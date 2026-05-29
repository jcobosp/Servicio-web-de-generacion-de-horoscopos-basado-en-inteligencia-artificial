import type { ZodiacSign } from '@/lib/zodiac';

/** Posición de un astro en la eclíptica. */
export interface Placement {
  sign: ZodiacSign;
  sign_name: string;
  longitude: number;
  deg_in_sign: number;
}

/** Narrativa generada por Gemini para la carta básica. */
export interface NatalInterpretation {
  intro: string;
  sun: string;
  moon: string;
  ascendant: string;
  synthesis: string;
  premium_hook: string;
}

export interface NatalChart {
  sun: Placement;
  moon: Placement;
  ascendant: Placement | null;
  /** La Luna se calculó sin hora exacta (solo fecha → mediodía). */
  moon_approximate: boolean;
  /** El usuario aportó su hora de nacimiento. */
  has_time: boolean;
  place: string | null;
  interpretation: NatalInterpretation;
  created_at: string;
}

export type NatalResponse =
  | { status: 'ok'; cached: boolean; chart: NatalChart }
  | { status: 'missing_data'; message: string }
  | { status: 'unavailable'; message: string }
  | { status: 'error'; message: string };

/** Parámetros de generación que envía el cliente. */
export interface NatalParams {
  birth_time?: string | null;
  lat?: number | null;
  lng?: number | null;
  tz?: string | null;
  place_label?: string | null;
}

// --- Carta natal COMPLETA (premium) ----------------------------------------

/** Posición de un planeta en la carta completa. */
export interface PlanetPosition extends Placement {
  body: string;
  name: string;
  symbol: string;
  house: number;
  retrograde: boolean;
}

export interface HouseCusp {
  house: number;
  sign: ZodiacSign;
  sign_name: string;
}

export interface Aspect {
  a: string;
  b: string;
  a_name: string;
  b_name: string;
  type: string;
  type_name: string;
  symbol: string;
  angle: number;
  orb: number;
}

/** Narrativa generada por Gemini para la carta completa (6 bloques + cierre). */
export interface FullNatalInterpretation {
  identity: string;
  emotional: string;
  love: string;
  vocation: string;
  shadow: string;
  year_ahead: string;
  summary: string;
}

export interface FullNatalChart {
  planets: PlanetPosition[];
  ascendant: Placement;
  midheaven: Placement;
  houses: HouseCusp[];
  aspects: Aspect[];
  place: string | null;
  interpretation: FullNatalInterpretation;
  created_at: string;
}

export type FullNatalResponse =
  | { status: 'ok'; cached: boolean; chart: FullNatalChart }
  | { status: 'forbidden'; message: string }
  | { status: 'missing_data'; message: string }
  | { status: 'unavailable'; message: string }
  | { status: 'error'; message: string };
