/**
 * Verificación offline de ranking cercano (haversine + filtros + límites).
 * No arranca el mapa; usa el GeoJSON oficial de Madrid y features OSM sintéticas.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const EARTH_RADIUS_M = 6_371_000;
const NEARBY_RADIUS_M = 800;
const NEARBY_MAX = 10;

function haversineMeters(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(a)));
}

function getNearbyFeatures(originLatLng, features, activeCats, {
  radiusM = NEARBY_RADIUS_M,
  maxResults = NEARBY_MAX,
} = {}) {
  const [oLat, oLng] = originLatLng;
  const scored = [];
  for (const feature of features) {
    const cat = feature.properties?.statusCat;
    if (cat !== "unknown" && !activeCats.has(cat)) continue;
    if (feature.geometry?.type !== "Point") continue;
    const [lng, lat] = feature.geometry.coordinates;
    const distanceM = haversineMeters(oLat, oLng, lat, lng);
    if (distanceM > radiusM) continue;
    scored.push({ feature, distanceM });
  }
  scored.sort((a, b) => a.distanceM - b.distanceM);
  return scored.slice(0, maxResults);
}

function estadoCategoria(estado) {
  if (estado === "OPERATIVO") return "ok";
  if (estado === "CERRADA_TEMPORALMENT") return "warn";
  return "off";
}

function normalizarMadrid(feature) {
  const p = feature.properties || {};
  return {
    type: "Feature",
    properties: {
      id: `madrid:${p.id}`,
      source: "madrid",
      name: null,
      address: p.direccion || null,
      area: p.barrio || null,
      statusCat: estadoCategoria(p.estado),
      statusText: p.estado,
    },
    geometry: feature.geometry,
  };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const geojson = JSON.parse(
  readFileSync(join(root, "public/data/fuentes.geojson"), "utf8")
);
const madrid = geojson.features.map(normalizarMadrid);

// Puerta del Sol
const sol = [40.4168, -3.7038];
const allCats = new Set(["ok", "warn", "off"]);

// ── Haversine sanity (Sol ↔ ~Plaza Mayor ≈ 300–500 m) ──────────────────────
const plazaMayorDist = haversineMeters(40.4168, -3.7038, 40.4155, -3.7074);
assert(plazaMayorDist > 200 && plazaMayorDist < 600, `haversine Sol–Plaza Mayor raro: ${plazaMayorDist}`);

// ── Madrid: hay fuentes cerca de Sol ───────────────────────────────────────
const nearSol = getNearbyFeatures(sol, madrid, allCats);
assert(nearSol.length > 0, "esperado ≥1 fuente cerca de Sol");
assert(nearSol.length <= NEARBY_MAX, `máximo ${NEARBY_MAX}, got ${nearSol.length}`);
for (let i = 1; i < nearSol.length; i++) {
  assert(
    nearSol[i].distanceM >= nearSol[i - 1].distanceM,
    "lista no ordenada por distancia"
  );
}
assert(
  nearSol.every((x) => x.distanceM <= NEARBY_RADIUS_M),
  "resultado fuera de radio"
);
console.log(`Madrid@Sol: ${nearSol.length} cercanas; más próxima a ${Math.round(nearSol[0].distanceM)} m`);

// ── Filtro: ocultar cerradas/warn ──────────────────────────────────────────
const onlyOk = getNearbyFeatures(sol, madrid, new Set(["ok"]));
assert(
  onlyOk.every((x) => x.feature.properties.statusCat === "ok"),
  "filtro ok dejó pasar no-ok"
);
console.log(`Madrid@Sol solo operativas: ${onlyOk.length}`);

const warnFeature = madrid.find((f) => f.properties.statusCat === "warn");
assert(warnFeature, "dataset Madrid sin fuentes warn para probar filtro");
const [wLng, wLat] = warnFeature.geometry.coordinates;
const nearWarnAll = getNearbyFeatures([wLat, wLng], madrid, allCats);
const nearWarnFiltered = getNearbyFeatures(
  [wLat, wLng],
  madrid,
  new Set(["ok", "off"])
);
assert(
  nearWarnAll.some((x) => x.feature.properties.id === warnFeature.properties.id),
  "warn debería aparecer con todos los filtros"
);
assert(
  nearWarnFiltered.every((x) => x.feature.properties.statusCat !== "warn"),
  "filtro sin warn dejó pasar warn"
);
console.log("Filtro warn oculto ✓");

// ── Caso vacío: punto en el Atlántico ──────────────────────────────────────
const atlantic = [40.0, -20.0];
const empty = getNearbyFeatures(atlantic, madrid, allCats);
assert(empty.length === 0, "Atlántico no debería tener fuentes Madrid");
console.log("Atlántico: 0 resultados ✓");

// ── Zona solo OSM (sintéticas) ─────────────────────────────────────────────
const osmOnly = [
  {
    type: "Feature",
    properties: { id: "osm:n1", source: "osm", name: null, statusCat: "unknown" },
    geometry: { type: "Point", coordinates: [-3.7035, 40.417] },
  },
  {
    type: "Feature",
    properties: {
      id: "osm:n2",
      source: "osm",
      name: "Fuente remota",
      statusCat: "unknown",
    },
    geometry: { type: "Point", coordinates: [-3.72, 40.43] }, // ~2 km
  },
];
const nearOsm = getNearbyFeatures(sol, osmOnly, new Set()); // filtros vacíos: unknown pasa
assert(nearOsm.length === 1, `OSM cercanas esperado 1, got ${nearOsm.length}`);
assert(nearOsm[0].feature.properties.id === "osm:n1", "debió ganar la OSM cercana");
assert(
  !nearOsm[0].feature.properties.name,
  "sin nombre (fallback UI = Fuente)"
);
console.log(`OSM sintético@Sol: ${nearOsm.length} cercana(s) ✓`);

console.log("verify-nearby: OK");
