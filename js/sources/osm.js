import { CONFIG } from "../config.js";

// Adapter de OpenStreetMap vía Overpass: fuentes de agua potable de todo el
// mundo (`amenity=drinking_water`), cargadas bajo demanda por zona.

export const id = "osm";
export const name = "OpenStreetMap";
// OSM no aporta estado operativo fiable → statusCat 'unknown'.
export const providesStatus = false;

// ── Caché por celdas ────────────────────────────────────────────────────────
// El mundo se trocea en celdas fijas de CELL_DEG grados. Cada celda se pide a
// Overpass una sola vez por sesión; al volver a una zona ya visitada no hay
// petición. Las features se acumulan por id (una misma fuente puede llegar
// desde celdas contiguas por el redondeo del bbox).
const CELL_DEG = 0.1;
const MAX_CELLS_PER_FETCH = 40; // salvaguarda ante viewports desmesurados

const loadedCells = new Set();
const featuresById = new Map();

function cellsFor([w, s, e, n]) {
  const cells = [];
  const x0 = Math.floor(w / CELL_DEG);
  const x1 = Math.floor(e / CELL_DEG);
  const y0 = Math.floor(s / CELL_DEG);
  const y1 = Math.floor(n / CELL_DEG);
  for (let x = x0; x <= x1; x++) {
    for (let y = y0; y <= y1; y++) {
      cells.push(`${x}:${y}`);
    }
  }
  return cells;
}

function cellBbox(key) {
  const [x, y] = key.split(":").map(Number);
  return [x * CELL_DEG, y * CELL_DEG, (x + 1) * CELL_DEG, (y + 1) * CELL_DEG];
}

// Bbox que cubre todas las celdas pendientes (una única petición a Overpass).
function coveringBbox(cellKeys) {
  let [w, s, e, n] = cellBbox(cellKeys[0]);
  for (const key of cellKeys.slice(1)) {
    const [cw, cs, ce, cn] = cellBbox(key);
    w = Math.min(w, cw);
    s = Math.min(s, cs);
    e = Math.max(e, ce);
    n = Math.max(n, cn);
  }
  return [w, s, e, n];
}

function normalizar(el) {
  const lat = el.type === "node" ? el.lat : el.center?.lat;
  const lon = el.type === "node" ? el.lon : el.center?.lon;
  if (lat == null || lon == null) return null;

  const tags = el.tags || {};
  // Fuentes marcadas como privadas/inaccesibles no sirven al usuario.
  if (tags.access === "private" || tags.access === "no") return null;

  return {
    type: "Feature",
    properties: {
      id: `osm:${el.type}/${el.id}`,
      source: id,
      sourceName: name,
      name: tags.name || null,
      address: null,
      area: null,
      statusCat: "unknown",
      statusText: null,
    },
    geometry: { type: "Point", coordinates: [lon, lat] },
  };
}

async function queryOverpass([w, s, e, n]) {
  // nwr = node + way + relation; `out center` da el centroide de ways/relations.
  const query = `[out:json][timeout:25];nwr["amenity"="drinking_water"](${s},${w},${n},${e});out center;`;
  const res = await fetch(CONFIG.overpassEndpoint, {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  if (!res.ok) {
    const err = new Error(`Overpass HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  const json = await res.json();
  return json.elements || [];
}

// Devuelve todas las fuentes OSM conocidas del bbox, pidiendo a Overpass solo
// las celdas aún no cargadas. Si Overpass falla, no se marca nada como
// cargado (se reintentará en el siguiente movimiento del mapa).
export async function fetchArea(bbox) {
  const pending = cellsFor(bbox).filter((key) => !loadedCells.has(key));

  if (pending.length > 0 && pending.length <= MAX_CELLS_PER_FETCH) {
    const elements = await queryOverpass(coveringBbox(pending));
    for (const el of elements) {
      const feature = normalizar(el);
      if (feature) featuresById.set(feature.properties.id, feature);
    }
    for (const key of pending) loadedCells.add(key);
  }

  return [...featuresById.values()];
}
