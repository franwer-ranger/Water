## Why

Las fichas OSM casi solo muestran nombre y estado `unknown`. OpenStreetMap ya trae tags útiles (`bottle`, `wheelchair`, `fee`, `seasonal`, `drinking_water:*`) que Fountly ignora. Enriquecer la ficha mejora la decisión sin nuevos datasets.

## What Changes

- Extender el adapter OSM para normalizar tags relevantes al esquema de feature (o un campo `amenities`/`tags` tipado).
- Mostrar en el bottom sheet iconos/chips legibles: botellas, silla de ruedas, de pago, estacional, etc.
- Omitir chips cuando el tag no exista; no inventar datos.
- Mantener compatibilidad con fuentes Madrid (sin esos tags o mapeados si aplica).

## Non-goals

- Edición OSM desde la app.
- Scraping de fotos o Street View.
- Nuevos filtros por accesibilidad en este change (puede venir después reutilizando los mismos campos).

## Capabilities

### New Capabilities

- `fountain-amenities`: exposición y visualización de atributos OSM útiles en la ficha de detalle de una fuente.

### Modified Capabilities

- (ninguna — no hay specs base aún)

## Impact

- `js/sources/osm.js` (normalización), `js/markers.js` (`detailHtml`), posiblemente `js/data.js` / tipos implícitos del feature
- Sin cambios de CI ni Overpass query más allá de leer tags ya devueltos
