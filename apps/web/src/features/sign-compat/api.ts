import { supabase } from '@/lib/supabase';
import { ZODIAC_SIGNS } from '@/lib/zodiac';
import type { ZodiacSign } from '@/lib/zodiac';
import type { SignCompatContent, SignCompatReport } from './types';

/** Orden canónico: el signo que va antes en la rueda del zodiaco es sign_a. */
function canonical(a: ZodiacSign, b: ZodiacSign): [ZodiacSign, ZodiacSign] {
  const ia = ZODIAC_SIGNS.indexOf(a);
  const ib = ZODIAC_SIGNS.indexOf(b);
  return ia <= ib ? [a, b] : [b, a];
}

/** Lee la compatibilidad estática entre dos signos (contenido fijo de la BBDD). */
export async function fetchSignCompatibility(
  a: ZodiacSign,
  b: ZodiacSign,
): Promise<SignCompatReport | null> {
  const [signA, signB] = canonical(a, b);
  const { data, error } = await supabase
    .from('sign_compatibility')
    .select('sign_a, sign_b, score, content')
    .eq('sign_a', signA)
    .eq('sign_b', signB)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    sign_a: data.sign_a as ZodiacSign,
    sign_b: data.sign_b as ZodiacSign,
    score: data.score,
    content: data.content as unknown as SignCompatContent,
  };
}
