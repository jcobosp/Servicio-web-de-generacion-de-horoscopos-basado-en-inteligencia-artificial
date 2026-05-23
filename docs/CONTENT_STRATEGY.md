# CONTENT_STRATEGY.md — Estrategia de contenido IA (Gemini)

## 1. Modelo y configuración

- **Modelo:** `gemini-2.5-flash` (ya configurado en el Google Cloud del usuario con límites de tokens).
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`.
- **Llamadas:** SOLO desde Edge Functions de Supabase. La API key vive en `GEMINI_API_KEY` como secret de la función.
- **Formato de salida:** JSON estructurado siempre (`responseMimeType: "application/json"` + `responseSchema`) para evitar parsing frágil.
- **Temperature recomendada:** 0.85 para horóscopos (creatividad + variedad), 0.7 para reportes premium (más cohesión), 0.6 para numerología (más estructura).
- **Idioma de la respuesta:** español de España, registro cálido pero no infantil, "tú" (no "usted").

## 2. Principios psicológicos que aplica el contenido

Los prompts deben empujar al modelo a aplicar estas técnicas. Bien aplicadas, **la mayoría del público se siente identificado** sin notar la estrategia.

### Efecto Forer / Barnum
Frases que parecen muy personales pero son universalmente verdaderas para casi cualquier ser humano. Ej.: *"A veces dudas de decisiones que en realidad ya tienes tomadas en el fondo."* Casi todos asentimos a eso.

**Reglas en el prompt:**
- Incluir al menos 2-3 frases de validación general por horóscopo.
- Evitar afirmaciones demasiado específicas que se puedan refutar (no decir "tendrás una llamada de tu jefe el martes").

### Lectura en frío (cold reading)
Inferencias basadas en patrones humanos comunes que el lector cree únicas. Ej.: *"Has tenido que ser fuerte por gente que no siempre lo ha sido por ti."*

### Anclajes emocionales
Mencionar emociones que la mayoría experimenta esta semana (ansiedad, esperanza, cansancio) y darles un marco. Que el lector piense "exacto, así me siento".

### Polaridad equilibrada (efecto Pollyanna + reto)
Toda lectura mezcla:
- Un **reto/tensión** ("hay algo que viene resistiéndose…").
- Un **descubrimiento positivo** ("…y precisamente ahí está la clave").
- Una **acción concreta y pequeña** ("hoy, atrévete a X").

Así el lector se identifica con el dolor y se queda con esperanza accionable.

### Específico-pero-no-medible
Detalles concretos que dan sensación de precisión sin poder demostrarse falsos: "una conversación reciente", "alguien cercano", "un número repetido".

### Lenguaje sensorial y simbólico
Verbos físicos ("respira", "suelta", "abre"), elementos naturales ("agua", "raíz", "viento"), símbolos del signo y de su elemento. Activa imaginería emocional.

### Validación + interpretación + invitación
Estructura recurrente que funciona:
1. **Te veo:** describir un estado interno común ("estás cargando más de lo que dejas ver").
2. **Lo interpreto:** dar significado astrológico ("tu regente entra hoy en…").
3. **Te invito:** acción mínima ("hoy basta con escribir lo que no quieres seguir cargando").

## 3. Tabla de longitudes por funcionalidad

| Funcionalidad | Plan | Longitud objetivo (palabras) | Tokens aprox. salida |
|---|---|---|---|
| Horóscopo diario (por área) | Free | 90-130 | 200 |
| Horóscopo semanal (por área) | Free | 180-240 | 350 |
| Horóscopo mensual (por área) | Free | 320-420 | 600 |
| Energía del día | Free | 60-90 | 160 |
| Evento astrológico (item) | Free | 50-80 | 130 |
| Carta natal básica | Free | 250-350 (total Sol+Luna+Asc) | 600 |
| Tarot 1 carta | Free | 80-120 | 220 |
| Tarot 3 cartas | Free | 220-300 | 500 |
| Carta natal completa | Premium | 1200-1800 | 2800 |
| Compatibilidad avanzada | Premium | 900-1300 | 2200 |
| Reporte mensual | Premium | 800-1200 | 2000 |
| Reporte anual | Premium | 1800-2500 | 4000 |
| Tarot complejo (10 cartas) | Premium | 900-1400 | 2200 |
| Numerología avanzada | Premium | 700-1100 | 1800 |

**Reglas:**
- Configurar `maxOutputTokens` en cada llamada según la tabla, con un 20% de margen.
- El prompt incluye explícitamente *"Extensión: alrededor de N palabras. Ni mucho menos ni mucho más."*

## 4. Coherencia entre funcionalidades

- Todas las llamadas reciben un **contexto base del usuario:**
  ```json
  { "sun_sign": "leo", "ascendant": "virgo|null", "moon": "libra|null",
    "plan": "free|premium", "date": "2026-05-23", "locale": "es-ES",
    "tone": "warm-mystic" }
  ```
- Una funcionalidad premium que extiende una free **DEBE recibir el texto generado en la free** como contexto:
  ```json
  { "previous_free_reading": "...texto del horóscopo diario..." }
  ```
  y el prompt le indica: *"Esta lectura premium amplía y profundiza la siguiente lectura gratuita previa. Mantén el mismo hilo emocional y simbólico; no contradigas nada de lo que ya se dijo. Profundiza."*
- Si el usuario tiene su carta natal calculada (premium), los horóscopos pueden mencionar elementos sutiles (ascendente, posición lunar) cuando proceda — el prompt lo permite SOLO si esos datos están presentes.

## 5. Cacheo y reutilización

- Los horóscopos diarios/semanales/mensuales **NO son personalizados por usuario**, sino por signo. → fila única en `horoscope_cache (sun_sign, scope, area, period_start)`.
- Política de generación:
  1. Pedir contenido → buscar en cache.
  2. Si existe → devolver.
  3. Si no existe → generar con Gemini → guardar → devolver.
- Posible warm-up automático: una cron job (Edge Function programada con `pg_cron` o un workflow de GitHub) que pregenere los 12 signos × 5 áreas × diario cada noche. **Decisión: optar por lazy (on-demand) durante el TFM** para reducir costes y mostrar el flujo "en vivo" en la defensa.
- Generaciones personalizadas (carta natal, compatibilidad, reporte premium) → fila por usuario, sin cache compartido.

## 6. Esquema de salida JSON (responseSchema)

Ejemplo para horóscopo diario por área:
```json
{
  "headline": "string (titular evocador, 6-10 palabras)",
  "body": "string (texto principal, 90-130 palabras)",
  "lucky_number": "integer (1-99)",
  "lucky_color": "string (nombre de color en español)",
  "mood_emoji": "string (1 emoji)",
  "keyword": "string (1-2 palabras)",
  "premium_hook": "string (1 frase que insinúa qué se profundiza en premium, 12-18 palabras)"
}
```

`premium_hook` es lo que se usa en `<UpsellCard />` al final del resultado free. Lo genera el propio Gemini para que la intriga esté alineada con el contenido.

## 7. Plantilla de prompt — horóscopo diario por área

```
Eres un astrólogo experimentado que escribe horóscopos contemporáneos en español de España, con un tono cálido, cercano y simbólico. Tu objetivo es que el lector se sienta visto y comprendido, sin caer en banalidad ni en lenguaje arcaico.

