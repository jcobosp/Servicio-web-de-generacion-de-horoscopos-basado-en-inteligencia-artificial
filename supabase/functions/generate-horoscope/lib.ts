// Utilidades: validación de entrada, fechas (zona Europe/Madrid) y validación
// de la salida de Gemini.

import { LENGTHS } from './prompts.ts';
import type { Area, Scope, SunSign } from './prompts.ts';

export const SUN_SIGNS: readonly SunSign[] = [
  'aries', 'tauro', 'geminis', 'cancer', 'leo', 'virgo',
  'libra', 'escorpio', 'sagitario', 'capricornio', 'acuario', 'piscis',
];
export const SCOPES: readonly Scope[] = ['daily', 'weekly', 'monthly'];
export const AREAS: readonly Area[] = ['general', 'love', 'health', 'money', 'work'];

const WEEKDAYS_ES = [
  'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado',
];

/** Fecha de hoy (YYYY-MM-DD) en la zona horaria de Madrid. */
export function madridToday(): string {
  // en-CA produce el formato ISO YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** ¿Es una fecha ISO válida YYYY-MM-DD? */
export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = parseUtc(value);
  return !Number.isNaN(d.getTime()) && formatUtc(d) === value;
}

function parseUtc(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatUtc(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Inicio del período de cache para una fecha y scope dados. */
export function periodStart(scope: Scope, isoDate: string): string {
  const d = parseUtc(isoDate);
  if (scope === 'daily') return formatUtc(d);
  if (scope === 'weekly') {
    // Lunes de la semana ISO.
    const dow = d.getUTCDay(); // 0=domingo
    const offset = (dow + 6) % 7; // días desde el lunes
    d.setUTCDate(d.getUTCDate() - offset);
    return formatUtc(d);
  }
  // monthly → primer día del mes.
  return `${isoDate.slice(0, 7)}-01`;
}

/** Inicio del período anterior (para el fallback cuando se supera el límite). */
export function previousPeriodStart(scope: Scope, isoPeriodStart: string): string {
  const d = parseUtc(isoPeriodStart);
  if (scope === 'daily') d.setUTCDate(d.getUTCDate() - 1);
  else if (scope === 'weekly') d.setUTCDate(d.getUTCDate() - 7);
  else d.setUTCMonth(d.getUTCMonth() - 1);
  return formatUtc(d);
}

/** Día de la semana en español para una fecha ISO. */
export function weekdayEs(isoDate: string): string {
  return WEEKDAYS_ES[parseUtc(isoDate).getUTCDay()];
}

export interface Horoscope {
  headline: string;
  body: string;
  lucky_number: number;
  lucky_color: string;
  mood_emoji: string;
  keyword: string;
  premium_hook: string;
  disclaimer?: string;
}

/**
 * Valida la salida de Gemini: presencia y tipo de los campos y que el cuerpo
 * caiga dentro de un rango de palabras razonable (tolerancia amplia: el objetivo
 * es descartar respuestas claramente fuera de formato, no microajustar).
 */
export function validateHoroscope(
  value: unknown,
  scope: Scope,
): { ok: true; value: Horoscope } | { ok: false; reason: string } {
  if (typeof value !== 'object' || value === null) {
    return { ok: false, reason: 'no es un objeto' };
  }
  const v = value as Record<string, unknown>;
  const strFields = [
    'headline', 'body', 'lucky_color', 'mood_emoji', 'keyword', 'premium_hook',
  ];
  for (const f of strFields) {
    if (typeof v[f] !== 'string' || (v[f] as string).trim() === '') {
      return { ok: false, reason: `campo "${f}" ausente o vacío` };
    }
  }
  const num = v.lucky_number;
  if (typeof num !== 'number' || !Number.isInteger(num) || num < 1 || num > 99) {
    return { ok: false, reason: 'lucky_number fuera de rango (1-99)' };
  }

  const { minWords, maxWords } = LENGTHS[scope];
  const words = (v.body as string).trim().split(/\s+/).length;
  const lo = Math.round(minWords * 0.6);
  const hi = Math.round(maxWords * 1.5);
  if (words < lo || words > hi) {
    return { ok: false, reason: `extensión del cuerpo fuera de rango (${words} palabras)` };
  }

  return {
    ok: true,
    value: {
      headline: (v.headline as string).trim(),
      body: (v.body as string).trim(),
      lucky_number: num,
      lucky_color: (v.lucky_color as string).trim(),
      mood_emoji: (v.mood_emoji as string).trim(),
      keyword: (v.keyword as string).trim(),
      premium_hook: (v.premium_hook as string).trim(),
      disclaimer:
        typeof v.disclaimer === 'string' && v.disclaimer.trim() !== ''
          ? (v.disclaimer as string).trim()
          : undefined,
    },
  };
}
