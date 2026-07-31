## Why

La UI mezcla semáforos de estado (solo Madrid), filtros que no aplican fuera de esa ciudad, y marcadores azules casi idénticos a «mi ubicación». El estado del Ayuntamiento no es fiable del todo: fuentes marcadas como cerradas a menudo están abiertas. La app debe ayudar a encontrar agua, no ocultar puntos por un dato dudoso.

## What Changes

- **BREAKING (UX):** Eliminar por completo el menú de filtros por estado operativo.
- Mostrar todas las fuentes por igual (Madrid y OSM) en el mapa, sin ocultar por `statusCat`.
- Convertir el estado de Madrid en un aviso suave en la ficha («Posiblemente cerrada temporalmente», etc.), no en un semáforo de marcador ni filtro.
- Unificar el color de todos los marcadores de fuente; añadir un icono de gota pequeño.
- Rediseñar el marcador de ubicación del usuario estilo Apple Maps (punto + anillo de pulso), claramente distinto de las fuentes.
- Restringir estilos `:hover` a dispositivos con puntero fino (`hover: hover` + `pointer: fine`); en touch usar `:active` / `:focus-visible`.

## Non-goals

- No cambiar la estrategia de amenities/tags OSM (`fee`, `bottle`, etc.): queda en el change `amenities-display-strategy`.
- No añadir nuevos datasets oficiales ni backend.
- No rediseñar el glassmorphism general ni el buscador.
- No gamificación ni cuentas de usuario.

## Capabilities

### New Capabilities

- `map-markers`: Apariencia unificada de fuentes vs marcador de usuario, y comportamiento táctil de hovers en controles del mapa.
- `fountain-status-hint`: Estado operativo oficial (p. ej. Madrid) como aviso no tajante en la ficha; sin filtrado ni semáforo en el mapa.

### Modified Capabilities

- `nearby-list`: Dejar de filtrar por estado activo; ajustar cómo se muestra (o no) el estado en la lista.
- `viewport-count`: El contador deja de depender de filtros por estado.

## Impact

- `index.html` (quitar UI de filtros), `css/styles.css`, `js/app.js`, `js/store.js`, `js/markers.js`, `js/geolocation.js`, `js/nearby.js`
- Adapters Madrid/OSM: se mantiene `statusCat` en datos; deja de colorear capas y de alimentar filtros
- Sin cambios de dependencias npm ni de CI
