# app-branding Specification

## Purpose

Alinear el nombre y la descripción públicos de la app con Fountly como mapa mundial de fuentes, no como producto solo de Madrid.

## Requirements

### Requirement: Identidad PWA y documento
El manifest y el título del documento SHALL presentar la app como Fountly / mapa de fuentes de agua potable de alcance global (con datos oficiales donde existan), no como “Fuentes de Madrid”.

#### Scenario: Instalar o mirar el manifest
- **WHEN** un cliente lee `manifest.webmanifest`
- **THEN** `name` y `description` no limitan el producto a Madrid

#### Scenario: Título de pestaña
- **WHEN** el usuario abre la app en el navegador
- **THEN** el título de la página refleja Fountly o fuentes de agua potable sin afirmar exclusividad de Madrid
