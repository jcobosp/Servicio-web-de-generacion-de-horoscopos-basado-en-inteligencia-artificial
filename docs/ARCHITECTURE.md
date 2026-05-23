# ARCHITECTURE.md — Arquitectura técnica

## 1. Visión general

Arquitectura tipo **SPA + BaaS + Serverless**: cliente React que habla con Supabase para datos y autenticación, y con Edge Functions de Supabase para todo lo que requiere secretos (Gemini, Stripe). El cliente nunca toca claves sensibles.

```
┌──────────────────────────┐         ┌────────────────────────────────┐
│   React + TS + Tailwind  │  HTTPS  │  Supabase (PostgreSQL + Auth)  │
│   (Vite SPA)             ├────────▶│  RLS en todas las tablas       │
│   anon key + Stripe pub  │         │                                │
└──────────┬───────────────┘         │  Edge Functions (Deno):        │
           │                         │   • generate-horoscope         │
           │   invoke()              │   • create-checkout-session    │
           └────────────────────────▶│   • stripe-webhook             │
                                     │   • create-portal-session      │
                                     │   • delete-account             │
                                     └──────┬─────────────────────────┘
                                            │ secrets de servidor
                                            ▼
                              ┌──────────────────────────────┐
                              │  Gemini API (gemini-2.5-flash)│
                              │  Stripe API                   │
                              └──────────────────────────────┘
```

## 2. Frontend — organización de carpetas

```
apps/web/src/
├── app/
│   ├── main.tsx                ← entry point
│   ├── App.tsx                 ← router root
│   ├── providers.tsx           ← QueryClient, Auth, Theme, Cookie consent
│   └── router.tsx              ← definición de rutas con lazy()
├── pages/                      ← componentes página (1 por ruta)
│   ├── HomePage.tsx
│   ├── DailyHoroscopePage.tsx
│   ├── auth/SignInPage.tsx
│   └── ...
├── features/                   ← lógica de dominio (vertical slices)
│   ├── horoscope/
│   │   ├── api.ts              ← funciones que invocan Edge Functions / supabase
│   │   ├── hooks.ts            ← useDailyHoroscope, useWeeklyHoroscope...
│   │   ├── components/         ← UI específica (HoroscopeCard, AreaTabs...)
│   │   ├── types.ts
│   │   └── utils.ts
│   ├── auth/
│   ├── billing/                ← Stripe Checkout, Portal, gating premium
│   ├── tarot/
│   ├── natal/                  ← carta natal (básica y completa)
│   ├── compatibility/
│   ├── numerology/
│   └── profile/
├── components/                 ← UI reutilizable transversal
│   ├── layout/NavBar.tsx
│   ├── layout/Footer.tsx
│   ├── layout/Layout.tsx
│   ├── ui/Button.tsx
│   ├── ui/Card.tsx
│   ├── ui/Modal.tsx
│   └── ...
├── lib/
│   ├── supabase.ts             ← createClient con anon key
│   ├── stripe.ts               ← loadStripe() lazy
│   ├── analytics.ts            ← wrapper que respeta consentimiento
│   ├── zodiac.ts               ← getZodiacSign(date), constantes
│   ├── dates.ts                ← format, parse, timezone helpers
│   └── seo.ts                  ← helpers de meta tags
├── hooks/                      ← hooks genéricos (useDebounce, useMediaQuery)
├── styles/
│   ├── tokens.css              ← variables CSS (si hace falta complementar Tailwind)
│   └── globals.css             ← reset, base
├── types/                      ← tipos compartidos (Database de Supabase generada)
│   └── supabase.ts             ← generado por supabase-cli (gen types)
└── i18n/
    └── es.ts                   ← textos de UI centralizados (para futuro multiidioma)
```

### Reglas de organización

- **Vertical slices:** todo lo de un dominio (horoscope, tarot...) vive bajo `features/<dominio>/`. Las páginas se quedan delgadas y solo orquestan.
- **Componentes en `components/` son agnósticos del dominio.** Si un componente necesita conocer "horóscopo" o "tarot", vive en `features/<dominio>/components/`.
- **`lib/` no importa de `features/` ni de `components/`** — solo al revés.
- **Rutas con lazy loading:** cada página se importa con `lazy(() => import(...))` para split de bundles.
- **Tipos de Supabase generados automáticamente** con `supabase gen types typescript --project-id <id>` cuando cambie el esquema.

## 3. Routing

```ts
const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/horoscopo/diario/:sign?', element: <DailyHoroscopePage /> },
  { path: '/horoscopo/semanal/:sign?', element: <WeeklyHoroscopePage /> },
  { path: '/horoscopo/mensual/:sign?', element: <MonthlyHoroscopePage /> },
  { path: '/energia-del-dia', element: <DailyEnergyPage /> },
  { path: '/eventos-astrologicos', element: <AstroEventsPage /> },
  { path: '/carta-natal/basica', element: <BasicNatalChartPage /> },
  { path: '/carta-natal/completa', element: <PremiumGate><FullNatalChartPage /></PremiumGate> },
  { path: '/compatibilidad', element: <PremiumGate><CompatibilityPage /></PremiumGate> },
  { path: '/reportes/:type', element: <PremiumGate><ReportPage /></PremiumGate> },
  { path: '/tarot/simple', element: <SimpleTarotPage /> },
  { path: '/tarot/avanzado', element: <PremiumGate><AdvancedTarotPage /></PremiumGate> },
  { path: '/numerologia', element: <PremiumGate><NumerologyPage /></PremiumGate> },
  { path: '/premium', element: <PricingPage /> },
  { path: '/login', element: <SignInPage /> },
  { path: '/registro', element: <SignUpPage /> },
  { path: '/perfil', element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
  { path: '/perfil/suscripcion', element: <ProtectedRoute><SubscriptionPage /></ProtectedRoute> },
  { path: '/perfil/datos', element: <ProtectedRoute><DataPrivacyPage /></ProtectedRoute> },
  { path: '/aviso-legal', element: <LegalNoticePage /> },
  { path: '/politica-de-privacidad', element: <PrivacyPolicyPage /> },
  { path: '/terminos-y-condiciones', element: <TermsPage /> },
  { path: '/politica-de-cookies', element: <CookiesPolicyPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
```

