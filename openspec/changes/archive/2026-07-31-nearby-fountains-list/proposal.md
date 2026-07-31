## Why

Hoy Fountly solo muestra fuentes en el mapa: sin ranking por distancia, encontrar la más cercana exige escanear visualmente. Tras “Cerca de mí”, una lista ordenada convierte el mapa en una decisión rápida (“a 120 m · operativa”).

## What Changes

- Tras geolocalización (y opcionalmente desde un punto del mapa), mostrar una lista de fuentes cercanas ordenada por distancia.
- Cada ítem: distancia, estado si existe, nombre/dirección, y tap que abre la ficha / centra el mapa.
- Respetar filtros activos (operativas / cerradas / fuera de servicio).
- Limitar a un radio y un máximo de resultados para no saturar la UI.

## Non-goals

- Navegación turn-by-turn propia (sigue bastando “Cómo llegar” a Google Maps).
- Ranking offline sin fuentes ya cargadas en el viewport/sesión.
- Notificaciones push de fuentes cercanas.

## Capabilities

### New Capabilities

- `nearby-list`: lista de fuentes cercanas al usuario (o a un punto de referencia), ordenada por distancia, sincronizada con filtros y selección en el mapa.

### Modified Capabilities

- (ninguna — no hay specs base aún)

## Impact

- `js/geolocation.js`, `js/app.js`, `js/markers.js`, `js/store.js`, `index.html`, `css/styles.css`
- Cálculo de distancia haversine en cliente sobre features ya en `data.js`
- Sin backend ni nuevas dependencias
