import type { TarotCard } from './types';

export type AdvancedSpreadType = 'celtic_cross' | 'horseshoe';

export interface AdvancedTarotContent {
  cards: TarotCard[];
  overview: string;
  synthesis: string;
  advice: string;
}

/** Cuota de un tipo de tirada concreto en el mes en curso. */
export interface SpreadQuota {
  /** ¿Ya se usó la tirada incluida de este tipo este mes? */
  includedUsed: boolean;
  /** Créditos comprados disponibles (sin consumir) de este tipo. */
  credits: number;
}

/** Cuota mensual por tipo de tirada. */
export type AdvancedTarotQuota = Record<AdvancedSpreadType, SpreadQuota>;

export type AdvancedTarotResponse =
  | {
      status: 'ok';
      id: string;
      created_at: string;
      spread: AdvancedSpreadType;
      question: string | null;
      content: AdvancedTarotContent;
      billing: 'included' | 'paid';
    }
  | {
      status: 'payment_required';
      message: string;
      spread: AdvancedSpreadType;
      price: string;
    }
  | { status: 'forbidden'; message: string }
  | { status: 'unavailable'; message: string }
  | { status: 'error'; message: string };

export const ADVANCED_SPREADS: ReadonlyArray<{
  key: AdvancedSpreadType;
  label: string;
  cards: number;
  description: string;
}> = [
  {
    key: 'celtic_cross',
    label: 'Cruz Celta',
    cards: 10,
    description:
      'La tirada más completa: 10 cartas que retratan tu situación, su raíz, tus influencias y el desenlace.',
  },
  {
    key: 'horseshoe',
    label: 'Herradura',
    cards: 7,
    description:
      '7 cartas que trazan el arco de pasado, presente, obstáculos y el resultado más probable.',
  },
];
