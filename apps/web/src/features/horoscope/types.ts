import type { ZodiacSign } from '@/lib/zodiac';

export type Scope = 'daily' | 'weekly' | 'monthly';
export type Area = 'general' | 'love' | 'health' | 'money' | 'work';

/** Contenido de un horóscopo (coincide con la salida de la Edge Function). */
export interface HoroscopeContent {
  headline: string;
  body: string;
  lucky_number: number;
  lucky_color: string;
  mood_emoji: string;
  keyword: string;
  premium_hook: string;
  disclaimer?: string;
}

/** Respuesta de la Edge Function `generate-horoscope`. */
export type HoroscopeResponse =
  | {
      status: 'ok';
      cached: boolean;
      stale?: boolean;
      period_start?: string;
      content: HoroscopeContent;
    }
  | { status: 'unavailable'; message: string }
  | { status: 'error'; message: string };

/** Metadatos de cada scope (rutas en español, títulos, SEO). */
export const SCOPE_META: Record<
  Scope,
  { path: string; label: string; title: string; periodHint: string }
> = {
  daily: { path: 'diario', label: 'diario', title: 'Horóscopo diario', periodHint: 'hoy' },
  weekly: { path: 'semanal', label: 'semanal', title: 'Horóscopo semanal', periodHint: 'esta semana' },
  monthly: { path: 'mensual', label: 'mensual', title: 'Horóscopo mensual', periodHint: 'este mes' },
};

/** Áreas de la vida (clave técnica en inglés, etiqueta en español). */
export const AREAS: ReadonlyArray<{ key: Area; label: string; emoji: string }> = [
  { key: 'general', label: 'General', emoji: '🌙' },
  { key: 'love', label: 'Amor', emoji: '💗' },
  { key: 'health', label: 'Salud', emoji: '🌿' },
  { key: 'money', label: 'Dinero', emoji: '🪙' },
  { key: 'work', label: 'Trabajo', emoji: '💼' },
];

export function scopeFromPath(path: string | undefined): Scope | null {
  const found = (Object.keys(SCOPE_META) as Scope[]).find(
    (s) => SCOPE_META[s].path === path,
  );
  return found ?? null;
}

export function isArea(value: string): value is Area {
  return AREAS.some((a) => a.key === value);
}

export type { ZodiacSign };
