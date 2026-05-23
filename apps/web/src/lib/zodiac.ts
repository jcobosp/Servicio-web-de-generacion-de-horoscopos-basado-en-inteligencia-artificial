export const ZODIAC_SIGNS = [
  'aries',
  'tauro',
  'geminis',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'escorpio',
  'sagitario',
  'capricornio',
  'acuario',
  'piscis',
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

export interface ZodiacInfo {
  slug: ZodiacSign;
  name: string;
  glyph: string;
  element: 'fuego' | 'tierra' | 'aire' | 'agua';
  dates: string;
  colors: {
    primary: string;
    secondary: string;
    from: string;
    to: string;
  };
}

export const ZODIAC: Record<ZodiacSign, ZodiacInfo> = {
  aries: {
    slug: 'aries',
    name: 'Aries',
    glyph: '♈',
    element: 'fuego',
    dates: '21 mar - 19 abr',
    colors: { primary: '#DC2626', secondary: '#FEE2E2', from: '#EF4444', to: '#F97316' },
  },
  tauro: {
    slug: 'tauro',
    name: 'Tauro',
    glyph: '♉',
    element: 'tierra',
    dates: '20 abr - 20 may',
    colors: { primary: '#16A34A', secondary: '#DCFCE7', from: '#22C55E', to: '#84CC16' },
  },
  geminis: {
    slug: 'geminis',
    name: 'Géminis',
    glyph: '♊',
    element: 'aire',
    dates: '21 may - 20 jun',
    colors: { primary: '#EAB308', secondary: '#FEF9C3', from: '#FACC15', to: '#FCD34D' },
  },
  cancer: {
    slug: 'cancer',
    name: 'Cáncer',
    glyph: '♋',
    element: 'agua',
    dates: '21 jun - 22 jul',
    colors: { primary: '#0EA5E9', secondary: '#E0F2FE', from: '#38BDF8', to: '#A5F3FC' },
  },
  leo: {
    slug: 'leo',
    name: 'Leo',
    glyph: '♌',
    element: 'fuego',
    dates: '23 jul - 22 ago',
    colors: { primary: '#F59E0B', secondary: '#FEF3C7', from: '#FBBF24', to: '#F97316' },
  },
  virgo: {
    slug: 'virgo',
    name: 'Virgo',
    glyph: '♍',
    element: 'tierra',
    dates: '23 ago - 22 sep',
    colors: { primary: '#65A30D', secondary: '#ECFCCB', from: '#84CC16', to: '#A3E635' },
  },
  libra: {
    slug: 'libra',
    name: 'Libra',
    glyph: '♎',
    element: 'aire',
    dates: '23 sep - 22 oct',
    colors: { primary: '#EC4899', secondary: '#FCE7F3', from: '#F472B6', to: '#F9A8D4' },
  },
  escorpio: {
    slug: 'escorpio',
    name: 'Escorpio',
    glyph: '♏',
    element: 'agua',
    dates: '23 oct - 21 nov',
    colors: { primary: '#7C2D12', secondary: '#FED7AA', from: '#9A3412', to: '#C2410C' },
  },
  sagitario: {
    slug: 'sagitario',
    name: 'Sagitario',
    glyph: '♐',
    element: 'fuego',
    dates: '22 nov - 21 dic',
    colors: { primary: '#9333EA', secondary: '#F3E8FF', from: '#A855F7', to: '#C084FC' },
  },
  capricornio: {
    slug: 'capricornio',
    name: 'Capricornio',
    glyph: '♑',
    element: 'tierra',
    dates: '22 dic - 19 ene',
    colors: { primary: '#1F2937', secondary: '#E5E7EB', from: '#374151', to: '#6B7280' },
  },
  acuario: {
    slug: 'acuario',
    name: 'Acuario',
    glyph: '♒',
    element: 'aire',
    dates: '20 ene - 18 feb',
    colors: { primary: '#06B6D4', secondary: '#CFFAFE', from: '#22D3EE', to: '#67E8F9' },
  },
  piscis: {
    slug: 'piscis',
    name: 'Piscis',
    glyph: '♓',
    element: 'agua',
    dates: '19 feb - 20 mar',
    colors: { primary: '#3B82F6', secondary: '#DBEAFE', from: '#60A5FA', to: '#A5B4FC' },
  },
};

/**
 * Calcula el signo solar a partir de una fecha de nacimiento.
 * Reglas tropicales occidentales estándar.
 */
export function getZodiacSign(birthDate: Date): ZodiacSign {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'tauro';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'geminis';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'escorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagitario';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricornio';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'acuario';
  return 'piscis';
}
