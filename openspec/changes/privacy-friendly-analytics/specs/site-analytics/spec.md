## Purpose

Medir de forma anónima si Fountly se usa (audiencia y eventos clave de producto) sin cuentas de usuario ni tracking invasivo.

## ADDED Requirements

### Requirement: Medición de audiencia
El sistema SHALL poder reportar métricas básicas de audiencia del sitio (al menos vistas de página y visitantes/usuarios únicos según el proveedor elegido) cuando la analítica esté configurada.

#### Scenario: Analítica configurada
- **WHEN** hay un identificador de analítica válido en la configuración de build
- **THEN** las visitas a la app se registran en el proveedor configurado

#### Scenario: Analítica no configurada
- **WHEN** no hay identificador de analítica
- **THEN** la app funciona igual y no carga scripts de tracking

### Requirement: Eventos de producto mínimos
El sistema SHALL poder registrar eventos anónimos de uso relevantes al mapa, sin datos personales ni ids de cuenta.

#### Scenario: Eventos clave
- **WHEN** el usuario realiza acciones instrumentadas (p. ej. geolocalización, abrir ficha de fuente, búsqueda)
- **THEN** se envía un evento anónimo al proveedor sin incluir nombre, email ni identificadores de usuario

#### Scenario: Sin PII en payloads
- **WHEN** se envía un evento
- **THEN** el payload no incluye dirección exacta del usuario ni texto libre que pueda identificar a una persona

### Requirement: Privacidad y consentimiento
Si el proveedor elegido requiere cookies no esenciales o consentimiento en la UE, el sistema SHALL mostrar un aviso/consentimiento adecuado antes de activar ese tracking, o bien elegirse un proveedor sin cookies que no lo requiera.

#### Scenario: Proveedor sin cookies
- **WHEN** se usa un proveedor privacy-first sin cookies de tracking
- **THEN** no es obligatorio un banner de cookies solo por analítica

#### Scenario: Proveedor con cookies (p. ej. GA4)
- **WHEN** se usa un proveedor que depende de cookies de medición
- **THEN** el tracking no se activa hasta cumplir el mecanismo de consentimiento definido

### Requirement: Proyecto sin cuentas
La analítica SHALL operar sin autenticación: no hay login, perfiles ni gamificación asociada a usuarios.

#### Scenario: Uso anónimo
- **WHEN** cualquier visitante usa la app
- **THEN** las métricas se atribuyen a tráfico anónimo del sitio, no a cuentas
