## Purpose

Mostrar el estado operativo de datasets oficiales como aviso no tajante en la ficha, sin filtrar ni colorear el mapa por ese dato.

## ADDED Requirements

### Requirement: Sin filtros por estado operativo
La UI SHALL NOT ofrecer controles para filtrar fuentes por estado operativo (`ok` / `warn` / `off`).

#### Scenario: Vista inicial del mapa
- **WHEN** el usuario abre la app
- **THEN** no existe un menú o botón de «Filtros» por estado bajo el buscador

### Requirement: Todas las fuentes visibles con el mismo criterio de mapa
El mapa SHALL mostrar las fuentes cargadas sin ocultarlas por `statusCat`. Fuentes con estado `warn` u `off` siguen apareciendo.

#### Scenario: Fuente marcada fuera de servicio
- **WHEN** el dataset oficial indica que una fuente está fuera de servicio
- **THEN** esa fuente sigue visible en el mapa junto al resto

### Requirement: Aviso suave en la ficha
Cuando una fuente tenga estado operativo conocido distinto de operativo (`warn` u `off`), la ficha SHALL mostrar un aviso con lenguaje no tajante (p. ej. «Posiblemente cerrada temporalmente», «Posiblemente fuera de servicio»). Las operativas MAY omitir el aviso o mostrar un hint neutro opcional.

#### Scenario: Estado warn en Madrid
- **WHEN** el usuario abre una fuente con `statusCat` `warn`
- **THEN** la ficha muestra un tag/aviso del estilo «Posiblemente cerrada temporalmente» (o equivalente suave)

#### Scenario: Fuente OSM sin estado
- **WHEN** el usuario abre una fuente con `statusCat` `unknown`
- **THEN** la ficha no muestra píldora ni aviso de estado operativo
