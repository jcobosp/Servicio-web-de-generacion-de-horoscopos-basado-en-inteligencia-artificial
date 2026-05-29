import type { ZodiacSign } from '@/lib/zodiac';

/** Bloques de texto estáticos de la compatibilidad entre dos signos. */
export interface SignCompatContent {
  headline: string;
  overview: string;
  love: string;
  passion: string;
  communication: string;
  strengths: string;
  challenges: string;
  advice: string;
}

export interface SignCompatReport {
  sign_a: ZodiacSign;
  sign_b: ZodiacSign;
  score: number;
  content: SignCompatContent;
}
