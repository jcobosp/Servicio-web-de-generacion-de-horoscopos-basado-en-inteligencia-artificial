<div align="center">

# Desarrollo de un servicio web de generación de horóscopos basado en Inteligencia Artificial

Trabajo Fin de Máster · Máster Universitario en Ingeniería de Telecomunicación

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

## 🎬 Vídeo demostración de la plataforma

> Recorrido completo en vídeo por **Zodiaq**, probando en directo **todas las funcionalidades** de la plataforma: registro y cálculo automático del signo, horóscopos diario/semanal/mensual, energía del día, eventos astrológicos, carta natal, tarot, compatibilidad y numerología, el plan premium con Stripe, el modelo de cookies y la experiencia sin anuncios.

<div align="center">

<a href="https://drive.google.com/file/d/1FUvC5qaLS3HghYQKUGvNbctKX4sPMKxT/view?usp=sharing" title="Ver el vídeo demostración de Zodiaq">
  <img src="https://drive.google.com/thumbnail?id=1FUvC5qaLS3HghYQKUGvNbctKX4sPMKxT&sz=w900" alt="Vídeo demostración de Zodiaq" width="800">
</a>

<br/><br/>

<a href="https://drive.google.com/file/d/1FUvC5qaLS3HghYQKUGvNbctKX4sPMKxT/view?usp=sharing">
  <img src="https://img.shields.io/badge/%E2%96%B6%20Ver%20el%20v%C3%ADdeo%20completo-Google%20Drive-4285F4?style=for-the-badge&logo=googledrive&logoColor=white" alt="Ver el vídeo en Google Drive">
</a>

<br/>

▶️ *Pulsa la portada o el botón para abrir el vídeo en Google Drive, donde podrás reproducirlo a pantalla completa.*

<sub>¿No se abre? Mira o descarga el vídeo directamente en Google Drive aquí: <a href="https://drive.google.com/file/d/1FUvC5qaLS3HghYQKUGvNbctKX4sPMKxT/view?usp=sharing">zodiaq-demo.mp4</a></sub>

</div>

---

## Índice

