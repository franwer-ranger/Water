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

// Cortesía con la API pública: espacio mínimo entre peticiones y pausa larga
// si Overpass devuelve 429/504 (rate limit) antes de volver a intentarlo.
const MIN_INTERVAL_MS = 2500;
const COOLDOWN_MS = 20000;

const loadedCells = new Set();
const featuresById = new Map();
let lastFetchAt = 0;
let cooldownUntil = 0;

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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
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

async function queryOverpass(bboxes) {
  // Una única petición con la unión de las celdas pendientes exactas: al
  // panear en diagonal, un bbox envolvente pediría también el área ya
  // cargada entre celdas; la unión no.
  // nwr = node + way + relation; `out center` da el centroide de ways/relations.
  const clauses = bboxes
    .map(([w, s, e, n]) => `nwr["amenity"="drinking_water"](${s},${w},${n},${e});`)
    .join("");
  const query = `[out:json][timeout:25];(${clauses});out center;`;
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

// Devuelve todas las fuentes OSM conocidas, pidiendo a Overpass solo las
// celdas del bbox aún no cargadas. Si Overpass falla, no se marca nada como
// cargado (se reintentará en el siguiente movimiento del mapa); tras un
// rate limit se devuelve solo la caché durante el cooldown, sin más
// peticiones ni errores repetidos.
export async function fetchArea(bbox) {
  const pending = cellsFor(bbox).filter((key) => !loadedCells.has(key));

  const skip =
    pending.length === 0 ||
    pending.length > MAX_CELLS_PER_FETCH ||
    Date.now() < cooldownUntil;

  if (!skip) {
    // Espacia las peticiones para no agotar los slots de la API pública.
    const wait = lastFetchAt + MIN_INTERVAL_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastFetchAt = Date.now();

    let elements;
    try {
      elements = await queryOverpass(pending.map(cellBbox));
    } catch (err) {
      if (err.status === 429 || err.status === 504) {
        cooldownUntil = Date.now() + COOLDOWN_MS;
      }
      throw err;
    }
    for (const el of elements) {
      const feature = normalizar(el);
      if (feature) featuresById.set(feature.properties.id, feature);
    }
    for (const key of pending) loadedCells.add(key);
  }

  return [...featuresById.values()];
}
