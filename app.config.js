// Lee la clave de Google Maps de una variable de entorno y la suma a la configuración del app.json.
// La clave NO se escribe acá: en EAS vive como variable de entorno, y en tu compu no existe.
module.exports = ({ config }) => {
  const claveMapa = process.env.GOOGLE_MAPS_API_KEY;
  const plugins = [...(config.plugins ?? [])];

  if (claveMapa) {
    plugins.push(['react-native-maps', { androidGoogleMapsApiKey: claveMapa }]);
  }

  return { ...config, plugins };
};