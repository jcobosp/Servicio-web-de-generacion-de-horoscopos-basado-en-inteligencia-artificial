// Prompt y esquema de salida de la carta natal COMPLETA (premium).
//
// Estructura (CONTENT_STRATEGY §8): 6 bloques en prosa + síntesis.
// Longitud objetivo: 1200-1800 palabras en total. Temperature 0.7.
// Coherencia (CLAUDE.md §7, CONTENT_STRATEGY §80-84): si el usuario ya tiene
// carta básica gratuita, su texto se le pasa a Gemini para que la completa lo
// AMPLÍE sin contradecirlo, manteniendo el mismo hilo emocional.

import type { Aspect, FullChart, PlanetPosition } from './astro.ts';

export const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    identity: {
      type: 'STRING',
      description:
        'Identidad esencial: Sol + Ascendente + Luna integrados como UNA persona coherente, no tres retratos sueltos. 200-300 palabras',
    },
    emotional: {
      type: 'STRING',
      description: 'Vida emocional: Luna, Casa 4 y aspectos al Sol/Luna. 180-280 palabras',
    },
    love: {
      type: 'STRING',
      description: 'Vínculos y vida amorosa: Venus, Marte, Casa 7 y Casa 5. 180-280 palabras',
    },
    vocation: {
      type: 'STRING',
      description: 'Vocación y propósito: Medio Cielo, Casa 10 y Sol. 180-280 palabras',
    },
    shadow: {
      type: 'STRING',
      description: 'Sombra y trabajo personal: los aspectos tensos relevantes (cuadraturas, oposiciones). 180-280 palabras',
    },
    year_ahead: {
      type: 'STRING',
      description: 'Recomendación cálida y concreta para los próximos 12 meses. 120-200 palabras',
    },
    summary: {
      type: 'STRING',
      description: 'Cierre breve que reúne todo en una frase-imagen memorable. 40-70 palabras',
    },
  },
  required: ['identity', 'emotional', 'love', 'vocation', 'shadow', 'year_ahead', 'summary'],
  propertyOrdering: ['identity', 'emotional', 'love', 'vocation', 'shadow', 'year_ahead', 'summary'],
};

export interface FullInterpretation {
  identity: string;
  emotional: string;
  love: string;
  vocation: string;
  shadow: string;
  year_ahead: string;
  summary: string;
}

function deg(value: number): string {
  return `${value.toFixed(1).replace('.', ',')}º`;
}

function planetLine(p: PlanetPosition): string {
  const retro = p.retrograde ? ' ℞ (retrógrado)' : '';
  return `- ${p.name} en ${p.sign_name} (${deg(p.deg_in_sign)}), Casa ${p.house}${retro}`;
}

function aspectLine(a: Aspect): string {
  return `- ${a.a_name} ${a.type_name} ${a.b_name} (orbe ${deg(a.orb)})`;
}

