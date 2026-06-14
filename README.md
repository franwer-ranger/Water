# 💧 Fuentes de agua potable de Madrid

Mapa web interactivo (estilo Google Maps) que muestra **únicamente las fuentes de
agua potable de Madrid**. Construido con [MapLibre GL JS](https://maplibre.org/)
(mapa vectorial WebGL) y teselas de [MapTiler](https://www.maptiler.com/),
con UI glassmorphism. Desplegable como sitio estático.

![Fuentes de Madrid](https://img.shields.io/badge/fuentes-2270-blue)

## Características

- 🗺️ Mapa a pantalla completa centrado en Madrid.
- 📍 **2.270 fuentes** de agua potable con agrupación en clústeres para un
  rendimiento fluido.
- 🟢🟠🔴 Color según el estado de la fuente (operativa, cerrada temporalmente,
  fuera de servicio), con **chips para filtrar** por estado.
- 💬 Panel de detalle (bottom sheet) con dirección, barrio, distrito y estado.
- 🧭 Botón **"Cerca de mí"** que usa geolocalización del navegador.
- 🧭 Zoom, rotación e inclinación (3D) con render vectorial fluido.
- 📱 Diseño responsive (móvil y escritorio).

## Ejecutar en local

El sitio carga un GeoJSON local mediante `fetch`, así que necesita un servidor
estático (no funciona abriendo el `index.html` con `file://`):

```bash
python3 -m http.server 8000
# Abrir http://localhost:8000
```

No requiere instalación ni paso de compilación: MapLibre GL está vendorizado
en `vendor/`.

### Clave de MapTiler

El estilo del mapa usa MapTiler. Consigue una **clave gratuita** (100k cargas/mes)
en [cloud.maptiler.com](https://cloud.maptiler.com/account/keys/), pégala en
`js/config.js` (`MAPTILER_KEY`) y restríngela a tu dominio en el panel de MapTiler.
Sin clave, la app usa automáticamente un estilo de respaldo de MapLibre.

## Desplegar en GitHub Pages

1. Sube el repositorio a GitHub.
2. **Settings → Pages → Deploy from a branch**, rama deseada y carpeta `/ (root)`.
3. El fichero `.nojekyll` (incluido) evita el procesado Jekyll.
4. Todas las rutas son relativas, por lo que el sitio funciona bajo
   `https://<usuario>.github.io/<repo>/`.

## Estructura

```
index.html              Página única (mapa + controles)
css/styles.css          Estilos y layout responsive
js/config.js            Clave MapTiler, centro/zoom, estilo, clúster
js/data.js              Carga del GeoJSON local
js/markers.js           Capas vectoriales (clúster + puntos) y panel de detalle
js/geolocation.js       Botón "Cerca de mí"
js/app.js               Punto de entrada
data/fuentes.geojson    Dataset de fuentes (WGS84, recortado)
vendor/                 MapLibre GL JS (sin CDN)
scripts/fetch-data.md   Cómo actualizar los datos
```

## Datos y licencia

Datos del conjunto abierto **"Fuentes de agua para beber"** del
[Ayuntamiento de Madrid](https://datos.madrid.es/dataset/300051-0-fuentes)
(actualización diaria en origen). Consulta
[`scripts/fetch-data.md`](scripts/fetch-data.md) para actualizarlos.

Mapa base © [MapTiler](https://www.maptiler.com/copyright/) y
© [OpenStreetMap](https://www.openstreetmap.org/copyright) y sus colaboradores.
MapLibre GL JS se distribuye bajo licencia BSD-3.
