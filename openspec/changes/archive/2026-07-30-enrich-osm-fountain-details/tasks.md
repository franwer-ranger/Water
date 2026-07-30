## 1. Modelo y mapeo OSM

- [x] 1.1 Definir lista whitelist de tags → `{ key, labelEs, valueLabel? }`
- [x] 1.2 En `js/sources/osm.js`, rellenar `amenities[]` desde `tags` (ignorar ausentes; manejar yes/no/limited)
- [x] 1.3 Asegurar que Madrid y el merge no rompen si `amenities` falta (default `[]`)

## 2. UI de ficha

- [x] 2.1 Extender `detailHtml` con sección de chips solo si hay amenities
- [x] 2.2 Estilos de chips coherentes con píldoras de estado existentes
- [x] 2.3 Fuera de alcance de este change: enlace “Mejorar en OSM” (otro change)

## 3. Verificación

- [x] 3.1 Localizar en Overpass/dev al menos una fuente con `bottle` o `wheelchair` y comprobar chips
- [x] 3.2 Abrir una fuente Madrid y confirmar que la ficha sigue correcta sin sección vacía
