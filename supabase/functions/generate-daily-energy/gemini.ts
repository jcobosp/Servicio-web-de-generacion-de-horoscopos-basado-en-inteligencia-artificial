// Cliente de Gemini 2.5 Flash (idéntico al de generate-horoscope). La API key
// vive en el secreto GEMINI_API_KEY. Reintenta una vez ante 429/5xx.

const ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export interface GeminiConfig {
  temperature: number;
  maxOutputTokens: number;
  responseSchema: unknown;
}

export interface GeminiResult {
  text: string;
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

    if ((res.status === 429 || res.status >= 500) && attempt === 0) {
      await sleep(2000);
      continue;
    }

    const errText = await res.text().catch(() => '');
    throw new Error(`Gemini respondió ${res.status}: ${errText.slice(0, 300)}`);
  }

  throw new Error('Gemini no respondió tras el reintento');
}
