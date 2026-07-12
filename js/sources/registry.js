import * as osm from "./osm.js";
import * as madrid from "./madrid.js";

// Registro de sources. OSM es la base global; las "excepciones oficiales"
// (pocas por diseño) aportan datos verificados con estado real y tienen
// prioridad sobre OSM en su región. Para añadir una nueva excepción basta
// con crear un adapter con la misma interfaz y listarlo aquí.
const EXCEPTIONS = [madrid];

function intersects([w1, s1, e1, n1], [w2, s2, e2, n2]) {
  return w1 <= e2 && e1 >= w2 && s1 <= n2 && n1 >= s2;
}

// Adapters a consultar para un bbox del viewport: siempre OSM, más las
// excepciones oficiales cuya región intersecte.
export function resolveSources(bbox) {
  return [...EXCEPTIONS.filter((s) => intersects(bbox, s.bbox)), osm];
}

// ── De-duplicación OSM ↔ oficial ────────────────────────────────────────────
// Una fuente OSM se descarta si hay una fuente oficial a menos de
// DEDUPE_RADIUS_M metros: casi con seguridad es el mismo punto físico y la
// oficial aporta estado real. Se hace por proximidad y no por bbox para no
// suprimir las fuentes OSM de municipios vecinos (Alcobendas, Coslada…) que
// caen dentro del rectángulo de la excepción sin estar cubiertos por ella.
const DEDUPE_RADIUS_M = 75;
const CELL_DEG = 0.002; // ~220 m: basta mirar la celda propia y las 8 vecinas

function cellKey(lng, lat) {
  return `${Math.floor(lng / CELL_DEG)}:${Math.floor(lat / CELL_DEG)}`;
}

function metersBetween([lng1, lat1], [lng2, lat2]) {
  const mLat = 111320; // metros por grado de latitud
  const mLng = mLat * Math.cos(((lat1 + lat2) / 2) * (Math.PI / 180));
  const dx = (lng1 - lng2) * mLng;
  const dy = (lat1 - lat2) * mLat;
  return Math.hypot(dx, dy);
}

// Filtra de `osmFeatures` las que duplican alguna feature oficial.
export function dedupeOsm(osmFeatures, officialFeatures) {
  if (officialFeatures.length === 0) return osmFeatures;

  const grid = new Map();
  for (const f of officialFeatures) {
    const [lng, lat] = f.geometry.coordinates;
    const key = cellKey(lng, lat);
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(f.geometry.coordinates);
  }

  return osmFeatures.filter((f) => {
    const [lng, lat] = f.geometry.coordinates;
    const cx = Math.floor(lng / CELL_DEG);
    const cy = Math.floor(lat / CELL_DEG);
    for (let x = cx - 1; x <= cx + 1; x++) {
      for (let y = cy - 1; y <= cy + 1; y++) {
        const bucket = grid.get(`${x}:${y}`);
        if (!bucket) continue;
        for (const coords of bucket) {
          if (metersBetween(f.geometry.coordinates, coords) < DEDUPE_RADIUS_M) {
            return false;
          }
        }
      }
    }
    return true;
  });
}
