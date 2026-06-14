// Configuración central de la aplicación (MapLibre GL + MapTiler).

// ───────────────────────────────────────────────────────────────────────────
//  CLAVE DE MAPTILER  ← pega aquí tu clave gratuita
//  Consíguela en https://cloud.maptiler.com/account/keys/ (100k cargas/mes
//  gratis) y restríngela a tu dominio en el panel de MapTiler.
//  Mientras esté el valor por defecto, la app usa un estilo de respaldo
//  gratuito de MapLibre para que el mapa siga renderizando.
// ───────────────────────────────────────────────────────────────────────────
export const MAPTILER_KEY = "V7XgnRt67o2g2L2kypS4";

const hasKey = MAPTILER_KEY && MAPTILER_KEY !== "GET_YOUR_FREE_KEY";

// Estilo de respaldo sin clave: mapa de calles OSM (raster) para que la app
// siga viéndose bien antes de añadir la clave de MapTiler. El servidor de
// fuentes de OpenMapTiles aporta las glifos para los números de clúster.
const RASTER_FALLBACK = {
  version: 8,
  glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
  sources: {
    osm: {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

export const CONFIG = {
  // MapLibre usa [lng, lat]
  center: [-3.7038, 40.4168], // Puerta del Sol
  zoom: 12.5,
  minZoom: 10,
  maxZoom: 19,
  // Límites del término municipal: [[oeste, sur], [este, norte]]
  maxBounds: [
    [-4.05, 40.2],
    [-3.4, 40.7],
  ],

  // Estilo vectorial. Streets v2 de MapTiler (look tipo Google Maps) con clave;
  // mapa de calles OSM como respaldo sin clave.
  style: hasKey
    ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`
    : RASTER_FALLBACK,
  usingFallbackStyle: !hasKey,

  // Atribución del dataset (las teselas/estilo añaden la suya automáticamente).
  attribution:
    'Datos: <a href="https://datos.madrid.es/dataset/300051-0-fuentes" target="_blank" rel="noopener">Ayuntamiento de Madrid</a>',

  // GeoJSON local (ruta relativa para GitHub Pages)
  dataUrl: "data/fuentes.geojson",

  // Clustering nativo de MapLibre
  cluster: {
    radius: 55,
    maxZoom: 16,
  },
};
