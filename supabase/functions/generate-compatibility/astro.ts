// Cálculo de posiciones clave y sinastría para la compatibilidad (premium).
//
// Para que sea USABLE (rara vez se conoce la hora exacta de la otra persona),
// la hora y el lugar son OPCIONALES: con solo la fecha calculamos Sol, Mercurio,
// Venus, Marte y la Luna (esta última aproximada al mediodía si no hay hora).
// Con hora + lugar añadimos el Ascendente.
//
// La sinastría compara los planetas de las dos personas (aspectos cruzados) y
// produce un "score" determinista de afinidad para que Gemini lo explique.

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

// Elemento por índice de signo (0=Aries…): fuego/tierra/aire/agua.
const SIGN_ELEMENT = [
  'fuego', 'tierra', 'aire', 'agua',
  'fuego', 'tierra', 'aire', 'agua',
  'fuego', 'tierra', 'aire', 'agua',
] as const;

export interface Placement {
  sign: string;
  sign_name: string;
  element: string;
  longitude: number;
  deg_in_sign: number;
}

export interface PersonPlacements {
  sun: Placement;
  moon: Placement;
  mercury: Placement;
  venus: Placement;
  mars: Placement;
  ascendant: Placement | null;
  moon_approximate: boolean;
}

const PLANET_BODIES: Record<string, any> = {
  sun: Astronomy.Body.Sun,
  moon: Astronomy.Body.Moon,
  mercury: Astronomy.Body.Mercury,
  venus: Astronomy.Body.Venus,
  mars: Astronomy.Body.Mars,
};

export const PLANET_NAMES: Record<string, string> = {
  sun: 'Sol', moon: 'Luna', mercury: 'Mercurio', venus: 'Venus', mars: 'Marte',
};

