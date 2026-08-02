## Context

See proposal.md — Why. Hoy: lupa SVG ad-hoc en `index.html`, emojis en FAB/sheet (`📍💧⚠🧭🔗`), `×` en clear/close, chevron CSS en cercanas, gota canvas en MapLibre. Stack vanilla + Vite; sin React.

## Goals / Non-Goals

**Goals:**
- Un módulo `js/icons.js` con SVGs outline Heroicons (MIT) como strings reutilizables.
- Sustituir chrome UI; gota custom intacta (mapa + cabecera sheet).
- Estilo: `stroke="currentColor"` + CSS `color: var(--accent)` sobre glass.

**Non-Goals:**
- npm Heroicons, sprite sheet, rediseño de layout, PWA icons, opción B (fondo primary).

## Decisions

### 1. Vendorear SVGs en `js/icons.js`, no npm
- **Choice:** Helper `icon(name, className?)` que devuelve markup SVG outline 24×24.
- **Why:** ~7 iconos; cero deps; usable en HTML estático y `detailHtml` strings.
- **Alt:** `@heroicons/react` (no aplica); archivos `.svg` + `?raw` (más I/O para pocos iconos).

### 2. Set inicial
| Uso | Heroicon outline |
|-----|------------------|
| Buscar | MagnifyingGlass |
| Cerca de mí | MapPin |
| Clear / close | XMark |
| Chevron cercanas | ChevronDown |
| Status warn | ExclamationTriangle |
| Cómo llegar | Map |
| Compartir | Share |

Gota sheet: SVG custom inline (misma silueta que el marcador), no Heroicons.

### 3. Color vía `currentColor` + `--accent`
Clase `.icon` (tamaño) y contexto (`.fab__icon`, `.sheet__icon`, etc.) con `color: var(--accent)`. Buscador: accent también (opción A unificada).

### 4. Fuera de alcance MapLibre
`createDropImage()` sin cambios.

## Risks / Trade-offs

- [SVG strings duplicados en HTML/JS] → Un solo `icons.js`; en `index.html` pegar markup una vez o inyectar al boot si hace falta (preferir markup estático en HTML para search/FAB/close sin flash).
- [Licencia] → Heroicons MIT; atribuir en comentario breve en `icons.js`.

## Migration Plan

Deploy estático normal. Rollback = revert del commit. Sin migración de datos.
