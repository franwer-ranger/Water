## Context

Los ids ya son canónicos (`madrid:…`, `osm:node/…`) en el merge de `data.js`. Bootstrap en `js/app.js`; ficha en `js/markers.js`. Hosting estático en GitHub Pages. Ver proposal.md — Why.

## Goals / Non-Goals

**Goals:**
- Query param estable `f=<id>` (corto, fácil de compartir)
- Resolve al boot + share button
- History limpia (`replaceState` al seleccionar; `pushState` opcional solo si aporta atrás útil)

**Non-Goals:**
- OG/Twitter cards dinámicas (sin SSR)
- Acortador de URLs

## Decisions

1. **Param `f`**  
   `https://fountly.app/?f=madrid:10040803`  
   *Alternativa:* path `/f/madrid/...` — peor en GH Pages sin rewrite rules.

2. **Resolución al boot**  
   - Si el feature ya está en memoria → open.  
   - Si es `madrid:*` → tras cargar GeoJSON Madrid, buscar por id.  
   - Si es `osm:*` → parsear tipo/id, Overpass por id (`node(id)` / `way(id)`) o bbox mínima alrededor de coords si se añaden al link.  
   Preferible: para OSM incluir coords opcionales `?f=osm:node/1&lng=&lat=` como ayuda, pero el id basta con query Overpass por id.

3. **Share**  
   `navigator.share` si existe; si no, `clipboard.writeText` + toast.

4. **History**  
   `replaceState` al abrir/cerrar ficha para no llenar el historial al explorar el mapa.

## Risks / Trade-offs

- [OSM id sin estar en caché] → Fetch Overpass puntual; puede fallar por rate limit → toast
- [Ids Madrid cambian entre updates] → Riesgo bajo; documentar que los links pueden caducar si el ayuntamiento renumerara
- [Encoding de `/` en `osm:node/123`] → Usar `encodeURIComponent` en el valor de `f`

## Migration Plan

Despliegue estático. Links nuevos solo; no rompe URLs existentes sin `f`.

## Open Questions

- ¿Merece la pena coords en el link como fallback visual si Overpass falla?
