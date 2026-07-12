// Configuración central de la aplicación (MapLibre GL + MapTiler).

// ───────────────────────────────────────────────────────────────────────────
//  CLAVE DE MAPTILER
//  Se lee de la variable de entorno VITE_MAPTILER_KEY (fichero `.env` en
//  local — ver `.env.example` — o secret de GitHub Actions en CI). La clave
//  de cliente es pública por naturaleza: mantén la restricción por dominio
//  en el panel de MapTiler. Como respaldo se usa la clave histórica del
//  proyecto para que un build sin `.env` siga funcionando igual.
// ───────────────────────────────────────────────────────────────────────────
export const MAPTILER_KEY =
  import.meta.env.VITE_MAPTILER_KEY;

const hasKey = Boolean(MAPTILER_KEY);

// Estilo de respaldo sin clave: mapa de calles OSM (raster) para que la app
// siga viéndose bien sin clave de MapTiler. El servidor de fuentes de
// OpenMapTiles aporta las glifos para los números de clúster.
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
  minZoom: 2, // mapa mundial: sin maxBounds ni zoom mínimo local
  maxZoom: 19,

  // Zoom mínimo para cargar fuentes por viewport (por debajo, se invita a
  // acercarse o usar el buscador; consultar el mundo entero no es viable).
  // A 10 entra una ciudad completa: así el fitBounds del buscador siempre
  // queda por encima y carga datos.
  minDataZoom: 10,

  // Estilo vectorial. Streets v2 de MapTiler (look tipo Google Maps) con clave;
  // mapa de calles OSM como respaldo sin clave.
  style: hasKey
    ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`
    : RASTER_FALLBACK,
  usingFallbackStyle: !hasKey,

  // Atribución de los datasets (las teselas/estilo añaden la suya).
  attribution:
    'Fuentes: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · <a href="https://datos.madrid.es/dataset/300051-0-fuentes" target="_blank" rel="noopener">Ayto. de Madrid</a>',

  // GeoJSON oficial de Madrid (copiado desde public/ al build; ruta relativa
  // para GitHub Pages).
  madridDataUrl: "data/fuentes.geojson",

  // API pública de Overpass (fuentes OSM de todo el mundo).
  overpassEndpoint: "https://overpass-api.de/api/interpreter",

  // Geocoding de MapTiler para el buscador (requiere clave). `center`
  // ({lng, lat}) sesga los resultados hacia la zona visible del mapa.
  geocoding: {
    url: (query, center) => {
      const proximity = center
        ? `&proximity=${center.lng.toFixed(4)},${center.lat.toFixed(4)}`
        : "";
      return `https://api.maptiler.com/geocoding/${encodeURIComponent(
        query
      )}.json?key=${MAPTILER_KEY}&limit=5&language=es&fuzzyMatch=true${proximity}`;
    },
    enabled: hasKey,
  },

  // Clustering nativo de MapLibre
  cluster: {
    radius: 55,
    maxZoom: 16,
  },
};
