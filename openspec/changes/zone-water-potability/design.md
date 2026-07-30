## Context

Fountly es estático; no hay backend. La percepción popular (“Almería no es potable”) suele mezclar **aptitud SINAC** (casi toda España: apta) con **sabor/dureza/origen** (desalación, etc.). Fuente oficial ciudadana: [SINAC](https://sinac.sanidad.gob.es/) (Ministerio de Sanidad); no hay API pública clara documentada para apps. Ver proposal.md — Why.

## Goals / Non-Goals

**Goals:**
- Modelo de zona versionado en `public/data/` (GeoJSON o JSON por municipio)
- UI no alarmista: `status: apta | no_apta | unknown` + `notes[]` opcionales
- Spike documentado sobre SINAC / open data antes de automatizar
- Copy que separe seguridad vs sabor

**Non-Goals:**
- Scraping frágil de SINAC en cada pageview del usuario
- Cobertura mundial v1
- Certificar cada fuente OSM

## Decisions

1. **Dos capas de verdad**  
   - `suitability`: apta / no_apta / unknown (sanitario)  
   - `notes`: texto curado opcional (“agua desalada; sabor particular”)  
   Así Madrid = apta; Almería = apta + nota de sabor (si los datos lo confirman), no “no potable” por mito.

2. **v1 = dataset curado estático**  
   Empezar con un JSON/GeoJSON pequeño (capitales / municipios de interés) generado o mantenido a mano tras el spike.  
   *Alternativa:* scrape SINAC en CI — mejor a medio plazo si el spike encuentra endpoint estable o open data reutilizable.

3. **Resolución espacial**  
   Point-in-polygon del centro del mapa (o geoloc) contra polígonos municipales, o lookup por reverse-geocode municipio si ya hay MapTiler. Preferir polígonos propios para no depender del geocoder offline.  
   *Alternativa:* solo lista de bbox rectangulares — más simple, menos preciso en costas.

4. **UI: chip/banner superior discreto**  
   “Red: apta · Sanidad/SINAC” + expandir notas. No overlay sobre markers.

5. **Disclaimer fijo**  
   “Orientativo; consulta la fuente oficial. No analiza esta fuente.”

## Risks / Trade-offs

- [Afirmar “no potable” erróneamente] → Default a unknown; no_apta solo con fuente citada; review humano del dataset curado
- [SINAC sin API] → Dataset curado + enlace “consultar en SINAC”; automatizar después
- [Confusión fuente vs red] → Disclaimer obligatorio en el indicador
- [Dataset se queda viejo] → Campo `updatedAt` + tarea CI opcional post-spike

## Migration Plan

Añadir `public/data/zones-potability.geojson` (o similar). Si el spike falla, el change puede archivarse parcialmente dejando solo el modelo + UI con 2–3 ciudades demo. Rollback = quitar banner + archivo de datos.

## Open Questions

- ¿El spike confirma open data reutilizable del Ministerio o solo portal interactivo?
- ¿v1 España entera a nivel provincia (grueso) o solo municipios piloto?
- ¿Mostrar el indicador siempre o solo tras geoloc / zoom a ciudad?
