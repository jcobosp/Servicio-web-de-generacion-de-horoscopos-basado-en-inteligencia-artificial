// Cliente de Gemini 2.5 Flash. La API key vive en el secreto GEMINI_API_KEY
// (nunca en el cliente). Reintenta una vez ante 429/5xx con backoff de 2s
// (CONTENT_STRATEGY §9).

const ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export interface GeminiConfig {
  temperature: number;
  maxOutputTokens: number;
  responseSchema: unknown;
}

export interface GeminiResult {
  /** Texto JSON devuelto por el modelo. */
  text: string;
  /** Tokens de salida estimados (para métricas de coste). */
  outputTokens: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function callGemini(
  prompt: string,
  cfg: GeminiConfig,
): Promise<GeminiResult> {
  const key = Deno.env.get('GEMINI_API_KEY');
  if (!key) throw new Error('GEMINI_API_KEY no está configurada');

  const body = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: cfg.temperature,
      maxOutputTokens: cfg.maxOutputTokens,
      responseMimeType: 'application/json',
      responseSchema: cfg.responseSchema,
      // gemini-2.5-flash razona por defecto y esos tokens consumen el
      // presupuesto de salida, truncando el JSON. El contenido es corto y
      // estructurado: desactivamos el "thinking" para una salida fiable.
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(`${ENDPOINT}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (res.ok) {
      const data = await res.json();
      const text: string | undefined =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Respuesta de Gemini vacía');
      const outputTokens: number =
        data?.usageMetadata?.candidatesTokenCount ?? 0;
      return { text, outputTokens };
    }

    // Reintento único ante rate limit o error de servidor.
    if ((res.status === 429 || res.status >= 500) && attempt === 0) {
      await sleep(2000);
      continue;
    }

    const errText = await res.text().catch(() => '');
    throw new Error(`Gemini respondió ${res.status}: ${errText.slice(0, 300)}`);
  }

  throw new Error('Gemini no respondió tras el reintento');
}
