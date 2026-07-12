import { CONFIG } from "../config.js";

// Adapter del dataset oficial del Ayuntamiento de Madrid. Es la primera
// "excepción oficial": dentro de su región tiene prioridad sobre OSM porque
// aporta estado real (operativa / cerrada / fuera de servicio).

export const id = "madrid";
export const name = "Ayuntamiento de Madrid";
// Aporta estado real → los filtros por estado aplican a esta source.
export const providesStatus = true;

// Región aproximada del término municipal [oeste, sur, este, norte]. Se usa
// solo para decidir si merece la pena consultar este adapter; la
// de-duplicación con OSM es por proximidad (ver registry.js), no por bbox.
export const bbox = [-3.9, 40.3, -3.51, 40.66];

const ESTADO_TEXTO = {
  OPERATIVO: "Operativa",
  CERRADA_TEMPORALMENT: "Cerrada temporalmente",
  FUERA_DE_SERVICIO: "Fuera de servicio",
  NO_OPERATIVO: "No operativa",
  NO_PREPARADO: "No preparada",
};

// Agrupa los estados del dataset en las categorías visuales normalizadas.
export function estadoCategoria(estado) {
  if (estado === "OPERATIVO") return "ok";
  if (estado === "CERRADA_TEMPORALMENT") return "warn";
  return "off"; // FUERA_DE_SERVICIO, NO_OPERATIVO, NO_PREPARADO, null…
}

function normalizar(feature) {
  const p = feature.properties || {};
  const area = [p.barrio, p.distrito]
    .filter(Boolean)
    .map((s) => s.toLowerCase())
    .join(" · ");
  return {
    type: "Feature",
    properties: {
      id: `madrid:${p.id}`,
      source: id,
      sourceName: name,
      name: null,
      address: p.direccion || null,
      area: area || null,
      statusCat: estadoCategoria(p.estado),
      statusText: ESTADO_TEXTO[p.estado] || "Estado desconocido",
    },
    geometry: feature.geometry,
  };
}

let dataPromise = null;

// El dataset completo pesa ~500 KB, así que en cuanto el viewport toca la
// región se carga entero una única vez (mismo comportamiento que la app
// original) en lugar de trocearlo por bbox.
export async function fetchArea() {
  if (!dataPromise) {
    dataPromise = (async () => {
      const res = await fetch(CONFIG.madridDataUrl);
      if (!res.ok) {
        throw new Error(
          `No se pudieron cargar las fuentes de Madrid (HTTP ${res.status})`
        );
      }
      const geojson = await res.json();
      return (geojson.features || []).map(normalizar);
    })();
    // Si falla (red), permite reintentar en el siguiente movimiento del mapa.
    dataPromise.catch(() => (dataPromise = null));
  }
  return dataPromise;
}
