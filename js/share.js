// Deep links y compartir fuentes: param `f=<id>` (+ lng/lat opcionales).

const PARAM_F = "f";
const PARAM_LNG = "lng";
const PARAM_LAT = "lat";

/** Lee el id canónico y coords opcionales desde la URL actual. */
export function readFountainLink() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get(PARAM_F);
  if (!raw) return null;
  let id;
  try {
    id = decodeURIComponent(raw);
  } catch {
    id = raw;
  }
  id = String(id).trim();
  if (!id) return null;

  const lng = parseCoord(params.get(PARAM_LNG));
  const lat = parseCoord(params.get(PARAM_LAT));
  const coords =
    lng != null && lat != null ? /** @type {[number, number]} */ ([lng, lat]) : null;
  return { id, coords };
}

function parseCoord(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Construye la URL absoluta para compartir una fuente. */
export function buildFountainUrl(id, coords) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set(PARAM_F, id);
  if (coords && Number.isFinite(coords[0]) && Number.isFinite(coords[1])) {
    url.searchParams.set(PARAM_LNG, coords[0].toFixed(6));
    url.searchParams.set(PARAM_LAT, coords[1].toFixed(6));
  }
  return url.toString();
}

/** Actualiza la query con `f` (y coords) vía replaceState. */
export function setFountainInUrl(id, coords) {
  const url = new URL(window.location.href);
  url.searchParams.set(PARAM_F, id);
  if (coords && Number.isFinite(coords[0]) && Number.isFinite(coords[1])) {
    url.searchParams.set(PARAM_LNG, coords[0].toFixed(6));
    url.searchParams.set(PARAM_LAT, coords[1].toFixed(6));
  } else {
    url.searchParams.delete(PARAM_LNG);
    url.searchParams.delete(PARAM_LAT);
  }
  history.replaceState(null, "", url);
}

/** Quita el param de fuente de la URL. */
export function clearFountainFromUrl() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(PARAM_F)) return;
  url.searchParams.delete(PARAM_F);
  url.searchParams.delete(PARAM_LNG);
  url.searchParams.delete(PARAM_LAT);
  history.replaceState(null, "", url);
}

/**
 * Comparte el enlace (Web Share) o lo copia al portapapeles.
 * @returns {'shared' | 'copied'}
 */
export async function shareFountain(id, coords, title) {
  const url = buildFountainUrl(id, coords);
  const shareData = {
    title: title || "Fuente de agua potable",
    text: title ? `${title} — Fountly` : "Fuente en Fountly",
    url,
  };

  if (typeof navigator.share === "function") {
    try {
      await navigator.share(shareData);
      return "shared";
    } catch (err) {
      // Cancelación del usuario: no caer al clipboard ni mostrar error.
      if (err && err.name === "AbortError") throw err;
    }
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return "copied";
  }

  // Fallback muy antiguo: prompt de copia manual.
  window.prompt("Copia el enlace:", url);
  return "copied";
}

/** Parsea ids canónicos `madrid:…` u `osm:node/123`. */
export function parseFountainId(id) {
  if (!id || typeof id !== "string") return null;
  if (id.startsWith("madrid:")) {
    return { source: "madrid", localId: id.slice("madrid:".length) };
  }
  const osm = /^osm:(node|way|relation)\/(\d+)$/i.exec(id);
  if (osm) {
    return {
      source: "osm",
      osmType: osm[1].toLowerCase(),
      osmId: osm[2],
    };
  }
  return null;
}
