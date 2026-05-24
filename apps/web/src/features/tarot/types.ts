export type SpreadType = 'one_card' | 'three_cards';

export interface TarotCard {
  id: string;
  name: string;
  arcana: 'major' | 'minor';
  suit?: 'copas' | 'espadas' | 'oros' | 'bastos';
  reversed: boolean;
  position: string;
  meaning: string;
}

export interface TarotContent {
  cards: TarotCard[];
  summary: string;
  premium_hook: string;
}

export type TarotResponse =
  | {
      status: 'ok';
      id: string;
      created_at: string;
      spread: SpreadType;
      question: string | null;
      content: TarotContent;
    }
  | { status: 'cooldown'; message: string; next_available_at: string }
  | { status: 'unavailable'; message: string }
  | { status: 'error'; message: string };

export const SPREADS: ReadonlyArray<{
  key: SpreadType;
  label: string;
  cards: number;
  description: string;
}> = [
  {
    key: 'one_card',
    label: 'Una carta',
    cards: 1,
    description: 'El mensaje que el día tiene para ti.',
  },
  {
    key: 'three_cards',
    label: 'Tres cartas',
    cards: 3,
    description: 'Pasado, presente y futuro de tu situación.',
  },
];
