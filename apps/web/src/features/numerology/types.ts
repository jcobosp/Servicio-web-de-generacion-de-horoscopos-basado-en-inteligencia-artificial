// Tipos de la numerología (gratuita + premium).

/** Significado estático de un número (parte gratuita). */
export interface NumerologyMeaning {
  headline: string;
  tagline?: string;
  essence: string;
  love: string;
  work: string;
  advice: string;
}

/** Resultado gratuito: números calculados + sus significados fijos. */
export interface FreeNumerology {
  lifePath: number;
  personalYear: number;
  year: number;
  lifePathMeaning: NumerologyMeaning | null;
  personalYearMeaning: NumerologyMeaning | null;
}

/** Números del usuario que la lectura premium interpreta. */
export interface NumerologyNumbers {
  life_path: number;
  personal_year: number;
  personal_month: number;
  birthday: number;
  year: number;
  month: number;
}

/** Secciones de la lectura premium narrada por Gemini. */
export interface NumerologyReadingContent {
  headline: string;
  portrait: string;
  purpose: string;
  strengths: string;
  cycle: string;
  love: string;
  advice: string;
}

export type NumerologyResponse =
  | {
      status: 'ok';
      id: string;
      created_at: string;
      numbers: NumerologyNumbers;
      focus: string | null;
      content: NumerologyReadingContent;
      billing: 'included' | 'paid';
    }
  | { status: 'payment_required'; message: string; price: string }
  | { status: 'forbidden'; message: string }
  | { status: 'missing_data'; message: string }
  | { status: 'unavailable'; message: string }
  | { status: 'error'; message: string };

/** Cuota del mes en curso (parte premium). */
export interface NumerologyQuota {
  /** ¿Ya se usó la lectura incluida de este mes? */
  includedUsed: boolean;
  /** Créditos comprados disponibles (sin consumir). */
  credits: number;
}

/** Una lectura premium guardada (para el historial). */
export interface StoredNumerologyReading {
  id: string;
  numbers: NumerologyNumbers;
  focus: string | null;
  content: NumerologyReadingContent;
  created_at: string;
}
