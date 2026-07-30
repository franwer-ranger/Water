## 1. Modelo y mapeo OSM

- [ ] 1.1 Definir lista whitelist de tags → `{ key, labelEs, valueLabel? }`
- [ ] 1.2 En `js/sources/osm.js`, rellenar `amenities[]` desde `tags` (ignorar ausentes; manejar yes/no/limited)
- [ ] 1.3 Asegurar que Madrid y el merge no rompen si `amenities` falta (default `[]`)

## 2. UI de ficha

- [ ] 2.1 Extender `detailHtml` con sección de chips solo si hay amenities
- [ ] 2.2 Estilos de chips coherentes con píldoras de estado existentes
- [ ] 2.3 Fuera de alcance de este change: enlace “Mejorar en OSM” (otro change)

## 3. Verificación

- [ ] 3.1 Localizar en Overpass/dev al menos una fuente con `bottle` o `wheelchair` y comprobar chips
- [ ] 3.2 Abrir una fuente Madrid y confirmar que la ficha sigue correcta sin sección vacía
