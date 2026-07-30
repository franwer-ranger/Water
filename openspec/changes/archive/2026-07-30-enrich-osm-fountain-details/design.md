## Context

El adapter OSM en `js/sources/osm.js` ya recibe `tags` de Overpass pero solo usa `name` (y filtra `access`). La ficha se construye en `detailHtml` (`js/markers.js`). Ver proposal.md — Why.

## Goals / Non-Goals

**Goals:**
- Campo estable `amenities: { key, label, value? }[]` (o mapa tipado) en el feature normalizado
- UI de chips en el sheet sin romper Madrid
- Tabla de mapeo centralizada y fácil de ampliar

**Non-Goals:**
- Filtros por amenity en este change
- Traducir todos los tags OSM posibles

## Decisions

1. **Amenities en el feature normalizado**  
   El adapter OSM produce `amenities[]`; Madrid deja `amenities: []` o ausente.  
   *Alternativa:* leer tags crudos en la UI — acopla OSM al sheet.

2. **Whitelist de tags**  
   Solo mapear un set curado (`bottle`, `wheelchair`, `fee`, `seasonal`, `drinking_water:refill`, opcionalmente `dog`). Valores `yes`/`no`/`limited` con labels claros; ignorar valores desconocidos.  
   *Alternativa:* volcar todos los tags — ruido para el usuario.

3. **Chips en español en `detailHtml`**  
   Labels fijos en el mapeo (`Botellas`, `Accesible`, `De pago`, `Estacional`).

4. **No cambiar la query Overpass**  
   Los tags ya vienen en el elemento; no hace falta `out tags` extra si ya se pide el nodo completo.

## Risks / Trade-offs

- [Cobertura baja de tags en OSM] → Chips solo cuando existan; valor igual cuando hay datos
- [Valores ambiguos `wheelchair=limited`] → Label específico “acceso limitado”
- [Duplicar lógica si luego hay filtros] → Mismo módulo de mapeo reutilizable

## Migration Plan

Sin migración de datos. Rollback trivial.

## Open Questions

- ¿Incluir enlace “Mejorar en OSM” en el mismo change o dejarlo para otro?
