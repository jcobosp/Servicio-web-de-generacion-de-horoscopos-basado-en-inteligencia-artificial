// Cálculo de eventos astrológicos del mes mediante `astronomy-engine`.
//
// Para v1 detectamos los eventos más reconocibles y siempre fiables:
//   - Luna nueva y luna llena (con el signo en el que ocurren).
//   - Ingresos de Sol, Mercurio, Venus y Marte (cuando cambian de signo
//     durante el mes).
// Los retrógrados y los ingresos de planetas exteriores quedan para versiones
// futuras (cómputo más delicado por los retrocesos).

// deno-lint-ignore-file no-explicit-any
import * as Astronomy from 'npm:astronomy-engine@2.1.19';

const SIGN_SLUGS = [
  'aries', 'tauro', 'geminis', 'cancer', 'leo', 'virgo',
  'libra', 'escorpio', 'sagitario', 'capricornio', 'acuario', 'piscis',
];
const SIGN_NAMES = [
  'Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo',
  'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis',
];

function signFromLon(lon: number): { slug: string; name: string; index: number } {
  const norm = ((lon % 360) + 360) % 360;
  const index = Math.floor(norm / 30);
  return { slug: SIGN_SLUGS[index], name: SIGN_NAMES[index], index };
}

/** Longitud eclíptica geocéntrica aparente de un cuerpo (grados). */
function eclipticLon(body: any, date: Date): number {
  const vec = Astronomy.GeoVector(body, date, true);
  const ecl = Astronomy.Ecliptic(vec);
  return ecl.elon;
}

/** YYYY-MM-DD en zona Europe/Madrid. */
function madridDate(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date);
}

export interface AstroEventRaw {
  kind: 'new_moon' | 'full_moon' | 'sun_ingress' | 'mercury_ingress' | 'venus_ingress' | 'mars_ingress';
  event_date: string;   // YYYY-MM-DD en Madrid
  body: 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars';
  sign_slug: string;
  sign_name: string;
}

function findLunations(searchStart: Date, searchEnd: Date, yearMonth: string): AstroEventRaw[] {
  const events: AstroEventRaw[] = [];
  for (const phase of [0, 180] as const) {
    let t = searchStart;
    let guard = 0;
    while (t < searchEnd && guard++ < 6) {
      const limitDays = (searchEnd.getTime() - t.getTime()) / 86_400_000;
      if (limitDays <= 0) break;
      const result = Astronomy.SearchMoonPhase(phase, t, Math.min(35, limitDays));
      if (!result) break;
      const eventTime: Date = result.date;
      if (eventTime >= searchEnd) break;
      const moonLon = eclipticLon(Astronomy.Body.Moon, eventTime);
      const sign = signFromLon(moonLon);
      const dateStr = madridDate(eventTime);
      if (dateStr.startsWith(yearMonth)) {
        events.push({
          kind: phase === 0 ? 'new_moon' : 'full_moon',
          event_date: dateStr,
          body: 'Moon',
          sign_slug: sign.slug,
          sign_name: sign.name,
        });
      }
      t = new Date(eventTime.getTime() + 86_400_000);
    }
  }
  return events;
}

function findIngress(
  bodyName: 'Sun' | 'Mercury' | 'Venus' | 'Mars',
  monthStart: Date,
  monthEnd: Date,
  yearMonth: string,
): AstroEventRaw | null {
  const body = (Astronomy.Body as any)[bodyName];
  const lonStart = eclipticLon(body, monthStart);
  const lonEnd = eclipticLon(body, new Date(monthEnd.getTime() - 1));
  const idxStart = signFromLon(lonStart).index;
  const idxEnd = signFromLon(lonEnd).index;
  if (idxStart === idxEnd) return null;

  // Búsqueda binaria del instante del ingreso (precisión 1 minuto).
  let lo = monthStart.getTime();
  let hi = monthEnd.getTime();
  while (hi - lo > 60_000) {
    const mid = (lo + hi) / 2;
    const lonMid = eclipticLon(body, new Date(mid));
    if (signFromLon(lonMid).index === idxStart) lo = mid;
    else hi = mid;
  }
  const t = new Date(hi);
  const lonAfter = eclipticLon(body, t);
  const sign = signFromLon(lonAfter);
  const dateStr = madridDate(t);
  if (!dateStr.startsWith(yearMonth)) return null;
  return {
    kind: `${bodyName.toLowerCase()}_ingress` as AstroEventRaw['kind'],
    event_date: dateStr,
    body: bodyName,
    sign_slug: sign.slug,
    sign_name: sign.name,
  };
}

/** Calcula los eventos astrológicos del mes (formato 'YYYY-MM'). */
export function computeMonthEvents(yearMonth: string): AstroEventRaw[] {
  const [yy, mm] = yearMonth.split('-').map(Number);
  // Ventana UTC del mes con 2 días de margen para captar lunaciones en frontera
  // de zona horaria.
  const monthStart = new Date(Date.UTC(yy, mm - 1, 1, 0, 0, 0));
  const monthEnd = new Date(Date.UTC(yy, mm, 1, 0, 0, 0));
  const searchStart = new Date(monthStart.getTime() - 2 * 86_400_000);
  const searchEnd = new Date(monthEnd.getTime() + 2 * 86_400_000);

  const events: AstroEventRaw[] = [];
  events.push(...findLunations(searchStart, searchEnd, yearMonth));
  for (const body of ['Sun', 'Mercury', 'Venus', 'Mars'] as const) {
    const ingress = findIngress(body, monthStart, monthEnd, yearMonth);
    if (ingress) events.push(ingress);
  }
  events.sort((a, b) => a.event_date.localeCompare(b.event_date));
  return events;
}
