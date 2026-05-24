// Lista de ciudades para el autocompletado del lugar de nacimiento.
//
// Cada ciudad lleva su latitud, longitud y zona horaria IANA. Con esto basta
// para calcular el Ascendente en el servidor (no usamos ninguna API de
// geocodificación externa: el listado es autocontenido y suficiente para el
// mercado objetivo —España e Hispanoamérica— más algunas capitales mundiales).
//
// Importante: Canarias usa Atlantic/Canary; la España peninsular y Baleares,
// Europe/Madrid; Ceuta y Melilla, Europe/Madrid.

export interface City {
  /** Nombre mostrable (ciudad, país o provincia). */
  name: string;
  lat: number;
  lng: number;
  /** Zona horaria IANA. */
  tz: string;
}

export const CITIES: readonly City[] = [
  // --- España: capitales de comunidad y principales provincias ---
  { name: 'Madrid, España', lat: 40.4168, lng: -3.7038, tz: 'Europe/Madrid' },
  { name: 'Barcelona, España', lat: 41.3851, lng: 2.1734, tz: 'Europe/Madrid' },
  { name: 'Valencia, España', lat: 39.4699, lng: -0.3763, tz: 'Europe/Madrid' },
  { name: 'Sevilla, España', lat: 37.3891, lng: -5.9845, tz: 'Europe/Madrid' },
  { name: 'Zaragoza, España', lat: 41.6488, lng: -0.8891, tz: 'Europe/Madrid' },
  { name: 'Málaga, España', lat: 36.7213, lng: -4.4214, tz: 'Europe/Madrid' },
  { name: 'Murcia, España', lat: 37.9922, lng: -1.1307, tz: 'Europe/Madrid' },
  { name: 'Palma de Mallorca, España', lat: 39.5696, lng: 2.6502, tz: 'Europe/Madrid' },
  { name: 'Las Palmas de Gran Canaria, España', lat: 28.1235, lng: -15.4363, tz: 'Atlantic/Canary' },
  { name: 'Santa Cruz de Tenerife, España', lat: 28.4636, lng: -16.2518, tz: 'Atlantic/Canary' },
  { name: 'Bilbao, España', lat: 43.263, lng: -2.935, tz: 'Europe/Madrid' },
  { name: 'Alicante, España', lat: 38.3452, lng: -0.481, tz: 'Europe/Madrid' },
  { name: 'Córdoba, España', lat: 37.8882, lng: -4.7794, tz: 'Europe/Madrid' },
  { name: 'Valladolid, España', lat: 41.6523, lng: -4.7245, tz: 'Europe/Madrid' },
  { name: 'Vigo, España', lat: 42.2406, lng: -8.7207, tz: 'Europe/Madrid' },
  { name: 'Gijón, España', lat: 43.5322, lng: -5.6611, tz: 'Europe/Madrid' },
  { name: 'A Coruña, España', lat: 43.3623, lng: -8.4115, tz: 'Europe/Madrid' },
  { name: 'Granada, España', lat: 37.1773, lng: -3.5986, tz: 'Europe/Madrid' },
  { name: 'Vitoria-Gasteiz, España', lat: 42.8467, lng: -2.6716, tz: 'Europe/Madrid' },
  { name: 'Santander, España', lat: 43.4623, lng: -3.8099, tz: 'Europe/Madrid' },
  { name: 'Oviedo, España', lat: 43.3614, lng: -5.8593, tz: 'Europe/Madrid' },
  { name: 'Pamplona, España', lat: 42.8125, lng: -1.6458, tz: 'Europe/Madrid' },
  { name: 'San Sebastián, España', lat: 43.3183, lng: -1.9812, tz: 'Europe/Madrid' },
  { name: 'Logroño, España', lat: 42.4627, lng: -2.445, tz: 'Europe/Madrid' },
  { name: 'Toledo, España', lat: 39.8628, lng: -4.0273, tz: 'Europe/Madrid' },
  { name: 'Albacete, España', lat: 38.9943, lng: -1.8585, tz: 'Europe/Madrid' },
  { name: 'Badajoz, España', lat: 38.8794, lng: -6.9707, tz: 'Europe/Madrid' },
  { name: 'Cáceres, España', lat: 39.4753, lng: -6.3724, tz: 'Europe/Madrid' },
  { name: 'Salamanca, España', lat: 40.9701, lng: -5.6635, tz: 'Europe/Madrid' },
  { name: 'León, España', lat: 42.5987, lng: -5.5671, tz: 'Europe/Madrid' },
  { name: 'Burgos, España', lat: 42.3439, lng: -3.6969, tz: 'Europe/Madrid' },
  { name: 'Almería, España', lat: 36.834, lng: -2.4637, tz: 'Europe/Madrid' },
  { name: 'Cádiz, España', lat: 36.5298, lng: -6.2926, tz: 'Europe/Madrid' },
  { name: 'Huelva, España', lat: 37.2614, lng: -6.9447, tz: 'Europe/Madrid' },
  { name: 'Jaén, España', lat: 37.7796, lng: -3.7849, tz: 'Europe/Madrid' },
  { name: 'Tarragona, España', lat: 41.1189, lng: 1.2445, tz: 'Europe/Madrid' },
  { name: 'Girona, España', lat: 41.9794, lng: 2.8214, tz: 'Europe/Madrid' },
  { name: 'Lleida, España', lat: 41.6176, lng: 0.62, tz: 'Europe/Madrid' },
  { name: 'Castellón de la Plana, España', lat: 39.9864, lng: -0.0513, tz: 'Europe/Madrid' },
  { name: 'Santiago de Compostela, España', lat: 42.8782, lng: -8.5448, tz: 'Europe/Madrid' },
  { name: 'Ourense, España', lat: 42.3358, lng: -7.864, tz: 'Europe/Madrid' },
  { name: 'Lugo, España', lat: 43.0121, lng: -7.5559, tz: 'Europe/Madrid' },
  { name: 'Mérida, España', lat: 38.9165, lng: -6.3436, tz: 'Europe/Madrid' },
  { name: 'Ceuta, España', lat: 35.8894, lng: -5.3198, tz: 'Europe/Madrid' },
  { name: 'Melilla, España', lat: 35.2923, lng: -2.9381, tz: 'Europe/Madrid' },

  // --- Hispanoamérica: principales ciudades ---
  { name: 'Ciudad de México, México', lat: 19.4326, lng: -99.1332, tz: 'America/Mexico_City' },
  { name: 'Guadalajara, México', lat: 20.6597, lng: -103.3496, tz: 'America/Mexico_City' },
  { name: 'Monterrey, México', lat: 25.6866, lng: -100.3161, tz: 'America/Monterrey' },
  { name: 'Buenos Aires, Argentina', lat: -34.6037, lng: -58.3816, tz: 'America/Argentina/Buenos_Aires' },
  { name: 'Córdoba, Argentina', lat: -31.4201, lng: -64.1888, tz: 'America/Argentina/Cordoba' },
  { name: 'Bogotá, Colombia', lat: 4.711, lng: -74.0721, tz: 'America/Bogota' },
  { name: 'Medellín, Colombia', lat: 6.2442, lng: -75.5812, tz: 'America/Bogota' },
  { name: 'Lima, Perú', lat: -12.0464, lng: -77.0428, tz: 'America/Lima' },
  { name: 'Santiago, Chile', lat: -33.4489, lng: -70.6693, tz: 'America/Santiago' },
  { name: 'Caracas, Venezuela', lat: 10.4806, lng: -66.9036, tz: 'America/Caracas' },
  { name: 'Quito, Ecuador', lat: -0.1807, lng: -78.4678, tz: 'America/Guayaquil' },
  { name: 'Guayaquil, Ecuador', lat: -2.1709, lng: -79.9224, tz: 'America/Guayaquil' },
  { name: 'La Paz, Bolivia', lat: -16.5, lng: -68.15, tz: 'America/La_Paz' },
  { name: 'Asunción, Paraguay', lat: -25.2637, lng: -57.5759, tz: 'America/Asuncion' },
  { name: 'Montevideo, Uruguay', lat: -34.9011, lng: -56.1645, tz: 'America/Montevideo' },
  { name: 'San José, Costa Rica', lat: 9.9281, lng: -84.0907, tz: 'America/Costa_Rica' },
  { name: 'Ciudad de Panamá, Panamá', lat: 8.9824, lng: -79.5199, tz: 'America/Panama' },
  { name: 'La Habana, Cuba', lat: 23.1136, lng: -82.3666, tz: 'America/Havana' },
  { name: 'Santo Domingo, República Dominicana', lat: 18.4861, lng: -69.9312, tz: 'America/Santo_Domingo' },
  { name: 'San Juan, Puerto Rico', lat: 18.4655, lng: -66.1057, tz: 'America/Puerto_Rico' },
  { name: 'Guatemala, Guatemala', lat: 14.6349, lng: -90.5069, tz: 'America/Guatemala' },
  { name: 'San Salvador, El Salvador', lat: 13.6929, lng: -89.2182, tz: 'America/El_Salvador' },
  { name: 'Tegucigalpa, Honduras', lat: 14.0723, lng: -87.1921, tz: 'America/Tegucigalpa' },
  { name: 'Managua, Nicaragua', lat: 12.1149, lng: -86.2362, tz: 'America/Managua' },

  // --- Otras capitales mundiales de referencia ---
  { name: 'Lisboa, Portugal', lat: 38.7223, lng: -9.1393, tz: 'Europe/Lisbon' },
  { name: 'París, Francia', lat: 48.8566, lng: 2.3522, tz: 'Europe/Paris' },
  { name: 'Londres, Reino Unido', lat: 51.5074, lng: -0.1278, tz: 'Europe/London' },
  { name: 'Roma, Italia', lat: 41.9028, lng: 12.4964, tz: 'Europe/Rome' },
  { name: 'Berlín, Alemania', lat: 52.52, lng: 13.405, tz: 'Europe/Berlin' },
  { name: 'Nueva York, Estados Unidos', lat: 40.7128, lng: -74.006, tz: 'America/New_York' },
  { name: 'Miami, Estados Unidos', lat: 25.7617, lng: -80.1918, tz: 'America/New_York' },
  { name: 'Los Ángeles, Estados Unidos', lat: 34.0522, lng: -118.2437, tz: 'America/Los_Angeles' },
];

/** Quita acentos y pasa a minúsculas para comparar sin sensibilidad. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** Busca ciudades cuyo nombre contenga el texto (máximo `limit` resultados). */
export function searchCities(query: string, limit = 6): City[] {
  const q = normalize(query.trim());
  if (q.length < 2) return [];
  const results: City[] = [];
  for (const city of CITIES) {
    if (normalize(city.name).includes(q)) {
      results.push(city);
      if (results.length >= limit) break;
    }
  }
  return results;
}
