// Prompt y esquema de la compatibilidad / sinastría (premium).
//
// Longitud objetivo (CONTENT_STRATEGY §3): 900-1300 palabras. Temperature 0.75.
// El "score" lo calcula el backend (determinista); Gemini lo EXPLICA y alinea su
// tono con él, no lo inventa.

import type { PersonPlacements, SynastryAspect } from './astro.ts';

export const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    connection: {
      type: 'STRING',
      description: 'La conexión general entre las dos personas: qué se siente al estar juntas. 160-240 palabras',
    },
    emotional: {
      type: 'STRING',
      description: 'Vínculo emocional y comunicación (Luna y Mercurio de ambas). 150-220 palabras',
    },
    love: {
      type: 'STRING',
      description: 'Amor, atracción y pasión (Venus y Marte cruzados). 150-220 palabras',
    },
    friction: {
      type: 'STRING',
      description: 'Los roces y lo que conviene trabajar (aspectos tensos), con esperanza y sin alarmismo. 140-200 palabras',
    },
    longterm: {
      type: 'STRING',
      description: 'Potencial a largo plazo de la relación. 120-180 palabras',
    },
    advice: {
      type: 'STRING',
      description: 'Un consejo cálido y concreto para los dos. 80-140 palabras',
    },
  },
  required: ['connection', 'emotional', 'love', 'friction', 'longterm', 'advice'],
  propertyOrdering: ['connection', 'emotional', 'love', 'friction', 'longterm', 'advice'],
};

export interface CompatInterpretation {
  connection: string;
  emotional: string;
  love: string;
  friction: string;
  longterm: string;
  advice: string;
}

function placementsLines(p: PersonPlacements): string {
  const lines = [
    `  - Sol en ${p.sun.sign_name}`,
    `  - Luna en ${p.moon.sign_name}${p.moon_approximate ? ' (aprox., sin hora)' : ''}`,
    `  - Mercurio en ${p.mercury.sign_name}`,
    `  - Venus en ${p.venus.sign_name}`,
    `  - Marte en ${p.mars.sign_name}`,
  ];
  if (p.ascendant) lines.push(`  - Ascendente en ${p.ascendant.sign_name}`);
  return lines.join('\n');
}

function aspectLine(asp: SynastryAspect, labelA: string, labelB: string): string {
  const tone = asp.harmonious ? 'armónico' : 'de tensión';
  return `  - ${asp.a_name} de ${labelA} ${asp.type_name} ${asp.b_name} de ${labelB} (${tone})`;
}

export function buildPrompt(
  labelA: string,
  labelB: string,
  a: PersonPlacements,
  b: PersonPlacements,
  aspects: SynastryAspect[],
  score: number,
): string {
  const topAspects = aspects.slice(0, 12);
  return `Eres una astróloga con 20 años de experiencia en sinastría (compatibilidad de pareja), escribiendo en español de España. Tu tono es cálido, cercano, simbólico y honesto: ni puro halago ni alarmismo. Vas a interpretar la compatibilidad entre dos personas para un usuario premium.

PERSONAS:
- ${labelA}:
${placementsLines(a)}
- ${labelB}:
${placementsLines(b)}

AFINIDAD GLOBAL CALCULADA: ${score}/100. Alinea el tono general con esta cifra: un valor alto (80+) = mucha sintonía; uno medio (60-79) = atracción con matices a trabajar; uno bajo (menos de 60) = una relación con retos reales que pide esfuerzo, comprensión y aceptación mutua, pero sin dramatizar ni condenar la relación. NO cites la cifra como número en el texto; transmítela en el tono.

ASPECTOS DE SINASTRÍA (planeta de una persona en aspecto con el de la otra):
${topAspects.map((x) => aspectLine(x, labelA, labelB)).join('\n') || '  - (sin aspectos exactos; guíate por los signos y elementos)'}

QUÉ SIMBOLIZA CADA PIEZA (úsalo, no lo cites como definición):
- Sol = identidad y lo que cada uno aporta. Luna = mundo emocional y necesidades. Mercurio = comunicación. Venus = cómo ama y qué valora. Marte = deseo, pasión e impulso. Ascendente = la primera impresión.
- Aspectos armónicos (trígono, sextil, conjunción) = fluidez. Aspectos de tensión (cuadratura, oposición) = chispa y aprendizaje.

ESTRUCTURA (todo en prosa fluida, sin listas ni títulos dentro del texto):
- "connection": la conexión general, qué se siente al estar juntas.
- "emotional": vínculo emocional y comunicación (Lunas y Mercurios).
- "love": amor, atracción y pasión (Venus y Marte cruzados).
- "friction": los roces y lo que conviene trabajar, con esperanza.
- "longterm": el potencial a largo plazo.
- "advice": un consejo cálido y concreto para los dos.

TÉCNICAS PSICOLÓGICAS (aplícalas con naturalidad, sin nombrarlas):
- Efecto Forer/Barnum, lectura en frío, anclaje emocional + polaridad, lenguaje sensorial y simbólico, específico-pero-no-medible.
- Que el lector sienta que esta relación es ÚNICA y reconocible, no un genérico.

REGLAS:
- Refiérete a las personas por su nombre (${labelA} y ${labelB}).
- Combina datos concretos (signos, planetas, aspectos) con frases universales.
- Prohibido: predicciones tajantes de ruptura/boda, alarmismo, fatalismo, consejos médicos/legales/financieros.
- Extensión TOTAL: 900-1300 palabras repartidas entre las secciones.

Responde EXCLUSIVAMENTE en JSON válido conforme al esquema indicado.`;
}

export function validate(value: unknown): CompatInterpretation | null {
  if (typeof value !== 'object' || value === null) return null;
  const v = value as Record<string, unknown>;
  const fields = ['connection', 'emotional', 'love', 'friction', 'longterm', 'advice'];
  for (const f of fields) {
    if (typeof v[f] !== 'string' || (v[f] as string).trim() === '') return null;
  }
  return {
    connection: (v.connection as string).trim(),
    emotional: (v.emotional as string).trim(),
    love: (v.love as string).trim(),
    friction: (v.friction as string).trim(),
    longterm: (v.longterm as string).trim(),
    advice: (v.advice as string).trim(),
  };
}
