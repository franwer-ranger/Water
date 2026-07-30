## 1. Elección de proveedor

- [ ] 1.1 Decidir proveedor (recomendado: Plausible o Cloudflare Web Analytics; GA4 solo si se asume consentimiento)
- [ ] 1.2 Crear propiedad/sitio en el proveedor y anotar el ID/domain público

## 2. Integración build-time

- [ ] 2.1 Añadir env var(s) documentadas (`VITE_ANALYTICS_…`) y no-op si faltan
- [ ] 2.2 Crear `js/analytics.js` con `init` + `track(event, props?)`
- [ ] 2.3 Cargar el script del proveedor solo cuando esté configurado

## 3. Eventos y privacidad

- [ ] 3.1 Instrumentar page view + geolocate + open_fountain + search (sin PII ni query libre)
- [ ] 3.2 Si el proveedor es GA4 (u otro con cookies): consent gate antes de cargar
- [ ] 3.3 Añadir nota breve de privacidad (README y/o página mínima)

## 4. CI y verificación

- [ ] 4.1 Pasar el secret/var al workflow de deploy de GitHub Pages
- [ ] 4.2 Verificar en el panel del proveedor una visita de prueba y al menos un evento
- [ ] 4.3 Verificar que sin env var no se carga ningún script de analytics
