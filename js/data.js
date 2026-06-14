import { CONFIG } from "./config.js";

// Carga el GeoJSON local de fuentes. Requiere servir el sitio por HTTP
// (fetch sobre file:// está bloqueado por el navegador).
export async function loadFuentes() {
  const res = await fetch(CONFIG.dataUrl);
  if (!res.ok) {
    throw new Error(`No se pudieron cargar las fuentes (HTTP ${res.status})`);
  }
  return res.json();
}
