## 1. Config y utilidad de distancia

- [ ] 1.1 Añadir en `config.js` `nearbyRadiusM` (800) y `nearbyMaxResults` (10)
- [ ] 1.2 Crear helper haversine (metros) reutilizable desde features Point

## 2. Lógica de lista cercana

- [ ] 2.1 Implementar función que, dado un punto, filtros activos y features en memoria, devuelva top-N dentro del radio ordenadas por distancia
- [ ] 2.2 Recalcular tras geolocalización y tras `moveend`/actualización de datos si la lista está abierta
- [ ] 2.3 Decisión UX: abrir la lista automáticamente (colapsable) tras “Cerca de mí”

## 3. UI

- [ ] 3.1 Añadir panel/lista en `index.html` + estilos glass coherentes (móvil primero)
- [ ] 3.2 Renderizar ítems: distancia, etiqueta, estado; vacío con mensaje claro
- [ ] 3.3 Al pulsar ítem, centrar mapa y abrir el mismo detalle que el click en marker
- [ ] 3.4 Permitir colapsar/cerrar la lista sin quitar el marker de usuario

## 4. Verificación

- [ ] 4.1 Probar en Madrid con filtros on/off y geoloc simulada o real
- [ ] 4.2 Probar zona solo OSM y caso sin resultados en el radio
