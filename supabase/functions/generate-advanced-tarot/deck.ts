// Mazo completo de tarot (Arcanos Mayores + Menores) con nombres en español.
// Idéntico al de la tirada simple: barajado y robo en el servidor.

export type Suit = 'copas' | 'espadas' | 'oros' | 'bastos';

export interface Card {
  id: string;
  name: string;
  arcana: 'major' | 'minor';
  suit?: Suit;
}

const MAJORS = [
  'El Loco', 'El Mago', 'La Sacerdotisa', 'La Emperatriz', 'El Emperador',
  'El Hierofante', 'Los Enamorados', 'El Carro', 'La Fuerza', 'El Ermitaño',
  'La Rueda de la Fortuna', 'La Justicia', 'El Colgado', 'La Muerte',
  'La Templanza', 'El Diablo', 'La Torre', 'La Estrella', 'La Luna',
  'El Sol', 'El Juicio', 'El Mundo',
];

const SUITS: Suit[] = ['copas', 'espadas', 'oros', 'bastos'];
const SUIT_NAMES: Record<Suit, string> = {
  copas: 'Copas', espadas: 'Espadas', oros: 'Oros', bastos: 'Bastos',
};
const RANKS = [
  'As', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve',
  'Diez', 'Sota', 'Caballero', 'Reina', 'Rey',
];

export const DECK: Card[] = (() => {
  const cards: Card[] = MAJORS.map((name, i) => ({
    id: `major-${i}`,
    name,
    arcana: 'major',
  }));
  for (const suit of SUITS) {
    for (let r = 0; r < RANKS.length; r++) {
      cards.push({
        id: `${suit}-${r}`,
        name: `${RANKS[r]} de ${SUIT_NAMES[suit]}`,
        arcana: 'minor',
        suit,
      });
    }
  }
  return cards;
})();

export interface DrawnCard {
  id: string;
  name: string;
  arcana: 'major' | 'minor';
  suit?: Suit;
  reversed: boolean;
  position: string;
}

/** Fisher-Yates: barajado sin sesgo. */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Roba `n` cartas sin repetir, cada una con orientación aleatoria. */
export function draw(n: number, positions: string[]): DrawnCard[] {
  const shuffled = shuffle(DECK).slice(0, n);
  return shuffled.map((card, i) => ({
    id: card.id,
    name: card.name,
    arcana: card.arcana,
    ...(card.suit ? { suit: card.suit } : {}),
    reversed: Math.random() < 0.5,
    position: positions[i] ?? '',
  }));
}
