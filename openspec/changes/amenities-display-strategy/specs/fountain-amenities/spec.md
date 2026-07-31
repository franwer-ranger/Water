## MODIFIED Requirements

### Requirement: Visualización en ficha
El bottom sheet SHALL mostrar amenities de forma que la ausencia de un tag OSM no se interprete como el valor contrario. La estrategia concreta (solo excepciones, tres estados sí/no/desconocido, o subset de tags) queda por decidir en design/apply futuro; hasta entonces el comportamiento actual (mostrar solo tags presentes) permanece, pero se reconoce como confuso para atributos como `fee`.

#### Scenario: Tag fee ausente
- **WHEN** un nodo OSM no tiene tag `fee`
- **THEN** la ficha no implica que la fuente no sea gratis; cualquier UI futura MUST evitar asimetría engañosa respecto a fuentes con `fee=no`

#### Scenario: Varias amenities presentes
- **WHEN** el feature tiene varias amenities reconocidas
- **THEN** todas se muestran en la ficha con etiqueta en español (comportamiento actual hasta redefinir la estrategia)

### Requirement: Tag ausente no inventa valor
El sistema SHALL NOT mapear la ausencia de un tag a «no» ni a «sí» sin una decisión de producto explícita documentada.

#### Scenario: bottle no informado
- **WHEN** un nodo no tiene el tag `bottle`
- **THEN** no se añade una amenity inventada de botellas
