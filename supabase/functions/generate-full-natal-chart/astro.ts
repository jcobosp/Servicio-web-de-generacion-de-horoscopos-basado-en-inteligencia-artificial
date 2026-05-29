// Cálculo de la carta natal COMPLETA (premium) con `astronomy-engine`.
//
// Amplía la carta básica (Sol/Luna/Ascendente) con:
//   - Los 10 planetas clásicos (Sol → Plutón), su signo, grado, casa y si están
//     retrógrados.
//   - El Medio Cielo (MC): el punto del zodiaco que culmina, clave para la
//     vocación.
//   - Las 12 casas por el sistema de SIGNOS ENTEROS (whole-sign): cada casa es
//     un signo completo a partir del Ascendente. Es un sistema antiguo, sólido
//     y sin las inestabilidades de Placidus en latitudes altas (decisión
//     documentada para un cálculo robusto en todo el mundo).
//   - Los aspectos mayores entre planetas (conjunción, sextil, cuadratura,
//     trígono, oposición) con su orbe.
//
// La hora y el lugar de nacimiento son OBLIGATORIOS aquí (sin ellos no hay
// casas ni Ascendente/MC, que son el esqueleto de una carta completa).

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
  sign: string;        // slug, p.ej. "leo"
  sign_name: string;   // nombre mostrable
  longitude: number;   // longitud eclíptica 0-360
  deg_in_sign: number; // grados dentro del signo 0-30
}

export interface PlanetPosition extends Placement {
  body: string;        // slug del planeta, p.ej. "venus"
  name: string;        // nombre mostrable, p.ej. "Venus"
  symbol: string;      // glifo, p.ej. "♀"
  house: number;       // casa 1-12 (whole-sign)
  retrograde: boolean; // movimiento aparente retrógrado
}

export interface HouseCusp {
  house: number;       // 1-12
  sign: string;        // slug del signo que ocupa la casa
  sign_name: string;
}

export interface Aspect {
  a: string;           // slug planeta A
  b: string;           // slug planeta B
  a_name: string;
  b_name: string;
  type: string;        // slug del aspecto: conjunction|sextile|square|trine|opposition
  type_name: string;   // nombre mostrable
  symbol: string;      // glifo del aspecto
  angle: number;       // separación real en grados
  orb: number;         // desviación respecto al ángulo exacto
}

export interface FullChart {
  planets: PlanetPosition[];
  ascendant: Placement;
  midheaven: Placement;
  houses: HouseCusp[];
  aspects: Aspect[];
  instant_utc: string;
}

// --- Definición de planetas (orden tradicional) ----------------------------
const PLANETS: { body: any; slug: string; name: string; symbol: string }[] = [
  { body: Astronomy.Body.Sun, slug: 'sun', name: 'Sol', symbol: '☉' },
  { body: Astronomy.Body.Moon, slug: 'moon', name: 'Luna', symbol: '☽' },
  { body: Astronomy.Body.Mercury, slug: 'mercury', name: 'Mercurio', symbol: '☿' },
  { body: Astronomy.Body.Venus, slug: 'venus', name: 'Venus', symbol: '♀' },
  { body: Astronomy.Body.Mars, slug: 'mars', name: 'Marte', symbol: '♂' },
  { body: Astronomy.Body.Jupiter, slug: 'jupiter', name: 'Júpiter', symbol: '♃' },
  { body: Astronomy.Body.Saturn, slug: 'saturn', name: 'Saturno', symbol: '♄' },
  { body: Astronomy.Body.Uranus, slug: 'uranus', name: 'Urano', symbol: '♅' },
  { body: Astronomy.Body.Neptune, slug: 'neptune', name: 'Neptuno', symbol: '♆' },
  { body: Astronomy.Body.Pluto, slug: 'pluto', name: 'Plutón', symbol: '♇' },
];

// --- Definición de aspectos mayores con sus orbes --------------------------
const ASPECTS: { angle: number; slug: string; name: string; symbol: string; orb: number }[] = [
  { angle: 0, slug: 'conjunction', name: 'Conjunción', symbol: '☌', orb: 8 },
  { angle: 60, slug: 'sextile', name: 'Sextil', symbol: '⚹', orb: 5 },
  { angle: 90, slug: 'square', name: 'Cuadratura', symbol: '□', orb: 6 },
  { angle: 120, slug: 'trine', name: 'Trígono', symbol: '△', orb: 7 },
  { angle: 180, slug: 'opposition', name: 'Oposición', symbol: '☍', orb: 8 },
];

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

/** Tiempo sidéreo local en grados (RAMC). */
function localSiderealDeg(date: Date, lngDeg: number): number {
  const gastHours = Astronomy.SiderealTime(date); // sidéreo aparente en Greenwich (horas)
  let lstDeg = gastHours * 15 + lngDeg;
  return ((lstDeg % 360) + 360) % 360;
}

