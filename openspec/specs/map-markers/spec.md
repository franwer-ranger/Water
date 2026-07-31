# map-markers Specification

## Purpose

Definir la apariencia unificada de las fuentes en el mapa frente al marcador de ubicación del usuario, y el comportamiento de hover en dispositivos táctiles.

## Requirements

### Requirement: Marcadores de fuente unificados
Todas las fuentes visibles en el mapa SHALL usar el mismo color de marca y un icono pequeño de gota, independientemente de `statusCat` o de la source (Madrid u OSM).

#### Scenario: Fuente Madrid y fuente OSM en la misma vista
- **WHEN** el mapa muestra una fuente del Ayuntamiento de Madrid y otra de OpenStreetMap
- **THEN** ambas usan el mismo color y el mismo icono de gota

#### Scenario: Estado operativo no cambia el color del punto
- **WHEN** una fuente Madrid tiene `statusCat` `ok`, `warn` u `off`
- **THEN** el marcador en el mapa no usa verde, ámbar ni rojo para distinguir ese estado

### Requirement: Marcador de ubicación del usuario distinto
El marcador de «mi ubicación» SHALL verse claramente distinto de una fuente: estilo tipo Apple Maps (punto central con anillo/halo de pulso), sin icono de gota.

#### Scenario: Usuario localizado cerca de fuentes
- **WHEN** el usuario activa geolocalización y hay fuentes en el mapa
- **THEN** el punto de ubicación no se confunde visualmente con un marcador de fuente

### Requirement: Hover solo en puntero fino
Los estilos de hover de controles de la app (FAB, lista cercanas, botones glass, etc.) SHALL aplicarse solo cuando el dispositivo reporta hover disponible y puntero fino; en táctil, la feedback visual SHALL usar `:active` y/o `:focus-visible`.

#### Scenario: Tap en ítem de cercanas en móvil
- **WHEN** el usuario toca un ítem de la lista de cercanas en un dispositivo táctil
- **THEN** no queda un estado de hover «pegado» tras levantar el dedo
