// Prompts, esquema de salida y configuración de longitud por scope.
// Basado en docs/CONTENT_STRATEGY.md (secciones 3, 6 y 7).

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
  general: 'general (visión global del día)',
  love: 'amor y relaciones',
  health: 'salud y bienestar',
  money: 'dinero y finanzas',
  work: 'trabajo y proyectos',
};

/** Longitud objetivo y techo de tokens por scope (tabla de CONTENT_STRATEGY §3). */
export const LENGTHS: Record<
  Scope,
  { minWords: number; maxWords: number; maxOutputTokens: number; label: string }
> = {
  // maxOutputTokens con margen amplio: el texto va en JSON (claves, comillas) y
  // el español gasta ~1.5 tokens/palabra. Sin "thinking" el coste real lo marca
  // el contenido generado, no este techo.
  daily: { minWords: 90, maxWords: 130, maxOutputTokens: 600, label: 'de hoy' },
  weekly: { minWords: 180, maxWords: 240, maxOutputTokens: 900, label: 'de esta semana' },
  monthly: { minWords: 320, maxWords: 420, maxOutputTokens: 1400, label: 'de este mes' },
};

export const TEMPERATURE = 0.85;

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
}

/** Construye el prompt del horóscopo según scope y área (CONTENT_STRATEGY §7). */
export function buildHoroscopePrompt(input: PromptInput): string {
  const { scope, area, signName, date, weekday, reinforce } = input;
  const len = LENGTHS[scope];
  const needsDisclaimer = area === 'health' || area === 'money';

  const periodLine =
    scope === 'daily'
      ? `- Fecha: ${date} (día de la semana: ${weekday})`
      : scope === 'weekly'
        ? `- Semana que comienza el ${date}`
        : `- Mes que comienza el ${date}`;

  const reinforceLine = reinforce
    ? '\nIMPORTANTE: tu respuesta anterior no cumplió el formato o la extensión. ' +
      'Devuelve EXCLUSIVAMENTE JSON válido y respeta el número de palabras del cuerpo.'
    : '';

  return `Eres un astrólogo experimentado que escribe horóscopos contemporáneos en español de España, con un tono cálido, cercano y simbólico. Tu objetivo es que el lector se sienta visto y comprendido, sin caer en banalidad ni en lenguaje arcaico.

CONTEXTO DEL LECTOR:
- Signo solar: ${signName}
${periodLine}
- Área de la vida: ${AREA_ES[area]}
- Horóscopo ${len.label}.

INSTRUCCIONES DE ESTILO:
- Trata al lector de "tú".
- Usa frases que la mayoría de la gente pueda sentir como propias (universales pero personales en la forma): aplica validación subjetiva (efecto Forer) y lectura en frío con naturalidad.
- Combina en el cuerpo: un reto o tensión del momento + un descubrimiento positivo + una acción concreta y mínima.
- Mete símbolos sutiles del signo ${signName} y de su elemento.
- Usa lenguaje sensorial (verbos físicos, elementos naturales).
- Evita predicciones literales y comprobables (nada de "el martes te llamará tu jefe").
- NUNCA diagnostiques enfermedades, prometas resultados económicos concretos, hables de la muerte de forma alarmista ni des consejos médicos, legales o financieros.
- Extensión del cuerpo: alrededor de ${len.minWords}-${len.maxWords} palabras. Ni mucho menos ni mucho más.
- "premium_hook": una frase que sugiera que hay una capa más profunda para quien quiera ir más allá (la verá un usuario que se plantea suscribirse a premium).
${needsDisclaimer
  ? '- Rellena "disclaimer" con: "Contenido astrológico de entretenimiento; no sustituye asesoramiento profesional."'
  : '- Deja "disclaimer" como cadena vacía.'}${reinforceLine}

Responde EXCLUSIVAMENTE en JSON válido conforme al esquema indicado.`;
}
