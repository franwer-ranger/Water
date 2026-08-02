## Why

La UI mezcla emojis, un SVG ad-hoc y un chevron CSS. Eso se ve inconsistente entre plataformas y no encaja con el primario `#0085c7`. Unificar chrome con Heroicons outline (vendoreados) da coherencia visual sin añadir frameworks.

## What Changes

- Vendorear SVGs outline de Heroicons usados en la UI (lupa, pin, X, chevron, aviso, compartir, cómo llegar).
- Sustituir emojis y el SVG/chevron actuales por esos iconos, con stroke en color primary (`--accent`) sobre fondos glass existentes.
- Añadir un helper pequeño para reutilizar el markup SVG (HTML estático y strings del bottom sheet).
- Mantener la gota custom de marca (marcador MapLibre + cabecera del sheet).

## Non-goals

- No instalar `@heroicons/react` / Vue ni el set completo de Heroicons.
- No cambiar el marcador del mapa ni rediseñar glassmorphism / layout.
- No introducir solid icons ni chips con fondo primary (opción B).
- No tocar favicon / PWA icons.

## Capabilities

### New Capabilities

- `ui-icons`: Sistema de iconos de chrome (Heroicons outline vendoreados + gota custom de marca) y su uso en buscador, FAB, sheet y lista cercanas.

### Modified Capabilities

- (ninguna)

## Impact

- `index.html`, `css/styles.css`, `js/markers.js` (HTML del sheet), posible `js/icons.js` + SVGs bajo `assets/` o `js/`.
- Sin nuevas dependencias npm. Sin cambios de datos ni deploy.
