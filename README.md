<div align="center">

# ✨ Zodiaq

### Plataforma web freemium de horóscopos y astrología con Inteligencia Artificial

*Trabajo Fin de Máster · Máster Universitario en Ingeniería de Telecomunicación*

**Autor:** Jesús Cobos Pozo

<br/>

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75B2?logo=google&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Checkout-635BFF?logo=stripe&logoColor=white)

</div>

---

## 📑 Índice

1. [Descripción del proyecto](#-descripción-del-proyecto)
2. [Características principales](#-características-principales)
3. [Stack tecnológico](#-stack-tecnológico)
4. [Arquitectura](#-arquitectura)
5. [Estructura del repositorio](#-estructura-del-repositorio)
6. [Puesta en marcha (clonar y arrancar)](#-puesta-en-marcha-clonar-y-arrancar)
7. [Seguridad de las claves del repositorio](#-seguridad-de-las-claves-del-repositorio)
8. [Scripts disponibles](#-scripts-disponibles)
9. [Mapa de rutas](#-mapa-de-rutas)
10. [Base de datos y backend](#-base-de-datos-y-backend)
11. [Cumplimiento legal y privacidad](#-cumplimiento-legal-y-privacidad)
12. [Calidad, pruebas y rendimiento](#-calidad-pruebas-y-rendimiento)
13. [Documentación del proyecto](#-documentación-del-proyecto)
14. [Próximos pasos](#-próximos-pasos-fuera-del-alcance-del-tfm)
15. [Licencia y autoría](#-licencia-y-autoría)

---

## 🌙 Descripción del proyecto

**Zodiaq** es una plataforma web **freemium** que moderniza un sector tradicional —el horóscopo y la astrología— mediante **IA generativa** (Google Gemini 2.5 Flash) y una arquitectura web profesional orientada a **conversión** y **posicionamiento SEO** en el mercado hispanohablante.

El proyecto demuestra, de extremo a extremo, cómo construir un producto digital listo para producción:

- **Plan gratuito** monetizado con publicidad (Google AdSense) y un modelo de cookies *«consentir o suscribirse»* conforme a la guía de la AEPD.
- **Plan premium** mediante suscripción recurrente (Stripe Checkout + Customer Portal + Webhooks), con funcionalidades avanzadas y experiencia sin anuncios.
- **Contenido generado por IA** con técnicas de psicología del lenguaje (efecto Forer/Barnum, lectura en frío), **cacheado en base de datos** por signo y fecha para acotar el coste de la IA.

> Todo el contenido de cara al usuario está en **español (España)**; el código (identificadores, esquema de BBDD, comentarios técnicos) sigue el estándar profesional en **inglés**.

---

## 🎯 Características principales

### 🆓 Plan gratuito

| Funcionalidad | Descripción |
|---|---|
| **Horóscopo diario / semanal / mensual** | Por signo solar y por áreas (amor, salud, dinero, trabajo). Cacheado y compartido por signo. |
| **Energía del día** | Nivel energético 1–10 por signo, con contexto del día anterior. |
| **Eventos astrológicos** | Lunas nuevas/llenas e ingresos planetarios reales del mes, calculados con efemérides. |
| **Carta natal básica** | Sol, Luna y Ascendente interpretados como un todo. Generación única por usuario. |
| **Tarot simple** | Tirada interpretada por IA con *cooldown* de 24 h. |
| **Compatibilidad por signos** | Las 78 combinaciones de signos, contenido estático determinista. |
| **Numerología** | Camino de vida y año personal calculados en cliente, con significados de catálogo. |
| **Rachas (streaks)** | Gamificación de la visita diaria con hitos y *badges*. |

### 💎 Plan premium

| Funcionalidad | Descripción |
|---|---|
| **Carta natal completa** | 10 planetas + Medio Cielo + 12 casas (whole-sign) + aspectos, interpretados por IA. |
| **Compatibilidad avanzada** | Sinastría real entre dos personas con *score* determinista. 1 incluida/mes + extras puntuales. |
| **Reportes mensuales y anuales** | Carta natal + tránsitos del periodo narrados por IA. Incluidos en el plan. |
| **Tarot avanzado** | Tiradas Cruz Celta (10) y Herradura (7). Cuota mensual por tipo + pagos puntuales. |
| **Numerología avanzada** | Lectura integral narrada por IA con enfoque personalizable. |
| **Sin anuncios** | Doble capa: ni se renderizan unidades ni se carga el script de AdSense. |

---

## 🛠 Stack tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React 19 + TypeScript 6 + Vite 8 |
| **Estilos** | Tailwind CSS 4 + componentes propios |
| **Animación** | Framer Motion + arte cósmico propio + iconos Lucide |
| **Routing** | React Router 7 (con *code-splitting* y *lazy loading*) |
| **Estado servidor** | TanStack Query (React Query 5) |
| **Estado cliente** | Zustand 5 |
| **Validación** | Zod 4 |
| **Backend / BBDD** | Supabase — PostgreSQL + Auth + Row Level Security + Storage + Edge Functions (Deno) |
| **IA generativa** | Google Gemini `gemini-2.5-flash` (invocada solo desde Edge Functions) |
| **Pagos** | Stripe — Checkout + Customer Portal + Webhooks |
| **Publicidad** | Google AdSense (solo plan gratuito y con consentimiento) |
| **SEO** | `react-helmet-async` + Schema.org (JSON-LD) + sitemap/robots generados en *build* |
| **Testing / Calidad** | Vitest + ESLint + Prettier + TypeScript estricto + Lighthouse |

---

## 🏗 Arquitectura

```
┌──────────────────────────────────────────────────────────────────┐
│                          NAVEGADOR (cliente)                       │
│   React 19 SPA · solo claves PÚBLICAS (anon key, publishable key)  │
└───────────────┬──────────────────────────────────┬───────────────┘
                │ HTTPS                              │ HTTPS
                ▼                                    ▼
┌───────────────────────────────┐   ┌──────────────────────────────┐
│  SUPABASE (PostgreSQL + Auth)  │   │   SUPABASE EDGE FUNCTIONS      │
│  · 20+ tablas con RLS          │   │   (Deno) — aquí viven los      │
│  · Auth (bcrypt)               │◄──┤   SECRETOS del servidor:       │
│  · Cron (pg_cron + pg_net)     │   │   · GEMINI_API_KEY             │
│  · Cache de contenido IA       │   │   · STRIPE_SECRET_KEY          │
└───────────────────────────────┘   │   · service_role               │
                                     └───────┬───────────────┬────────┘
                                             ▼               ▼
                                   ┌──────────────┐  ┌──────────────┐
                                   │ Google Gemini│  │    Stripe     │
                                   │  2.5 Flash   │  │  (pasarela)   │
                                   └──────────────┘  └──────────────┘
```

**Principio de seguridad central:** el cliente **nunca** llama a Gemini ni a Stripe directamente. Toda operación sensible pasa por una **Edge Function** donde residen los secretos, y todo acceso a datos está filtrado por **Row Level Security** en PostgreSQL.

---

## 📁 Estructura del repositorio

```
tfm/
├── CLAUDE.md                     ← Contexto maestro del proyecto
├── README.md                     ← Este archivo
├── apps/
│   └── web/                      ← Aplicación React (frontend)
│       ├── public/               ← Estáticos (favicon, ejemplo de anuncio…)
│       ├── src/
│       │   ├── app/              ← Entry, providers, router, prefetch
│       │   ├── pages/            ← Páginas (lazy-loaded)
│       │   ├── features/         ← Lógica por dominio (15 dominios)
│       │   │   ├── auth/  billing/  horoscope/  natal/  tarot/
│       │   │   ├── numerology/  compatibility/  sign-compat/
│       │   │   ├── reports/  daily-energy/  astro-events/
│       │   │   └── streaks/  legal/  privacy/  profile/
│       │   ├── components/       ← UI reutilizable (layout, motion, visual…)
│       │   ├── lib/              ← Clientes (supabase, seo), utils, hooks
│       │   ├── styles/ types/ i18n/
│       │   └── *.test.ts         ← Tests unitarios (Vitest)
│       ├── .env                  ← Claves PÚBLICAS (versionado a propósito)
│       ├── .env.example          ← Plantilla de variables
│       ├── package.json
│       ├── vite.config.ts        ← Build + plugin de sitemap/robots
│       └── tailwind.config / tsconfig
├── supabase/
│   ├── migrations/               ← 21 migraciones SQL versionadas (tablas, RLS, crons)
│   ├── functions/                ← 18 Edge Functions (Deno)
│   └── seed/                     ← Generadores de datos semilla
└── docs/                         ← Documentación técnica del proyecto
    ├── ROADMAP.md  ARCHITECTURE.md  DATABASE_SCHEMA.md  DESIGN_SYSTEM.md
    ├── CONTENT_STRATEGY.md  MARKETING_STRATEGY.md  SEO_STRATEGY.md
    └── SECURITY.md  LEGAL_COMPLIANCE.md  INTEGRATIONS.md
```

---

## 🚀 Puesta en marcha (clonar y arrancar)

### Requisitos previos

- **Node.js 20.19+** (recomendado 22 LTS) y **npm 10+**.
- Un navegador moderno.

> **No necesitas crear cuentas ni configurar claves.** El repositorio incluye un `apps/web/.env` con las **claves públicas** del cliente, ya apuntando al backend de demostración (Supabase + IA + Stripe en modo prueba). Clona y arranca.

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/jcobosp/Servicio-web-de-generacion-de-horoscopos-basado-en-inteligencia-artificial.git
cd Servicio-web-de-generacion-de-horoscopos-basado-en-inteligencia-artificial

# 2. Entrar en la aplicación web e instalar dependencias
cd apps/web
npm install

# 3. Arrancar el servidor de desarrollo
npm run dev
```

Abre **http://localhost:5173** en el navegador. 🎉

### Probar cada parte

| Qué probar | Cómo |
|---|---|
| **Funcionalidades gratuitas** | Navega sin registrarte (horóscopos, compatibilidad por signos, numerología, eventos…). |
| **Cuenta de usuario** | Regístrate con un email; el signo se calcula automáticamente desde tu fecha de nacimiento. |
| **Funcionalidades por usuario** | Tarot simple, carta natal básica (requieren sesión). |
| **Plan premium** | En `/premium` inicia el checkout. Stripe está en **modo prueba**: usa la tarjeta `4242 4242 4242 4242`, cualquier fecha futura y cualquier CVC. **No se realiza ningún cargo real.** |

---

## 🔐 Seguridad de las claves del repositorio

**El `apps/web/.env` está versionado a propósito** para que cualquiera pueda clonar y arrancar sin configurar nada. Esto es **seguro por diseño**:

- Las variables con prefijo `VITE_*` son **públicas**: Vite las incrusta en el JavaScript que se sirve al navegador, de modo que ya son visibles en las DevTools de cualquier web desplegada. Ocultarlas en el repo no aportaría nada.
- La `anon key` de Supabase y la `publishable key` de Stripe **están diseñadas para ser públicas**.
- Lo que realmente protege la plataforma **no** es ocultar esas claves, sino:
  - 🛡️ **Row Level Security (RLS)** activado en todas las tablas con datos de usuario.
  - ⏱️ Un **límite diario de generaciones de IA** en las Edge Functions, que acota el coste.
  - 🔒 Los **secretos reales** (API key de Gemini, `service_role` de Supabase, `secret key` y `webhook secret` de Stripe) viven **solo** en *Supabase → Edge Functions → Secrets*. **Nunca** están en el repositorio ni llegan al navegador.

> Para apuntar a tu propio backend, crea un `apps/web/.env.local` (ignorado por git) con tus valores; tienen prioridad sobre el `.env` versionado. Tienes la plantilla en `apps/web/.env.example`.

---

## 📜 Scripts disponibles

Todos se ejecutan dentro de `apps/web`:

| Script | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo con *Hot Module Replacement* |
| `npm run build` | Build de producción (`tsc -b` + `vite build`, genera sitemap y robots) |
| `npm run preview` | Sirve el build de producción localmente |
| `npm test` | Tests unitarios con Vitest (modo *run*) |
| `npm run test:watch` | Tests en modo *watch* |
| `npm run lint` | Análisis estático con ESLint |
| `npm run lint:fix` | ESLint con autocorrección |
| `npm run format` | Formatea el código con Prettier |
| `npm run format:check` | Verifica el formato sin escribir |
| `npm run typecheck` | Comprobación de tipos de TypeScript |

---

## 🗺 Mapa de rutas

<details>
<summary><strong>Públicas / gratuitas</strong></summary>

| Ruta | Página |
|---|---|
| `/` | Inicio |
| `/horoscopo/diario[/:signo]` | Horóscopo diario |
| `/horoscopo/semanal[/:signo]` | Horóscopo semanal |
| `/horoscopo/mensual[/:signo]` | Horóscopo mensual |
| `/energia-del-dia[/:signo]` | Energía del día |
| `/eventos-astrologicos` | Eventos astrológicos |
| `/tarot/simple` | Tarot simple (requiere sesión) |
| `/carta-natal/basica` | Carta natal básica (requiere sesión) |
| `/compatibilidad` | Compatibilidad por signos |
| `/numerologia` | Numerología gratuita |
| `/premium` | Página de planes y precios |

</details>

<details>
<summary><strong>Premium (requieren sesión + plan activo)</strong></summary>

| Ruta | Página |
|---|---|
| `/carta-natal/completa` | Carta natal completa |
| `/compatibilidad/avanzada` | Compatibilidad avanzada (sinastría) |
| `/tarot/avanzado` | Tarot avanzado |
| `/numerologia/avanzada` | Numerología avanzada |
| `/reportes/mensual` | Reporte mensual |
| `/reportes/anual` | Reporte anual |

</details>

<details>
<summary><strong>Cuenta, autenticación y legales</strong></summary>

| Ruta | Página |
|---|---|
| `/registro`, `/login` | Alta e inicio de sesión |
| `/recuperar-contrasena`, `/restablecer-contrasena` | Recuperación de contraseña |
| `/perfil`, `/perfil/datos`, `/perfil/suscripcion` | Cuenta del usuario |
| `/aviso-legal`, `/politica-de-privacidad` | Páginas legales |
| `/terminos-y-condiciones`, `/politica-de-cookies` | Páginas legales |

</details>

---

## 🗄 Base de datos y backend

- **PostgreSQL gestionado por Supabase** con **21 migraciones SQL versionadas** (`supabase/migrations/`) que crean tablas, políticas RLS, funciones, *triggers*, índices y tareas programadas.
- **20+ tablas** con **Row Level Security** activada y políticas explícitas (perfiles, suscripciones, cache de horóscopos, lecturas de tarot, cartas natales, reportes, créditos, consentimientos legales, idempotencia de eventos Stripe…).
- **18 Edge Functions** (Deno) que encapsulan toda la lógica sensible:
  - **Generación de IA:** `generate-horoscope`, `generate-daily-energy`, `generate-astro-events`, `generate-natal-chart`, `generate-full-natal-chart`, `generate-compatibility`, `generate-report`, `generate-tarot-reading`, `generate-advanced-tarot`, `generate-numerology`.
  - **Pagos Stripe:** `create-checkout-session`, `create-portal-session`, `stripe-webhook` y funciones de pago puntual (compatibilidad, tarot, numerología, tarot simple).
  - **Cuenta:** `delete-account`.
- **Cálculo astronómico real** con `astronomy-engine` server-side (Sol, Luna, Ascendente, planetas, casas, aspectos y tránsitos).
- **Cache de contenido** por signo y fecha para reutilizar una generación entre todos los usuarios del mismo signo, con **tareas `pg_cron`** programadas (desactivadas por defecto; la generación bajo demanda funciona igualmente).

---

## ⚖️ Cumplimiento legal y privacidad

- **RGPD + LOPDGDD + LSSI-CE + Ley de Cookies** (mercado español). Detalle en `docs/LEGAL_COMPLIANCE.md`.
- **Mínimos datos personales:** en el registro solo se piden email, contraseña, nombre y fecha de nacimiento (para calcular el signo). Hora y lugar de nacimiento son **opcionales** y se almacenan cifrados.
- **Contraseñas gestionadas por Supabase Auth** (bcrypt). Datos cifrados en reposo (AES-256) y en tránsito (HTTPS).
- **Modelo de cookies «consentir o suscribirse»** (guía AEPD, mayo 2024): usar gratis requiere aceptar cookies publicitarias; la alternativa sin anuncios es el plan Premium.
- Páginas legales completas: aviso legal, política de privacidad, términos y condiciones, política de cookies. Gestión de consentimiento persistida en BBDD y panel de **gestión de datos del usuario** (incluye borrado de cuenta).

---

## ✅ Calidad, pruebas y rendimiento

- **TypeScript estricto** + **ESLint** + **Prettier**: `typecheck`, `lint` y `build` limpios.
- **Tests unitarios (Vitest)** sobre la lógica pura crítica: cálculo del signo zodiacal (fechas centrales y límites exactos de los 12 signos) y numerología (camino de vida, año personal, conservación de números maestros 11/22/33).
- **Lighthouse** (build + preview, CLI *headless*):

  | Plataforma | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
  |---|:---:|:---:|:---:|:---:|
  | 🖥️ Escritorio | 82 | 98 | 100 | 100 |
  | 📱 Móvil | 74–76 | 98 | 100 | 100 |

- **SEO desde el día 1:** metadatos por página, *canonical*, Open Graph/Twitter, datos estructurados Schema.org (JSON-LD), **sitemap y robots.txt generados en *build*** (63 URLs), URLs limpias.
- **Rendimiento:** *code-splitting* por vendors y rutas *lazy*, *prefetch* de navegación, fuentes asíncronas y respeto de `prefers-reduced-motion`.

---

## 📚 Documentación del proyecto

La planificación y el diseño detallado viven en `docs/`:

| Documento | Contenido |
|---|---|
| [`ROADMAP.md`](docs/ROADMAP.md) | Plan de fases con seguimiento del avance |
| [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Arquitectura técnica y de carpetas |
| [`DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) | Tablas, relaciones, RLS e índices |
| [`DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | Sistema de diseño visual y temas por funcionalidad |
| [`CONTENT_STRATEGY.md`](docs/CONTENT_STRATEGY.md) | Prompts de Gemini, psicología y longitudes |
| [`MARKETING_STRATEGY.md`](docs/MARKETING_STRATEGY.md) | *Funnel* freemium → premium y *upsells* |
| [`SEO_STRATEGY.md`](docs/SEO_STRATEGY.md) | Keywords, metadatos, sitemap y Schema.org |
| [`SECURITY.md`](docs/SECURITY.md) | Ciberseguridad, gestión de secretos y OWASP |
| [`LEGAL_COMPLIANCE.md`](docs/LEGAL_COMPLIANCE.md) | RGPD, LSSI, cookies y textos legales |
| [`INTEGRATIONS.md`](docs/INTEGRATIONS.md) | Conexión paso a paso con Supabase, Stripe, Gemini y AdSense |

---

## 🔭 Próximos pasos (fuera del alcance del TFM)

- Despliegue en **Vercel** con dominio propio y Supabase Cloud en producción.
- **Activación real de Google AdSense** (hoy se muestra una imagen de ejemplo en la ubicación de cada anuncio).
- Internacionalización (es-MX, en).
- Aplicación móvil nativa.

---

## 📄 Licencia y autoría

Proyecto desarrollado por **Jesús Cobos Pozo** como **Trabajo Fin de Máster** del Máster Universitario en Ingeniería de Telecomunicación.

Uso **académico**. Todos los derechos reservados salvo indicación expresa. Las marcas y servicios de terceros (Google, Supabase, Stripe) pertenecen a sus respectivos propietarios.

<div align="center">

---

*Hecho con ☕, código y un poco de magia astral.*

</div>
