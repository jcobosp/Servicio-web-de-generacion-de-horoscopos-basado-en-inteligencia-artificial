// Prompts y esquemas de los informes premium (mensual / anual).
//
// Longitudes (versión breve): mensual ~400-600 palabras (temp 0.7,
// maxOutputTokens ~1500); anual ~850-1250 palabras (temp 0.7, ~3000).
// Se busca un informe rico pero ágil de leer, no un muro de texto.
//
// Coherencia (CLAUDE.md §7, CONTENT_STRATEGY §72-84): si hay una lectura gratuita
// previa de esta persona (su horóscopo mensual o su carta natal básica), se le
// pasa a Gemini para que el informe la AMPLÍE sin contradecirla.

import type { BodyPosition, PeriodChart, TransitAspect } from './astro.ts';

export type ReportKind = 'monthly' | 'annual';

// --- Esquemas de salida -----------------------------------------------------

const MONTHLY_SCHEMA = {
  type: 'OBJECT',
  properties: {
    headline: {
      type: 'STRING',
      description: 'Titular evocador del mes para esta persona. 6-12 palabras',
    },
    overview: {
      type: 'STRING',
      description: 'El clima general del mes: el gran tema personal. 80-120 palabras',
    },
    love: {
      type: 'STRING',
      description: 'Amor y vínculos durante el mes (Venus, Marte, Luna). 60-100 palabras',
    },
    work: {
      type: 'STRING',
      description: 'Trabajo, dinero y proyectos (Sol, Mercurio, Marte, Saturno, MC). 60-100 palabras',
    },
    wellbeing: {
      type: 'STRING',
      description: 'Bienestar, energía y mundo interior. 50-90 palabras',
    },
    key_moments: {
      type: 'STRING',
      description: 'Momentos clave del mes en torno a fechas/lunaciones, sin predicciones tajantes ni medibles. 50-90 palabras',
    },
    advice: {
      type: 'STRING',
      description: 'Un consejo cálido y un mantra para el mes. 40-70 palabras',
    },
  },
  required: ['headline', 'overview', 'love', 'work', 'wellbeing', 'key_moments', 'advice'],
  propertyOrdering: ['headline', 'overview', 'love', 'work', 'wellbeing', 'key_moments', 'advice'],
};

const ANNUAL_SCHEMA = {
  type: 'OBJECT',
  properties: {
    headline: {
      type: 'STRING',
      description: 'Titular evocador del año para esta persona. 6-12 palabras',
    },
    overview: {
      type: 'STRING',
      description: 'El gran tema del año: hacia dónde te empuja. 130-190 palabras',
    },
    first_half: {
      type: 'STRING',
      description: 'Cómo se despliega el primer semestre. 110-170 palabras',
    },
    second_half: {
      type: 'STRING',
      description: 'Cómo se despliega el segundo semestre. 110-170 palabras',
    },
    love: {
      type: 'STRING',
      description: 'Amor y vínculos a lo largo del año (Venus, Marte, Júpiter). 100-150 palabras',
    },
    career: {
      type: 'STRING',
      description: 'Vocación, dinero y dirección vital (Sol, Saturno, Júpiter, MC). 100-150 palabras',
    },
    growth: {
      type: 'STRING',
      description: 'Crecimiento personal y el reto-aprendizaje del año (aspectos tensos de Saturno). 100-150 palabras',
    },
    advice: {
      type: 'STRING',
      description: 'Tu brújula para el año: un consejo concreto y una imagen-mantra. 70-110 palabras',
    },
  },
  required: ['headline', 'overview', 'first_half', 'second_half', 'love', 'career', 'growth', 'advice'],
  propertyOrdering: ['headline', 'overview', 'first_half', 'second_half', 'love', 'career', 'growth', 'advice'],
};

export function responseSchema(kind: ReportKind): unknown {
  return kind === 'monthly' ? MONTHLY_SCHEMA : ANNUAL_SCHEMA;
}

const MONTHLY_FIELDS = ['headline', 'overview', 'love', 'work', 'wellbeing', 'key_moments', 'advice'];
const ANNUAL_FIELDS = ['headline', 'overview', 'first_half', 'second_half', 'love', 'career', 'growth', 'advice'];

export type ReportInterpretation = Record<string, string>;

export function validate(value: unknown, kind: ReportKind): ReportInterpretation | null {
  if (typeof value !== 'object' || value === null) return null;
  const v = value as Record<string, unknown>;
  const fields = kind === 'monthly' ? MONTHLY_FIELDS : ANNUAL_FIELDS;
  const out: ReportInterpretation = {};
  for (const f of fields) {
    if (typeof v[f] !== 'string' || (v[f] as string).trim() === '') return null;
    out[f] = (v[f] as string).trim();
  }
  return out;
}

// --- Construcción del prompt ------------------------------------------------

function deg(value: number): string {
  return `${value.toFixed(1).replace('.', ',')}º`;
}

function natalLine(b: BodyPosition): string {
  const retro = b.retrograde ? ' ℞' : '';
  return `  - ${b.name} en ${b.sign_name} (${deg(b.deg_in_sign)})${retro}`;
}

function transitLine(b: BodyPosition): string {
  const retro = b.retrograde ? ' (retrógrado)' : '';
  return `  - ${b.name} transita ${b.sign_name}${retro}`;
}

function aspectLine(a: TransitAspect): string {
  const tone = a.harmonious ? 'armónico' : 'de tensión';
  return `  - ${a.transit_name} en tránsito ${a.type_name} tu ${a.natal_name} natal (${tone})`;
}