1. [Descripción del proyecto](#descripción-del-proyecto)
2. [Características principales](#características-principales)
3. [Stack tecnológico](#stack-tecnológico)
4. [Arquitectura](#arquitectura)
5. [Estructura del repositorio](#estructura-del-repositorio)
6. [Puesta en marcha](#puesta-en-marcha)
7. [Seguridad de las claves del repositorio](#seguridad-de-las-claves-del-repositorio)
8. [Scripts disponibles](#scripts-disponibles)
9. [Mapa de rutas](#mapa-de-rutas)
10. [Base de datos y backend](#base-de-datos-y-backend)
11. [Cumplimiento legal y privacidad](#cumplimiento-legal-y-privacidad)
12. [Calidad, pruebas y rendimiento](#calidad-pruebas-y-rendimiento)
13. [Próximos pasos](#próximos-pasos-fuera-del-alcance-del-tfm)
14. [Licencia y autoría](#licencia-y-autoría)

---

## Descripción del proyecto

**Zodiaq** es una plataforma web *freemium* que moderniza un sector tradicional, el del horóscopo y la astrología, mediante Inteligencia Artificial generativa (Google Gemini 2.5 Flash) y una arquitectura web profesional orientada a la conversión y al posicionamiento orgánico (SEO) en el mercado hispanohablante.

El proyecto demuestra, de extremo a extremo, cómo construir un producto digital listo para producción:

* Un **plan gratuito** monetizado con publicidad (Google AdSense) y un modelo de cookies de tipo «consentir o suscribirse» conforme a la guía de la AEPD.
* Un **plan premium** mediante suscripción recurrente (Stripe Checkout, Customer Portal y Webhooks), con funcionalidades avanzadas y experiencia sin anuncios.
* **Contenido generado por IA** apoyado en técnicas de psicología del lenguaje (efecto Forer o Barnum y lectura en frío) y **cacheado en base de datos** por signo y fecha para acotar el coste de la generación.

Todo el contenido orientado al usuario está en español de España. El código fuente (identificadores, esquema de base de datos y comentarios técnicos) sigue el estándar profesional en inglés.

---

## Características principales

### Plan gratuito

| Funcionalidad | Descripción |
|---|---|
| **Horóscopo diario, semanal y mensual** | Por signo solar y por áreas (amor, salud, dinero, trabajo). Contenido cacheado y compartido por signo. |
| **Energía del día** | Nivel energético del 1 al 10 por signo, con contexto del día anterior. |
| **Eventos astrológicos** | Lunas nuevas y llenas e ingresos planetarios reales del mes, calculados con efemérides. |
| **Carta natal básica** | Sol, Luna y Ascendente interpretados como un conjunto. Generación única por usuario. |
| **Tarot simple** | Tirada interpretada por IA con periodo de espera de 24 horas. |
| **Compatibilidad por signos** | Las 78 combinaciones de signos, con contenido estático determinista. |
| **Numerología** | Camino de vida y año personal calculados en cliente, con significados de catálogo. |
| **Rachas** | Gamificación de la visita diaria con hitos y distintivos. |

### Plan premium

| Funcionalidad | Descripción |
|---|---|
| **Carta natal completa** | Diez planetas, Medio Cielo, doce casas (*whole-sign*) y aspectos, interpretados por IA. |
| **Compatibilidad avanzada** | Sinastría real entre dos personas con puntuación determinista. Una generación incluida al mes y compras puntuales adicionales. |
| **Reportes mensuales y anuales** | Carta natal y tránsitos del periodo narrados por IA. Incluidos en el plan. |
| **Tarot avanzado** | Tiradas Cruz Celta (diez cartas) y Herradura (siete cartas). Cuota mensual por tipo y compras puntuales. |
| **Numerología avanzada** | Lectura integral narrada por IA con enfoque personalizable. |
| **Experiencia sin anuncios** | Doble capa: no se renderizan las unidades publicitarias ni se carga el script de AdSense. |

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React 19, TypeScript 6 y Vite 8 |
| **Estilos** | Tailwind CSS 4 y componentes propios |
| **Animación** | Framer Motion, arte cósmico propio e iconos Lucide |
| **Routing** | React Router 7 con *code splitting* y carga diferida |
| **Estado de servidor** | TanStack Query (React Query 5) |
| **Estado de cliente** | Zustand 5 |
| **Validación** | Zod 4 |
| **Backend y base de datos** | Supabase: PostgreSQL, Auth, Row Level Security, Storage y Edge Functions (Deno) |
| **IA generativa** | Google Gemini `gemini-2.5-flash`, invocada únicamente desde Edge Functions |
| **Pagos** | Stripe: Checkout, Customer Portal y Webhooks |
| **Publicidad** | Google AdSense, solo en el plan gratuito y con consentimiento |
| **SEO** | `react-helmet-async`, datos estructurados Schema.org (JSON-LD) y generación de *sitemap* y *robots* en el *build* |
| **Calidad y pruebas** | Vitest, ESLint, Prettier, TypeScript estricto y Lighthouse |

---

## Arquitectura

El principio de seguridad central es que el cliente nunca invoca a Gemini ni a Stripe de forma directa. Toda operación sensible se canaliza a través de una **Edge Function**, donde residen los secretos del servidor, y todo acceso a datos se filtra mediante **Row Level Security** en PostgreSQL.

```
┌──────────────────────────────────────────────────────────────────┐
│                          NAVEGADOR (cliente)                       │
│   React 19 SPA · solo claves PÚBLICAS (anon key, publishable key)  │
└───────────────┬──────────────────────────────────┬───────────────┘
                │ HTTPS                              │ HTTPS
                ▼                                    ▼
┌───────────────────────────────┐   ┌──────────────────────────────┐
│  SUPABASE (PostgreSQL + Auth)  │   │   SUPABASE EDGE FUNCTIONS      │
│  · 20+ tablas con RLS          │   │   (Deno). Aquí viven los       │
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

---

## Estructura del repositorio

```
tfm/
├── README.md                     Este archivo
├── apps/
│   └── web/                      Aplicación React (frontend)
│       ├── public/               Estáticos (favicon, ejemplo de anuncio)
│       ├── src/
│       │   ├── app/              Entry, providers, router y prefetch
│       │   ├── pages/            Páginas con carga diferida
│       │   ├── features/         Lógica por dominio (15 dominios)
│       │   │   ├── auth, billing, horoscope, natal, tarot
│       │   │   ├── numerology, compatibility, sign-compat
│       │   │   ├── reports, daily-energy, astro-events
│       │   │   └── streaks, legal, privacy, profile
│       │   ├── components/       UI reutilizable (layout, motion, visual)
│       │   ├── lib/              Clientes (supabase, seo), demo y utilidades
│       │   ├── styles, types, i18n
│       │   └── *.test.ts         Tests unitarios (Vitest)
│       ├── .env                  Claves PÚBLICAS (versionado a propósito)
│       ├── .env.example          Plantilla de variables
│       ├── package.json
│       ├── vite.config.ts        Build y plugin de sitemap/robots
│       └── tailwind.config / tsconfig
└── supabase/
    └── migrations/               21 migraciones SQL versionadas (tablas, RLS, crons)
```

### Qué incluye el repositorio (y qué se mantiene privado)

Este repositorio contiene **todo lo necesario para clonar, arrancar y probar la plataforma de extremo a extremo** y comprobar que funciona correctamente: la aplicación web completa (frontend), las migraciones de base de datos (esquema y políticas de seguridad) y el modo demostración con resultados de ejemplo precargados.

Por motivos de **confidencialidad y propiedad intelectual**, una parte de la lógica del *backend* **no se publica** en el repositorio, aunque sí está desplegada y en pleno funcionamiento en el servicio real que se prueba con el usuario de demostración:

* La **ingeniería de los *prompts* de IA** y las *Edge Functions* de generación, que constituyen el núcleo diferencial del proyecto (las «recetas» con las que se elabora el contenido).
* Los **generadores de datos semilla** deterministas.
* La **documentación interna** y la memoria académica del TFM.

El objetivo es **proteger el trabajo frente a copias o plagios** y no desvelar la fórmula concreta de generación de contenido, sin que ello impida en ningún momento probar y verificar que toda la plataforma funciona correctamente gracias al usuario de demostración.

---

## Puesta en marcha

### Requisitos previos

* **Node.js 20.19 o superior** (se recomienda la versión 22 LTS) y **npm 10 o superior**.
* Un navegador moderno.

No es necesario crear cuentas ni configurar claves. El repositorio incluye un archivo `apps/web/.env` con las claves públicas del cliente, ya orientadas al backend de demostración (Supabase, IA y Stripe en modo prueba). Basta con clonar y arrancar.

### Pasos

**1. Clona el repositorio:**

```bash
git clone https://github.com/jcobosp/Servicio-web-de-generacion-de-horoscopos-basado-en-inteligencia-artificial.git
```

**2. Entra en la carpeta del proyecto:**

```bash
cd Servicio-web-de-generacion-de-horoscopos-basado-en-inteligencia-artificial
```

**3. Entra en la aplicación web:**

```bash
cd apps/web
```

**4. Instala las dependencias:**

```bash
npm install
```

**5. Arranca el servidor de desarrollo:**

```bash
npm run dev
```

A continuación, abrir **http://localhost:5173** en el navegador.

### Usuario de demostración

La plataforma se entrega en **modo demostración**. Para que cualquiera pueda probarla con comodidad, y para no generar coste en el servicio de IA, las funcionalidades de inteligencia artificial **no se generan en vivo**: devuelven **resultados de ejemplo precargados y deterministas**. De este modo, todo el mundo ve el mismo contenido y la aplicación **no realiza ninguna llamada a Google Gemini**.

Para recorrer **todas** las funcionalidades, incluidas las premium, inicia sesión con el usuario de demostración, que ya tiene una **suscripción premium activa**:

| | |
|---|---|
| 📧 **Correo** | `demo@zodiaq.app` |
| 🔑 **Contraseña** | `ZodiaqDemo2026` |

Con esta cuenta podrás ver al instante el resultado de la carta natal completa, la compatibilidad avanzada, los reportes mensual y anual, el tarot avanzado y la numerología avanzada, además de todas las funcionalidades gratuitas.

> **¿Por qué un modo demostración?** El motor de IA (Google Gemini) está asociado a una cuenta con coste por uso. Para que las pruebas públicas no generen ningún gasto, la aplicación no invoca la IA real, sino que sirve resultados de ejemplo. Quien quiera activar la generación real solo tiene que establecer `VITE_DEMO_MODE=false` en un archivo `apps/web/.env.local` y configurar su propia clave `GEMINI_API_KEY` en las Edge Functions de Supabase.

### Cómo probar cada parte

| Qué probar | Cómo |
|---|---|
| **Funcionalidades gratuitas** | Navegar sin registrarse (horóscopos, compatibilidad por signos, numerología, eventos astrológicos). Muestran resultados de ejemplo. |
| **Usuario de demostración** | Iniciar sesión con `demo@zodiaq.app` / `ZodiaqDemo2026`. Incluye premium activo y acceso a todo. |
| **Funcionalidades por usuario** | Tarot simple y carta natal básica (requieren sesión iniciada). |
| **Funcionalidades premium** | Con el usuario de demostración: carta natal completa, compatibilidad avanzada, reportes, tarot avanzado y numerología avanzada. |
| **Registrar tu propia cuenta** | También puedes registrarte con tu correo; el signo se calcula automáticamente a partir de la fecha de nacimiento. Los pagos y la gestión de cuenta están deshabilitados en el modo demostración. |

---

## Seguridad de las claves del repositorio

El archivo `apps/web/.env` está versionado de forma deliberada para que cualquier persona pueda clonar el repositorio y arrancarlo sin configuración previa. Esta decisión es segura por diseño:

* Las variables con prefijo `VITE_` son **públicas**: Vite las incrusta en el JavaScript que se sirve al navegador, por lo que ya son visibles en las herramientas de desarrollo de cualquier web desplegada. Ocultarlas en el repositorio no aportaría ninguna protección.
* La *anon key* de Supabase y la *publishable key* de Stripe están diseñadas para ser públicas.
* Lo que realmente protege la plataforma no es ocultar esas claves, sino varios mecanismos:
  * **Row Level Security (RLS)** activado en todas las tablas con datos de usuario.
  * El **modo demostración** (`VITE_DEMO_MODE=true`): la aplicación no llama a la IA y sirve resultados de ejemplo, de modo que las pruebas públicas **no generan coste**. Como protección adicional a nivel de servidor, el backend de demostración **no tiene configurada la clave `GEMINI_API_KEY`**, por lo que ninguna petición —ni siquiera directa a las Edge Functions— puede consumir generaciones de pago.
  * Los **secretos reales** (la *API key* de Gemini, la *service role* de Supabase y la *secret key* y el *webhook secret* de Stripe) residen exclusivamente en los *secrets* de las Edge Functions de Supabase. Nunca están en el repositorio ni llegan al navegador.

Para orientar la aplicación hacia un backend propio, basta con crear un archivo `apps/web/.env.local` (ignorado por git) con valores personalizados; estos tienen prioridad sobre el `.env` versionado. La plantilla está disponible en `apps/web/.env.example`.

---

## Scripts disponibles

Todos se ejecutan dentro de `apps/web`:

| Script | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Build de producción (`tsc -b` y `vite build`; genera *sitemap* y *robots*) |
| `npm run preview` | Sirve el build de producción en local |
| `npm test` | Ejecuta los tests unitarios con Vitest |
| `npm run test:watch` | Tests en modo observación |
| `npm run lint` | Análisis estático con ESLint |
| `npm run lint:fix` | ESLint con corrección automática |
| `npm run format` | Formatea el código con Prettier |
| `npm run format:check` | Verifica el formato sin escribir cambios |
| `npm run typecheck` | Comprobación de tipos de TypeScript |

---

## Mapa de rutas

<details>
<summary><strong>Públicas y gratuitas</strong></summary>

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
<summary><strong>Premium (requieren sesión y plan activo)</strong></summary>

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
<summary><strong>Cuenta, autenticación y páginas legales</strong></summary>

| Ruta | Página |
|---|---|
| `/registro`, `/login` | Alta e inicio de sesión |
| `/recuperar-contrasena`, `/restablecer-contrasena` | Recuperación de contraseña |
| `/perfil`, `/perfil/datos`, `/perfil/suscripcion` | Cuenta del usuario |
| `/aviso-legal`, `/politica-de-privacidad` | Páginas legales |
| `/terminos-y-condiciones`, `/politica-de-cookies` | Páginas legales |

</details>

---

## Base de datos y backend

* **PostgreSQL gestionado por Supabase** con **21 migraciones SQL versionadas** (`supabase/migrations/`) que crean tablas, políticas RLS, funciones, *triggers*, índices y tareas programadas.
* Más de **20 tablas** con **Row Level Security** activada y políticas explícitas: perfiles, suscripciones, cache de horóscopos, lecturas de tarot, cartas natales, reportes, créditos, consentimientos legales e idempotencia de eventos de Stripe, entre otras.
* **18 Edge Functions** (Deno) que encapsulan toda la lógica sensible y que, aunque están desplegadas y operativas en el servicio, **no se incluyen en este repositorio público por confidencialidad** (ver [Qué incluye el repositorio](#qué-incluye-el-repositorio-y-qué-se-mantiene-privado)):
  * **Generación de IA:** `generate-horoscope`, `generate-daily-energy`, `generate-astro-events`, `generate-natal-chart`, `generate-full-natal-chart`, `generate-compatibility`, `generate-report`, `generate-tarot-reading`, `generate-advanced-tarot` y `generate-numerology`.
  * **Pagos con Stripe:** `create-checkout-session`, `create-portal-session`, `stripe-webhook` y las funciones de pago puntual de compatibilidad, tarot avanzado, numerología y tarot simple.
  * **Gestión de cuenta:** `delete-account`.
* **Cálculo astronómico real** con la librería `astronomy-engine` en el servidor (Sol, Luna, Ascendente, planetas, casas, aspectos y tránsitos).
* **Cache de contenido** por signo y fecha, de modo que una sola generación se reutiliza entre todos los usuarios del mismo signo. Las **tareas programadas con `pg_cron`** quedan configuradas y desactivadas por defecto; la generación bajo demanda funciona igualmente cuando no existe contenido en cache.

---

## Cumplimiento legal y privacidad

* Cumplimiento del **RGPD, la LOPDGDD, la LSSI-CE y la normativa de cookies** del mercado español.
* **Minimización de datos personales**: en el registro solo se solicitan correo electrónico, contraseña, nombre y fecha de nacimiento (necesaria para calcular el signo). La hora y el lugar de nacimiento son opcionales y se almacenan cifrados.
* **Contraseñas gestionadas por Supabase Auth** (bcrypt). Los datos se cifran en reposo (AES-256) y en tránsito (HTTPS).
* **Modelo de cookies de tipo «consentir o suscribirse»** (guía de la AEPD de mayo de 2024): el uso gratuito requiere aceptar las cookies publicitarias, mientras que la alternativa sin anuncios es el plan Premium.
* Páginas legales completas (aviso legal, política de privacidad, términos y condiciones y política de cookies), gestión del consentimiento persistida en base de datos y panel de gestión de datos del usuario, que incluye el borrado de la cuenta.

---

## Calidad, pruebas y rendimiento

* **TypeScript estricto**, **ESLint** y **Prettier**, con `typecheck`, `lint` y `build` sin incidencias.
* **Tests unitarios con Vitest** sobre la lógica pura crítica: el cálculo del signo zodiacal (fechas centrales y límites exactos de los doce signos) y la numerología (camino de vida, año personal y conservación de los números maestros 11, 22 y 33).
* **Auditoría con Lighthouse** (sobre el *build* de producción servido en local, mediante la CLI en modo *headless*):

  | Plataforma | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
  |---|:---:|:---:|:---:|:---:|
  | Escritorio | 82 | 98 | 100 | 100 |
  | Móvil | 74 a 76 | 98 | 100 | 100 |

* **SEO desde el primer día**: metadatos por página, etiqueta *canonical*, Open Graph y Twitter Cards, datos estructurados Schema.org (JSON-LD) y generación de *sitemap* y `robots.txt` durante el *build* (63 URL), con URL limpias.
* **Rendimiento**: *code splitting* por dependencias y rutas con carga diferida, *prefetch* de la navegación, carga asíncrona de fuentes y respeto de la preferencia `prefers-reduced-motion`.

---

## Próximos pasos (fuera del alcance del TFM)

* Despliegue en **Vercel** con dominio propio y Supabase Cloud en producción.
* **Activación real de Google AdSense** (actualmente se muestra una imagen de ejemplo en la ubicación de cada anuncio).
* Internacionalización (es-MX e inglés).
* Aplicación móvil nativa.

---

## Licencia y autoría

Proyecto desarrollado por **Jesús Cobos Pozo** como Trabajo Fin de Máster del Máster Universitario en Ingeniería de Telecomunicación.

Uso académico. Todos los derechos reservados salvo indicación expresa. Las marcas y servicios de terceros (Google, Supabase y Stripe) pertenecen a sus respectivos propietarios.