function placementFromLon(lon: number): Placement {
  const norm = ((lon % 360) + 360) % 360;
  const index = Math.floor(norm / 30);
  return {
    sign: SIGN_SLUGS[index],
    sign_name: SIGN_NAMES[index],
    element: SIGN_ELEMENT[index],
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

function ascendantLongitude(date: Date, latDeg: number, lngDeg: number): number {
  const gastHours = Astronomy.SiderealTime(date);
  let lstDeg = gastHours * 15 + lngDeg;
  lstDeg = ((lstDeg % 360) + 360) % 360;
  const ramc = (lstDeg * Math.PI) / 180;
  const eps = meanObliquityRad(date);
  const lat = (latDeg * Math.PI) / 180;
  const asc = Math.atan2(
    Math.cos(ramc),
    -(Math.sin(ramc) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps)),
  );
  return ((((asc * 180) / Math.PI) % 360) + 360) % 360;
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

export interface PersonInput {
  birthDate: string;            // YYYY-MM-DD
  birthTime: string | null;     // HH:MM o null
  lat: number | null;
  lng: number | null;
  tz: string;                   // zona IANA (def. Europe/Madrid)
}

/** Calcula las posiciones clave de una persona. */
export function computePlacements(input: PersonInput): PersonPlacements {
  const hasTime = Boolean(input.birthTime);
  const time = input.birthTime ?? '12:00';
  const instant = wallClockToUtc(input.birthDate, time, input.tz);

  const place = (slug: string) => placementFromLon(eclipticLon(PLANET_BODIES[slug], instant));

  let ascendant: Placement | null = null;
  if (hasTime && input.lat !== null && input.lng !== null) {
    ascendant = placementFromLon(ascendantLongitude(instant, input.lat, input.lng));
  }

  return {
    sun: place('sun'),
    moon: place('moon'),
    mercury: place('mercury'),
    venus: place('venus'),
    mars: place('mars'),
    ascendant,
    moon_approximate: !hasTime,
  };
}

// --- Sinastría --------------------------------------------------------------

export interface SynastryAspect {
  a: string;        // planeta de la persona A (slug)
  b: string;        // planeta de la persona B (slug)
  a_name: string;
  b_name: string;
  type: string;     // conjunction|sextile|square|trine|opposition
  type_name: string;
  harmonious: boolean;
  orb: number;
}

const ASPECTS: { angle: number; slug: string; name: string; orb: number; harmonious: boolean }[] = [
  { angle: 0, slug: 'conjunction', name: 'Conjunción', orb: 7, harmonious: true },
  { angle: 60, slug: 'sextile', name: 'Sextil', orb: 5, harmonious: true },
  { angle: 90, slug: 'square', name: 'Cuadratura', orb: 6, harmonious: false },
  { angle: 120, slug: 'trine', name: 'Trígono', orb: 7, harmonious: true },
  { angle: 180, slug: 'opposition', name: 'Oposición', orb: 7, harmonious: false },
];

// Pares de planetas relevantes para los vínculos (A-planet, B-planet).
const RELEVANT_PAIRS: [string, string][] = [
  ['sun', 'moon'], ['moon', 'sun'],
  ['sun', 'sun'], ['moon', 'moon'],
  ['venus', 'mars'], ['mars', 'venus'],
  ['venus', 'venus'], ['mars', 'mars'],
  ['sun', 'venus'], ['venus', 'sun'],
  ['mercury', 'mercury'],
  ['sun', 'mars'], ['mars', 'sun'],
];

function angularSep(a: number, b: number): number {
  let sep = Math.abs(a - b);
  if (sep > 180) sep = 360 - sep;
  return sep;
}

export interface SynastryResult {
  aspects: SynastryAspect[];
  score: number; // 0-100, afinidad global
}

/** Compara las dos personas: aspectos cruzados + score determinista. */
export function computeSynastry(a: PersonPlacements, b: PersonPlacements): SynastryResult {
  const planetsA = a as unknown as Record<string, Placement>;
  const planetsB = b as unknown as Record<string, Placement>;

  const aspects: SynastryAspect[] = [];
  for (const [pa, pb] of RELEVANT_PAIRS) {
    const la = planetsA[pa]?.longitude;
    const lb = planetsB[pb]?.longitude;
    if (la === undefined || lb === undefined) continue;
    const sep = angularSep(la, lb);
    let best: { def: typeof ASPECTS[number]; orb: number } | null = null;
    for (const def of ASPECTS) {
      const orb = Math.abs(sep - def.angle);
      if (orb <= def.orb && (!best || orb < best.orb)) best = { def, orb };
    }
    if (best) {
      aspects.push({
        a: pa, b: pb,
        a_name: PLANET_NAMES[pa], b_name: PLANET_NAMES[pb],
        type: best.def.slug, type_name: best.def.name,
        harmonious: best.def.harmonious, orb: best.orb,
      });
    }
  }
  aspects.sort((x, y) => x.orb - y.orb);

  // --- Score determinista de rango medio (~40-95) --------------------------
  // Los elementos afines suben y los que chocan bajan; los aspectos armónicos
  // suman y los tensos restan. Así una pareja con choque de elementos y muchos
  // aspectos tensos puede caer por debajo de 50, aunque la mayoría salen altas.
  let score = 50;

  const elementScore = (ea: string, eb: string): number => {
    if (ea === eb) return 9;
    const compatible =
      (ea === 'fuego' && eb === 'aire') || (ea === 'aire' && eb === 'fuego') ||
      (ea === 'tierra' && eb === 'agua') || (ea === 'agua' && eb === 'tierra');
    return compatible ? 6 : -4; // elementos que chocan restan
  };

  score += elementScore(a.sun.element, b.sun.element);
  score += Math.round(elementScore(a.moon.element, b.moon.element) * 0.9);
  score += Math.round(elementScore(a.venus.element, b.venus.element) * 0.7);

  for (const asp of aspects) {
    const weight = asp.a === asp.b ? 1 : 1.5; // los cruces planeta-distinto pesan más
    if (asp.harmonious) score += Math.round(3 * weight); // +3 / +5
    else score -= Math.round(2 * weight); // -2 / -3 (los tensos restan)
  }

  score = Math.max(40, Math.min(95, Math.round(score)));

  return { aspects, score };
}