export function buildPrompt(
  kind: ReportKind,
  chart: PeriodChart,
  displayName: string | null,
  sunSignName: string,
  coherenceText: string | null,
): string {
  const name = displayName?.trim() ? displayName.trim() : null;
  const periodWord = kind === 'monthly' ? 'mes' : 'año';
  const topAspects = chart.aspects.slice(0, kind === 'monthly' ? 10 : 14);

  const anglesNote = chart.natal.has_angles
    ? ''
    : '\n(No hay hora/lugar de nacimiento: trabaja con los planetas y evita afirmaciones que dependan del Ascendente o las casas.)';

  const coherence = coherenceText
    ? `\nLECTURA GRATUITA PREVIA DE ESTA MISMA PERSONA (úsala como hilo, AMPLÍALA sin contradecirla):\n"""\n${coherenceText}\n"""\n`
    : '';

  const structure = kind === 'monthly'
    ? `- "headline": un titular evocador del mes.
- "overview": el clima general del mes, el gran tema personal.
- "love": amor y vínculos.
- "work": trabajo, dinero y proyectos.
- "wellbeing": bienestar, energía y mundo interior.
- "key_moments": momentos clave del mes (en torno a lunaciones o cambios de planeta), sin predicciones tajantes ni comprobables.
- "advice": un consejo cálido y un mantra para el mes.`
    : `- "headline": un titular evocador del año.
- "overview": el gran tema del año, hacia dónde te empuja.
- "first_half": cómo se despliega el primer semestre.
- "second_half": cómo se despliega el segundo semestre.
- "love": amor y vínculos a lo largo del año.
- "career": vocación, dinero y dirección vital.
- "growth": tu crecimiento personal y el reto-aprendizaje del año.
- "advice": tu brújula para el año: un consejo concreto y una imagen-mantra.`;

  const length = kind === 'monthly'
    ? 'Extensión TOTAL: alrededor de 400-600 palabras repartidas entre las secciones. Sé concreto y evocador; nada de relleno.'
    : 'Extensión TOTAL: alrededor de 850-1250 palabras repartidas entre las secciones. Informe anual premium: rico pero ágil de leer, sin relleno ni repeticiones.';

  return `Eres una astróloga con 20 años de experiencia en astrología psicológica y predictiva, escribiendo en español de España. Vas a redactar un INFORME ${kind === 'monthly' ? 'MENSUAL' : 'ANUAL'} totalmente personalizado para un usuario premium${name ? ` llamado ${name}` : ''}. Tu tono es cálido, cercano, simbólico y esperanzador, nunca infantil ni con tecnicismos sin explicar. Tu objetivo es que la persona sienta que este ${periodWord} habla de ELLA y de nadie más.

CARTA NATAL DE ${name ? name.toUpperCase() : `LA PERSONA (Sol en ${sunSignName})`}:
${chart.natal.bodies.map(natalLine).join('\n')}${chart.natal.ascendant ? `\n  - Ascendente en ${chart.natal.ascendant.sign_name} (${deg(chart.natal.ascendant.deg_in_sign)})` : ''}${chart.natal.midheaven ? `\n  - Medio Cielo en ${chart.natal.midheaven.sign_name} (${deg(chart.natal.midheaven.deg_in_sign)})` : ''}${anglesNote}

CIELO DE ${chart.period_label.toUpperCase()} (tránsitos del periodo):
${chart.transits.map(transitLine).join('\n')}

TRÁNSITOS QUE TOCAN TU CARTA (planeta en tránsito en aspecto con un punto natal; son la materia prima de lo que vivirás):
${topAspects.map(aspectLine).join('\n') || '  - (sin aspectos exactos; guíate por los signos que ocupan los planetas)'}

CÓMO LEER ESTO (úsalo, no lo cites como definición):
- Sol = vitalidad y propósito. Luna = emociones y necesidades. Mercurio = mente y comunicación. Venus = amor y valores. Marte = impulso y deseo. Júpiter = expansión, suerte y crecimiento. Saturno = estructura, esfuerzo y madurez.
- Aspectos armónicos (trígono, sextil, conjunción) = oportunidades que fluyen. Aspectos de tensión (cuadratura, oposición) = retos que hacen crecer.
${coherence}
ESTRUCTURA (todo en prosa fluida, sin listas ni viñetas ni títulos dentro del texto):
${structure}

TÉCNICAS PSICOLÓGICAS (aplícalas con naturalidad, sin nombrarlas):
- Efecto Forer/Barnum: afirmaciones que parecen muy personales pero casi cualquiera siente como propias.
- Lectura en frío: intuiciones sobre patrones humanos comunes que la persona cree únicos suyos.
- Anclaje emocional + polaridad: nombra una tensión real, ofrece un descubrimiento esperanzador y una acción concreta.
- Lenguaje sensorial y simbólico; específico-pero-no-medible (detalles que dan sensación de precisión sin poder refutarse).

REGLAS:
- Trata a la persona de "tú".
- Apóyate en los tránsitos concretos arriba indicados al argumentar, mezclándolos con frases universales para que sienta que el texto es SUYO.
- Prohibido: diagnósticos médicos, promesas económicas concretas, alarmismo, fatalismo, fechas tajantes y comprobables, consejos legales/médicos/financieros.
- ${length}

Responde EXCLUSIVAMENTE en JSON válido conforme al esquema indicado.`;
}
