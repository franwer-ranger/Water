## Why

Hoy no se puede mandar “esta fuente” por WhatsApp o guardar un favorito: al abrir `fountly.app` siempre caes en el mapa genérico. Un deep link por `id` hace la app compartible y útil fuera de la sesión.

## What Changes

- URL con query (p. ej. `?f=madrid:10040803` o `?f=osm:node/123`) que, al cargar, vuela al punto y abre la ficha.
- Botón “Compartir” en el bottom sheet (Web Share API + fallback copiar enlace).
- Si la fuente aún no está en memoria, cargarla (bbox mínimo / fetch dirigido) o mostrar toast si no se encuentra.
- Actualizar la URL al seleccionar una fuente (sin ensuciar el historial en exceso).

## Non-goals

- Open Graph / cards sociales en servidor (GitHub Pages estático; meta dinámicas requerirían otro hosting).
- Cuentas de usuario o favoritos en la nube.
- Short links propios.

## Capabilities

### New Capabilities

- `shareable-links`: deep links por id de fuente, apertura al cargar, y acción de compartir desde la ficha.

### Modified Capabilities

- (ninguna — no hay specs base aún)

## Impact

- `js/app.js` (bootstrap + selección), `js/markers.js` (sheet + share), `js/data.js` / sources si hace falta fetch por id
- History API (`pushState`/`replaceState`); sin backend
