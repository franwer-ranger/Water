import { CONFIG } from "./config.js";
import { getUserLatLng } from "./geolocation.js";

// ── Estados ────────────────────────────────────────────────────────────────
export const COLORS = {
  ok: "#16a34a",
  warn: "#f59e0b",
  off: "#dc2626",
  accent: "#0085c7",
};

const ESTADO_TEXTO = {
  OPERATIVO: "Operativa",
  CERRADA_TEMPORALMENT: "Cerrada temporalmente",
  FUERA_DE_SERVICIO: "Fuera de servicio",
  NO_OPERATIVO: "No operativa",
  NO_PREPARADO: "No preparada",
};

// Agrupa los estados del dataset en tres categorías visuales.
export function estadoCategoria(estado) {
  if (estado === "OPERATIVO") return "ok";
  if (estado === "CERRADA_TEMPORALMENT") return "warn";
  return "off"; // FUERA_DE_SERVICIO, NO_OPERATIVO, NO_PREPARADO, null…
}

// Expresión MapLibre: color del punto según el estado.
const estadoColorExpr = [
  "match",
  ["get", "estado"],
  "OPERATIVO",
  COLORS.ok,
  "CERRADA_TEMPORALMENT",
  COLORS.warn,
  /* resto */ COLORS.off,
];

export const SOURCE_ID = "fuentes";

// Añade la fuente (source) GeoJSON con clustering y las capas de render.
export function addFuentesLayers(map, geojson) {
  map.addSource(SOURCE_ID, {
    type: "geojson",
    data: geojson,
    cluster: true,
    clusterRadius: CONFIG.cluster.radius,
    clusterMaxZoom: CONFIG.cluster.maxZoom,
  });

  // Burbuja del clúster (color de marca, tamaño según nº de puntos).
  map.addLayer({
    id: "clusters",
    type: "circle",
    source: SOURCE_ID,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": COLORS.accent,
      "circle-opacity": 0.9,
      "circle-radius": ["step", ["get", "point_count"], 16, 25, 21, 100, 27],
      "circle-stroke-width": 4,
      "circle-stroke-color": "rgba(255,255,255,0.85)",
    },
  });

  // Número dentro del clúster.
  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: SOURCE_ID,
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-font": ["Noto Sans Bold"],
      "text-size": 13,
    },
    paint: { "text-color": "#ffffff" },
  });

  // Halo suave bajo cada punto individual (da sensación de profundidad).
  map.addLayer({
    id: "fuentes-glow",
    type: "circle",
    source: SOURCE_ID,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": estadoColorExpr,
      "circle-opacity": 0.18,
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 11, 7, 17, 16],
    },
  });

  // Punto individual coloreado por estado.
  map.addLayer({
    id: "fuentes-point",
    type: "circle",
    source: SOURCE_ID,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": estadoColorExpr,
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 11, 4, 17, 8],
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });
}

// ── Panel de detalle ─────────────────────────────────────────────────────────
// URL de Google Maps con ruta a pie hasta la fuente.
function directionsUrl(lat, lng) {
  const origin = getUserLatLng();
  const o = origin ? `&origin=${origin[0]},${origin[1]}` : "";
  return `https://www.google.com/maps/dir/?api=1${o}&destination=${lat},${lng}&travelmode=walking`;
}

// HTML interior del bottom-sheet de detalle. coords viene como [lng, lat].
export function detailHtml(props, coords) {
  const cat = estadoCategoria(props.estado);
  const estadoTxt = ESTADO_TEXTO[props.estado] || "Estado desconocido";
  const parts = [];
  parts.push('<div class="sheet__head">');
  parts.push('<span class="sheet__icon" aria-hidden="true">💧</span>');
  parts.push("<div>");
  parts.push("<h2 class=\"sheet__title\">Fuente de agua potable</h2>");
  if (props.direccion)
    parts.push(`<p class="sheet__addr">${escapeHtml(props.direccion)}</p>`);
  const zona = [props.barrio, props.distrito].filter(Boolean).join(" · ");
  if (zona) parts.push(`<p class="sheet__zona">${escapeHtml(zona)}</p>`);
  parts.push("</div></div>");

  parts.push(
    `<span class="estado estado--${cat}"><span class="estado__dot"></span>${estadoTxt}</span>`
  );

  // El botón "Cómo llegar" se muestra en operativas y en cerradas
  // temporalmente: este segundo estado no es fiable y muchas fuentes
  // marcadas así están realmente abiertas.
  if (cat === "ok" || cat === "warn") {
    const url = directionsUrl(coords[1], coords[0]);
    parts.push(
      `<a class="sheet__btn" href="${url}" target="_blank" rel="noopener">` +
        '<span aria-hidden="true">🧭</span> Cómo llegar</a>'
    );
  }
  return parts.join("");
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
