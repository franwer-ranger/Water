## Context

Hoy tras geolocalización solo hay flyTo + marker de usuario; las features viven en el store/`data.js` ya cargadas por viewport. Ver proposal.md — Why.

## Goals / Non-Goals

**Goals:**
- Ranking por distancia haversine en cliente sobre features ya cargadas
- Panel/lista coherente con el glassmorphism actual (sheet o panel inferior/lateral)
- Reutilizar filtros existentes del store

**Non-Goals:**
- Fetch dedicado solo para la lista (v1 usa datos en memoria)
- Routing propio

## Decisions

1. **Fuente de datos = features en memoria**  
   Tras “Cerca de mí” el zoom suele ser alto y el viewport ya disparó Overpass/Madrid. Evita nueva API.  
   *Alternativa:* query Overpass por radio — más completo pero frágil con rate limits.

2. **Haversine simple en JS**  
   Suficiente a escala urbana; sin dependencias.  
   *Alternativa:* turf.js — overkill.

3. **UI: sheet/lista apilable bajo controles**  
   Lista colapsable (“N cerca”) que no tape el mapa entero en móvil. Tap → mismo path que click en marker (`openDetail`).  
   *Alternativa:* sidebar solo desktop — peor en móvil, caso principal.

4. **Defaults:** radio ~800 m, max 10 resultados (constantes en `config.js`).

## Risks / Trade-offs

- [Lista vacía aunque haya fuentes a 1 km] → Mensaje “alejate el zoom / mueve el mapa” + opcional botón ampliar radio más adelante
- [Features OSM aún no cargadas] → Mostrar loading breve o recompute en `moveend` tras fetch
- [Contador global confuso vs lista] → La lista es independiente del contador de sesión

## Migration Plan

Despliegue estático habitual. Rollback = revertir el change; sin migración de datos.

## Open Questions

- ¿Abrir la lista automáticamente tras geolocalización o solo un badge “ver cercanas”?
