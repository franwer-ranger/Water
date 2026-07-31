## 1. Config y utilidad de distancia

- [x] 1.1 Añadir en `config.js` `nearbyRadiusM` (800) y `nearbyMaxResults` (10)
- [x] 1.2 Crear helper haversine (metros) reutilizable desde features Point

## 2. Lógica de lista cercana

- [x] 2.1 Implementar función que, dado un punto, filtros activos y features en memoria, devuelva top-N dentro del radio ordenadas por distancia
- [x] 2.2 Recalcular tras geolocalización y tras `moveend`/actualización de datos si la lista está abierta
- [x] 2.3 Decisión UX: abrir la lista automáticamente (colapsable) tras “Cerca de mí”

## 3. UI

- [x] 3.1 Añadir panel/lista en `index.html` + estilos glass coherentes (móvil primero)
- [x] 3.2 Renderizar ítems: distancia, etiqueta, estado; vacío con mensaje claro
- [x] 3.3 Al pulsar ítem, centrar mapa y abrir el mismo detalle que el click en marker
- [x] 3.4 Permitir colapsar/cerrar la lista sin quitar el marker de usuario

## 4. Verificación

- [x] 4.1 Probar en Madrid con filtros on/off y geoloc simulada o real
- [x] 4.2 Probar zona solo OSM y caso sin resultados en el radio
