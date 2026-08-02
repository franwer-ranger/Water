import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { CONFIG } from "./config.js";
import {
  loadArea,
  getAllFeatures,
  resolveFeatureById,
} from "./data.js";
import { addFuentesLayers, detailHtml, SOURCE_ID } from "./markers.js";
import { setupGeolocation, getUserLatLng } from "./geolocation.js";
import { setupSearch } from "./search.js";
import { createStore } from "./store.js";
import { setupSplash } from "./splash.js";
import {
  readFountainLink,
  setFountainInUrl,
  clearFountainFromUrl,
  shareFountain,
} from "./share.js";
import {
  getNearbyFeatures,
  formatDistance,
  featureLabel,
} from "./nearby.js";

const countEl = document.getElementById("count");
const toastEl = document.getElementById("toast");
const sheetEl = document.getElementById("sheet");
const sheetBody = document.getElementById("sheet-body");
const nearbyEl = document.getElementById("nearby");
const nearbyListEl = document.getElementById("nearby-list");
const nearbyEmptyEl = document.getElementById("nearby-empty");
const nearbyTitleEl = document.getElementById("nearby-title");
const nearbyToggleEl = document.getElementById("nearby-toggle");
const nearbyCloseEl = document.getElementById("nearby-close");
let toastTimer;
let sheetOpen = false;
let nearbyVisible = false;

// Estado compartido: features cargadas en la sesión.
const store = createStore({
  features: [],
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

// Fuentes cuyas coordenadas caen en el viewport actual.
function featuresInView(map, state) {
  const b = map.getBounds();
  const west = b.getWest();
  const south = b.getSouth();
  const east = b.getEast();
  const north = b.getNorth();
  return state.features.filter((f) => {
    const [lng, lat] = f.geometry.coordinates;
    return lng >= west && lng <= east && lat >= south && lat <= north;
  });
}

function updateViewportCount(map) {
  setCount(featuresInView(map, store.get()).length);
}

// ── Bottom-sheet ─────────────────────────────────────────────────────────────
function openSheet(props, coords, { syncUrl = true } = {}) {
  if (!sheetEl || !sheetBody) return;
  sheetBody.innerHTML = detailHtml(props, coords);
  sheetEl.hidden = false;
  sheetOpen = true;
  requestAnimationFrame(() => sheetEl.classList.add("is-open"));
  if (syncUrl && props.id) {
    setFountainInUrl(props.id, coords);
  }
}

function closeSheet() {
  if (!sheetEl) return;
  sheetEl.classList.remove("is-open");
  sheetOpen = false;
  clearFountainFromUrl();
}

function focusFountain(map, feature) {
  const coords = feature.geometry.coordinates;
  openSheet(feature.properties, coords);
  const zoom = Math.max(map.getZoom(), 16);
  map.easeTo({ center: coords, zoom, offset: [0, -80] });
}

// ── Lista de fuentes cercanas ────────────────────────────────────────────────
function setNearbyOpen(open, { expanded = true } = {}) {
  if (!nearbyEl) return;
  nearbyVisible = open;
  nearbyEl.hidden = !open;
  if (!open) return;
  nearbyEl.classList.toggle("is-collapsed", !expanded);
  if (nearbyToggleEl) {
    nearbyToggleEl.setAttribute("aria-expanded", String(expanded));
  }
}

function renderNearbyList(map) {
  if (!nearbyVisible || !nearbyListEl || !nearbyEmptyEl) return;

  const origin = getUserLatLng();
  const state = store.get();
  const items = origin ? getNearbyFeatures(origin, state.features) : [];

  const n = items.length;
  if (nearbyTitleEl) {
    nearbyTitleEl.textContent =
      n === 0 ? "Sin fuentes cercanas" : `${n} cerca`;
  }

  nearbyListEl.replaceChildren();
  if (n === 0) {
    nearbyEmptyEl.hidden = false;
    nearbyEmptyEl.textContent = `No hay fuentes en ~${CONFIG.nearbyRadiusM} m. Acércate o mueve el mapa para cargar más.`;
    return;
  }

  nearbyEmptyEl.hidden = true;
  const frag = document.createDocumentFragment();
  for (const { feature, distanceM } of items) {
    const props = feature.properties;
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "nearby__item";
    btn.dataset.id = props.id || "";

    const dist = document.createElement("span");
    dist.className = "nearby__dist";
    dist.textContent = formatDistance(distanceM);

    const meta = document.createElement("span");
    meta.className = "nearby__meta";
    const label = document.createElement("span");
    label.className = "nearby__label";
    label.textContent = featureLabel(props);
    meta.appendChild(label);
    if (props.name && (props.address || props.area)) {
      const sub = document.createElement("span");
      sub.className = "nearby__sub";
      sub.textContent = props.address || props.area;
      meta.appendChild(sub);
    }

    btn.appendChild(dist);
    btn.appendChild(meta);

    btn.addEventListener("click", () => focusFountain(map, feature));
    li.appendChild(btn);
    frag.appendChild(li);
  }
  nearbyListEl.appendChild(frag);
}

function openNearbyList(map) {
  setNearbyOpen(true, { expanded: true });
  renderNearbyList(map);
}

function setupNearbyPanel(map) {
  if (!nearbyEl) return;

  nearbyToggleEl?.addEventListener("click", () => {
    const collapsed = nearbyEl.classList.toggle("is-collapsed");
    nearbyToggleEl.setAttribute("aria-expanded", String(!collapsed));
  });

  nearbyCloseEl?.addEventListener("click", () => {
    // Cierra la lista; el marker de usuario se mantiene.
    setNearbyOpen(false);
  });
}

async function resolveDeepLink(map, link) {
  if (!link?.id) return;

  if (link.coords) {
    map.jumpTo({
      center: link.coords,
      zoom: Math.max(map.getZoom(), 15),
    });
  }

  showToast("Buscando fuente…", true);

  const tryResolve = () =>
    resolveFeatureById(link.id, { coords: link.coords || undefined });

  let { feature, error, transient } = await tryResolve();

  // Overpass saturado ≠ fuente inexistente: reintenta tras el cooldown típico.
  if (!feature && transient) {
    showToast("El servidor de OSM está saturado; reintento en unos segundos…", true);
    await new Promise((r) => setTimeout(r, 21000));
    ({ feature, error, transient } = await tryResolve());
  }

  if (feature) {
    store.set({ features: getAllFeatures() });
    focusFountain(map, feature);
    showToast("Fuente encontrada.");
    return;
  }

  console.warn("[deep-link]", link.id, error);
  if (transient) {
    // Deja la URL y el mapa; un pan posterior puede completar la carga.
    showToast("No se pudo cargar la fuente ahora. Prueba a mover el mapa.");
    return;
  }

  showToast("No se encontró esa fuente.");
  clearFountainFromUrl();
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

// ── Render: actualiza mapa + contador del viewport ───────────────────────────
function render(map, state) {
  const source = map.getSource(SOURCE_ID);
  if (!source) return;
  source.setData({ type: "FeatureCollection", features: state.features });
  updateViewportCount(map);
  if (nearbyVisible) renderNearbyList(map);
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
  map.on("click", "fuentes-icon", (e) => {
    const feature = e.features[0];
    openSheet(feature.properties, feature.geometry.coordinates);
    map.easeTo({ center: feature.geometry.coordinates, offset: [0, -80] });
  });

  // Click en el mapa vacío → cerrar panel.
  map.on("click", (e) => {
    const hits = map.queryRenderedFeatures(e.point, {
      layers: ["fuentes-point", "fuentes-icon", "clusters"],
    });
    if (!hits.length) closeSheet();
  });

  // Cursor de mano sobre elementos interactivos.
  for (const id of ["clusters", "fuentes-point", "fuentes-icon"]) {
    map.on("mouseenter", id, () => (map.getCanvas().style.cursor = "pointer"));
    map.on("mouseleave", id, () => (map.getCanvas().style.cursor = ""));
  }
}

function wireSheetActions() {
  if (!sheetBody) return;
  sheetBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-share-id]");
    if (!btn) return;
    const id = btn.getAttribute("data-share-id");
    const lng = Number(btn.getAttribute("data-share-lng"));
    const lat = Number(btn.getAttribute("data-share-lat"));
    const title = btn.getAttribute("data-share-title") || undefined;
    const coords =
      Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : null;
    try {
      const result = await shareFountain(id, coords, title);
      if (result === "copied") showToast("Enlace copiado.");
    } catch (err) {
      if (err?.name === "AbortError") return;
      showToast("No se pudo compartir el enlace.");
    }
  });
}

