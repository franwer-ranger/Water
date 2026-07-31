import { resolveSources, dedupeOsm } from "./sources/registry.js";
import * as madrid from "./sources/madrid.js";
import { fetchByOsmId } from "./sources/osm.js";
import { parseFountainId } from "./share.js";

// Orquestador de la capa de datos: consulta los adapters que tocan el bbox,
// acumula sus features normalizadas por id y expone la colección fusionada
// (oficiales + OSM sin duplicados) lista para pintar.

const officialById = new Map();
const osmById = new Map();

function ingestFeature(feature) {
  if (!feature?.properties?.id) return;
  const target =
    feature.properties.source === "osm" ? osmById : officialById;
  target.set(feature.properties.id, feature);
}

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
    for (const feature of res.value) {
      ingestFeature(feature);
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

export function findFeatureById(id) {
  return officialById.get(id) || osmById.get(id) || null;
}

/**
 * Resuelve una fuente por id canónico (caché, dataset Madrid o Overpass).
 * @returns {Promise<{feature: object|null, error?: Error}>}
 */
export async function resolveFeatureById(id) {
  const cached = findFeatureById(id);
  if (cached) return { feature: cached };

  const parsed = parseFountainId(id);
  if (!parsed) return { feature: null };

  try {
    if (parsed.source === "madrid") {
      const features = await madrid.fetchArea();
      for (const feature of features) ingestFeature(feature);
      return { feature: findFeatureById(id) };
    }

    if (parsed.source === "osm") {
      const feature = await fetchByOsmId(parsed.osmType, parsed.osmId);
      if (feature) ingestFeature(feature);
      return { feature: feature || null };
    }
  } catch (error) {
    return { feature: null, error };
  }

  return { feature: null };
}
