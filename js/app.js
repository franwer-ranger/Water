import { CONFIG } from "./config.js";
import { loadFuentes } from "./data.js";
import { buildFuentesLayer } from "./markers.js";
import { setupGeolocation } from "./geolocation.js";

const statusEl = document.getElementById("status");
function setStatus(text) {
  if (statusEl) statusEl.textContent = text;
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
  setupGeolocation(map, document.getElementById("locate-btn"), setStatus);

  try {
    const geojson = await loadFuentes();
    const layer = buildFuentesLayer(geojson);
    map.addLayer(layer);
    const total = (geojson.features || []).length;
    setStatus(`${total.toLocaleString("es-ES")} fuentes en el mapa`);
  } catch (err) {
    console.error(err);
    setStatus("Error al cargar las fuentes. Revisa la consola.");
  }
}

main();
