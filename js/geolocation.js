// Geolocalización: "Buscar fuentes cerca de mí".
// Usa la API del navegador a través de map.locate() y gestiona el permiso denegado.

let userMarker = null;

export function setupGeolocation(map, button, setStatus) {
  if (!button) return;

  button.addEventListener("click", () => {
    if (!("geolocation" in navigator)) {
      setStatus("Tu navegador no permite geolocalización.");
      return;
    }
    button.disabled = true;
    setStatus("Buscando tu ubicación…");
    map.locate({ setView: true, maxZoom: 17, enableHighAccuracy: true });
  });

  map.on("locationfound", (e) => {
    button.disabled = false;
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
    setStatus("Mostrando fuentes cerca de tu ubicación.");
  });

  map.on("locationerror", (err) => {
    button.disabled = false;
    const msg =
      err.code === 1
        ? "Permiso de ubicación denegado."
        : "No se pudo obtener tu ubicación.";
    setStatus(msg);
  });
}
