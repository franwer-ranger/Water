## Purpose

Permitir al usuario ver fuentes cercanas ordenadas por distancia y saltar a una concreta desde una lista, sin depender solo del mapa.

## ADDED Requirements

### Requirement: Lista cercana tras geolocalización
El sistema SHALL mostrar una lista de fuentes cercanas al usuario cuando se active “Cerca de mí” y existan features cargadas en un radio configurable.

#### Scenario: Fuentes dentro del radio
- **WHEN** el usuario activa geolocalización y hay al menos una fuente dentro del radio
- **THEN** la lista muestra esas fuentes ordenadas de menor a mayor distancia

#### Scenario: Sin fuentes en el radio
- **WHEN** el usuario activa geolocalización y no hay fuentes dentro del radio
- **THEN** la lista (o un mensaje asociado) indica que no hay resultados cercanos

### Requirement: Contenido de cada ítem
Cada ítem de la lista SHALL mostrar distancia aproximada y la mejor etiqueta disponible (nombre, dirección o área), más el estado operativo cuando exista (`ok` / `warn` / `off`).

#### Scenario: Fuente Madrid operativa
- **WHEN** una fuente cercana tiene `statusCat` distinto de `unknown`
- **THEN** el ítem muestra la píldora o texto de estado correspondiente

#### Scenario: Fuente OSM sin nombre
- **WHEN** una fuente cercana no tiene nombre
- **THEN** el ítem usa dirección, área, o un fallback genérico (“Fuente”)

### Requirement: Respeto de filtros
La lista SHALL incluir solo fuentes que pasen los filtros de estado activos en ese momento.

#### Scenario: Filtro oculta cerradas
- **WHEN** el usuario desactiva el filtro de cerradas y hay fuentes cerradas cerca
- **THEN** esas fuentes no aparecen en la lista

### Requirement: Selección desde la lista
Al elegir un ítem, el sistema SHALL centrar el mapa en esa fuente y abrir su ficha de detalle.

#### Scenario: Tap en ítem
- **WHEN** el usuario pulsa un ítem de la lista
- **THEN** el mapa hace focus en esa coordenada y se abre el detalle de la fuente

### Requirement: Límite de resultados
La lista SHALL limitar el número máximo de resultados mostrados (además del radio) para mantener la UI usable.

#### Scenario: Muchas fuentes cerca
- **WHEN** hay más fuentes en el radio que el máximo configurado
- **THEN** solo se muestran las N más cercanas
