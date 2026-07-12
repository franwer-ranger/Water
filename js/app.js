import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { CONFIG } from "./config.js";
import { loadArea, getAllFeatures } from "./data.js";
import { addFuentesLayers, detailHtml, SOURCE_ID } from "./markers.js";
import { setupGeolocation } from "./geolocation.js";
import { setupSearch } from "./search.js";
import { createStore } from "./store.js";

const countEl = document.getElementById("count");
const toastEl = document.getElementById("toast");
const sheetEl = document.getElementById("sheet");
const sheetBody = document.getElementById("sheet-body");
let toastTimer;

// Estado compartido: features cargadas y filtros de estado activos. Los
// filtros solo aplican a fuentes con estado real; las 'unknown' (OSM)
// siempre se muestran.
const store = createStore({
  features: [],
  activeCats: new Set(["ok", "warn", "off"]),
});

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

// ── Render: aplica filtros y actualiza mapa + contador ──────────────────────
function render(map, state) {
  const source = map.getSource(SOURCE_ID);
  if (!source) return;
  const features = state.features.filter(
    (f) =>
      f.properties.statusCat === "unknown" ||
      state.activeCats.has(f.properties.statusCat)
  );
  source.setData({ type: "FeatureCollection", features });
  setCount(features.length);
}

// ── Carga de fuentes por viewport ────────────────────────────────────────────
let zoomHintShown = false;
let loading = false;
let pendingRefresh = false;
let lastErrorToastAt = 0;
let retryTimer = null;

async function refreshData(map) {
  if (map.getZoom() < CONFIG.minDataZoom) {
    // Solo avisa la primera vez y si aún no hay nada que ver.
    if (!zoomHintShown && store.get().features.length === 0) {
      zoomHintShown = true;
      showToast("Acércate o busca una ciudad para ver las fuentes.");
    }
    return;
  }

  if (loading) {
    // Ya hay una petición en vuelo: recuerda repetir con el viewport final.
    pendingRefresh = true;
    return;
  }
  loading = true;
  try {
    const b = map.getBounds();
    const { errors } = await loadArea([
      b.getWest(),
      b.getSouth(),
      b.getEast(),
      b.getNorth(),
    ]);
    store.set({ features: getAllFeatures() });

    for (const { source, error } of errors) {
      console.error(`[${source}]`, error);
      // Máximo un toast de error cada 15 s: al mover el mapa varias veces
      // seguidas no tiene sentido repetir el mismo aviso.
      if (Date.now() - lastErrorToastAt < 15000) continue;
      lastErrorToastAt = Date.now();
      if (source === "osm" && (error?.status === 429 || error?.status === 504)) {
        showToast("El servidor de OSM está saturado; reintento en unos segundos.");
        // Reintenta solo cuando pase el cooldown del adapter, aunque el
        // usuario no vuelva a mover el mapa.
        clearTimeout(retryTimer);
        retryTimer = setTimeout(() => refreshData(map), 21000);
      } else {
        showToast("No se pudieron cargar algunas fuentes de la zona.");
      }
    }
  } finally {
    loading = false;
    if (pendingRefresh) {
      pendingRefresh = false;
      refreshData(map);
    }
  }
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
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
function setupFilters() {
  const opts = document.querySelectorAll(".filter-opt[data-cat]");
  const badge = document.getElementById("filter-badge");

  opts.forEach((opt) => {
    opt.addEventListener("click", () => {
      const active = new Set(store.get().activeCats);
      const cat = opt.dataset.cat;
      if (active.has(cat) && active.size > 1) {
        active.delete(cat);
        opt.classList.remove("is-active");
      } else {
        active.add(cat);
        opt.classList.add("is-active");
      }
      if (badge) badge.hidden = active.size === 3; // marca que hay filtros activos
      store.set({ activeCats: active });
    });
  });
}

async function main() {
  const map = initMap();
  setupGeolocation(map, document.getElementById("locate-btn"), showToast);
  setupSearch(map, showToast);

  if (CONFIG.usingFallbackStyle) {
    console.warn(
      "[Water] Sin clave de MapTiler: usando estilo de respaldo y buscador " +
        "desactivado. Define VITE_MAPTILER_KEY en un fichero .env " +
        "(ver .env.example)."
    );
  }

  const sheetClose = document.getElementById("sheet-close");
  if (sheetClose) sheetClose.addEventListener("click", closeSheet);
  setupFilterMenu();
  setupFilters();

  store.subscribe((state) => render(map, state));

  map.on("load", () => {
    addFuentesLayers(map, {
      type: "FeatureCollection",
      features: [],
    });
    wireInteractions(map);

    // Carga inicial de la zona visible + recargas al mover el mapa.
    showToast("Cargando fuentes…", true);
    refreshData(map).then(() => {
      if (store.get().features.length > 0) {
        showToast("Toca un punto para ver los detalles.");
      }
    });
    map.on("moveend", debounce(() => refreshData(map), 400));
  });
}

main();
