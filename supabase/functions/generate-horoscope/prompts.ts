// Prompts, esquema de salida y configuración de longitud por scope.
// Basado en docs/CONTENT_STRATEGY.md (secciones 2, 3, 6 y 7).

export type Scope = 'daily' | 'weekly' | 'monthly';
export type Area = 'general' | 'love' | 'health' | 'money' | 'work';
export type SunSign =
  | 'aries' | 'tauro' | 'geminis' | 'cancer' | 'leo' | 'virgo'
  | 'libra' | 'escorpio' | 'sagitario' | 'capricornio' | 'acuario' | 'piscis';

/** Nombre del signo para el prompt (con tildes). */
export const SIGN_NAMES: Record<SunSign, string> = {
  aries: 'Aries', tauro: 'Tauro', geminis: 'Géminis', cancer: 'Cáncer',
  leo: 'Leo', virgo: 'Virgo', libra: 'Libra', escorpio: 'Escorpio',
  sagitario: 'Sagitario', capricornio: 'Capricornio', acuario: 'Acuario',
  piscis: 'Piscis',
};

/** Área en español para el prompt. */
export const AREA_ES: Record<Area, string> = {
  general: 'general (visión global)',
  love: 'amor y relaciones',
  health: 'salud y bienestar',
  money: 'dinero y finanzas',
  work: 'trabajo y proyectos',
};

/** Longitud objetivo y techo de tokens por scope (tabla de CONTENT_STRATEGY §3). */
export const LENGTHS: Record<
  Scope,
  { minWords: number; maxWords: number; maxOutputTokens: number; label: string; period: string }
> = {
  daily: { minWords: 90, maxWords: 130, maxOutputTokens: 600, label: 'de hoy', period: 'el día de hoy' },
  weekly: { minWords: 180, maxWords: 240, maxOutputTokens: 900, label: 'de esta semana', period: 'esta semana' },
  monthly: { minWords: 320, maxWords: 420, maxOutputTokens: 1400, label: 'de este mes', period: 'este mes' },
};

export const TEMPERATURE = 0.9;

/**
 * Esquema de salida estructurada (Gemini `responseSchema`). Usa la nomenclatura
 * de tipos en mayúsculas del subconjunto OpenAPI que acepta la API.
 */
export const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    headline: { type: 'STRING', description: 'Titular evocador, 6-10 palabras' },
    body: { type: 'STRING', description: 'Texto principal del horóscopo' },
    lucky_number: { type: 'INTEGER', description: 'Número de la suerte, 1-99' },
    lucky_color: { type: 'STRING', description: 'Color en español' },
    mood_emoji: { type: 'STRING', description: 'Un único emoji' },
    keyword: { type: 'STRING', description: 'Palabra clave, 1-2 palabras' },
    premium_hook: {
      type: 'STRING',
      description: 'Frase que insinúa qué profundiza premium, 12-18 palabras',
    },
    disclaimer: {
      type: 'STRING',
      description: 'Aviso de entretenimiento (solo salud/dinero; vacío si no aplica)',
    },
  },
  required: [
    'headline', 'body', 'lucky_number', 'lucky_color',
    'mood_emoji', 'keyword', 'premium_hook',
  ],
  propertyOrdering: [
    'headline', 'body', 'lucky_number', 'lucky_color',
    'mood_emoji', 'keyword', 'premium_hook', 'disclaimer',
  ],
} as const;

interface PromptInput {
  scope: Scope;
  area: Area;
  signName: string;
  /** Fecha de referencia ISO (período). */
  date: string;
  /** Día de la semana en español (solo relevante para daily). */
  weekday: string;
  /** Si true, refuerza las instrucciones tras un primer intento inválido. */
  reinforce?: boolean;
  /** Lectura del periodo anterior (mismo signo/scope/área) para no repetir. */
  previous?: { headline: string; body: string };
}

/** Construye el prompt del horóscopo según scope y área (CONTENT_STRATEGY §2 y §7). */
export function buildHoroscopePrompt(input: PromptInput): string {
  const { scope, area, signName, date, weekday, reinforce, previous } = input;
  const len = LENGTHS[scope];
  const needsDisclaimer = area === 'health' || area === 'money';

  const periodLine =
    scope === 'daily'
      ? `- Fecha: ${date} (día de la semana: ${weekday})`
      : scope === 'weekly'
        ? `- Semana que comienza el ${date}`
        : `- Mes que comienza el ${date}`;

  const avoid = previous
    ? `\nLECTURA DEL PERIODO ANTERIOR para ${signName} en ${AREA_ES[area]}. NO la repitas: cambia el enfoque, las imágenes, el consejo y el tono. Que se note que es una lectura nueva.\n- Titular anterior: "${previous.headline}"\n- Cuerpo anterior: "${previous.body}"\n`
    : '';

  const reinforceLine = reinforce
    ? '\nIMPORTANTE: tu respuesta anterior no cumplió el formato o la extensión. ' +
      'Devuelve EXCLUSIVAMENTE JSON válido y respeta el número de palabras del cuerpo.'
    : '';

  return `Eres un astrólogo que escribe horóscopos contemporáneos en español de España. Tu objetivo es que ${signName} se sienta VISTO y comprendido al leerte, y que le ENGANCHE emocionalmente, sin caer en banalidad ni en lenguaje arcaico.

CONTEXTO DEL LECTOR:
- Signo solar: ${signName}
${periodLine}
- Área de la vida: ${AREA_ES[area]}
- Horóscopo ${len.label}.

TÉCNICAS PSICOLÓGICAS (aplícalas con naturalidad, sin nombrarlas nunca):
- Efecto Forer/Barnum: afirmaciones que parecen muy personales pero casi cualquiera siente como propias ("últimamente cargas con más de lo que muestras").
- Lectura en frío: intuiciones sobre patrones humanos comunes que el lector cree únicos suyos.
- Anclaje emocional: nombra una emoción que muchos sienten en ${len.period} (ilusión, cansancio, esperanza, inquietud) y dale un marco que reconforte.
- Polaridad equilibrada: un reto o tensión + un descubrimiento esperanzador + una acción pequeña y concreta.
- Lenguaje sensorial y simbólico: verbos físicos (respira, suelta, abre) y símbolos del signo ${signName} y su elemento.
- Específico-pero-no-medible: "una conversación reciente", "alguien cercano", sin predicciones comprobables.

REGLAS:
- Trata al lector de "tú". Tono cálido, cercano, emocionalmente evocador.
- Prohibido: predicciones literales comprobables, diagnósticos médicos, promesas económicas concretas, alarmismo, consejos legales/médicos/financieros.
- Extensión del cuerpo: alrededor de ${len.minWords}-${len.maxWords} palabras. Ni mucho menos ni mucho más.
- "premium_hook": una frase que sugiera que hay una capa más profunda para quien quiera ir más allá (la verá quien se plantea suscribirse a premium).
${needsDisclaimer
  ? '- Rellena "disclaimer" con: "Contenido astrológico de entretenimiento; no sustituye asesoramiento profesional."'
  : '- Deja "disclaimer" como cadena vacía.'}${avoid}${reinforceLine}

Responde EXCLUSIVAMENTE en JSON válido conforme al esquema indicado.`;
}
