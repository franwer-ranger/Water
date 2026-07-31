# viewport-count Specification

## Purpose

Mostrar cuántas fuentes filtradas hay en la vista actual del mapa, no un acumulado de sesión que confunde.

## Requirements

### Requirement: Contador por viewport
El contador SHALL reflejar el número de fuentes que pasan los filtros activos y cuyas coordenadas caen dentro de los bounds actuales del mapa.

#### Scenario: Pan tras cargar zona
- **WHEN** el usuario mueve el mapa tras haber cargado fuentes
- **THEN** el contador se actualiza al número de fuentes filtradas dentro del nuevo viewport

#### Scenario: Filtro activo
- **WHEN** el usuario desactiva un estado (p. ej. cerradas)
- **THEN** el contador excluye esas fuentes también en el recuento del viewport

#### Scenario: Acumulado de sesión mayor que la vista
- **WHEN** el usuario ha cargado varias zonas en la sesión pero el viewport solo cubre una parte
- **THEN** el contador no muestra el total acumulado de la sesión, sino solo las de la vista
