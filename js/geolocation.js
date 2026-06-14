// Geolocalización: "Buscar fuentes cerca de mí".
// Usa la API del navegador a través de map.locate() y gestiona el permiso denegado.

let userMarker = null;
let lastUserLatLng = null; // [lat, lng] de la última ubicación conocida

// Devuelve la última ubicación del usuario como [lat, lng], o null si no hay.
export function getUserLatLng() {
  return lastUserLatLng;
}

export function setupGeolocation(map, button, showToast) {
  if (!button) return;

  button.addEventListener("click", () => {
    if (!("geolocation" in navigator)) {
      showToast("Tu navegador no permite geolocalización.");
      return;
    }
    button.disabled = true;
    button.classList.add("is-loading");
    showToast("Buscando tu ubicación…");
    map.locate({ setView: true, maxZoom: 17, enableHighAccuracy: true });
  });

  map.on("locationfound", (e) => {
    button.disabled = false;
    button.classList.remove("is-loading");
    lastUserLatLng = [e.latlng.lat, e.latlng.lng];
    if (userMarker) {
      userMarker.setLatLng(e.latlng);
    } else {
      userMarker = L.marker(e.latlng, {
        icon: L.divIcon({
          className: "",
          html: '<div class="user-marker"></div>',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        }),
        zIndexOffset: 1000,
        interactive: false,
      }).addTo(map);
    }
    showToast("Mostrando fuentes cerca de tu ubicación.");
  });

  map.on("locationerror", (err) => {
    button.disabled = false;
    button.classList.remove("is-loading");
    const msg =
      err.code === 1
        ? "Permiso de ubicación denegado."
        : "No se pudo obtener tu ubicación.";
    showToast(msg);
  });
}
