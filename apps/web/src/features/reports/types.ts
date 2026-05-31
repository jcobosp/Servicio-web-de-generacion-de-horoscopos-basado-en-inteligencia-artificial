import type { ZodiacSign } from '@/lib/zodiac';

export type ReportKind = 'monthly' | 'annual';

/** Posición de un astro en la eclíptica. */
export interface Placement {
  sign: ZodiacSign;
  sign_name: string;
  longitude: number;
  deg_in_sign: number;
}

export interface BodyPosition extends Placement {
  body: string;
  name: string;
  symbol: string;
  retrograde: boolean;
}

export interface NatalSnapshot {
  bodies: BodyPosition[];
  ascendant: Placement | null;
  midheaven: Placement | null;
  has_time: boolean;
  has_angles: boolean;
}

export interface TransitAspect {
  transit: string;
  transit_name: string;
  natal: string;
  natal_name: string;
  type: string;
  type_name: string;
  harmonious: boolean;
  orb: number;
}

/**
 * Narrativa de Gemini. Las claves dependen del tipo:
 *  - mensual: headline, overview, love, work, wellbeing, key_moments, advice.
 *  - anual: headline, overview, first_half, second_half, love, career, growth, advice.
 */
export type ReportInterpretation = Record<string, string>;

export interface Report {
  kind: ReportKind;
  period_start: string;
  period_label: string;
  place: string | null;
  natal: NatalSnapshot;
  transits: BodyPosition[];
  aspects: TransitAspect[];
  interpretation: ReportInterpretation;
  created_at: string;
}

export type ReportResponse =
  | { status: 'ok'; cached: boolean; report: Report }
  | { status: 'forbidden'; message: string }
  | { status: 'missing_data'; message: string }
  | { status: 'unavailable'; message: string }
  | { status: 'error'; message: string };

/** Parámetros de generación que envía el cliente. */
export interface ReportParams {
  kind: ReportKind;
  birth_time?: string | null;
  lat?: number | null;
  lng?: number | null;
  tz?: string | null;
  place_label?: string | null;
}
