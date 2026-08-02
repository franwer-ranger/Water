## 1. Icon module

- [x] 1.1 Add `js/icons.js` with Heroicons outline SVGs (magnifyingGlass, mapPin, xMark, chevronDown, exclamationTriangle, map, share) plus custom brand `drop`, and `icon(name, className?)` helper
- [x] 1.2 Add base `.icon` CSS (size, currentColor → `--accent`) without breaking glass layouts

## 2. Wire chrome UI

- [x] 2.1 Replace search SVG, FAB pin emoji, clear/close `×`, and nearby chevron CSS with outline icons in `index.html` (+ CSS tweaks)
- [x] 2.2 Update `detailHtml` in `js/markers.js`: custom drop header; outline icons for warn / directions / share (import from `icons.js`)
- [x] 2.3 Smoke-check: `npm run build` succeeds; map drop layer untouched

## 3. Wrap-up

- [x] 3.1 Mark OpenSpec tasks complete after visual sanity on key controls
