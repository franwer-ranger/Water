## 1. URL y resolución

- [ ] 1.1 Definir param `f` + encode/decode del id (`encodeURIComponent`)
- [ ] 1.2 Al boot, leer `f` y encolar apertura cuando el feature esté disponible
- [ ] 1.3 Resolver `madrid:*` tras carga del GeoJSON; `osm:*` vía Overpass por id (y opcionalmente `lng`/`lat` en query como fallback de cámara)
- [ ] 1.4 Toast si no se encuentra; no bloquear el mapa

## 2. Sincronización History

- [ ] 2.1 `replaceState` al abrir ficha con `f=<id>`
- [ ] 2.2 Quitar `f` al cerrar ficha

## 3. Compartir

- [ ] 3.1 Botón “Compartir” en el bottom sheet
- [ ] 3.2 Web Share API con fallback a clipboard + toast

## 4. Verificación

- [ ] 4.1 Abrir link Madrid conocido en frío (reload)
- [ ] 4.2 Abrir link OSM y caso id inválido
- [ ] 4.3 Compartir y pegar el enlace en otra pestaña
