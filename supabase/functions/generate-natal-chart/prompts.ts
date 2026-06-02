// Prompt y esquema de salida de la carta natal básica (Sol + Luna + Ascendente).
//
// Longitud objetivo (CONTENT_STRATEGY §3): 250-350 palabras en total, repartidas
// entre las secciones. Aplica las técnicas psicológicas del proyecto.

import type { NatalPositions } from './astro.ts';

export const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    intro: {
      type: 'STRING',
      description:
        'Identidad esencial integrando Sol, Luna y Ascendente como UNA persona (no tres retratos sueltos), 55-75 palabras',
    },
    sun: { type: 'STRING', description: 'Qué aporta el Sol (esencia, propósito), 45-65 palabras' },
    moon: { type: 'STRING', description: 'Qué aporta la Luna (mundo emocional, necesidades), 45-65 palabras' },
    ascendant: {
      type: 'STRING',
      description:
        'Qué aporta el Ascendente (cómo te muestras, primera impresión); si no se conoce, explica con calidez que necesita la hora y el lugar de nacimiento y qué revelaría. 45-65 palabras',
    },
    synthesis: { type: 'STRING', description: 'Cierre que une los tres + una invitación pequeña y concreta, 35-55 palabras' },
    premium_hook: { type: 'STRING', description: 'Gancho premium, 12-18 palabras' },
  },
  required: ['intro', 'sun', 'moon', 'ascendant', 'synthesis', 'premium_hook'],
  propertyOrdering: ['intro', 'sun', 'moon', 'ascendant', 'synthesis', 'premium_hook'],
};

export interface Interpretation {
  intro: string;
  sun: string;
  moon: string;
  ascendant: string;
  synthesis: string;
  premium_hook: string;
}

function deg(value: number): string {
  return `${value.toFixed(1).replace('.', ',')}º`;
}

export function buildPrompt(pos: NatalPositions, displayName: string | null): string {
  const name = displayName?.trim() ? displayName.trim() : null;
  const hasAsc = pos.ascendant !== null;

  const ascLine = hasAsc
    ? `- Ascendente en ${pos.ascendant!.sign_name} (${deg(pos.ascendant!.deg_in_sign)} del signo)`
    : '- Ascendente: NO disponible (la persona no ha indicado su hora y lugar de nacimiento).';

  const moonNote = pos.moon_approximate
    ? ' (calculada sin hora exacta: la Luna puede variar si nació muy cerca del cambio de signo; menciónalo con suavidad solo si encaja)'
    : '';

  const ascInstruction = hasAsc
    ? `- "ascendant": interpreta el Ascendente en ${pos.ascendant!.sign_name}: cómo se muestra ante el mundo, su primera impresión, la "máscara" con la que se presenta.`
    : `- "ascendant": NO inventes un signo de Ascendente. Explica con calidez que el Ascendente revela cómo te muestras ante los demás y que, para calcularlo, hace falta la hora y el lugar exactos de nacimiento. Invita a añadirlos para completar el retrato. NO menciones ningún signo concreto aquí.`;

  return `Eres una astróloga con años de experiencia escribiendo cartas natales psicológicas en español de España. Tu tono es cálido, cercano, simbólico y profundo, nunca infantil ni con tecnicismos sin explicar. Tu objetivo es que ${name ?? 'la persona'} se sienta PROFUNDAMENTE vista y comprendida al leerse.

DATOS NATALES${name ? ` DE ${name.toUpperCase()}` : ''}:
- Sol en ${pos.sun.sign_name} (${deg(pos.sun.deg_in_sign)} del signo)
- Luna en ${pos.moon.sign_name} (${deg(pos.moon.deg_in_sign)} del signo)${moonNote}
${ascLine}

QUÉ SIMBOLIZA CADA PIEZA (úsalo, no lo cites literalmente):
- El Sol = esencia, identidad, propósito vital, lo que vino a brillar.
- La Luna = mundo emocional, necesidades íntimas, cómo se cuida y se siente seguro.
- El Ascendente = la primera impresión, cómo se presenta y aborda la vida.

TÉCNICAS PSICOLÓGICAS (aplícalas con naturalidad, sin nombrarlas):
- Efecto Forer/Barnum: afirmaciones que parecen muy personales pero casi cualquiera siente como propias ("por dentro eres más sensible de lo que dejas ver").
- Lectura en frío: intuiciones sobre patrones humanos comunes que el lector cree únicos suyos.
- Anclaje emocional + polaridad: nombra una tensión real + un descubrimiento esperanzador + una acción pequeña y concreta.
- Lenguaje sensorial y simbólico: verbos físicos (respira, suelta, abre) y símbolos de los signos y sus elementos.
- Específico-pero-no-medible: detalles que dan sensación de precisión sin poder refutarse.

REGLAS:
- Trata a la persona de "tú".
- NEUTRALIDAD DE GÉNERO (obligatorio): NO conoces el género de la persona, así que NO lo asumas en ningún momento. Evita vocativos y adjetivos con marca de género ("querida"/"querido", "bienvenida", "preparada", "sensible y atenta"...): usa fórmulas neutras (p. ej. "te doy la bienvenida", "tu sensibilidad", "alguien atento a los detalles") o reformula la frase. El texto debe sonar natural y valer EXACTAMENTE igual para cualquier persona.
- "intro": integra Sol + Luna + Ascendente como UNA sola persona coherente, no tres descripciones separadas.
- "sun": interpreta el Sol en ${pos.sun.sign_name}.
- "moon": interpreta la Luna en ${pos.moon.sign_name}.
${ascInstruction}
- "synthesis": cierra uniendo los tres y deja una invitación mínima y concreta.
- "premium_hook": insinúa que la carta completa (10 planetas, 12 casas y sus aspectos) explica el "porqué" de sus relaciones, su vocación y sus bloqueos.
- Prohibido: diagnósticos médicos, promesas económicas concretas, alarmismo, fatalismo, consejos legales/médicos/financieros.
- Extensión TOTAL: alrededor de 250-350 palabras repartidas entre las secciones. Ni muy corto ni un muro de texto.

Responde EXCLUSIVAMENTE en JSON válido conforme al esquema indicado.`;
}

export function validate(value: unknown): Interpretation | null {
  if (typeof value !== 'object' || value === null) return null;
  const v = value as Record<string, unknown>;
  const fields = ['intro', 'sun', 'moon', 'ascendant', 'synthesis', 'premium_hook'];
  for (const f of fields) {
    if (typeof v[f] !== 'string' || (v[f] as string).trim() === '') return null;
  }
  return {
    intro: (v.intro as string).trim(),
    sun: (v.sun as string).trim(),
    moon: (v.moon as string).trim(),
    ascendant: (v.ascendant as string).trim(),
    synthesis: (v.synthesis as string).trim(),
    premium_hook: (v.premium_hook as string).trim(),
  };
}
