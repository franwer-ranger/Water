## 1. Spike de datos (bloqueante)

- [ ] 1.1 Investigar SINAC / open data Ministerio: ¿hay descarga o API reutilizable? Documentar hallazgo en `design.md` (actualizar Open Questions)
- [ ] 1.2 Decidir v1: dataset curado de municipios piloto vs provincia; fijar 5–15 zonas iniciales
- [ ] 1.3 Aclarar casos tipo Almería: apta + nota de sabor (no marcar no_apta sin evidencia sanitaria)

## 2. Modelo y datos estáticos

- [ ] 2.1 Definir schema JSON/GeoJSON: `id`, `name`, `suitability`, `notes[]`, `attribution`, `updatedAt`, geometría o lookup
- [ ] 2.2 Crear `public/data/` inicial con zonas piloto y disclaimer
- [ ] 2.3 Loader en cliente + resolución por punto (centro mapa o geoloc)

## 3. UI

- [ ] 3.1 Chip/banner de zona con estados apta / no_apta / unknown
- [ ] 3.2 Mostrar notes y atribución; enlace a fuente oficial si existe
- [ ] 3.3 Copy que deje claro: agua de red / zona, no análisis de la fuente del mapa
- [ ] 3.4 Actualizar al mover el mapa (debounce) cuando cambie la zona

## 4. Automatización (opcional tras spike)

- [ ] 4.1 Si hay fuente estable, script `scripts/` + nota en workflow; si no, documentar actualización manual

## 5. Verificación

- [ ] 5.1 Probar municipio piloto apta, uno con notes, y uno sin datos
- [ ] 5.2 Revisar copy con alguien ajeno: ¿se entiende que no es “esta fuente”?
