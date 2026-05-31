/**
 * Temas visuales por funcionalidad. Centraliza el color/gradiente/identidad de
 * cada funcionalidad para que las páginas (secciones 10.5.4/10.5.5) compartan
 * un look coherente pasando solo una `ThemeKey`. Todos los tonos de texto
 * (`text`) son `-600/-700`, con contraste AA sobre blanco. Ver DESIGN_SYSTEM.
 */
export type ThemeKey =
  | 'cosmos'
  | 'tarot'
  | 'astral'
  | 'amor'
  | 'numen'
  | 'energy'
  | 'celeste'
  | 'gold';

export interface FeatureTheme {
  key: ThemeKey;
  /** Color de texto/acento (AA sobre blanco). */
  text: string;
  /** Fondo suave para chips/cards. */
  bgSoft: string;
  /** Borde suave a juego. */
  border: string;
  /** Gradiente de marca (clases `from-… to-…`). */
  gradient: string;
  /** Anillo de foco/realce. */
  ring: string;
  /** Dos colores para los "blobs" del fondo cósmico (paleta Tailwind por defecto). */
  blobA: string;
  blobB: string;
}

export const FEATURE_THEMES: Record<ThemeKey, FeatureTheme> = {
  cosmos: {
    key: 'cosmos',
    text: 'text-cosmos-700',
    bgSoft: 'bg-cosmos-50',
    border: 'border-cosmos-200',
    gradient: 'from-cosmos-600 to-aurora-500',
    ring: 'ring-cosmos-500',
    blobA: 'bg-indigo-300',
    blobB: 'bg-violet-300',
  },
  tarot: {
    key: 'tarot',
    text: 'text-tarot-700',
    bgSoft: 'bg-tarot-50',
    border: 'border-tarot-100',
    gradient: 'from-tarot-600 to-aurora-600',
    ring: 'ring-tarot-500',
    blobA: 'bg-fuchsia-300',
    blobB: 'bg-violet-300',
  },
  astral: {
    key: 'astral',
    text: 'text-astral-700',
    bgSoft: 'bg-astral-50',
    border: 'border-astral-100',
    gradient: 'from-astral-600 to-celeste-500',
    ring: 'ring-astral-500',
    blobA: 'bg-blue-300',
    blobB: 'bg-cyan-300',
  },
  amor: {
    key: 'amor',
    text: 'text-amor-700',
    bgSoft: 'bg-amor-50',
    border: 'border-amor-100',
    gradient: 'from-amor-600 to-tarot-500',
    ring: 'ring-amor-500',
    blobA: 'bg-rose-300',
    blobB: 'bg-fuchsia-300',
  },
  numen: {
    key: 'numen',
    text: 'text-numen-700',
    bgSoft: 'bg-numen-50',
    border: 'border-numen-100',
    gradient: 'from-numen-600 to-celeste-500',
    ring: 'ring-numen-500',
    blobA: 'bg-emerald-300',
    blobB: 'bg-teal-300',
  },
  energy: {
    key: 'energy',
    text: 'text-energy-700',
    bgSoft: 'bg-energy-50',
    border: 'border-energy-100',
    gradient: 'from-energy-600 to-gold-500',
    ring: 'ring-energy-500',
    blobA: 'bg-orange-300',
    blobB: 'bg-amber-300',
  },
  celeste: {
    key: 'celeste',
    text: 'text-celeste-700',
    bgSoft: 'bg-celeste-50',
    border: 'border-celeste-100',
    gradient: 'from-celeste-600 to-astral-500',
    ring: 'ring-celeste-500',
    blobA: 'bg-cyan-300',
    blobB: 'bg-sky-300',
  },
  gold: {
    key: 'gold',
    text: 'text-gold-600',
    bgSoft: 'bg-amber-50',
    border: 'border-gold-300',
    gradient: 'from-gold-500 to-energy-500',
    ring: 'ring-gold-400',
    blobA: 'bg-amber-300',
    blobB: 'bg-orange-300',
  },
};

/** Devuelve el tema (con fallback a `cosmos`). */
export function featureTheme(key: ThemeKey = 'cosmos'): FeatureTheme {
  return FEATURE_THEMES[key] ?? FEATURE_THEMES.cosmos;
}
