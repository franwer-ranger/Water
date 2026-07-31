## Context

Ver proposal.md. Hoy `amenitiesFromTags` solo emite amenities cuando el valor OSM está en un mapa conocido; la ficha oculta la sección si la lista está vacía. Eso es correcto para no inventar datos, pero engañoso para `fee` («Gratis» a ratos).

## Goals / Non-Goals

**Goals:** Dejar por escrito el problema y las opciones A–D exploradas en conversación (solo excepciones; tres estados; quitar fee; disclaimer).

**Non-Goals:** Elegir e implementar una opción en este change.

## Decisions

Ninguna decisión de implementación. Opciones candidatas:

| Opción | Idea |
|--------|------|
| A | Solo tags «excepcionales» (De pago, No accesible…). Lo positivo por defecto no se pinta. |
| B | Set fijo con sí / no / desconocido. |
| C | Quitar tags poco fiables (`fee`); dejar el resto como ahora. |
| D | Disclaimer en ficha sin cambiar chips. |

Preferencia informal previa: A para `fee`; pendiente validar resto de tags.

## Risks / Trade-offs

- [Elegir B densifica la ficha] → Evaluar en mock antes de apply.  
- [Elegir A oculta info positiva útil] → Aceptable si el default social es «gratis / público».

## Open Questions

- ¿Misma regla para todos los tags o `fee` aparte?
- ¿Madrid algún día aportará amenities oficiales?
