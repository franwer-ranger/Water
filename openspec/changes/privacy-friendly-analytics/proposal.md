## Why

Fountly es una herramienta pública sin cuentas: conviene saber si se usa (visitantes únicos, páginas vistas, uso básico) sin construir un sistema de usuarios. Tener el change en specs permite implementarlo cuando toque, típicamente con un proveedor de analítica web.

## What Changes

- Integrar analítica de tráfico/uso en el sitio estático (visitantes, vistas, y eventos mínimos de producto).
- Preferir una opción simple de configurar (p. ej. GA4, Plausible, Umami o Cloudflare Web Analytics) vía ID/env, desactivable si no hay clave.
- Cumplir privacidad básica: no PII, no tracking de cuentas (no existen), y consentimiento/aviso si el proveedor lo exige (p. ej. cookies de GA en UE).
- Documentar en README qué se mide y cómo desactivarlo.

## Non-goals

- Cuentas de usuario, login o perfiles.
- Gamificación, rachas, favoritos en la nube o leaderboards.
- Heatmaps, session replay o grabación de pantallas.
- Panel de analytics propio (usar el del proveedor).

## Capabilities

### New Capabilities

- `site-analytics`: medición anónima de uso del sitio (audiencia y eventos clave) sin autenticación de usuarios.

### Modified Capabilities

- (ninguna)

## Impact

- `index.html` (script/snippet), posiblemente `js/` fino para eventos (`geolocate`, `open_fountain`, `search`)
- Variable de entorno / build (`VITE_…`) para el ID del proveedor
- Posible aviso de cookies / privacidad si se elige un proveedor basado en cookies
- Sin backend; sin cambios al modelo de fuentes
