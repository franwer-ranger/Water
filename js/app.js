import { CONFIG } from "./config.js";
import { loadFuentes } from "./data.js";
import {
  addFuentesLayers,
  detailHtml,
  estadoCategoria,
  SOURCE_ID,
} from "./markers.js";
import { setupGeolocation } from "./geolocation.js";

const countEl = document.getElementById("count");
const toastEl = document.getElementById("toast");
const sheetEl = document.getElementById("sheet");
const sheetBody = document.getElementById("sheet-body");
let toastTimer;

// Mensajes transitorios sobre el mapa (carga, geolocalización, errores).
function showToast(text, persist = false) {
  if (!toastEl) return;
  toastEl.textContent = text;
  clearTimeout(toastTimer);
  if (!persist) {
    toastTimer = setTimeout(() => (toastEl.textContent = ""), 4000);
  }
}

function setCount(n) {
  if (!countEl) return;
  countEl.textContent = `${n.toLocaleString("es-ES")} fuentes`;
  countEl.hidden = false;
}

// ── Bottom-sheet ─────────────────────────────────────────────────────────────
function openSheet(props, coords) {
  if (!sheetEl || !sheetBody) return;
  sheetBody.innerHTML = detailHtml(props, coords);
  sheetEl.hidden = false;
  requestAnimationFrame(() => sheetEl.classList.add("is-open"));
}

function closeSheet() {
  if (!sheetEl) return;
  sheetEl.classList.remove("is-open");
}

function initMap() {
  const map = new maplibregl.Map({
    container: "map",
    style: CONFIG.style,
    center: CONFIG.center,
    zoom: CONFIG.zoom,
    minZoom: CONFIG.minZoom,
    maxZoom: CONFIG.maxZoom,
    maxBounds: CONFIG.maxBounds,
    attributionControl: false,
    dragRotate: true,
  });

  map.addControl(
    new maplibregl.NavigationControl({ visualizePitch: true }),
    "top-right"
  );
  map.addControl(
    new maplibregl.AttributionControl({
      compact: true,
      customAttribution: CONFIG.attribution,
    }),
    "bottom-right"
  );

  return map;
}

// ── Interacciones de mapa ────────────────────────────────────────────────────
function wireInteractions(map) {
  // Click en clúster → acercar para expandirlo.
  map.on("click", "clusters", async (e) => {
    const feature = e.features[0];
    const clusterId = feature.properties.cluster_id;
    try {
      const zoom = await map
        .getSource(SOURCE_ID)
        .getClusterExpansionZoom(clusterId);
      map.easeTo({ center: feature.geometry.coordinates, zoom });
    } catch (_) {
      /* noop */
    }
  });

  // Click en fuente individual → abrir panel de detalle.
  map.on("click", "fuentes-point", (e) => {
    const feature = e.features[0];
    openSheet(feature.properties, feature.geometry.coordinates);
    map.easeTo({ center: feature.geometry.coordinates, offset: [0, -80] });
  });

  // Click en el mapa vacío → cerrar panel.
  map.on("click", (e) => {
    const hits = map.queryRenderedFeatures(e.point, {
      layers: ["fuentes-point", "clusters"],
    });
    if (!hits.length) closeSheet();
  });

  // Cursor de mano sobre elementos interactivos.
  for (const id of ["clusters", "fuentes-point"]) {
    map.on("mouseenter", id, () => (map.getCanvas().style.cursor = "pointer"));
    map.on("mouseleave", id, () => (map.getCanvas().style.cursor = ""));
  }
}

// ── Menú de filtros (abrir/cerrar popover) ────────────────────────────────────
function setupFilterMenu() {
  const menu = document.getElementById("filter-menu");
  const toggle = document.getElementById("filter-toggle");
  if (!menu || !toggle) return;

  const setOpen = (open) => {
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    setOpen(!menu.classList.contains("is-open"));
  });
  // Clic fuera o Escape cierran el popover (clics dentro lo mantienen abierto).
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target)) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

// ── Filtros por estado ────────────────────────────────────────────────────────
function setupFilters(map, fullData) {
  const active = new Set(["ok", "warn", "off"]);
  const opts = document.querySelectorAll(".filter-opt[data-cat]");
  const badge = document.getElementById("filter-badge");

  const apply = () => {
    const features = (fullData.features || []).filter((f) =>
      active.has(estadoCategoria(f.properties.estado))
    );
    map.getSource(SOURCE_ID).setData({
      type: "FeatureCollection",
      features,
    });
    setCount(features.length);
    if (badge) badge.hidden = active.size === 3; // marca que hay filtros activos
  };

  opts.forEach((opt) => {
    opt.addEventListener("click", () => {
      const cat = opt.dataset.cat;
      if (active.has(cat) && active.size > 1) {
        active.delete(cat);
        opt.classList.remove("is-active");
      } else {
        active.add(cat);
        opt.classList.add("is-active");
      }
      apply();
    });
  });
}

async function main() {
  const map = initMap();
  setupGeolocation(map, document.getElementById("locate-btn"), showToast);

  if (CONFIG.usingFallbackStyle) {
    console.warn(
      "[Water] Sin clave de MapTiler: usando estilo de respaldo. " +
        "Añade tu clave gratuita en js/config.js (MAPTILER_KEY)."
    );
  }

  const sheetClose = document.getElementById("sheet-close");
  if (sheetClose) sheetClose.addEventListener("click", closeSheet);
  setupFilterMenu();

  showToast("Cargando fuentes…", true);

  let geojson;
  try {
    geojson = await loadFuentes();
  } catch (err) {
    console.error(err);
    showToast("Error al cargar las fuentes. Revisa la consola.", true);
    return;
  }

  map.on("load", () => {
    addFuentesLayers(map, geojson);
    wireInteractions(map);
    setupFilters(map, geojson);
    setCount((geojson.features || []).length);
    showToast("Toca un punto para ver los detalles.");
  });
}

main();
