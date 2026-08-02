## Purpose

Define how chrome UI icons are rendered across the SPA: Heroicons outline for controls and actions, with the custom brand drop reserved for fountain identity.

## ADDED Requirements

### Requirement: Chrome controls use outline icons in brand accent
Search, locate FAB, clear/close controls, nearby chevron, status warning, directions, and share SHALL use outline vector icons (not emoji). Icon strokes SHALL use the app accent color (`--accent` / `#0085c7`) while retaining existing glass backgrounds for those controls.

#### Scenario: Locate FAB shows outline pin
- **WHEN** the user views the "Cerca de mí" button
- **THEN** it shows an outline map-pin icon in accent color on the glass FAB, not a pin emoji

#### Scenario: Search shows outline magnifying glass
- **WHEN** the user views the search box
- **THEN** the leading icon is an outline magnifying glass tinted with accent (or soft ink that matches accent treatment for search), not a bespoke non-Heroicons path unless intentionally vendored as Heroicons outline

#### Scenario: Sheet actions use outline icons
- **WHEN** the bottom sheet shows "Cómo llegar" and "Compartir"
- **THEN** each action shows an outline icon in accent color beside the label, not emoji

#### Scenario: Status warning uses outline triangle
- **WHEN** the sheet shows a status hint for a non-ok fountain
- **THEN** the hint uses an outline warning icon, not a warning emoji

### Requirement: Brand drop remains custom
The fountain identity mark (map marker drop and sheet header drop) SHALL remain the custom brand drop artwork. Heroicons MUST NOT replace that drop.

#### Scenario: Sheet header keeps brand drop
- **WHEN** the user opens a fountain detail sheet
- **THEN** the header uses the custom brand drop (or equivalent custom drop markup), not a Heroicons glyph and not a water-drop emoji

#### Scenario: Map markers unchanged by icon chrome work
- **WHEN** fountain markers are rendered on the map
- **THEN** they continue to use the existing custom drop image and brand color treatment

### Requirement: Decorative icons are hidden from assistive tech
Icon SVGs used purely as decoration beside labeled controls SHALL be marked `aria-hidden="true"` (or equivalent) so screen readers rely on the control's accessible name/label text.

#### Scenario: FAB accessible name unchanged
- **WHEN** a screen reader focuses the locate button
- **THEN** it announces the existing aria-label / title text, not a description of the SVG paths
