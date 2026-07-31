## 1. Quitar filtros y activeCats

- [x] 1.1 Eliminar markup del menú de filtros en `index.html` y CSS asociado
- [x] 1.2 Quitar `activeCats`, `setupFilters` / `setupFilterMenu` y filtrado por estado en `app.js` / `store.js`
- [x] 1.3 Contador de viewport: contar todas las fuentes en bounds (sin estado)
- [x] 1.4 Lista cercanas: dejar de intersectar con filtros de estado

## 2. Status suave en ficha

- [x] 2.1 Sustituir píldora tajante en `detailHtml` por aviso suave (`warn` / `off`); omitir en `ok` y `unknown`
- [x] 2.2 Ajustar estilos del hint (chip neutro, no semáforo fuerte)
- [x] 2.3 Quitar o suavizar píldoras de estado en ítems de `nearby`

## 3. Marcadores unificados + usuario

- [x] 3.1 Unificar color de capas de fuentes (sin `statusColorExpr` por cat)
- [x] 3.2 Añadir icono de gota a puntos individuales
- [x] 3.3 Rediseñar `.user-marker` estilo Apple Maps (punto + anillo/pulso)
- [x] 3.4 Verificar contraste visual fuente vs ubicación en desktop y móvil

## 4. Hover táctil

- [x] 4.1 Envolver `:hover` de controles en `@media (hover: hover) and (pointer: fine)`
- [x] 4.2 Conservar `:active` / `:focus-visible` para feedback en touch

## 5. Verificación

- [x] 5.1 `npm run build` OK
- [x] 5.2 Smoke manual: Madrid (hint en ficha), fuera de Madrid (sin hint), geolocalización, lista cercanas sin hover pegado
