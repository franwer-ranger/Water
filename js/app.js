import { CONFIG } from "./config.js";
import { loadFuentes } from "./data.js";
import { buildFuentesLayer } from "./markers.js";
import { setupGeolocation } from "./geolocation.js";

const countEl = document.getElementById("count");
const toastEl = document.getElementById("toast");
let toastTimer;

// Mensajes transitorios sobre el mapa (carga, geolocalización, errores).
function showToast(text, persist = false) {
  if (!toastEl) return;
  toastEl.textContent = text;
  clearTimeout(toastTimer);
  if (!persist) {
    toastTimer = setTimeout(() => {
      toastEl.textContent = "";
    }, 4000);
  }
}

// Contador persistente en la cabecera.
function setCount(n) {
  if (!countEl) return;
  countEl.textContent = `${n.toLocaleString("es-ES")} fuentes`;
  countEl.hidden = false;
}

function initMap() {
  const map = L.map("map", {
    center: CONFIG.center,
    zoom: CONFIG.zoom,
    minZoom: CONFIG.minZoom,
    maxZoom: CONFIG.maxZoom,
    maxBounds: CONFIG.maxBounds,
    maxBoundsViscosity: 0.7,
    zoomControl: true,
  });

  L.tileLayer(CONFIG.tiles.url, {
    attribution: CONFIG.tiles.attribution,
    maxZoom: CONFIG.maxZoom,
  }).addTo(map);

  return map;
}

async function main() {
  const map = initMap();
  setupGeolocation(map, document.getElementById("locate-btn"), showToast);

  showToast("Cargando fuentes…", true);
  try {
    const geojson = await loadFuentes();
    const layer = buildFuentesLayer(geojson);
    map.addLayer(layer);
    const total = (geojson.features || []).length;
    setCount(total);
    showToast("Toca un punto para ver los detalles.");
  } catch (err) {
    console.error(err);
    showToast("Error al cargar las fuentes. Revisa la consola.", true);
  }
}

main();
