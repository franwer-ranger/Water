# 💧 Fuentes de agua potable de Madrid

Mapa web interactivo (estilo Google Maps) que muestra **únicamente las fuentes de
agua potable de Madrid**. Construido con [Leaflet](https://leafletjs.com/) y teselas
de OpenStreetMap: sin clave de API, sin coste y desplegable como sitio estático.

![Fuentes de Madrid](https://img.shields.io/badge/fuentes-2270-blue)

## Características

- 🗺️ Mapa a pantalla completa centrado en Madrid.
- 📍 **2.270 fuentes** de agua potable con agrupación en clústeres para un
  rendimiento fluido.
- 🟢🟠🔴 Color según el estado de la fuente (operativa, cerrada temporalmente,
  fuera de servicio).
- 💬 Popups con dirección, barrio, distrito y estado de cada fuente.
- 🧭 Botón **"Cerca de mí"** que usa geolocalización del navegador.
- 📱 Diseño responsive (móvil y escritorio).

## Ejecutar en local

El sitio carga un GeoJSON local mediante `fetch`, así que necesita un servidor
estático (no funciona abriendo el `index.html` con `file://`):

```bash
python3 -m http.server 8000
# Abrir http://localhost:8000
```

No requiere instalación ni paso de compilación: las librerías están vendorizadas
en `vendor/`.

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
js/config.js            Centro/zoom, teselas, opciones de clúster
js/data.js              Carga del GeoJSON local
js/markers.js           Capa de clúster, iconos y popups
js/geolocation.js       Botón "Cerca de mí"
js/app.js               Punto de entrada
data/fuentes.geojson    Dataset de fuentes (WGS84, recortado)
vendor/                 Leaflet + Leaflet.markercluster (sin CDN)
scripts/fetch-data.md   Cómo actualizar los datos
```

## Datos y licencia

Datos del conjunto abierto **"Fuentes de agua para beber"** del
[Ayuntamiento de Madrid](https://datos.madrid.es/dataset/300051-0-fuentes)
(actualización diaria en origen). Consulta
[`scripts/fetch-data.md`](scripts/fetch-data.md) para actualizarlos.

Mapa base © [OpenStreetMap](https://www.openstreetmap.org/copyright) y sus
colaboradores. Leaflet y Leaflet.markercluster se distribuyen bajo licencia BSD-2.
