// Geolocalización: "Buscar fuentes cerca de mí" (MapLibre GL).

let userMarker = null;
let lastUserLatLng = null; // [lat, lng] de la última ubicación conocida

// Devuelve la última ubicación del usuario como [lat, lng], o null si no hay.
export function getUserLatLng() {
  return lastUserLatLng;
}

export function setupGeolocation(map, button, showToast) {
  if (!button) return;

  button.addEventListener("click", () => {
    // Tras el primer uso ya no hace falta invitar al usuario a pulsar.
    button.classList.add("fab--used");
    if (!("geolocation" in navigator)) {
      showToast("Tu navegador no permite geolocalización.");
      return;
    }
    button.disabled = true;
    button.classList.add("is-loading");
    showToast("Buscando tu ubicación…");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        button.disabled = false;
        button.classList.remove("is-loading");
        const { latitude: lat, longitude: lng } = pos.coords;
        lastUserLatLng = [lat, lng];

        if (userMarker) {
          userMarker.setLngLat([lng, lat]);
        } else {
          const el = document.createElement("div");
          el.className = "user-marker";
          userMarker = new maplibregl.Marker({ element: el })
            .setLngLat([lng, lat])
            .addTo(map);
        }
        map.flyTo({ center: [lng, lat], zoom: 16, essential: true });
        showToast("Mostrando fuentes cerca de tu ubicación.");
      },
      (err) => {
        button.disabled = false;
        button.classList.remove("is-loading");
        const msg =
          err.code === err.PERMISSION_DENIED
            ? "Permiso de ubicación denegado."
            : "No se pudo obtener tu ubicación.";
        showToast(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  });
}