URLs en español y kebab-case por SEO local.

## 4. Capa de datos

### Patrón de acceso

- **Lecturas de datos del usuario:** directas al cliente Supabase con RLS (`supabase.from('horoscope_cache').select(...)`).
- **Generación de contenido IA:** siempre vía `supabase.functions.invoke('generate-horoscope', { body: {...} })`. Nunca llamar a Gemini desde el cliente.
- **Pagos:** vía Edge Functions (`create-checkout-session`, `create-portal-session`).

### Cacheo con TanStack Query

```ts
useQuery({
  queryKey: ['horoscope', 'daily', sign, todayIso],
  queryFn: () => fetchDailyHoroscope(sign),
  staleTime: 1000 * 60 * 60,  // 1h
  gcTime: 1000 * 60 * 60 * 6,
});
```

## 5. Edge Functions (Supabase, Deno)

```
supabase/functions/
├── generate-horoscope/
│   ├── index.ts          ← endpoint principal
│   ├── prompts.ts        ← templates de prompts por scope/area
│   └── gemini.ts         ← cliente fetch a Gemini API
├── create-checkout-session/index.ts
├── create-portal-session/index.ts
├── stripe-webhook/index.ts
├── delete-account/index.ts
└── _shared/
    ├── supabase-admin.ts ← cliente con service_role
    ├── auth.ts           ← verificación de JWT del cliente
    └── cors.ts
```

### Patrón común de Edge Function

1. Verificar CORS y método.
2. Verificar JWT del usuario (extraer `user_id`).
3. Validar payload con Zod (Deno-compatible) o similar.
4. Hacer el trabajo.
5. Devolver JSON con `Content-Type` correcto.
6. Manejar errores → 4xx/5xx con `{ error: string }`.

## 6. Decisiones arquitectónicas justificadas

| Decisión | Por qué |
|---|---|
| Vite en vez de Next.js | El proyecto no necesita SSR pesado; los horóscopos son contenido dinámico por usuario. Para SEO de las páginas públicas se prerrenderiza con `vite-plugin-ssg` si hace falta o se usa `react-helmet-async` para meta tags. Vite simplifica el TFM y el bundle es más pequeño. |
| Supabase | Cubre Auth + DB + Storage + Edge Functions con RLS de Postgres. Reduce drásticamente el código backend y es perfecto para un TFM. |
| Edge Functions para Gemini/Stripe | Mantener `GEMINI_API_KEY` y `STRIPE_SECRET_KEY` fuera del navegador es obligatorio por seguridad. |
| TanStack Query | Cacheo, deduplicación y revalidación gratis; evita estado servidor manual. |
| Zustand (opcional, mínimo) | Para estado UI global puntual (modales, banner de cookies). Evitar para estado de servidor. |
| Tailwind | Permite construir el sistema de diseño rápido y mantener estilos consistentes sin CSS-in-JS. |
| No usar una librería UI completa (MUI/Chakra) | Mejor para personalizar la estética "horóscopo" sin pelearse con themes; el TFM gana puntos por componentes propios bien hechos. |

## 7. Variables de entorno

### `.env` del cliente (`apps/web/.env.local`)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_ADSENSE_CLIENT=
VITE_SITE_URL=http://localhost:5173
```

### Secrets de Edge Functions (Supabase Dashboard → Project Settings → Edge Functions → Secrets)
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_MONTHLY=
STRIPE_PRICE_ANNUAL=
SITE_URL=
```

**Nunca poner secretos en `.env` del cliente ni commitearlos.** Solo `.env.example` se commitea (con valores vacíos).

## 8. Convenciones de código

- **TypeScript estricto** (`strict: true`, `noUncheckedIndexedAccess: true`).
- **Componentes:** function components con `export function ComponentName() {}` (no `default export`, salvo el caso de lazy routes).
- **Props:** interface con sufijo `Props`, ej. `interface CardProps`.
- **Archivos:** `PascalCase.tsx` para componentes, `camelCase.ts` para utilidades.
- **No prop drilling más de 2 niveles:** subir a contexto o React Query.
- **Errores:** lanzar `Error` con mensaje descriptivo. El boundary global muestra una UI amable.
- **No `any`** salvo justificación documentada con `// eslint-disable-next-line`.

## 9. Errores y boundary

- `<ErrorBoundary />` global en `app/providers.tsx`.
- Errores de TanStack Query → toast + retry button.
- Errores 401 → cerrar sesión y redirigir a `/login`.
- Errores de Gemini (límite, timeout) → mostrar contenido cacheado del día anterior si existe, o un mensaje "Las estrellas están descansando, vuelve en unos minutos".
