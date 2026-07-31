import { CONFIG } from "./config.js";

const EARTH_RADIUS_M = 6_371_000;

/** Distancia haversine en metros entre dos puntos WGS84. */
export function haversineMeters(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Distancia en metros desde un origen [lat, lng] a un Feature Point. */
export function distanceFromPoint(feature, originLatLng) {
  const [lng, lat] = feature.geometry.coordinates;
  const [oLat, oLng] = originLatLng;
  return haversineMeters(oLat, oLng, lat, lng);
}

/**
 * Top-N fuentes dentro del radio, ordenadas por distancia.
 * @param {[number, number]} originLatLng [lat, lng]
 * @returns {{ feature: object, distanceM: number }[]}
 */
export function getNearbyFeatures(
  originLatLng,
  features,
  {
    radiusM = CONFIG.nearbyRadiusM,
    maxResults = CONFIG.nearbyMaxResults,
  } = {}
) {
  if (!originLatLng || !features?.length) return [];

  const scored = [];
  for (const feature of features) {
    if (feature.geometry?.type !== "Point") continue;

    const distanceM = distanceFromPoint(feature, originLatLng);
    if (distanceM > radiusM) continue;
    scored.push({ feature, distanceM });
  }

  scored.sort((a, b) => a.distanceM - b.distanceM);
  return scored.slice(0, maxResults);
}

export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  const km = meters / 1000;
  const text = km < 10 ? km.toFixed(1).replace(".", ",") : String(Math.round(km));
  return `${text} km`;
}

/** Mejor etiqueta disponible para un ítem de la lista. */
export function featureLabel(props) {
  return props.name || props.address || props.area || "Fuente";
}
