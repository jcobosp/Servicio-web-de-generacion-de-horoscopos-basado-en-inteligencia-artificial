// Cálculo astronómico de los informes premium (mensual / anual) con
// `astronomy-engine` server-side.
//
// Un informe personalizado combina dos cosas:
//   1. La CARTA NATAL del usuario (quién es): Sol, Luna, Mercurio, Venus, Marte,
//      Júpiter y Saturno + Ascendente/MC si aportó hora y lugar.
//   2. Los TRÁNSITOS del periodo (qué le toca vivir): dónde están esos mismos
//      planetas durante el mes/año y qué ASPECTOS forman con su carta natal.
//
// La hora y el lugar son OPCIONALES (rara vez se conoce la hora exacta): con solo
// la fecha calculamos los planetas y aproximamos la Luna al mediodía; con hora +
// lugar añadimos el Ascendente y el Medio Cielo.

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
  sign: string;
  sign_name: string;
  longitude: number;
  deg_in_sign: number;
}

export interface BodyPosition extends Placement {
  body: string;   // slug, p.ej. "venus"
  name: string;   // mostrable, p.ej. "Venus"
  symbol: string; // glifo
  retrograde: boolean;
}

export interface NatalSnapshot {
  bodies: BodyPosition[];
  ascendant: Placement | null;
  midheaven: Placement | null;
  has_time: boolean;        // el usuario aportó hora (Luna fiable)
  has_angles: boolean;      // hora + lugar (Ascendente/MC disponibles)
}

export interface TransitAspect {
  transit: string;          // planeta que transita (slug)
  transit_name: string;
  natal: string;            // punto natal aspectado (slug o 'ascendant'|'midheaven')
  natal_name: string;
  type: string;             // conjunction|sextile|square|trine|opposition
  type_name: string;
  harmonious: boolean;
  orb: number;
}

export interface PeriodChart {
  natal: NatalSnapshot;
  transits: BodyPosition[];       // posiciones de los planetas en el punto medio del periodo
  aspects: TransitAspect[];       // tránsito ↔ natal, ordenados por exactitud
  period_label: string;           // "mayo de 2026" / "2026"
}

// Planetas considerados (los lentos importan para los temas del periodo).
const PLANETS: { body: any; slug: string; name: string; symbol: string }[] = [
  { body: Astronomy.Body.Sun, slug: 'sun', name: 'Sol', symbol: '☉' },
  { body: Astronomy.Body.Moon, slug: 'moon', name: 'Luna', symbol: '☽' },
  { body: Astronomy.Body.Mercury, slug: 'mercury', name: 'Mercurio', symbol: '☿' },
  { body: Astronomy.Body.Venus, slug: 'venus', name: 'Venus', symbol: '♀' },
  { body: Astronomy.Body.Mars, slug: 'mars', name: 'Marte', symbol: '♂' },
  { body: Astronomy.Body.Jupiter, slug: 'jupiter', name: 'Júpiter', symbol: '♃' },
  { body: Astronomy.Body.Saturn, slug: 'saturn', name: 'Saturno', symbol: '♄' },
];

// Para los tránsitos descartamos la Luna (demasiado rápida para un mes/año).
const TRANSIT_SLUGS = ['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

const ASPECTS: { angle: number; slug: string; name: string; orb: number; harmonious: boolean }[] = [
  { angle: 0, slug: 'conjunction', name: 'Conjunción', orb: 6, harmonious: true },
  { angle: 60, slug: 'sextile', name: 'Sextil', orb: 4, harmonious: true },
  { angle: 90, slug: 'square', name: 'Cuadratura', orb: 5, harmonious: false },
  { angle: 120, slug: 'trine', name: 'Trígono', orb: 5, harmonious: true },
  { angle: 180, slug: 'opposition', name: 'Oposición', orb: 6, harmonious: false },
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

function eclipticLon(body: any, date: Date): number {
  const vec = Astronomy.GeoVector(body, date, true);
  return Astronomy.Ecliptic(vec).elon;
}

function julianDay(date: Date): number {
  return date.getTime() / 86_400_000 + 2440587.5;
}

function meanObliquityRad(date: Date): number {
  const t = (julianDay(date) - 2451545.0) / 36525;
  const epsDeg =
    23.439291111 - 0.0130041667 * t - 1.6388889e-7 * t * t + 5.0361111e-7 * t * t * t;
  return (epsDeg * Math.PI) / 180;
}

function localSiderealDeg(date: Date, lngDeg: number): number {
  const gastHours = Astronomy.SiderealTime(date);
  const lstDeg = gastHours * 15 + lngDeg;
  return ((lstDeg % 360) + 360) % 360;
}

function ascendantLongitude(date: Date, latDeg: number, lngDeg: number): number {
  const ramc = (localSiderealDeg(date, lngDeg) * Math.PI) / 180;
  const eps = meanObliquityRad(date);
  const lat = (latDeg * Math.PI) / 180;
  const asc = Math.atan2(
    Math.cos(ramc),
    -(Math.sin(ramc) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps)),
  );
  return ((((asc * 180) / Math.PI) % 360) + 360) % 360;
}

function midheavenLongitude(date: Date, lngDeg: number): number {
  const ramc = (localSiderealDeg(date, lngDeg) * Math.PI) / 180;
  const eps = meanObliquityRad(date);
  const mc = Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps));
  return ((((mc * 180) / Math.PI) % 360) + 360) % 360;
}

