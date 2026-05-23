# SEO_STRATEGY.md — Posicionamiento orgánico

## 1. Objetivo

Posicionar la plataforma en los primeros resultados de Google para búsquedas hispanohablantes de horóscopos, tarot, carta natal y astrología. Foco en intención informacional y comercial-blanda, captando tráfico que después se convierte vía freemium.

## 2. Arquitectura de URLs

Estructura jerárquica, en español, kebab-case. Cada URL tiene un propósito SEO claro:

| URL | Intención | Indexable | Frecuencia |
|---|---|---|---|
| `/` | Brand + home | Sí | Diaria |
| `/horoscopo` | Hub de horóscopos | Sí | Diaria |
| `/horoscopo/diario` | Horóscopo diario general | Sí | Diaria (cambia) |
| `/horoscopo/diario/leo` (×12 signos) | Horóscopo diario de Leo | Sí | Diaria |
| `/horoscopo/semanal/leo` (×12) | Horóscopo semanal de Leo | Sí | Semanal |
| `/horoscopo/mensual/leo` (×12) | Horóscopo mensual de Leo | Sí | Mensual |
| `/signo/leo` (×12) | Página perenne del signo | Sí | Estática (mejorada periódicamente) |
| `/carta-natal/basica` | Funcionalidad gratis | Sí (landing) | Estática |
| `/tarot/simple` | Funcionalidad gratis | Sí (landing) | Estática |
| `/compatibilidad/leo-virgo` (×12×12) | Páginas SEO de pares | Sí | Estática |
| `/premium` | Conversión | Sí | Estática |
| `/login`, `/registro`, `/perfil/*` | Cuenta | **NO** indexar | — |
| `/aviso-legal`, `/politica-de-privacidad`, etc. | Legal | Sí | Estática |

## 3. Meta tags por página

Plantilla mínima por página:
```html
<title>{Título único 50-60 chars}</title>
<meta name="description" content="{Descripción 140-160 chars con CTA suave}">
<link rel="canonical" href="https://zodiaq.app/...">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="https://zodiaq.app/og/...png">
<meta property="og:type" content="website|article">
<meta name="twitter:card" content="summary_large_image">
```

Helper en `lib/seo.ts`:
```ts
export function buildMeta({ title, description, path, image }: ...) { ... }
```

Aplicado vía `react-helmet-async`.

### Ejemplos de title/description
- `/horoscopo/diario/leo` → *Horóscopo Leo de hoy · {Fecha} | Zodiaq* / *Tu horóscopo diario de Leo, escrito por IA y personalizado por tu signo. Amor, trabajo, salud y dinero.*
- `/carta-natal/basica` → *Calcula tu carta natal gratis · Sol, Luna y Ascendente | Zodiaq* / *Descubre los tres pilares de tu carta natal en minutos. Gratis y con interpretación.*
- `/signo/leo` → *Leo: personalidad, compatibilidad y predicciones | Zodiaq* / *Todo sobre el signo Leo: rasgos, fortalezas, sombras, signos compatibles y horóscopo diario.*

## 4. Datos estructurados (Schema.org)

En `/` y páginas de marca:
```json
{ "@context":"https://schema.org", "@type":"WebSite",
  "name":"Zodiaq", "url":"https://zodiaq.app",
  "potentialAction":{ "@type":"SearchAction",
    "target":"https://zodiaq.app/buscar?q={query}",
    "query-input":"required name=query" } }
```

En cada horóscopo:
```json
{ "@type":"Article", "headline":"Horóscopo Leo · 23 de mayo de 2026",
  "datePublished":"2026-05-23T00:00:00+02:00",
  "inLanguage":"es-ES", "author":{"@type":"Organization","name":"Zodiaq"} }
```

En `/premium`:
```json
{ "@type":"Product", "name":"Zodiaq Premium",
  "offers":[{"@type":"Offer","price":"4.99","priceCurrency":"EUR"}] }
```

En cada signo (`/signo/leo`):
```json
{ "@type":"FAQPage", "mainEntity":[ ... preguntas frecuentes sobre Leo ... ] }
```

## 5. Sitemap y robots

### `public/robots.txt`
```
User-agent: *
Disallow: /perfil
Disallow: /login
Disallow: /registro
Disallow: /api
Allow: /

Sitemap: https://zodiaq.app/sitemap.xml
```

### Sitemap dinámico
Generar `sitemap.xml` en build (con `vite-plugin-sitemap` o script propio). Incluye:
- Home.
- 12 páginas `/signo/{slug}`.
- 36 URLs `/horoscopo/{scope}/{sign}` con `<lastmod>` actualizado.
- 144 URLs `/compatibilidad/{a}-{b}` (combinaciones únicas; 12×11/2 = 66 si simétricas, o 144 si dirigidas — decisión: hacer 66 con par ordenado alfabético).
- Páginas legales y de funcionalidades.

## 6. Rendimiento (Core Web Vitals)

Objetivo: **Lighthouse ≥ 90 en mobile** en todas las páginas públicas.

- Lazy-load de todas las rutas con `lazy()`.
- Imágenes en formatos modernos (AVIF/WebP), `loading="lazy"`, `width`/`height` para evitar CLS.
- Fuentes con `font-display: swap`, preload de la principal.
- Sin librerías UI pesadas (sin MUI/Chakra/Bootstrap).
- Bundle splitting agresivo (chunks por feature).
- Preconnect a Supabase y Google Fonts.
- Minimizar JS de terceros — AdSense solo carga tras consentimiento y solo en páginas free.

## 7. Indexación rápida de contenido nuevo

- Sitemap dinámico actualizado con `<lastmod>` cada vez que se genera contenido nuevo.
- Google Search Console: enviar el sitemap manualmente al desplegar.
- Internal linking: cada página enlaza a páginas relacionadas (signo → diario/semanal/mensual de ese signo + compatibilidades).

## 8. Contenido perenne ("evergreen")

Páginas `/signo/{slug}` son fundamentales: contenido largo (1500+ palabras), generado por Gemini con un prompt especial pero **editado y revisado a mano** para que sea de máxima calidad SEO. Cubre:
- Personalidad del signo.
- Compatibilidades.
- Famosos del signo.
- Mitología.
- Cómo amar a un X.
- Cómo trabaja un X.
- Salud y bienestar del signo.

Estas páginas se generan una vez y se actualizan trimestralmente.

## 9. Keywords objetivo (banco inicial)

Cabecera (alto volumen):
- horóscopo
- horóscopo de hoy
- horóscopo {signo}
- carta natal gratis
- tarot online
- compatibilidad de signos
- {signo} hoy

Long tail (más fácil rankear):
- horóscopo de hoy {signo} amor
- ascendente cómo calcular
- carta natal interpretación
- {signo} y {signo} compatibilidad
- significado luna en {signo}
- horóscopo chino vs occidental

Mapping keyword → URL para no canibalizar:
- "horóscopo leo" → `/horoscopo/diario/leo`
- "leo signo" → `/signo/leo`
- "leo y virgo" → `/compatibilidad/leo-virgo`

## 10. Hreflang (futuro)

El TFM es solo español. Si en el futuro se añade `es-MX`, `en`, etc., usar:
```html
<link rel="alternate" hreflang="es-ES" href="https://zodiaq.app/...">
<link rel="alternate" hreflang="x-default" href="https://zodiaq.app/...">
```

Mencionar como "siguiente paso" pero no implementar.
