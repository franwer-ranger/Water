## MODIFIED Requirements

### Requirement: Contenido de cada ítem
Cada ítem de la lista SHALL mostrar distancia aproximada y la mejor etiqueta disponible (nombre, dirección o área). El estado operativo oficial, si existe, MAY mostrarse como texto suave breve o omitirse en la lista (el detalle completo vive en la ficha).

#### Scenario: Fuente OSM sin nombre
- **WHEN** una fuente cercana no tiene nombre
- **THEN** el ítem usa dirección, área, o un fallback genérico (“Fuente”)

#### Scenario: Fuente con estado oficial
- **WHEN** una fuente cercana tiene `statusCat` distinto de `unknown`
- **THEN** el ítem no usa semáforo verde/ámbar/rojo como elemento principal; si muestra estado, usa lenguaje no tajante o lo omite

## REMOVED Requirements

### Requirement: Respeto de filtros
**Reason:** Se elimina el filtrado por estado operativo en toda la app; todas las fuentes cercanas en radio entran en la lista.
**Migration:** Quitar la intersección con `activeCats`; la lista solo aplica radio y límite N.
