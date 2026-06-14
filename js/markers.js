import { CONFIG } from "./config.js";
import { getUserLatLng } from "./geolocation.js";

// Agrupa los estados del dataset en tres categorías visuales.
function estadoCategoria(estado) {
  if (estado === "OPERATIVO") return "ok";
  if (estado === "CERRADA_TEMPORALMENT") return "warn";
  return "off"; // FUERA_DE_SERVICIO, NO_OPERATIVO, NO_PREPARADO, null…
}

const ESTADO_TEXTO = {
  OPERATIVO: "Operativa",
  CERRADA_TEMPORALMENT: "Cerrada temporalmente",
  FUERA_DE_SERVICIO: "Fuera de servicio",
  NO_OPERATIVO: "No operativa",
  NO_PREPARADO: "No preparada",
};

// Cache de iconos por categoría: un divIcon compartido y reutilizado.
const iconCache = {};
function iconoPara(categoria) {
  if (!iconCache[categoria]) {
    iconCache[categoria] = L.divIcon({
      className: "",
      html: `<div class="fuente-marker fuente-marker--${categoria}"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -8],
    });
  }
  return iconCache[categoria];
}

// URL de Google Maps con ruta a pie hasta la fuente. Si conocemos la ubicación
// del usuario la usamos como origen; si no, Google usará la ubicación actual.
function directionsUrl(lat, lng) {
  const origin = getUserLatLng();
  const o = origin ? `&origin=${origin[0]},${origin[1]}` : "";
  return `https://www.google.com/maps/dir/?api=1${o}&destination=${lat},${lng}&travelmode=walking`;
}

// Construye el HTML del popup de forma perezosa (solo al abrirse).
// coords viene del GeoJSON como [lon, lat].
function popupHtml(props, coords) {
  const cat = estadoCategoria(props.estado);
  const estadoTxt = ESTADO_TEXTO[props.estado] || "Estado desconocido";
  const parts = ['<div class="fuente-popup">'];
  parts.push("<h3>💧 Fuente de agua potable</h3>");
  if (props.direccion) parts.push(`<p>${escapeHtml(props.direccion)}</p>`);
  const zona = [props.barrio, props.distrito].filter(Boolean).join(" · ");
  if (zona) parts.push(`<p class="fuente-popup__zona">${escapeHtml(zona)}</p>`);
  parts.push(`<span class="estado estado--${cat}">${estadoTxt}</span>`);

  // Botón "Cómo llegar" solo para fuentes operativas.
  if (props.estado === "OPERATIVO") {
    const url = directionsUrl(coords[1], coords[0]);
    parts.push(
      `<a class="popup-btn" href="${url}" target="_blank" rel="noopener">` +
        '<span aria-hidden="true">🧭</span> Cómo llegar</a>'
    );
  }
  parts.push("</div>");
  return parts.join("");
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

// Crea la capa de clúster con todas las fuentes.
export function buildFuentesLayer(geojson) {
  const clusterGroup = L.markerClusterGroup(CONFIG.cluster);

  const geoLayer = L.geoJSON(geojson, {
    pointToLayer: (feature, latlng) => {
      const cat = estadoCategoria(feature.properties.estado);
      return L.marker(latlng, {
        icon: iconoPara(cat),
        title: feature.properties.direccion || "Fuente de agua potable",
      });
    },
    onEachFeature: (feature, layer) => {
      layer.bindPopup(
        () => popupHtml(feature.properties, feature.geometry.coordinates),
        { closeButton: true }
      );
    },
  });

  clusterGroup.addLayer(geoLayer);
  return clusterGroup;
}