CONTEXTO DEL LECTOR:
- Signo solar: {sun_sign}
- Fecha: {date} (día de la semana: {weekday})
- Área de la vida: {area}  // general | amor | salud | dinero | trabajo

INSTRUCCIONES DE ESTILO:
- Trata al lector de "tú".
- Usa frases que la mayoría de la gente pueda sentir como propias (universales pero personales en la forma).
- Combina: un reto del momento + un descubrimiento positivo + una acción concreta y mínima para hoy.
- Mete símbolos sutiles del signo y su elemento.
- Evita predicciones literales y comprobables.
- Extensión del cuerpo: 90-130 palabras. Ni menos ni más.
- Termina con un "premium_hook": una frase que sugiera que hay una capa más profunda de información para quien quiera ir más allá (la verá un usuario que esté pensando en suscribirse a premium).

RESPONDE EXCLUSIVAMENTE EN JSON VÁLIDO con este esquema:
{ "headline": "...", "body": "...", "lucky_number": 7, "lucky_color": "...", "mood_emoji": "✨", "keyword": "...", "premium_hook": "..." }
```

## 8. Plantilla — carta natal premium (completa)

```
Eres una astróloga con 20 años de experiencia, especializada en cartas natales psicológicas. Vas a interpretar una carta natal completa para un usuario premium, en español de España.

DATOS NATALES:
- Sol en {sun_sign} ({sun_degree}º)
- Luna en {moon_sign} ({moon_degree}º)
- Ascendente en {asc_sign} ({asc_degree}º)
- Posiciones planetarias: {planets_json}
- Casas: {houses_json}
- Aspectos principales: {aspects_json}

ESTRUCTURA OBLIGATORIA (todo en prosa, sin listas):
1) Identidad esencial (Sol + Asc + Luna integrados como una persona, no como tres descripciones sueltas).
2) Vida emocional (Luna + Casa 4 + aspectos al Sol).
3) Vínculos y vida amorosa (Venus, Marte, Casa 7, Casa 5).
4) Vocación y propósito (Mediocielo, Casa 10, Sol).
5) Sombra y trabajo personal (aspectos tensos relevantes).
6) Recomendación para los próximos 12 meses (un consejo concreto).

ESTILO:
- Tono cálido, simbólico, profundo. Sin tecnicismos sin explicar.
- Que el lector sienta que es ÉL/ELLA, no un genérico. Combina datos específicos (signos, casas) con frases universales.
- Extensión: 1200-1800 palabras.

Devuelve JSON: { "sections": [{ "title": "...", "body": "..." }, ...], "summary": "..." }
```

## 9. Manejo de fallos de Gemini

- Si la API devuelve 429 (rate limit) o 5xx: reintentar 1 vez con backoff 2s.
- Si falla de nuevo: devolver contenido del día anterior si hay cache; si no, mensaje suave:
  > "Las estrellas están alineándose. Vuelve en unos minutos."
- Loggear el fallo en `user_events` (anonimizado) para detectar patrones.

## 10. Filtrado y seguridad de contenido

- El prompt instruye a Gemini que **NUNCA**: diagnostique enfermedades, prometa resultados financieros concretos, hable de muerte de forma alarmista, dé consejos legales/médicos.
- Si el área es "salud" o "dinero", añadir la coletilla: *"Esto es contenido astrológico de entretenimiento, no sustituye asesoramiento profesional."* en `body` o como `disclaimer` separado.
- Las salidas pasan por un validador de longitud y schema antes de guardarse. Si no cumple, se descarta y reintenta una vez con prompt reforzado.

## 11. Control de coste y métricas

- Contador diario por función: si se exceden N llamadas/día, devolver cache antiguo o mensaje suave.
- Loggear en `user_events`: `gemini_call` con `{ scope, tokens_in, tokens_out, latency_ms, cached: bool }`.
- En el panel de admin (Fase tardía u opcional): dashboard con coste estimado del mes.
