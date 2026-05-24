// Prompt y esquema para que Gemini escriba título + descripción de cada evento
// que `astro.ts` ya ha calculado con fechas y signos reales.

import type { AstroEventRaw } from './astro.ts';

const KIND_LABEL: Record<AstroEventRaw['kind'], string> = {
  new_moon: 'Luna nueva',
  full_moon: 'Luna llena',
  sun_ingress: 'El Sol entra en',
  mercury_ingress: 'Mercurio entra en',
  venus_ingress: 'Venus entra en',
  mars_ingress: 'Marte entra en',
};

export const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    events: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING', description: 'Título evocador, 4-8 palabras' },
          description: { type: 'STRING', description: 'Descripción emocional, 50-80 palabras' },
        },
        required: ['title', 'description'],
        propertyOrdering: ['title', 'description'],
      },
    },
  },
  required: ['events'],
  propertyOrdering: ['events'],
} as const;

function describe(ev: AstroEventRaw): string {
  const label = KIND_LABEL[ev.kind];
  if (ev.kind === 'new_moon' || ev.kind === 'full_moon') {
    return `${label} en ${ev.sign_name} el ${ev.event_date}`;
  }
  return `${label} ${ev.sign_name} el ${ev.event_date}`;
}

export function buildEventsPrompt(
  events: AstroEventRaw[],
  previousTitles: string[],
  reinforce: boolean,
): string {
  const list = events.map((e, i) => `${i + 1}. ${describe(e)}`).join('\n');
  const avoid = previousTitles.length
    ? `\nTÍTULOS DEL MES ANTERIOR (NO los repitas; cambia metáforas, verbos e imágenes):\n${previousTitles.map((t) => `- ${t}`).join('\n')}\n`
    : '';
  const reinforceLine = reinforce
    ? '\nIMPORTANTE: tu respuesta anterior no cumplió el formato. Devuelve EXCLUSIVAMENTE JSON válido con el array "events" del mismo número y orden que la lista.'
    : '';

  return `Eres un astrólogo que escribe en español de España con tono cálido, cercano y simbólico. Para cada evento astrológico del mes —cuya FECHA y SIGNO son hechos astronómicos que NO debes cambiar—, escribe un TÍTULO evocador (4-8 palabras) y una DESCRIPCIÓN (50-80 palabras) que el lector sienta como propia.

TÉCNICAS PSICOLÓGICAS (aplícalas con naturalidad, sin nombrarlas):
- Efecto Forer/Barnum: afirmaciones que parecen muy personales pero casi cualquiera siente como propias.
- Lectura en frío: intuiciones sobre patrones humanos comunes ("algo que llevas días pensando", "alguien cercano").
- Anclaje emocional: nombra una emoción que muchos viven en esos días y dale un marco.
- Polaridad equilibrada: una tensión + un descubrimiento + una acción pequeña y concreta.
- Lenguaje sensorial: verbos físicos (respira, suelta, abre) y símbolos del signo y su elemento.

REGLAS:
- Trata al lector de "tú".
- Prohibido: predicciones literales comprobables, alarmismo, consejos médicos/legales/financieros.
- El TÍTULO no debe ser solo "Luna llena en Tauro" — añade un matiz evocador (p.ej. "Luna llena en Tauro: lo que pide tu cuerpo").
- La DESCRIPCIÓN incorpora el signo y por qué importa esa energía esos días.

EVENTOS DEL MES (mantén EXACTAMENTE este orden y número de elementos):
${list}
${avoid}${reinforceLine}
Responde EXCLUSIVAMENTE en JSON válido conforme al esquema indicado.`;
}
