## MODIFIED Requirements

### Requirement: Contador por viewport
El contador SHALL reflejar el número de fuentes cuyas coordenadas caen dentro de los bounds actuales del mapa, sin aplicar filtros por estado operativo.

#### Scenario: Pan tras cargar zona
- **WHEN** el usuario mueve el mapa tras haber cargado fuentes
- **THEN** el contador se actualiza al número de fuentes dentro del nuevo viewport

#### Scenario: Fuentes con distintos estados en vista
- **WHEN** el viewport incluye fuentes `ok`, `warn`, `off` y `unknown`
- **THEN** el contador las incluye todas

#### Scenario: Acumulado de sesión mayor que la vista
- **WHEN** el usuario ha cargado varias zonas en la sesión pero el viewport solo cubre una parte
- **THEN** el contador no muestra el total acumulado de la sesión, sino solo las de la vista