export function buildPrompt(
  chart: FullChart,
  displayName: string | null,
  basicText: string | null,
): string {
  const name = displayName?.trim() ? displayName.trim() : null;
  const sun = chart.planets.find((p) => p.body === 'sun')!;
  const moon = chart.planets.find((p) => p.body === 'moon')!;

  // Solo los aspectos más relevantes (orbe ya ordenado de menor a mayor).
  const topAspects = chart.aspects.slice(0, 14);

  const coherence = basicText
    ? `\nLECTURA GRATUITA PREVIA DE ESTA MISMA PERSONA (su carta básica de Sol, Luna y Ascendente):\n"""\n${basicText}\n"""\nEsta carta completa AMPLÍA y PROFUNDIZA esa lectura. Mantén el mismo hilo emocional y simbólico, no contradigas nada de lo dicho; ve más hondo y conecta los puntos que allí solo se insinuaban.\n`
    : '';

  return `Eres una astróloga con 20 años de experiencia, especializada en cartas natales psicológicas, escribiendo en español de España. Vas a interpretar la carta natal COMPLETA de un usuario premium. Tu tono es cálido, cercano, simbólico y profundo, nunca infantil ni con tecnicismos sin explicar. Tu objetivo es que ${name ?? 'la persona'} se sienta PROFUNDAMENTE vista, comprendida y acompañada.

DATOS NATALES${name ? ` DE ${name.toUpperCase()}` : ''}:
- Ascendente en ${chart.ascendant.sign_name} (${deg(chart.ascendant.deg_in_sign)})
- Medio Cielo (MC) en ${chart.midheaven.sign_name} (${deg(chart.midheaven.deg_in_sign)})
- Sol en ${sun.sign_name}, Casa ${sun.house} · Luna en ${moon.sign_name}, Casa ${moon.house}

POSICIONES PLANETARIAS:
${chart.planets.map(planetLine).join('\n')}

CASAS (sistema de signos enteros, la Casa 1 es el signo del Ascendente):
${chart.houses.map((h) => `- Casa ${h.house}: ${h.sign_name}`).join('\n')}

ASPECTOS PRINCIPALES (los más exactos):
${topAspects.map(aspectLine).join('\n')}
${coherence}
ESTRUCTURA OBLIGATORIA (todo en prosa fluida, sin listas ni viñetas, sin títulos dentro del texto):
- "identity": identidad esencial integrando Sol + Ascendente + Luna como UNA persona.
- "emotional": vida emocional (Luna, Casa 4 y los aspectos a la Luna y al Sol).
- "love": vínculos y vida amorosa (Venus, Marte, Casa 7 y Casa 5).
- "vocation": vocación y propósito (Medio Cielo, Casa 10 y Sol).
- "shadow": la sombra y el trabajo personal (a partir de los aspectos tensos: cuadraturas y oposiciones).
- "year_ahead": una recomendación cálida y concreta para los próximos 12 meses.
- "summary": un cierre breve que lo reúna todo en una frase-imagen memorable.

TÉCNICAS PSICOLÓGICAS (aplícalas con naturalidad, sin nombrarlas):
- Efecto Forer/Barnum: afirmaciones que parecen muy personales pero casi cualquiera siente como propias.
- Lectura en frío: intuiciones sobre patrones humanos comunes que el lector cree únicos suyos.
- Anclaje emocional + polaridad: nombra una tensión real, ofrece un descubrimiento esperanzador y una acción concreta.
- Lenguaje sensorial y simbólico: verbos físicos y los símbolos de los signos, planetas y elementos.
- Específico-pero-no-medible: detalles que dan sensación de precisión sin poder refutarse.

REGLAS:
- Trata a la persona de "tú".
- NEUTRALIDAD DE GÉNERO (obligatorio): NO conoces el género de la persona, así que NO lo asumas en ningún momento. Evita vocativos y adjetivos con marca de género ("querida"/"querido", "bienvenida", "preparada", "sensible y atenta"...): usa fórmulas neutras (p. ej. "te doy la bienvenida", "tu sensibilidad", "alguien atento a los detalles") o reformula la frase. El texto debe sonar natural y valer EXACTAMENTE igual para cualquier persona.
- Combina datos concretos de su carta (signos, casas, planetas, aspectos) con frases universales, para que sienta que el texto es SUYO y de nadie más.
- Usa de verdad los datos: cita planetas, casas y aspectos concretos al argumentar.
- Prohibido: diagnósticos médicos, promesas económicas concretas, alarmismo, fatalismo, consejos legales/médicos/financieros.
- Extensión TOTAL: 1200-1800 palabras repartidas entre las secciones. Es una lectura premium: rica y generosa, pero sin relleno.

Responde EXCLUSIVAMENTE en JSON válido conforme al esquema indicado.`;
}

export function validate(value: unknown): FullInterpretation | null {
  if (typeof value !== 'object' || value === null) return null;
  const v = value as Record<string, unknown>;
  const fields = ['identity', 'emotional', 'love', 'vocation', 'shadow', 'year_ahead', 'summary'];
  for (const f of fields) {
    if (typeof v[f] !== 'string' || (v[f] as string).trim() === '') return null;
  }
  return {
    identity: (v.identity as string).trim(),
    emotional: (v.emotional as string).trim(),
    love: (v.love as string).trim(),
    vocation: (v.vocation as string).trim(),
    shadow: (v.shadow as string).trim(),
    year_ahead: (v.year_ahead as string).trim(),
    summary: (v.summary as string).trim(),
  };
}
