## Why

El contador acumula todas las fuentes cargadas en la sesión (un número engañoso) y el manifest PWA sigue diciendo “Fuentes de Madrid” aunque la app es mundial (Fountly). Corregir ambos restaura confianza y coherencia de marca.

## What Changes

- Contador = fuentes filtradas visibles en el viewport actual (no el total de sesión).
- Actualizar el contador al pan/zoom, no solo al cargar datos.
- Alinear branding PWA/título con Fountly (mapa mundial de fuentes), no “solo Madrid”.

## Non-goals

- Cambiar la caché en memoria de `data.js` (sigue acumulando para no re-fetch).
- Renombrar el paquete npm o el dataset `fuentes.geojson` de Madrid.
- Rediseño visual del toolbar.

## Capabilities

### New Capabilities

- `viewport-count`: contador de fuentes filtradas en el viewport del mapa.
- `app-branding`: nombre y descripción públicos alineados con el alcance mundial (Fountly).

### Modified Capabilities

- (ninguna)

## Impact

- `js/app.js`, `public/manifest.webmanifest`, `index.html` (title / apple title)