function isRetrograde(body: any, date: Date): boolean {
  const dt = 6 * 3600 * 1000;
  const before = eclipticLon(body, new Date(date.getTime() - dt));
  const after = eclipticLon(body, new Date(date.getTime() + dt));
  let delta = after - before;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return delta < 0;
}

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

function wallClockToUtc(dateStr: string, timeStr: string, tz: string): Date {
  const [y, mo, d] = dateStr.split('-').map(Number);
  const [h, mi] = timeStr.split(':').map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi, 0);
  const off1 = tzOffsetMs(tz, new Date(guess));
  let utc = guess - off1;
  const off2 = tzOffsetMs(tz, new Date(utc));
  if (off2 !== off1) utc = guess - off2;
  return new Date(utc);
}

function bodyPosition(date: Date, def: typeof PLANETS[number]): BodyPosition {
  const lon = eclipticLon(def.body, date);
  const base = placementFromLon(lon);
  const retro =
    def.slug === 'sun' || def.slug === 'moon' ? false : isRetrograde(def.body, date);
  return { ...base, body: def.slug, name: def.name, symbol: def.symbol, retrograde: retro };
}

export interface NatalInput {
  birthDate: string;          // YYYY-MM-DD
  birthTime: string | null;   // HH:MM o null
  lat: number | null;
  lng: number | null;
  tz: string;                 // zona IANA (def. Europe/Madrid)
}

/** Calcula la carta natal del usuario (planetas + ángulos si hay hora/lugar). */
function computeNatal(input: NatalInput): NatalSnapshot {
  const hasTime = Boolean(input.birthTime);
  const time = input.birthTime ?? '12:00';
  const instant = wallClockToUtc(input.birthDate, time, input.tz);
  const hasAngles = hasTime && input.lat !== null && input.lng !== null;

  const bodies = PLANETS.map((p) => bodyPosition(instant, p));

  let ascendant: Placement | null = null;
  let midheaven: Placement | null = null;
  if (hasAngles) {
    ascendant = placementFromLon(ascendantLongitude(instant, input.lat!, input.lng!));
    midheaven = placementFromLon(midheavenLongitude(instant, input.lng!));
  }

  return { bodies, ascendant, midheaven, has_time: hasTime, has_angles: hasAngles };
}

function angularSep(a: number, b: number): number {
  let sep = Math.abs(a - b);
  if (sep > 180) sep = 360 - sep;
  return sep;
}

/**
 * Calcula la carta del periodo: posiciones de tránsito en el punto medio y los
 * aspectos que forman con la carta natal del usuario.
 *
 * `midUtc` es el instante representativo del periodo (mitad del mes / del año).
 */
export function computePeriodChart(
  input: NatalInput,
  midUtc: Date,
  periodLabel: string,
): PeriodChart {
  const natal = computeNatal(input);

  const transits = PLANETS
    .filter((p) => TRANSIT_SLUGS.includes(p.slug))
    .map((p) => bodyPosition(midUtc, p));

  // Puntos natales contra los que medimos aspectos (planetas + ángulos).
  const natalPoints: { slug: string; name: string; lon: number }[] = natal.bodies.map((b) => ({
    slug: b.body, name: b.name, lon: b.longitude,
  }));
  if (natal.ascendant) {
    natalPoints.push({ slug: 'ascendant', name: 'Ascendente', lon: natal.ascendant.longitude });
  }
  if (natal.midheaven) {
    natalPoints.push({ slug: 'midheaven', name: 'Medio Cielo', lon: natal.midheaven.longitude });
  }

  const aspects: TransitAspect[] = [];
  for (const t of transits) {
    for (const np of natalPoints) {
      const sep = angularSep(t.longitude, np.lon);
      let best: { def: typeof ASPECTS[number]; orb: number } | null = null;
      for (const def of ASPECTS) {
        const orb = Math.abs(sep - def.angle);
        if (orb <= def.orb && (!best || orb < best.orb)) best = { def, orb };
      }
      if (best) {
        aspects.push({
          transit: t.body, transit_name: t.name,
          natal: np.slug, natal_name: np.name,
          type: best.def.slug, type_name: best.def.name,
          harmonious: best.def.harmonious, orb: best.orb,
        });
      }
    }
  }
  aspects.sort((x, y) => x.orb - y.orb);

  return { natal, transits, aspects, period_label: periodLabel };
}
