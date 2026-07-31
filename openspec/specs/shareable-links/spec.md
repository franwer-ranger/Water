# shareable-links Specification

## Purpose

Permitir abrir y compartir una fuente concreta mediante una URL estable basada en su id, para que Fountly sea útil fuera de una sesión de mapa genérica.

## Requirements

### Requirement: Deep link por id
El sistema SHALL aceptar un parámetro de URL que identifique una fuente por su id canónico (p. ej. `madrid:…` u `osm:…`) y, al cargar la app, centrar el mapa y abrir su ficha.

#### Scenario: Link válido con fuente cargable
- **WHEN** el usuario abre una URL con id de fuente válido y los datos están o pueden obtenerse
- **THEN** el mapa se centra en esa fuente y se muestra el detalle

#### Scenario: Id desconocido o no encontrado
- **WHEN** el id no corresponde a ninguna fuente resoluble
- **THEN** la app carga el mapa normal y muestra un aviso de que no se encontró la fuente

### Requirement: Compartir desde la ficha
El detalle de una fuente abierta SHALL ofrecer una acción para compartir o copiar el enlace a esa fuente.

#### Scenario: Compartir con Web Share
- **WHEN** el navegador soporta Web Share y el usuario elige compartir
- **THEN** se ofrece el enlace profundo de esa fuente

#### Scenario: Fallback copiar
- **WHEN** Web Share no está disponible
- **THEN** el sistema copia el enlace al portapapeles y confirma con un toast

### Requirement: URL sincronizada con la selección
Al abrir una fuente desde el mapa, el sistema SHALL actualizar la URL para reflejar el id seleccionado sin romper el botón atrás de forma abusiva.

#### Scenario: Abrir fuente desde el mapa
- **WHEN** el usuario selecciona una fuente en el mapa
- **THEN** la URL incluye el id de esa fuente

#### Scenario: Cerrar ficha
- **WHEN** el usuario cierra el detalle
- **THEN** el parámetro de fuente se elimina o deja de representar una selección activa
