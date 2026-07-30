# AGENTS.md

Instrucciones mínimas para asistentes de código en este repositorio.

## Proyecto

Mapa web de **fuentes de agua potable** (OSM global + datasets oficiales por región, hoy Madrid). Vanilla JS + [Vite](https://vite.dev/) + [MapLibre GL JS](https://maplibre.org/) + MapTiler.

## Arranque

```bash
npm install
cp .env.example .env   # VITE_MAPTILER_KEY
npm run dev            # http://localhost:5173
```

- `npm run build` / `npm run preview` — build de producción
- `npm run update-data` — regenera el GeoJSON oficial de Madrid

## Estructura relevante

| Ruta | Rol |
|------|-----|
| `index.html`, `css/` | UI |
| `js/app.js` | Entrada: mapa, carga por viewport, filtros |
| `js/config.js` | Zooms, endpoints, MapTiler |
| `js/data.js` + `js/sources/` | Adapters de datos y merge/dedupe |
| `js/markers.js`, `js/search.js`, `js/geolocation.js` | Capas, buscador, GPS |
| `public/data/` | Datasets estáticos (p. ej. Madrid) |
| `scripts/` | Actualización de datos |

## Convenciones

- Mantener vanilla JS; no añadir frameworks sin pedirlo.
- Nuevas fuentes oficiales: adapter con `fetchArea(bbox) → features` y registro en `js/sources/registry.js`.
- Features normalizadas: `statusCat: 'ok' | 'warn' | 'off' | 'unknown'`.
- No commitear `.env` ni secretos. La clave MapTiler es de cliente; restringir por dominio en MapTiler.
- Cambios acotados; no reescribir arquitectura ni UI sin necesidad.
- Responder en el idioma del usuario cuando escriba en español.

## OpenSpec

Este repo usa (o usará) [OpenSpec](https://github.com/Fission-AI/OpenSpec/) para desarrollo guiado por specs. Artefactos en `openspec/`; skills/comandos `/opsx-*` o `/opsx:*` según el agente.

Flujo habitual cuando se active:

1. Explorar o proponer un cambio (`/opsx-explore`, `/opsx-propose`)
2. Implementar tareas (`/opsx-apply`)
3. Archivar al terminar (`/opsx-archive`)

Antes de cambios de producto no triviales, preferir una proposal/spec OpenSpec frente a improvisar en código.
