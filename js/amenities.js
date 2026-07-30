// Whitelist de tags OSM → amenities normalizadas para la ficha.
// Ausencia de tag ≠ "no": solo se emite amenity si el valor es conocido.

const VALUE_MAPS = {
  bottle: {
    yes: { key: "bottle", label: "Botellas" },
    no: { key: "bottle", label: "Sin botellas" },
  },
  wheelchair: {
    yes: { key: "wheelchair", label: "Accesible" },
    limited: { key: "wheelchair", label: "Acceso limitado" },
    no: { key: "wheelchair", label: "No accesible" },
  },
  fee: {
    yes: { key: "fee", label: "De pago" },
    no: { key: "fee", label: "Gratis" },
  },
  seasonal: {
    yes: { key: "seasonal", label: "Estacional" },
    no: { key: "seasonal", label: "Todo el año" },
  },
  "drinking_water:refill": {
    yes: { key: "refill", label: "Recarga" },
    no: { key: "refill", label: "Sin recarga" },
  },
  dog: {
    yes: { key: "dog", label: "Perros" },
    no: { key: "dog", label: "No perros" },
  },
};

/** Extrae amenities tipadas desde tags OSM crudos. */
export function amenitiesFromTags(tags = {}) {
  const out = [];
  for (const [osmKey, values] of Object.entries(VALUE_MAPS)) {
    const raw = tags[osmKey];
    if (raw == null || raw === "") continue;
    const amenity = values[String(raw).toLowerCase()];
    if (amenity) out.push({ ...amenity });
  }
  return out;
}

/** Normaliza props.amenities tras round-trip MapLibre (puede venir stringificado). */
export function normalizeAmenities(props) {
  let list = props?.amenities;
  if (typeof list === "string") {
    try {
      list = JSON.parse(list);
    } catch {
      return [];
    }
  }
  return Array.isArray(list) ? list : [];
}
