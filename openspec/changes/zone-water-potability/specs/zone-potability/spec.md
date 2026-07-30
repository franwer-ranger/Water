## Purpose

Dar contexto de zona sobre si el agua de red es apta para consumo (y, si aplica, notas de sabor/origen), para que el mapa de fuentes no se interprete en vacío sanitario.

## ADDED Requirements

### Requirement: Indicador de zona
El sistema SHALL mostrar un indicador visible (banner o chip) con el estado de aptitud del agua de red para la zona correspondiente al centro del mapa o a la ubicación del usuario cuando existan datos.

#### Scenario: Zona con datos apta
- **WHEN** el viewport cae en una zona catalogada como apta para consumo
- **THEN** el indicador comunica que el agua de red es apta, con atribución de la fuente de datos

#### Scenario: Zona sin datos
- **WHEN** no hay datos para la zona visible
- **THEN** el indicador no afirma potabilidad; puede ocultarse o mostrar “sin datos de zona”

### Requirement: Separar seguridad y sabor
El sistema SHALL distinguir en el copy entre aptitud sanitaria y notas de sabor/origen cuando ambas existan.

#### Scenario: Apta pero sabor particular
- **WHEN** una zona es apta y tiene una nota de sabor u origen (p. ej. desalación)
- **THEN** el UI muestra ambos mensajes sin presentar el sabor como “no potable”

### Requirement: No confundir fuente con red
El sistema SHALL dejar claro que el indicador habla del agua de red / zona, no del análisis de esa fuente concreta.

#### Scenario: Abrir ficha de fuente
- **WHEN** el usuario mira el indicador de zona junto al mapa de fuentes
- **THEN** el texto no afirma que esa fuente individual haya sido analizada

### Requirement: Atribución y actualización
Los datos de zona SHALL incluir atribución visible y, cuando se actualicen por script/CI, una fecha o versión de referencia.

#### Scenario: Usuario quiere verificar
- **WHEN** el usuario ve el indicador
- **THEN** puede identificar la fuente (p. ej. SINAC / dataset curado) y, si hay enlace, abrirlo

### Requirement: Alcance v1 acotado
La primera versión SHALL cubrir al menos un conjunto limitado de zonas (p. ej. municipios españoles curados) en lugar de pretender cobertura global completa.

#### Scenario: Ciudad fuera del dataset
- **WHEN** el usuario navega a una ciudad no cubierta
- **THEN** no se muestra un estado inventado
