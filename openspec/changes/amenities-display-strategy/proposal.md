## Why

Los amenities OSM (`fee`, `bottle`, etc.) solo aparecen cuando el tag existe. Eso hace que «Gratis» salga en unas fuentes y no en otras, sin que la ausencia signifique «de pago». Necesitamos una estrategia de producto antes de tocar la UI.

## What Changes

- Definir (en specs) cómo mostrar amenities cuando el dato es incompleto: excepciones vs defaults vs tres estados (sí/no/desconocido).
- Decidir trato especial de `fee` vs otros tags.
- **No implementar** UI en este change; solo capturar requisitos y opciones.

## Non-goals

- No cambiar código de `amenities.js` / ficha en este change.
- No inventar datos OSM ausentes como hechos.

## Capabilities

### New Capabilities

_(ninguna — se modifica la existente)_

### Modified Capabilities

- `fountain-amenities`: Clarificar requisitos de visualización ante tags ausentes y posibles reglas por tipo de amenity.

## Impact

- Solo artefactos OpenSpec; implementación futura en un apply posterior.
- Código actual (`js/amenities.js`, `js/markers.js`) permanece hasta entonces.
