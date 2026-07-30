## Context

`render` en `js/app.js` hace `setCount(features.length)` sobre todo lo filtrado en memoria. El manifest aún dice Madrid. Ver proposal.md — Why.

## Goals / Non-Goals

**Goals:**
- Contar con bounds del mapa + mismos filtros que el layer
- Recalcular en `moveend` (y en render por filtros/datos)
- Branding Fountly en manifest + title

**Non-Goals:**
- Vaciar la caché al salir del viewport
- Contar solo puntos “renderizados” post-clustering (queryRenderedFeatures subcuenta)

## Decisions

1. **Filtro por bbox de coordenadas** sobre el array ya filtrado por estado — correcto con clustering.
2. **Label:** seguir con `N fuentes` (el número ya es el de la vista).
3. **Marca:** `name: "Fountly"`, `short_name: "Fountly"`, description mundial; title `Fountly — Fuentes de agua potable`.

## Risks / Trade-offs

- [Antimeridian / bbox raro] → Irrelevante al zoom urbano habitual
- [Zoom muy bajo con miles de puntos en memoria en vista] → Contar en JS es barato a esta escala

## Migration Plan

Deploy estático. Usuarios con PWA instalada pueden seguir viendo el nombre viejo hasta que el SO refresque el manifest.

## Open Questions

- Ninguna bloqueante.
