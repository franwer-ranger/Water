// Configuración central de la aplicación.
// Cambiar el proveedor de teselas aquí si crece el tráfico (Carto, Stadia, MapTiler…).

export const CONFIG = {
  // Centro y zoom inicial (Puerta del Sol, Madrid)
  center: [40.4168, -3.7038],
  zoom: 12,
  minZoom: 10,
  maxZoom: 19,
  // Límites aproximados del término municipal para acotar el desplazamiento
  maxBounds: [
    [40.20, -4.05],
    [40.70, -3.40],
  ],

  // Teselas base (OpenStreetMap estándar, sin API key)
  tiles: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | ' +
      'Datos: <a href="https://datos.madrid.es/dataset/300051-0-fuentes">Ayuntamiento de Madrid</a>',
  },

  // Datos de fuentes (GeoJSON local, ruta relativa para GitHub Pages)
  dataUrl: "data/fuentes.geojson",

  // Opciones de clustering
  cluster: {
    chunkedLoading: true,
    maxClusterRadius: 60,
    disableClusteringAtZoom: 17,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
  },
};
