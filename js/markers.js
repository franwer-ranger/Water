import { CONFIG } from "./config.js";
import { getUserLatLng } from "./geolocation.js";

// ── Estados normalizados ────────────────────────────────────────────────────
// 'unknown' (fuentes sin estado fiable, p. ej. OSM) se pinta con el color de
// marca y sin píldora de estado.
export const COLORS = {
  ok: "#16a34a",
  warn: "#f59e0b",
  off: "#dc2626",
  unknown: "#0085c7",
};

// Expresión MapLibre: color del punto según statusCat normalizado.
const statusColorExpr = [
  "match",
  ["get", "statusCat"],
  "ok",
  COLORS.ok,
  "warn",
  COLORS.warn,
  "off",
  COLORS.off,
  /* unknown y resto */ COLORS.unknown,
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
      "circle-color": COLORS.unknown,
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
      "circle-color": statusColorExpr,
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
      "circle-color": statusColorExpr,
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

// HTML interior del bottom-sheet de detalle sobre las propiedades
// normalizadas (name/address/area opcionales, píldora de estado solo si la
// source aporta estado, atribución de la source). coords viene como [lng, lat].
export function detailHtml(props, coords) {
  const cat = props.statusCat || "unknown";
  const parts = [];
  parts.push('<div class="sheet__head">');
  parts.push('<span class="sheet__icon" aria-hidden="true">💧</span>');
  parts.push("<div>");
  parts.push(
    `<h2 class="sheet__title">${escapeHtml(
      props.name || "Fuente de agua potable"
    )}</h2>`
  );
  if (props.address)
    parts.push(`<p class="sheet__addr">${escapeHtml(props.address)}</p>`);
  if (props.area)
    parts.push(`<p class="sheet__zona">${escapeHtml(props.area)}</p>`);
  parts.push("</div></div>");

  if (cat !== "unknown") {
    const statusText = props.statusText || "Estado desconocido";
    parts.push(
      `<span class="estado estado--${cat}"><span class="estado__dot"></span>${escapeHtml(
        statusText
      )}</span>`
    );
  }

  // El botón "Cómo llegar" se muestra salvo en fuentes fuera de servicio.
  // 'warn' (cerrada temporalmente) lo mantiene: ese estado no es fiable y
  // muchas fuentes marcadas así están realmente abiertas.
  if (cat !== "off") {
    const url = directionsUrl(coords[1], coords[0]);
    parts.push(
      `<a class="sheet__btn" href="${url}" target="_blank" rel="noopener">` +
        '<span aria-hidden="true">🧭</span> Cómo llegar</a>'
    );
  }

  if (props.sourceName) {
    parts.push(
      `<p class="sheet__source">Datos: ${escapeHtml(props.sourceName)}</p>`
    );
  }
  return parts.join("");
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
