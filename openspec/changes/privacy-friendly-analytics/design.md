## Context

Sitio estático en GitHub Pages, Vite, sin backend ni cuentas. Ver proposal.md — Why. La decisión de producto es herramienta libre; gamificación/usuarios quedan fuera.

## Goals / Non-Goals

**Goals:**
- Saber si hay tráfico y uso básico (UV, pageviews, 2–4 eventos)
- Encender/apagar con env var en build
- Encajar con hosting estático y poco mantenimiento

**Non-Goals:**
- Product analytics tipo Mixpanel con identity
- Session replay
- Cumplir “analytics perfecto” multi-jurisdicción más allá de lo razonable para un side project

## Decisions

1. **Proveedor por defecto recomendado: Plausible o Cloudflare Web Analytics**  
   Encajan con un proyecto público: poco/no cookies, setup simple, UV + pageviews.  
   *Alternativa:* GA4 — válido si ya hay cuenta Google y se acepta banner de consentimiento + IP anonymization; más fricción GDPR.  
   *Alternativa:* Umami self-hosted — más control, pero implica hosting/DB (choca con “solo estático” salvo servicio externo).

2. **Abstracción mínima `track(event, props?)`**  
   Un módulo `js/analytics.js` no-op si no hay `VITE_ANALYTICS_*`. Facilita cambiar de proveedor sin tocar call sites.

3. **Eventos v1 (sugeridos)**  
   - `page_view` (automático)  
   - `geolocate`  
   - `open_fountain` (props: `source` = madrid|osm, no coords exactas del usuario)  
   - `search` (sin query string literal; o solo “performed”)

4. **Secrets**  
   Measurement ID / domain en env de GitHub Actions al build de Pages; nunca hardcodear en el repo si se prefiere, o ID público de Plausible/CF (suelen ser públicos) documentado.

5. **Privacidad**  
   Si se elige GA4: consent banner + load diferido. Si Plausible/CF: sin banner solo por analytics (sigue siendo buena idea una línea en README / página de privacidad breve).

## Risks / Trade-offs

- [GA4 sin consentimiento en UE] → No usarlo así; banner o cambiar de proveedor
- [Eventos con coords de fuente] → OK a granularidad baja; no enviar ubicación GPS del usuario
- [Adblockers] → Subconteo inevitable; aceptable para “¿se usa o no?”

## Migration Plan

Añadir snippet + módulo; desplegar. Rollback = quitar env var / revert. Sin migración de datos de usuario (no hay).

## Open Questions

- ¿Proveedor final: Plausible, Cloudflare Web Analytics, o GA4?
- ¿Hace falta página `/privacy` mínima o basta README?
