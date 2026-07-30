# fountain-amenities Specification

## Purpose

Mostrar en la ficha de una fuente atributos OSM útiles (botellas, accesibilidad, pago, estacionalidad) cuando existan, sin inventar datos.

## Requirements

### Requirement: Normalización de amenities desde OSM
El sistema SHALL mapear tags OSM conocidos de agua potable a un conjunto estable de amenities en el feature normalizado.

#### Scenario: Fuente con bottle=yes
- **WHEN** un nodo OSM `amenity=drinking_water` tiene `bottle=yes`
- **THEN** el feature incluye una amenity que indica que se pueden rellenar botellas

#### Scenario: Tag ausente
- **WHEN** un nodo no tiene el tag
- **THEN** no se añade esa amenity (ausencia ≠ “no”)

### Requirement: Visualización en ficha
El bottom sheet SHALL mostrar chips o iconos legibles solo para amenities presentes.

#### Scenario: Varias amenities
- **WHEN** el feature tiene varias amenities reconocidas
- **THEN** todas se muestran en la ficha con etiqueta en español

#### Scenario: Sin amenities
- **WHEN** el feature no tiene amenities reconocidas
- **THEN** la ficha no muestra una sección vacía de amenities

### Requirement: Compatibilidad con fuentes oficiales
Las fuentes de adapters oficiales (p. ej. Madrid) SHALL seguir funcionando; amenities OSM no aplicables simplemente no aparecen.

#### Scenario: Fuente Madrid
- **WHEN** el usuario abre una fuente del dataset Madrid
- **THEN** la ficha muestra estado/dirección como ahora y no falla por falta de amenities OSM

### Requirement: Conjunto mínimo de tags v1
El sistema SHALL reconocer al menos: relleno de botellas (`bottle`), accesibilidad silla de ruedas (`wheelchair`), de pago (`fee`), estacional (`seasonal` / `opening_date` si se documenta), y acceso restringido ya filtrado no debe reaparecer como amenity confusa.

#### Scenario: fee=yes
- **WHEN** la fuente tiene `fee=yes`
- **THEN** la ficha indica que puede requerir pago
