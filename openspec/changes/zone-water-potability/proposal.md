## Why

Una fuente en el mapa no dice si el agua de esa ciudad/zona es de confianza para beber. La gente asume reglas locales (“en Madrid sí, en Almería no”) que a menudo mezclan **seguridad sanitaria** con **sabor**. Fountly debería dar contexto de zona claro y con fuente citada, sin alarmismo.

## What Changes

- Banner o chip de zona visible según el viewport/ubicación: potabilidad / aptitud del agua de red (y, si se incluye, notas de sabor u origen).
- Modelo de datos de zonas (GeoJSON o lookup por municipio) versionado en `public/data/`, actualizable por script/CI cuando haya fuente estable.
- Spike inicial para elegir fuente: preferir datos oficiales (España: SINAC / informes Ministerio de Sanidad); si no hay API usable, dataset curado mínimo + enlace a consulta oficial.
- Distinguir en UI: **apta para consumo** ≠ **sabe bien**; no afirmar calidad del grifo de una fuente concreta sin dato.

## Non-goals

- Analíticas químicas en tiempo real por fuente.
- Sustituir el aviso sanitario oficial.
- Cobertura mundial completa en v1 (empezar por España o un subconjunto de ciudades).
- Confundir “no me gusta el sabor” con “no es potable” sin etiquetarlo como opinión/nota.

## Capabilities

### New Capabilities

- `zone-potability`: contexto de aptitud/calidad del agua de red por zona geográfica, mostrado en el mapa con atribución y matices (seguridad vs sabor).

### Modified Capabilities

- (ninguna — no hay specs base aún)

## Impact

- Nuevo módulo de datos de zona + UI (banner/chip) en `js/app.js` / markers / CSS
- Posible `scripts/` + workflow de actualización si hay fuente scrapable/open data
- Riesgo legal/reputacional: copy cuidadoso + atribución obligatoria
