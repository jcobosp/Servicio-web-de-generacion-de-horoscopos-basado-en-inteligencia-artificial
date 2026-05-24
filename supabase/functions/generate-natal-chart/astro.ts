// Cálculo de la carta natal básica (Sol, Luna y Ascendente) con `astronomy-engine`.
//
// - Sol y Luna: longitud eclíptica geocéntrica aparente en el instante de
//   nacimiento (si no hay hora, se usa el mediodía local como aproximación).
// - Ascendente: signo que asciende por el horizonte este. Requiere hora y
//   lugar (latitud/longitud), porque cambia ~1 grado cada 4 minutos.
//
// La hora de nacimiento es LOCAL; se convierte a UTC con la zona horaria de la
// ciudad (IANA), respetando el horario de verano histórico que conozca el ICU.

// deno-lint-ignore-file no-explicit-any
import * as Astronomy from 'npm:astronomy-engine@2.1.19';

export const SIGN_SLUGS = [
  'aries', 'tauro', 'geminis', 'cancer', 'leo', 'virgo',
  'libra', 'escorpio', 'sagitario', 'capricornio', 'acuario', 'piscis',
] as const;
export const SIGN_NAMES = [
  'Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo',
  'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis',
] as const;

export interface Placement {
  sign: string;       // slug, p.ej. "leo"
  sign_name: string;  // nombre mostrable, p.ej. "Leo"
  longitude: number;  // longitud eclíptica 0-360
  deg_in_sign: number; // grados dentro del signo 0-30
}

export interface NatalPositions {
  sun: Placement;
  moon: Placement;
  ascendant: Placement | null; // null si no hay hora/lugar
  moon_approximate: boolean;    // true si la Luna se calculó sin hora exacta
  instant_utc: string;          // instante de nacimiento usado (ISO UTC)
}

function placementFromLon(lon: number): Placement {
  const norm = ((lon % 360) + 360) % 360;
  const index = Math.floor(norm / 30);
  return {
    sign: SIGN_SLUGS[index],
    sign_name: SIGN_NAMES[index],
    longitude: norm,
    deg_in_sign: norm - index * 30,
  };
}

/** Longitud eclíptica geocéntrica aparente de un cuerpo (grados). */
function eclipticLon(body: any, date: Date): number {
  const vec = Astronomy.GeoVector(body, date, true);
  return Astronomy.Ecliptic(vec).elon;
}

function julianDay(date: Date): number {
  return date.getTime() / 86_400_000 + 2440587.5;
}

/** Oblicuidad media de la eclíptica (radianes) para la fecha dada. */
function meanObliquityRad(date: Date): number {
  const t = (julianDay(date) - 2451545.0) / 36525;
  const epsDeg =
    23.439291111 -
    0.0130041667 * t -
    1.6388889e-7 * t * t +
    5.0361111e-7 * t * t * t;
  return (epsDeg * Math.PI) / 180;
}

/**
 * Longitud eclíptica del Ascendente (grados 0-360).
 * Fórmula clásica a partir del tiempo sidéreo local (RAMC), la oblicuidad y la
 * latitud geográfica. Longitud este positiva.
 */
export function ascendantLongitude(date: Date, latDeg: number, lngDeg: number): number {
  const gastHours = Astronomy.SiderealTime(date); // tiempo sidéreo aparente en Greenwich (horas)
  let lstDeg = gastHours * 15 + lngDeg;            // tiempo sidéreo local en grados
  lstDeg = ((lstDeg % 360) + 360) % 360;

  const ramc = (lstDeg * Math.PI) / 180;
  const eps = meanObliquityRad(date);
  const lat = (latDeg * Math.PI) / 180;

  let asc = Math.atan2(
    Math.cos(ramc),
    -(Math.sin(ramc) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps)),
  );
  let ascDeg = (asc * 180) / Math.PI;
  ascDeg = ((ascDeg % 360) + 360) % 360;
  return ascDeg;
}

/** Desfase (ms) de una zona IANA respecto a UTC en un instante dado. */
function tzOffsetMs(tz: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const map: Record<string, string> = {};
  for (const p of dtf.formatToParts(date)) map[p.type] = p.value;
  let hour = Number(map.hour);
  if (hour === 24) hour = 0; // algunos ICU devuelven "24" a medianoche
  const asUtc = Date.UTC(
    Number(map.year), Number(map.month) - 1, Number(map.day),
    hour, Number(map.minute), Number(map.second),
  );
  return asUtc - date.getTime();
}

/**
 * Convierte una fecha+hora de pared en una zona IANA al instante UTC real.
 * Refina una vez para resolver bien las fronteras de horario de verano.
 */
export function wallClockToUtc(
  dateStr: string,
  timeStr: string,
  tz: string,
): Date {
  const [y, mo, d] = dateStr.split('-').map(Number);
  const [h, mi] = timeStr.split(':').map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi, 0);
  const off1 = tzOffsetMs(tz, new Date(guess));
  let utc = guess - off1;
  const off2 = tzOffsetMs(tz, new Date(utc));
  if (off2 !== off1) utc = guess - off2;
  return new Date(utc);
}

export interface ComputeInput {
  birthDate: string;            // YYYY-MM-DD (local)
  birthTime: string | null;     // HH:MM (local) o null
  lat: number | null;
  lng: number | null;
  tz: string;                   // zona IANA (def. Europe/Madrid)
}

/** Calcula Sol, Luna y (si hay datos) Ascendente para los datos de nacimiento. */
export function computeNatalChart(input: ComputeInput): NatalPositions {
  const hasTime = Boolean(input.birthTime);
  // Sin hora: mediodía local, que minimiza el error del signo lunar.
  const time = input.birthTime ?? '12:00';
  const instant = wallClockToUtc(input.birthDate, time, input.tz);

  const sun = placementFromLon(eclipticLon(Astronomy.Body.Sun, instant));
  const moon = placementFromLon(eclipticLon(Astronomy.Body.Moon, instant));

  let ascendant: Placement | null = null;
  if (hasTime && input.lat !== null && input.lng !== null) {
    ascendant = placementFromLon(ascendantLongitude(instant, input.lat, input.lng));
  }

  return {
    sun,
    moon,
    ascendant,
    moon_approximate: !hasTime,
    instant_utc: instant.toISOString(),
  };
}
