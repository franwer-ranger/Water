## Context

Ver proposal.md — Why. Hoy: filtros por `statusCat` en toolbar; capas MapLibre coloreadas por estado; `user-marker` círculo azul casi igual a puntos OSM (`COLORS.unknown`); `:hover` sin media query de puntero.

## Goals / Non-Goals

**Goals:** Quitar filtros y `activeCats` del flujo UI; unificar paint de fuentes; gota en símbolo; user marker Apple-like; status suave solo en sheet; hover gated.

**Non-Goals (design):** No reescribir clustering; no tocar amenities OSM; no cambiar Overpass ni el GeoJSON de Madrid.

## Decisions

1. **Mantener `statusCat` en features, dejar de usarlo en capas/filtros**  
   Sigue alimentando el hint de ficha. Alternativa: borrarlo del adapter — descartada; reintroduce trabajo si hay datasets oficiales futuros.

2. **Copy suave (ES)**  
   - `warn` → «Posiblemente cerrada temporalmente»  
   - `off` → «Posiblemente fuera de servicio»  
   - `ok` → no mostrar píldora (evitar falsa certeza); el dato positivo no aporta si no nos fiamos del negativo tampoco de forma tajante.  
   Alternativa: mostrar «Según Ayuntamiento: operativa» — más verboso; se puede añadir luego.

3. **Capas MapLibre: color único + symbol de gota**  
   Circle (o circle+symbol) con `COLORS` unificado (`--accent`). Icono gota vía `map.addImage` / SDF o SVG rasterizado pequeño. Alternativa: solo círculo con borde distinto al user — menos diferenciación fuente↔usuario.

4. **User marker: DOM Marker Apple-like**  
   Punto azul intenso + anillo blanco + halo animado (CSS). No reutilizar color exacto del fill de fuentes si se puede; si el fill de fuente es accent, el user usa azul Maps (`#007AFF`) o similar + pulso. Alternativa: `GeolocateControl` nativo — menos control visual.

5. **Hover**  
   Envolver reglas `:hover` existentes en `@media (hover: hover) and (pointer: fine)`. Mantener `:active` / `:focus-visible` fuera.

6. **Lista cercanas**  
   Quitar píldoras de color de estado en ítems (alineado con mapa). Distancia + etiqueta bastan; el hint vive en la ficha.

7. **Store**  
   Eliminar `activeCats` y lógica asociada en `app.js` / `store.js`.

## Risks / Trade-offs

- [Fuentes realmente cerradas visibles] → Mitigación: aviso en ficha; mejor que ocultar por dato dudoso.  
- [Icono gota en clústers] → Clústers siguen siendo burbuja numérica de marca; solo puntos individuales llevan gota.  
- [Contraste gota a zoom bajo] → Radio/escala interpolada; probar en móvil.

## Migration Plan

Despliegue estático habitual (GitHub Pages). Rollback = revert del commit. Sin migración de datos.

## Open Questions

Ninguna que bloquee implementación; copy exacto de `ok` omitido a propósito.
