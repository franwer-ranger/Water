import { CONFIG } from "./config.js";

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

// Construye el HTML del popup de forma perezosa (solo al abrirse).
function popupHtml(props) {
  const cat = estadoCategoria(props.estado);
  const estadoTxt = ESTADO_TEXTO[props.estado] || "Estado desconocido";
  const partes = [];
  partes.push('<div class="fuente-popup">');
  partes.push("<h3>💧 Fuente de agua potable</h3>");
  if (props.direccion) partes.push(`<p>${escapeHtml(props.direccion)}</p>`);
  const zona = [props.barrio, props.distrito].filter(Boolean).join(" · ");
  if (zona) partes.push(`<p>${escapeHtml(zona)}</p>`);
  partes.push(`<span class="estado estado--${cat}">${estadoTxt}</span>`);
  partes.push("</div>");
  return partes.join("");
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
      layer.bindPopup(() => popupHtml(feature.properties));
    },
  });

  clusterGroup.addLayer(geoLayer);
  return clusterGroup;
}