function setupKeyboard() {
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (sheetOpen) closeSheet();
    else if (nearbyVisible) setNearbyOpen(false);
  });
}

async function main() {
  const splash = setupSplash();
  // Tope de seguridad: Overpass puede tardar mucho o no responder, y el estilo
  // del mapa podría no cargar nunca. Pasado este margen se destapa la app y el
  // toast «Cargando fuentes…» sigue informando.
  const splashFailsafe = setTimeout(() => splash.hide(), 6000);
  const hideSplash = () => {
    clearTimeout(splashFailsafe);
    splash.hide();
  };

  const map = initMap();
  const deepLink = readFountainLink();
  setupGeolocation(map, document.getElementById("locate-btn"), showToast, () => {
    openNearbyList(map);
  });
  setupSearch(map, showToast);
  setupNearbyPanel(map);

  if (CONFIG.usingFallbackStyle) {
    console.warn(
      "[Water] Sin clave de MapTiler: usando estilo de respaldo y buscador " +
        "desactivado. Define VITE_MAPTILER_KEY en un fichero .env " +
        "(ver .env.example)."
    );
  }

  const sheetClose = document.getElementById("sheet-close");
  if (sheetClose) sheetClose.addEventListener("click", closeSheet);
  setupKeyboard();
  wireSheetActions();

  store.subscribe((state) => render(map, state));

  map.on("load", async () => {
    addFuentesLayers(map, {
      type: "FeatureCollection",
      features: [],
    });
    wireInteractions(map);

    // Deep link primero (una sola ruta Overpass); luego rellena el viewport.
    // Los listeners de moveend se registran después: si no, jumpTo/easeTo
    // del deep link dispara otro fetchArea en paralelo → 429/504 y toast
    // falso de «fuente no encontrada».
    try {
      if (deepLink) {
        await resolveDeepLink(map, deepLink);
        await refreshData(map);
      } else {
        showToast("Cargando fuentes…", true);
        await refreshData(map);
        if (store.get().features.length > 0) {
          showToast("Toca un punto para ver los detalles.");
        }
      }
    } finally {
      // Primera carga terminada (éxito o error): fuera el splash.
      hideSplash();
    }

    map.on("moveend", () => {
      updateViewportCount(map);
      if (nearbyVisible) renderNearbyList(map);
    });
    map.on("moveend", debounce(() => refreshData(map), 400));
  });
}

main();