/**
 * Longitud eclíptica del Ascendente (grados 0-360).
 * Fórmula clásica a partir del RAMC, la oblicuidad y la latitud geográfica.
 */
export function ascendantLongitude(date: Date, latDeg: number, lngDeg: number): number {
  const ramc = (localSiderealDeg(date, lngDeg) * Math.PI) / 180;
  const eps = meanObliquityRad(date);
  const lat = (latDeg * Math.PI) / 180;

  const asc = Math.atan2(
    Math.cos(ramc),
    -(Math.sin(ramc) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps)),
  );
  return ((((asc * 180) / Math.PI) % 360) + 360) % 360;
}

/**
 * Longitud eclíptica del Medio Cielo (grados 0-360).
 * El MC es el punto de la eclíptica que cruza el meridiano local; su ascensión
 * recta coincide con el RAMC. Para β=0: tan(λ) = tan(α)/cos(ε).
 */
export function midheavenLongitude(date: Date, lngDeg: number): number {
  const ramc = (localSiderealDeg(date, lngDeg) * Math.PI) / 180;
  const eps = meanObliquityRad(date);
  const mc = Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps));
  return ((((mc * 180) / Math.PI) % 360) + 360) % 360;
}

/** ¿El planeta se mueve en sentido retrógrado (longitud decreciente)? */
function isRetrograde(body: any, date: Date): boolean {
  const dt = 6 * 3600 * 1000; // ±6 h: estable también para planetas lentos
  const before = eclipticLon(body, new Date(date.getTime() - dt));
  const after = eclipticLon(body, new Date(date.getTime() + dt));
  let delta = after - before;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return delta < 0;
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
  if (hour === 24) hour = 0;
  const asUtc = Date.UTC(
    Number(map.year), Number(map.month) - 1, Number(map.day),
    hour, Number(map.minute), Number(map.second),
  );
  return asUtc - date.getTime();
}

/** Convierte fecha+hora de pared en una zona IANA al instante UTC real. */
export function wallClockToUtc(dateStr: string, timeStr: string, tz: string): Date {
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
  birthDate: string;  // YYYY-MM-DD (local)
  birthTime: string;  // HH:MM (local) — obligatorio en la completa
  lat: number;
  lng: number;
  tz: string;         // zona IANA
}

/** Casa (1-12, whole-sign) que ocupa una longitud, dado el signo del Ascendente. */
function houseOfLon(lon: number, ascSignIndex: number): number {
  const signIndex = Math.floor((((lon % 360) + 360) % 360) / 30);
  return ((signIndex - ascSignIndex + 12) % 12) + 1;
}

/** Calcula la carta natal completa (10 planetas, MC, casas y aspectos). */
export function computeFullChart(input: ComputeInput): FullChart {
  const instant = wallClockToUtc(input.birthDate, input.birthTime, input.tz);

  const ascLon = ascendantLongitude(instant, input.lat, input.lng);
  const ascendant = placementFromLon(ascLon);
  const ascSignIndex = Math.floor(ascLon / 30);

  const midheaven = placementFromLon(midheavenLongitude(instant, input.lng));

  // Planetas
  const planets: PlanetPosition[] = PLANETS.map((p) => {
    const lon = eclipticLon(p.body, instant);
    const base = placementFromLon(lon);
    const retro =
      p.slug === 'sun' || p.slug === 'moon' ? false : isRetrograde(p.body, instant);
    return {
      ...base,
      body: p.slug,
      name: p.name,
      symbol: p.symbol,
      house: houseOfLon(lon, ascSignIndex),
      retrograde: retro,
    };
  });

  // Casas (whole-sign): casa 1 = signo del Ascendente, y así sucesivamente.
  const houses: HouseCusp[] = [];
  for (let h = 0; h < 12; h++) {
    const idx = (ascSignIndex + h) % 12;
    houses.push({ house: h + 1, sign: SIGN_SLUGS[idx], sign_name: SIGN_NAMES[idx] });
  }

  // Aspectos mayores entre cada par de planetas.
  const aspects: Aspect[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      let sep = Math.abs(planets[i].longitude - planets[j].longitude);
      if (sep > 180) sep = 360 - sep;
      let best: { def: typeof ASPECTS[number]; orb: number } | null = null;
      for (const def of ASPECTS) {
        const orb = Math.abs(sep - def.angle);
        if (orb <= def.orb && (!best || orb < best.orb)) best = { def, orb };
      }
      if (best) {
        aspects.push({
          a: planets[i].body, b: planets[j].body,
          a_name: planets[i].name, b_name: planets[j].name,
          type: best.def.slug, type_name: best.def.name, symbol: best.def.symbol,
          angle: sep, orb: best.orb,
        });
      }
    }
  }
  // Los aspectos más exactos primero (orbe menor = más relevante).
  aspects.sort((x, y) => x.orb - y.orb);

  return {
    planets,
    ascendant,
    midheaven,
    houses,
    aspects,
    instant_utc: instant.toISOString(),
  };
}
