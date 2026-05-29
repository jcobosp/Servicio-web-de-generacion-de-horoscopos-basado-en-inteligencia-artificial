import type { ZodiacSign } from '@/lib/zodiac';

/** Posición de un astro (incluye el elemento del signo). */
export interface Placement {
  sign: ZodiacSign;
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

export interface SynastryAspect {
  a: string;
  b: string;
  a_name: string;
  b_name: string;
  type: string;
  type_name: string;
  harmonious: boolean;
  orb: number;
}

export interface CompatInterpretation {
  connection: string;
  emotional: string;
  love: string;
  friction: string;
  longterm: string;
  advice: string;
}

export interface CompatReport {
  label_a: string;
  label_b: string;
  score: number;
  placements_a: PersonPlacements;
  placements_b: PersonPlacements;
  aspects: SynastryAspect[];
  interpretation: CompatInterpretation;
  created_at: string;
}

export type CompatResponse =
  | { status: 'ok'; cached: boolean; report: CompatReport }
  | { status: 'forbidden'; message: string }
  | { status: 'missing_data'; message: string }
  | { status: 'payment_required'; message: string; price?: string }
  | { status: 'unavailable'; message: string }
  | { status: 'error'; message: string };

/** Cuota del usuario para el mes en curso. */
export interface CompatQuota {
  /** ¿Ya usó la generación incluida de este mes? */
  includedUsed: boolean;
  /** Créditos comprados disponibles (sin consumir). */
  credits: number;
}

/** Datos de una persona que envía el cliente. */
export interface PersonParams {
  label: string;
  birth_date: string;
  birth_time?: string | null;
  lat?: number | null;
  lng?: number | null;
  tz?: string | null;
  place_label?: string | null;
}

export interface CompatParams {
  person_a: PersonParams;
  person_b: PersonParams;
}
