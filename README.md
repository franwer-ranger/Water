# 💧 Fuentes de agua potable

Mapa web interactivo (estilo Google Maps) de **fuentes de agua potable de todo
el mundo**. Usa [OpenStreetMap](https://www.openstreetmap.org/) (vía Overpass)
como base global, y datasets oficiales como **excepciones verificadas** que
tienen prioridad en su región — hoy, el del Ayuntamiento de Madrid, que aporta
el estado real de cada fuente. Construido con
[MapLibre GL JS](https://maplibre.org/) (mapa vectorial WebGL), teselas y
geocoding de [MapTiler](https://www.maptiler.com/), [Vite](https://vite.dev/) y
UI glassmorphism en vanilla JS.

## Características

- 🗺️ Mapa mundial a pantalla completa; las fuentes se cargan **bajo demanda
  por zona** al mover el mapa (con caché por celdas para no repetir peticiones).
- 🔎 **Buscador de ciudades y zonas** (geocoding de MapTiler) con dropdown
  glass accesible por teclado; al elegir un resultado se navega a la zona y se
  cargan sus fuentes.
- 🌍 Fuentes de **OpenStreetMap** (`amenity=drinking_water`) en cualquier
  lugar del mundo, en color azul (sin estado).
- 🟢🟠🔴 En Madrid, datos oficiales con color según el estado real (operativa,
  cerrada temporalmente, fuera de servicio) y **chips para filtrar** por
  estado. Los duplicados OSM ↔ oficial se eliminan por proximidad.
- 💬 Panel de detalle (bottom sheet) con nombre/dirección, estado (si se
  conoce), atribución del dato y botón **"Cómo llegar"**.
- 📍 Botón **"Cerca de mí"** que usa geolocalización del navegador.
- 📱 Diseño responsive (móvil y escritorio) y clustering para un rendimiento
  fluido.

## Ejecutar en local

```bash
npm install
cp .env.example .env   # y pega tu clave de MapTiler
npm run dev            # http://localhost:5173
```

### Clave de MapTiler

El estilo del mapa y el buscador usan MapTiler. Consigue una **clave gratuita**
(100k cargas/mes) en [cloud.maptiler.com](https://cloud.maptiler.com/account/keys/),
ponla en `.env` como `VITE_MAPTILER_KEY` y **restríngela a tu dominio** en el
panel de MapTiler (la clave de cliente es pública por naturaleza). Sin clave,
la app usa un estilo raster de respaldo y desactiva el buscador.

## Build y despliegue

```bash
npm run build     # genera dist/
npm run preview   # sirve dist/ en local
```

El workflow [`deploy.yml`](.github/workflows/deploy.yml) compila con Vite y
publica `dist/` en GitHub Pages en cada push a `main`. Configura el secret
`VITE_MAPTILER_KEY` en **Settings → Secrets and variables → Actions**. Las
rutas del build son relativas, así que funciona tanto con dominio propio
(`public/CNAME`) como bajo `https://<usuario>.github.io/<repo>/`.

## Arquitectura de datos

Cada *source adapter* implementa un contrato único
(`fetchArea(bbox) → features normalizadas`) y mapea sus datos crudos a un
esquema común (`statusCat: 'ok' | 'warn' | 'off' | 'unknown'`, name/address/area
opcionales):

- [`js/sources/osm.js`](js/sources/osm.js) — Overpass
  (`amenity=drinking_water`); base global, sin estado (`unknown`). Caché por
  celdas de 0,1° para no repetir peticiones al volver a una zona.
- [`js/sources/madrid.js`](js/sources/madrid.js) — GeoJSON oficial del
  Ayuntamiento; aporta estado real.
- [`js/sources/registry.js`](js/sources/registry.js) — decide qué adapters
  consultar para un bbox y elimina los puntos OSM que duplican una fuente
  oficial a <75 m. Para añadir una nueva excepción oficial basta con crear un
  adapter con la misma interfaz y listarlo aquí.

La carga se dispara en `moveend` (debounce 400 ms) a partir de `minDataZoom`
(10, suficiente para abarcar una ciudad completa al buscarla); por debajo se
invita a acercarse o usar el buscador.

## Estructura

```
index.html                Página única (entry de Vite)
css/styles.css            Estilos y layout responsive (glass)
js/config.js              Clave MapTiler (env), estilo, zooms, endpoints
js/app.js                 Punto de entrada: mapa, carga por viewport, filtros
js/data.js                Orquestador: merge de sources + de-duplicación
js/sources/               Adapters de datos (osm, madrid, registry)
js/search.js              Buscador (geocoding MapTiler)
js/store.js               Store reactivo mínimo
js/markers.js             Capas vectoriales (clúster + puntos) y panel de detalle
js/geolocation.js         Botón "Cerca de mí"
public/data/fuentes.geojson  Dataset oficial de Madrid (actualización diaria)
scripts/update-data.mjs   Regeneración del dataset de Madrid
vite.config.js            Build (base relativa, dist/)
```

## Datos y licencia

- **OpenStreetMap** vía [Overpass API](https://overpass-api.de/): datos
  © colaboradores de OpenStreetMap, [ODbL](https://www.openstreetmap.org/copyright).
- **Madrid**: conjunto abierto **"Fuentes de agua para beber"** del
  [Ayuntamiento de Madrid](https://datos.madrid.es/dataset/300051-0-fuentes)
  (actualización diaria automática vía
  [`update-data.yml`](.github/workflows/update-data.yml); ver
  [`scripts/fetch-data.md`](scripts/fetch-data.md)).

Mapa base © [MapTiler](https://www.maptiler.com/copyright/) y
© [OpenStreetMap](https://www.openstreetmap.org/copyright) y sus colaboradores.
MapLibre GL JS se distribuye bajo licencia BSD-3.
