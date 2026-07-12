import { resolveSources, dedupeOsm } from "./sources/registry.js";

// Orquestador de la capa de datos: consulta los adapters que tocan el bbox,
// acumula sus features normalizadas por id y expone la colección fusionada
// (oficiales + OSM sin duplicados) lista para pintar.

const officialById = new Map();
const osmById = new Map();

// Carga las fuentes visibles en el bbox [oeste, sur, este, norte].
// Devuelve los errores por source (parciales: una source caída no impide
// pintar las demás).
export async function loadArea(bbox) {
  const adapters = resolveSources(bbox);
  const results = await Promise.allSettled(
    adapters.map((a) => a.fetchArea(bbox))
  );

  const errors = [];
  results.forEach((res, i) => {
    const adapter = adapters[i];
    if (res.status === "rejected") {
      errors.push({ source: adapter.id, error: res.reason });
      return;
    }
    const target = adapter.id === "osm" ? osmById : officialById;
    for (const feature of res.value) {
      target.set(feature.properties.id, feature);
    }
  });

  return { errors };
}

// Colección fusionada de todo lo cargado hasta ahora. Los puntos OSM que
// duplican una fuente oficial cercana se suprimen (la oficial gana: aporta
// estado real).
export function getAllFeatures() {
  const official = [...officialById.values()];
  const osm = dedupeOsm([...osmById.values()], official);
  return [...official, ...osm];
}
