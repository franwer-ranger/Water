import { CONFIG } from "./config.js";
import { normalizeAmenities } from "./amenities.js";
import { getUserLatLng } from "./geolocation.js";

// Color unificado de marca para todas las fuentes (Madrid y OSM).
export const FOUNTAIN_COLOR = "#0085c7";

export const SOURCE_ID = "fuentes";
const DROP_IMAGE_ID = "fountain-drop";

/** Canvas 64×64 con gota blanca (para symbol layer). */
function createDropImage() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const cx = size / 2;
  const cy = size / 2 + 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 22);
  ctx.bezierCurveTo(cx + 18, cy - 4, cx + 16, cy + 14, cx, cy + 18);
  ctx.bezierCurveTo(cx - 16, cy + 14, cx - 18, cy - 4, cx, cy - 22);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  return canvas;
}

// Añade la fuente (source) GeoJSON con clustering y las capas de render.
export function addFuentesLayers(map, geojson) {
  if (!map.hasImage(DROP_IMAGE_ID)) {
    map.addImage(DROP_IMAGE_ID, createDropImage(), { pixelRatio: 2 });
  }

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
      "circle-color": FOUNTAIN_COLOR,
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

  // Halo suave bajo cada punto individual.
  map.addLayer({
    id: "fuentes-glow",
    type: "circle",
    source: SOURCE_ID,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": FOUNTAIN_COLOR,
      "circle-opacity": 0.18,
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 11, 7, 17, 16],
    },
  });

  // Punto individual (color unificado).
  map.addLayer({
    id: "fuentes-point",
    type: "circle",
    source: SOURCE_ID,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": FOUNTAIN_COLOR,
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 11, 6, 17, 11],
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });

  // Icono de gota centrado en cada fuente.
  map.addLayer({
    id: "fuentes-icon",
    type: "symbol",
    source: SOURCE_ID,
    filter: ["!", ["has", "point_count"]],
    layout: {
      "icon-image": DROP_IMAGE_ID,
      "icon-size": ["interpolate", ["linear"], ["zoom"], 11, 0.28, 17, 0.42],
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
    },
  });
}

// Aviso suave a partir del estado oficial (datos no del todo fiables).
function statusHint(cat) {
  if (cat === "warn") return "Posiblemente cerrada temporalmente";
  if (cat === "off") return "Posiblemente fuera de servicio";
  return null;
}

// ── Panel de detalle ─────────────────────────────────────────────────────────
function directionsUrl(lat, lng) {
  const origin = getUserLatLng();
  const o = origin ? `&origin=${origin[0]},${origin[1]}` : "";
  return `https://www.google.com/maps/dir/?api=1${o}&destination=${lat},${lng}&travelmode=walking`;
}

// HTML interior del bottom-sheet. coords viene como [lng, lat].
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

  const hint = statusHint(cat);
  if (hint) {
    parts.push(
      `<span class="status-hint"><span class="status-hint__icon" aria-hidden="true">⚠</span>${escapeHtml(
        hint
      )}</span>`
    );
  }

  const amenities = normalizeAmenities(props);
  if (amenities.length) {
    parts.push('<ul class="sheet__amenities" aria-label="Detalles">');
    for (const a of amenities) {
      const text = a.valueLabel ? `${a.label}: ${a.valueLabel}` : a.label;
      parts.push(
        `<li class="amenity-chip">${escapeHtml(text)}</li>`
      );
    }
    parts.push("</ul>");
  }

  // Acciones: Cómo llegar (siempre) + Compartir.
  const actions = [];
  const url = directionsUrl(coords[1], coords[0]);
  actions.push(
    `<a class="sheet__btn" href="${url}" target="_blank" rel="noopener">` +
      '<span aria-hidden="true">🧭</span> Cómo llegar</a>'
  );
  if (props.id) {
    const lng = coords[0];
    const lat = coords[1];
    const title = props.name || props.address || "Fuente de agua potable";
    actions.push(
      `<button type="button" class="sheet__btn sheet__btn--share" ` +
        `data-share-id="${escapeAttr(props.id)}" ` +
        `data-share-lng="${lng}" data-share-lat="${lat}" ` +
        `data-share-title="${escapeAttr(title)}">` +
        '<span aria-hidden="true">🔗</span> Compartir</button>'
    );
  }
  parts.push(`<div class="sheet__actions">${actions.join("")}</div>`);

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

function escapeAttr(str) {
  return escapeHtml(str);
}
