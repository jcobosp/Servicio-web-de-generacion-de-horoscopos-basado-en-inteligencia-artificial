# ROADMAP — Plan de desarrollo del TFM

> **Fuente de verdad del avance del proyecto.** Cada tarea es una casilla `- [ ]`. Cuando se completa y se verifica, pasa a `- [x]`. Las tareas que requieren acción externa (crear cuentas, conseguir API keys, tomar decisiones de producto) se marcan con `⚠️ ACCIÓN MANUAL` y deben resolverse antes de continuar.
>
> **Orden:** las fases son secuenciales. No empezar la Fase N+1 hasta que la Fase N esté totalmente cerrada.

---

## Fase 0 — Planificación y documentación ✅

- [x] Lectura del anteproyecto y comprensión del alcance.
- [x] Creación de `docs/ROADMAP.md` (este archivo).
- [x] Creación de `docs/ARCHITECTURE.md`.
- [x] Creación de `docs/DATABASE_SCHEMA.md`.
- [x] Creación de `docs/DESIGN_SYSTEM.md`.
- [x] Creación de `docs/CONTENT_STRATEGY.md`.
- [x] Creación de `docs/MARKETING_STRATEGY.md`.
- [x] Creación de `docs/SEO_STRATEGY.md`.
- [x] Creación de `docs/SECURITY.md`.
- [x] Creación de `docs/LEGAL_COMPLIANCE.md`.
- [x] Creación de `docs/INTEGRATIONS.md`.

---

## Fase 1 — Arranque técnico del frontend ✅

- [x] Inicializar repositorio git (`git init`, primer commit con docs).
- [x] Crear `.gitignore` raíz (node_modules, .env*, dist, .vercel, etc.).
- [x] Crear `apps/web` con Vite + React + TypeScript (`npm create vite@latest`).
- [x] Instalar y configurar **Tailwind CSS** con la paleta del proyecto. *Nota: usado Tailwind v4 (más moderno, sin postcss/autoprefixer separados, config en CSS vía `@theme`).*
- [x] Instalar **React Router v6** y configurar el router raíz con lazy loading. *Nota: instalado react-router-dom v7, sucesor directo de v6 con la misma API (`createBrowserRouter`).*
- [x] Instalar **TanStack Query** y crear el `QueryClient` global con configuración por defecto sensata.
- [x] Instalar **Zustand** (sin usarlo todavía — solo dejarlo listo).
- [x] Configurar **ESLint + Prettier** (reglas estrictas, sin warnings al guardar).
- [x] Configurar `tsconfig.json` en modo `strict` y con `paths` absolutos (`@/*`).
- [x] Crear estructura de carpetas según `docs/ARCHITECTURE.md`.
- [x] Crear `.env.example` con todas las variables del proyecto (sin valores).
- [x] Crear `README.md` raíz con: descripción breve, stack, cómo arrancar en local, enlaces a `docs/`.
- [x] Página de ejemplo (`/`) renderizando un "Hola, Zodiaq" para validar el setup. *Incluye grid de los 12 signos con sus gradientes característicos.*
- [x] Comprobar que `npm run dev`, `npm run build` y `npm run lint` funcionan sin errores. *También añadidos `typecheck`, `format`, `format:check`, `lint:fix`.*

**Notas técnicas extra (Fase 1):**
- Se detectó interceptación TLS de Norton Antivirus que rompía npm. Solución: exportados los 126 CAs del almacén raíz de Windows a `~/.node-ca/windows-roots.pem` y configurada la variable de entorno **`NODE_EXTRA_CA_CERTS`** a nivel de usuario (persistente). En futuras sesiones Node ya la leerá automáticamente.

---

## Fase 2 — Sistema de diseño y layout global ✅

- [x] Definir tokens de Tailwind (colores, sombras, radios, espaciados) según `docs/DESIGN_SYSTEM.md`.
- [x] Definir la paleta de colores por signo (`signColors`) en un módulo central (`src/lib/zodiac.ts`).
- [x] Crear componentes base: `Button`, `Card`, `Badge`, `Input`, `Select`, `Modal`, `Toast`, `Skeleton`.
- [x] Crear `<NavBar />` sticky superior con menú móvil, indicador de scroll y links a las funcionalidades.
- [x] Crear `<Footer />` con enlaces legales, redes sociales placeholder y copyright dinámico.
- [x] Crear `<Layout />` que envuelve todas las páginas (NavBar + Outlet + Footer + ToastViewport).
- [x] Implementar `useScrollDirection` para animar la NavBar.
- [x] Crear un componente `<SignCard />` reutilizable (icono, nombre, fechas, gradiente por signo).
- [x] Crear página `/` (landing) con hero, grid de 12 signos, sección de 4 funcionalidades y CTA premium destacado.
- [x] Diseño 100% responsive (mobile-first) verificado: grid se adapta de 2 cols (móvil) → 3 → 4 → 6 (lg).
- [x] NotFoundPage con tono cuidado y CTAs útiles.
- [ ] Smoke test visual manual: capturas de la landing en escritorio y móvil (lo hace el autor del TFM cuando quiera documentar la fase para la memoria).

---

## Fase 3 — Supabase: proyecto, esquema y RLS ✅

- [x] ⚠️ ACCIÓN MANUAL: crear proyecto en [Supabase](https://supabase.com) y compartir `Project URL` y `anon public key`. Proyecto **Zodiaq** (ref `asotgxhniqcdkwainijo`, región `eu-west-3` París — UE por RGPD, PostgreSQL 17).
- [x] ⚠️ ACCIÓN MANUAL: la `service_role key` NO se necesita aún. Se usará en Fase 6/8 y se subirá directamente al dashboard como Secret de Edge Functions (nunca al repo).
- [x] Instalar `@supabase/supabase-js` en `apps/web` (ya estaba desde Fase 1).
- [x] Crear `apps/web/src/lib/supabase.ts` con el cliente tipado configurado por env vars.
- [x] Crear migraciones en `supabase/migrations/` según `docs/DATABASE_SCHEMA.md` (11 tablas): `profiles`, `subscriptions`, `horoscope_cache`, `daily_energy`, `astro_events`, `tarot_readings`, `natal_charts`, `compatibility_reports`, `streaks`, `user_events`, `legal_consents`.
- [x] Activar RLS en TODAS las tablas y escribir las políticas (lectura propia, escritura por service_role, lectura pública del contenido cacheado).
- [x] Crear funciones SQL: `get_zodiac_sign(date)`, `increment_streak()`, `private.is_premium(uuid)`, `set_updated_at()`.
- [x] Crear trigger `on_auth_user_created` (crea `profiles` + `streaks` al registrar usuario, calcula el signo en servidor).
- [x] Aplicar las migraciones (6 en total) y verificar con `list_tables` (11 tablas, todas con RLS).
- [x] Ejecutar advisors y resolver warnings: relocalizadas funciones SECURITY DEFINER, optimizadas las 14 políticas RLS con `(select auth.uid())`, añadido índice FK en `user_events`.
- [x] Generar tipos TypeScript del esquema → `apps/web/src/types/supabase.ts`.
- [x] Prueba de conectividad real: lectura pública OK, RLS bloquea tabla privada sin sesión, RPC `get_zodiac_sign` correcto.

**Notas técnicas (Fase 3):**
- Advisor de seguridad: queda 1 WARN intencionado — `increment_streak` es invocable por `authenticated` por diseño (RPC que actualiza solo la fila del propio usuario). Aceptado y documentado.
- Advisor de rendimiento: solo quedan INFO de "índices sin usar", normal en BBDD nueva sin tráfico; se usarán al funcionar la app, no se eliminan.
- Las claves públicas (URL + anon key) están en `apps/web/.env.local` (ignorado por git). La `anon key` es la que usa `@supabase/supabase-js`.

---

## Fase 4 — Autenticación de usuarios ✅

- [x] Crear `features/auth/` con: `SignInPage`, `SignUpPage`, `ForgotPasswordPage`, `ResetPasswordPage` (+ `AuthShell`, `AuthProvider`, `api.ts`, `validation.ts`).
- [x] Formulario de registro con validación Zod: email, contraseña (mín 8 chars + mayúscula + minúscula + número), nombre, fecha de nacimiento, checkbox obligatorio de T&C + Privacidad, opt-in de marketing. Edad mínima 16 años validada.
- [x] Calcular signo solar en el cliente (`getZodiacSign`) y mostrarlo en vivo en el formulario. El servidor lo recalcula (no se confía en el cliente).
- [x] `supabase.auth.signUp()` con metadatos → trigger crea `profiles` (con `sun_sign`), `streaks` y 3 `legal_consents`. **Verificado end-to-end con un alta de prueba.**
- [x] Inicio de sesión, cerrar sesión (NavBar + perfil) y recuperar/restablecer contraseña.
- [x] Hook `useAuth()` vía `<AuthProvider>` (envuelve `onAuthStateChange` + `getSession`).
- [x] `<ProtectedRoute />` que redirige a `/login` conservando la ruta de origen.
- [x] Página `/perfil` con datos, racha/signo, edición de nombre y zona horaria, cerrar sesión.
- [x] Página `/perfil/datos`: exportar datos en JSON (RGPD acceso/portabilidad) y eliminar cuenta con confirmación.
- [x] Edge Function `delete-account` desplegada (verify_jwt) — borrado real con cascade. **Verificado: cascade elimina datos y conserva consentimientos con user_id NULL.**
- [x] Verificación de email: con confirmación de email activada en Supabase no hay sesión hasta confirmar; el perfil avisa si el email no está confirmado.

**Notas técnicas (Fase 4):**
- La Edge Function `delete-account` cubre también la tarea equivalente de la Fase 5 (se marcará allí).
- El hash de IP real en `legal_consents` requiere capturar la cabecera en una Edge Function (queda como mejora; ahora se marca `captured-at-signup`).
- Bundle principal ~176 KB gzip al incluir supabase-js; pendiente code-splitting en Fase 10.

---

## Fase 5 — Cumplimiento legal (RGPD / LSSI / Cookies) ✅

- [x] Páginas estáticas: `/aviso-legal`, `/politica-de-privacidad`, `/terminos-y-condiciones`, `/politica-de-cookies`. Plantillas base en `docs/LEGAL_COMPLIANCE.md`. Marco común en `components/legal/LegalPage.tsx`; contenido en `pages/legal/`.
- [ ] ⚠️ ACCIÓN MANUAL (pendiente, diferida por el usuario): rellenar los datos reales del responsable (nombre, NIF/DNI, domicilio, email). Centralizados como placeholders en `apps/web/src/features/legal/company.ts` — es el ÚNICO archivo a editar. Hasta entonces las páginas muestran `[NOMBRE_RESPONSABLE]`, `[NIF]`, `[EMAIL_CONTACTO]`, etc.
- [x] Banner de cookies con consentimiento granular (técnicas / analíticas / publicidad) — sin opción preseleccionada; "Rechazar todas" tan accesible como "Aceptar todas" (AEPD 2024). `features/legal/CookieBanner.tsx` + `CookiePreferences.tsx`.
- [x] Bloquear scripts de AdSense y analíticas hasta que el usuario consienta. `features/legal/ConsentScripts.tsx` inyecta GA/AdSense solo con el consentimiento de su categoría y solo si hay `VITE_GA_ID` / `VITE_ADSENSE_CLIENT` (vacíos por ahora → no se carga nada). Listo para Fase 7/10.
- [x] Guardar el consentimiento en `legal_consents` (versión, timestamp, IP hasheada). `features/legal/api.ts` inserta `cookies_analytics` y `cookies_marketing` para usuarios autenticados (la RLS exige sesión; los anónimos solo en cookie). IP hash = `captured-client-side` (misma limitación que el alta, requiere Edge Function — documentado).
- [x] Enlaces a las páginas legales desde el footer y desde los checkboxes del registro. Footer ya enlazaba las 4 páginas; añadido botón "Configurar cookies". Los checkboxes del registro ya enlazaban T&C y privacidad (Fase 4).
- [x] Implementar "Exportar mis datos" (descarga JSON con todos los datos del usuario) — hecho client-side vía RLS en `/perfil/datos` (adelantado en Fase 4).
- [x] Implementar "Eliminar mi cuenta" (borrado real, no soft delete) — Edge Function `delete-account` con confirmación en la app (adelantado en Fase 4). *Mejora futura: confirmación adicional por email.*

**Notas técnicas (Fase 5):**
- El estado de consentimiento vive en la cookie `cookie-consent` (JSON, `SameSite=Lax`, `max-age` 24 meses) — fuente de verdad también para anónimos. `needsConsent()` re-muestra el banner si no hay decisión, si cambia `LEGAL_VERSION` o si caduca (>24 meses, recomendación AEPD).
- `ConsentProvider` (en `app/providers.tsx`, dentro de `AuthProvider`) expone `useConsent()`. Lee la cookie de forma síncrona en el primer render (SPA sin SSR) para evitar parpadeo del banner.
- `LEGAL_VERSION` (`1.0`) y `LEGAL_LAST_UPDATED` centralizados en `company.ts`; la versión coincide con la que el trigger de alta guarda en `legal_consents` (migración 0007).
- Verificado: `npm run typecheck`, `npm run lint` y `npm run build` sin errores; dev server arranca limpio.

---

## Fase 6 — Motor de generación de horóscopos (Gemini) ✅

- [x] ⚠️ ACCIÓN MANUAL: confirmar la API key de Gemini disponible en Google Cloud y los límites de tokens. Compartir como secreto de Supabase (NO en .env del cliente). **Hecho:** el usuario añadió `GEMINI_API_KEY` como secret de Edge Functions; generación verificada en real.
- [x] Crear Edge Function `supabase/functions/generate-horoscope/` (módulos `index.ts`, `gemini.ts`, `prompts.ts`, `lib.ts`). Desplegada vía MCP (v2, `verify_jwt=false` → pública para horóscopos free con o sin sesión).
- [x] Implementar dentro: llamada a Gemini 2.5 Flash con prompts de `docs/CONTENT_STRATEGY.md`, control de longitud por scope (`maxOutputTokens`), `responseMimeType: application/json` + `responseSchema`, y validación del JSON de salida (campos, tipos y rango de palabras) con un reintento de prompt reforzado. `disclaimer` automático en áreas salud/dinero.
- [x] Implementar cache: lookup en `horoscope_cache (sun_sign, scope, area, period_start)`; si existe devuelve (cached), si no genera, hace upsert (idempotente `onConflict`) y devuelve la fila canónica. **Verificado:** 2ª llamada idéntica sirve de cache sin nueva generación.
- [x] Implementar control de coste: contador diario de eventos `gemini_call` en `user_events` vs `GEMINI_DAILY_LIMIT` (def. 300); si se supera, devuelve el período anterior de cache o un mensaje suave. Métricas (latencia, tokens_out) logueadas por llamada.
- [x] Test manual: invocada vía `Invoke-RestMethod` (Leo diario general + health). Formato, longitud (~95-110 palabras), tono cálido y disclaimer correctos.

**Notas técnicas (Fase 6):**
- `gemini-2.5-flash` razona por defecto; con `maxOutputTokens` ajustado los tokens de "thinking" truncaban el JSON (1ª prueba → `validation_failed`). Solución: `thinkingConfig: { thinkingBudget: 0 }` + márgenes de tokens más amplios (daily 600 / weekly 900 / monthly 1400). Documentado en el código.
- `period_start` se calcula en zona `Europe/Madrid`: diario = fecha; semanal = lunes ISO; mensual = día 1. Acepta `date` opcional en el body (por defecto hoy en Madrid).
- Tipos REST del `responseSchema` en MAYÚSCULAS (`OBJECT`/`STRING`/`INTEGER`), no las del SDK.
- Validación: hecha a mano (sin Zod) porque el `responseSchema` ya fuerza la estructura; el chequeo manual es defensivo y evita una dependencia extra en el cold start. Desviación consciente respecto a `INTEGRATIONS.md`.
- Pendiente para Fase 7: cliente tipado en el frontend (`features/horoscope/`) que invoque esta función y pinte el resultado + `<UpsellCard>` con `premium_hook`.

---

## Fase 7 — Funcionalidades gratuitas ✅

- [x] Página `/horoscopo/diario` (carga por signo del usuario, fallback a selector `<SignPicker>` si no hay sesión). Acepta `/horoscopo/diario/:sign` (URLs limpias por signo, SEO).
- [x] Página `/horoscopo/semanal` y `/horoscopo/mensual` (misma estructura, vía `<HoroscopeView scope>`; navegación entre periodos en la cabecera).
- [x] Tabs por área: general, amor, salud, dinero, trabajo (`<AreaTabs>`).
- [x] **Política transversal aplicada también a `generate-horoscope`:** prompt psicológico (Forer, lectura en frío, anclaje emocional, polaridad, sensorial), contexto del periodo anterior pasado a Gemini para no repetir, retención por scope (current+previous: diario→hoy+ayer; semanal→2 semanas; mensual→2 meses) limpiando al generar. Cron migración `0010_horoscope_crons.sql`: daily 04:10 UTC, weekly 04:20 UTC lunes, monthly 04:30 UTC día 1 (escalonados para no saturar Gemini). 12 signos × 5 áreas = 60 generaciones por scope. 
- [x] Página `/energia-del-dia` **por signo** (al usuario con sesión se le muestra la de su signo; sin sesión, selector). Incluye nivel de energía 1-10, foco y cautela, con contenido psicológico (Forer, lectura en frío). Backend `generate-daily-energy` por signo, auto-generación diaria con cron y retención hoy+ayer. 

> **POLÍTICA DE CONTENIDO IA PERIÓDICO (aplicar a todas las funcionalidades diarias/semanales/mensuales):**
> 1. **Auto-generación con cron** (`pg_cron` + `pg_net`, URL/anon key en Vault). Migración `0009_daily_cron.sql`.
> 2. **Pasar a Gemini el contenido del periodo anterior** del mismo signo para que no se repita.
> 3. **Retención = periodo actual + anterior** (se borra lo más antiguo al generar): diario→hoy+ayer; semanal→2 semanas; mensual/eventos→2 meses. **Carta natal: nunca se borra** (se genera una vez por usuario).
> 4. **Contenido emocional/psicológico** manteniendo las longitudes acordadas.
- [x] Página `/eventos-astrologicos` con lunas (nueva/llena) e ingresos del Sol/Mercurio/Venus/Marte del mes en curso. Cálculo **astronómico real con `npm:astronomy-engine@2.1.19`** server-side (Edge Function `generate-astro-events`); Gemini escribe título + descripción con técnicas psicológicas. Retención mes actual + anterior. Cron `astro-events-generation` (40 4 1 * *) programado y APAGADO por defecto (mig. 0011). 
- [x] Página `/carta-natal/basica` — pide hora y ciudad de nacimiento (opcionales, con autocompletado local de ~70 ciudades de España, Hispanoamérica y capitales mundiales con su zona IANA). Edge Function `generate-natal-chart` (POR USUARIO, requiere sesión, `verify_jwt=false` validando el JWT a mano): calcula Sol/Luna con `astronomy-engine@2.1.19` **server-side** (decisión revisada para no engordar el bundle) y Ascendente con la fórmula clásica RAMC+oblicuidad+latitud — verificada empíricamente con el cross-check del orto solar (Δ≈1° en latitudes hispanohablantes). Gemini interpreta Sol+Luna+Asc integrados como UNA persona con técnicas psicológicas (Forer, lectura en frío, polaridad, lenguaje sensorial). Guarda en `natal_charts` (is_full=false, una por usuario, no caduca) y persiste hora/lugar en `profiles` para futuras funcionalidades. **Generación única blindada en backend Y en UI**: si el usuario ya tiene carta, la función devuelve siempre la guardada (sin volver a llamar a Gemini) y la página la muestra directamente sin formulario, así nadie puede consumir tokens extra ni desde la app ni con peticiones directas. `features/natal/` (api+hooks+types+cities) + `pages/NatalChartPage.tsx` + ruta `/carta-natal/basica`. **Verificado por el usuario.**
- [x] Página `/tarot/simple` — tirada de 1 o 3 cartas con cooldown gratuito de 24h. Edge Function `generate-tarot-reading` (POR USUARIO, requiere sesión): baraja un mazo de 78 cartas en el servidor (orientación normal/invertida), Gemini interpreta con técnicas psicológicas (significado por carta + síntesis + premium_hook), guarda en `tarot_readings`. Sin cron ni cache compartida (cada tirada es única; el historial del usuario se conserva). `features/tarot/` + `pages/TarotPage.tsx` + ruta `/tarot/simple`. **Verificado por el usuario (probado logueado): funciona perfectamente.**
- [x] Sistema de rachas: badge 🔥 en NavBar con días consecutivos; toasts de hito (3/7/14/30) vía RPC `increment_streak` al ver el horóscopo diario (`features/streaks/`).
- [x] Card de upsell al final de cada resultado gratuito (`<UpsellCard>`, copys de `docs/MARKETING_STRATEGY.md` + `premium_hook` de Gemini).
- [x] Integrar AdSense en las páginas gratuitas (`<AdSlot>`): solo plan free + consentimiento de publicidad; script cargado por `ConsentScripts`. Placeholder en dev hasta tener dominio/cliente en producción.

**Notas técnicas (Fase 7, núcleo de horóscopos):**
- `features/horoscope/` (api+hooks+types) invoca la Edge Function `generate-horoscope` (pública). `<HoroscopeView scope>` resuelve el signo (parámetro de URL → `profiles.sun_sign` → selector), gestiona tabs de área y compone tarjeta + upsell + anuncio + picker de otros signos.
- `features/billing/useIsPremium()` (lectura de `subscriptions`) oculta anuncios a premium; se ampliará en Fase 8.
- Verificado: `typecheck`, `lint` y `build` OK. La generación real ya se validó en Fase 6 (hay cache de Leo/diario).
- **Pendiente de esta fase:** energía del día, eventos astrológicos, carta natal básica (con decisión de efemérides) y tarot simple.

---

## Fase 8 — Stripe y plan premium ✅

- [x] ⚠️ ACCIÓN MANUAL: cuenta de Stripe en modo test conectada vía MCP (entorno de prueba "Zodiaq", `acct_1Tb22qL1iRYuy62n`). **Resuelto por el usuario**: `STRIPE_PUBLISHABLE_KEY` en `.env.local` y `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`/`STRIPE_PRICE_*`/`SITE_URL` como Secrets de Edge Functions; webhook registrado en Stripe.
- [x] Crear producto en Stripe: "Zodiaq Premium" (`prod_UaCdVDWNgD6IFb`) con precio mensual 4,99 € (`price_1Tb2EnL1iRYuy62ndE0n6sjn`) y anual 49,99 € (`price_1Tb2ErL1iRYuy62nCNhQmArD`). Creados vía MCP.
- [x] Migración 0012 `stripe_events_idempotency.sql`: tabla `stripe_events(id text pk, type, received_at)` con RLS para descartar eventos duplicados del webhook.
- [x] Crear Edge Function `create-checkout-session` (verifica JWT, reutiliza/crea customer, genera Checkout hosted con metadata `user_id`+`plan`, locale `es`).
- [x] Crear Edge Function `stripe-webhook` (firma verificada con `STRIPE_WEBHOOK_SECRET`; procesa `checkout.session.completed`, `customer.subscription.created|updated|deleted`, `invoice.payment_failed`; upsert idempotente en `subscriptions` con conflict `user_id`; idempotencia por `event.id`).
- [x] Crear Edge Function `create-portal-session` (Customer Portal de Stripe, locale `es`).
- [x] Hook `useSubscription()` (ya existía en Fase 7) + `useStartCheckout()` + `useOpenPortal()` en `features/billing/hooks.ts`. `features/billing/api.ts` con `createCheckoutSession(plan)` y `createPortalSession()`.
- [x] Componente `<PremiumGate />` en `components/billing/PremiumGate.tsx` que envuelve funcionalidades premium con fallback a CTA de suscripción.
- [x] Página `/premium` con planes mensual/anual destacados, beneficios, FAQ y CTA al checkout (`pages/PremiumPage.tsx`). Manejo de retorno `?status=cancelled`.
- [x] Página `/perfil/suscripcion` con estado del plan, próxima renovación, botón "Gestionar suscripción" (Customer Portal) y refresco post-pago (`pages/SubscriptionPage.tsx`). Acceso desde el perfil con badge "Premium activo" / "Plan gratuito".
- [x] **Verificación end-to-end por el usuario**: alta con tarjeta de test `4242 4242 4242 4242` → Checkout → webhook escribe en `subscriptions` (status `active`) → `/perfil/suscripcion` muestra el plan activo y "Gestionar suscripción" abre el Customer Portal. **Funciona perfectamente.**

**Notas técnicas (Fase 8):**
- Smoke test previo de las 3 Edge Functions confirmó despliegue y lectura de secrets (401 sin token / 400 sin firma, en lugar de 500 por config faltante).
- Las claves de test viajaron por el chat; **recordatorio**: rotar `sk_test`/`whsec` antes de cualquier migración a producción (en test el riesgo es nulo).
- Acciones manuales (publishable key en `.env.local`, secrets en Supabase, webhook en Stripe con los 5 eventos) **completadas por el usuario**.

---

## Fase 9 — Funcionalidades premium ✅

- [x] `/carta-natal/completa` — interpretación detallada de las 12 casas y aspectos principales. Edge Function `generate-full-natal-chart` (`verify_jwt=false`, valida JWT a mano): calcula los **10 planetas** (Sol→Plutón, con retrógrados), **Medio Cielo** y **12 casas** por sistema de **signos enteros** (whole-sign, robusto sin fallos por latitud) y **aspectos mayores** con `astronomy-engine@2.1.19` server-side. **Verifica premium EN EL BACKEND** (active/trialing) y **generación única por usuario** blindada (si ya existe, la devuelve sin volver a llamar a Gemini). **Coherencia**: pasa a Gemini el texto de la carta básica para ampliarlo sin contradecirlo (regla #7 CLAUDE.md). Salida en 6 secciones + síntesis (1200-1800 palabras, temp 0.7, maxOutputTokens 4096). Guarda en `natal_charts` (is_full=true, no caduca). Frontend: `features/natal/` (tipos+api+hooks `useFullNatalChart`/`useGenerateFullNatalChart`), `pages/FullNatalChartPage.tsx` envuelta en `<PremiumGate>` con formulario hora+ciudad (prefill desde perfil) y resultado (mapa planetario + casas + aspectos + narrativa). Ruta `/carta-natal/completa` (protegida). Acceso directo desde la carta básica para usuarios premium. typecheck/lint/build OK.
- [x] `/compatibilidad/avanzada` — **"Compatibilidad avanzada"** (premium), formulario para dos personas, sinastría narrada por Gemini. Edge Function `generate-compatibility` (`verify_jwt=false`): calcula Sol/Luna/Mercurio/Venus/Marte (+Ascendente si hay hora) de **ambas personas** con `astronomy-engine`, computa **aspectos de sinastría cruzados** y un **score de afinidad determinista** (elementos + aspectos, sesgo "feel good" 55-98). **Premium en backend** + **dedupe por `pair_key`** simétrico (migración 0013) → re-consultar la misma pareja devuelve el informe guardado sin gastar tokens ni cuota. La hora/lugar son **opcionales**. Gemini narra 6 bloques (conexión, emoción, amor, roces, largo plazo, consejo), 900-1300 palabras, temp 0.75.
  - **Cuota (modelo de créditos, migración 0014):** columna `billing` en `compatibility_reports` ('included'|'paid') + tabla `compatibility_credits`. Cada premium tiene **1 generación incluida por mes natural**; agotada, devuelve `payment_required` (402). Generaciones extra a **1,99 €** por pago puntual (Stripe Checkout mode `payment`, función `create-compatibility-payment`); el `stripe-webhook` concede 1 crédito por pago (idempotente por `stripe_session_id`). Cada informe nuevo consume incluida-del-mes o un crédito (se marca `billing` y se consume el crédito tras guardar). Acceso permanente a todo el historial.
  - Frontend: `features/compatibility/` (tipos+api+hooks: `useGenerateCompatibility`, `useCompatibilityHistory`, `useCompatibilityQuota`, `useBuyCompatibilityCredit`), `pages/CompatibilityPage.tsx` con `<PremiumGate>`, formulario de 2 personas (A pre-rellenada del perfil), banner de cuota, botón "Generar otra por 1,99 €" cuando se agota, manejo de retorno `?status=paid/cancelled`, resultado (score + posiciones + aspectos + narrativa) e historial. Ruta `/compatibilidad/avanzada` (protegida). Accesos directos desde `/perfil/suscripcion`. typecheck/lint/build OK.
- [x] **Compatibilidad GRATUITA** (`/compatibilidad`, pública) — funcionalidad freemium separada de la avanzada: el usuario elige **2 signos** y consulta su compatibilidad. Contenido **100% estático en BBDD, sin Gemini**: tabla `sign_compatibility` (migración 0015, lectura pública por RLS) con las **78 combinaciones** (12 signos entre sí, incluido mismo signo), sembradas a mano vía generador determinista (`supabase/seed/gen-sign-compatibility.mjs` + `0016_seed_sign_compatibility.sql`). Cada combo tiene **score 40-95 coherente con el aspecto astrológico** (cuadratura/quincuncio bajos, trígono/sextil altos, espejo/oposición medios; spread real: 25 bajas / 17 medias / 36 altas) y campos típicos de webs de horóscopo (headline, overview, amor, pasión, comunicación, lo que une, retos, consejo) con técnicas Forer/psicológicas. Frontend `features/sign-compat/` + `pages/SignCompatibilityPage.tsx` (2 `Select`, resultado, `AdSlot`, **card de marketing hacia `/compatibilidad/avanzada`**). Enlace en NavBar. typecheck/lint/build OK.
- [x] `/reportes/mensual` y `/reportes/anual` — informes largos personalizados. Edge Function `generate-report` (`verify_jwt=false`, valida JWT a mano): **verifica premium en backend**, **generación única por usuario y periodo** (cache por `user_id`+`kind`+`period_start` → el informe del mes/año en curso se reutiliza sin volver a llamar a Gemini; control de coste). **Incluidos en premium** (sin créditos extra). Calcula la **carta natal** del usuario (Sol→Saturno + Ascendente/MC si hay hora/lugar) y los **tránsitos del periodo** (punto medio) con **aspectos tránsito↔natal** vía `astronomy-engine`. **Coherencia** (regla #7): al mensual le pasa el horóscopo mensual gratuito de su signo; al anual, su carta natal básica. Mensual = 7 secciones (overview/love/work/wellbeing/key_moments/advice + headline, 800-1200 palabras, maxTokens 2600); anual = 8 secciones (overview/first_half/second_half/love/career/growth/advice + headline, 1800-2500 palabras, maxTokens 5200), temp 0.7. Tabla `premium_reports` (migración 0017, RLS lectura propia). Frontend: `features/reports/` (tipos+api+hooks: `useCurrentReport`/`useGenerateReport`/`useReportHistory`/`useReportById`) + `pages/ReportsPage.tsx` (`<PremiumGate>`, formulario hora+ciudad opcional con prefill del perfil, mapa de tránsitos + aspectos + narrativa, historial de periodos). Rutas protegidas `/reportes/mensual` y `/reportes/anual`. Accesos directos desde `/perfil/suscripcion`. typecheck/lint/build OK.
- [x] `/tarot/avanzado` — tiradas complejas (cruz celta, herradura). Edge Function `generate-advanced-tarot` (`verify_jwt=false`, valida JWT a mano): **verifica premium en backend** (active/trialing) y baraja/roba las cartas en el servidor (78 cartas, normal/invertida, posiciones tradicionales fijas: 10 Cruz Celta, 7 Herradura). Gemini interpreta toda la tirada (significado por carta ligado a su posición + `overview` + `synthesis` + `advice`, temp 0.9, prompt psicológico Forer/lectura en frío) con `responseSchema`. Guarda en `tarot_readings` (`is_premium_spread=true`, `spread_type` ya admitía `celtic_cross`/`horseshoe`; `interpretation` = JSON con las 3 secciones narrativas). Sin cron ni cache compartida; el historial se conserva.
  - **Cuota (modelo de créditos POR TIPO, migración 0018):** columna `billing` en `tarot_readings` ('included'|'paid') + tabla `advanced_tarot_credits` (con `spread_type`). Cada premium tiene **1 generación incluida por mes natural de CADA tirada** (1 Cruz Celta + 1 Herradura, cuotas independientes); agotada la incluida de un tipo, devuelve `payment_required` (402). Tiradas extra de cada tipo a **1,79 €** por pago puntual (Stripe Checkout mode `payment`, función `create-advanced-tarot-payment` que recibe el `spread`); el `stripe-webhook` concede 1 crédito DEL TIPO comprado (idempotente por `stripe_session_id`). Cada tirada nueva consume la incluida-del-mes (de su tipo) o un crédito de ese mismo tipo (se marca `billing` y se consume el crédito tras guardar).
  - Frontend: `features/tarot/advanced-types.ts|advanced-api.ts|advanced-hooks.ts` (`useDrawAdvancedTarot`/`useAdvancedHistory`/`useAdvancedTarotQuota`/`useBuyAdvancedTarotCredit`, reutiliza `TarotCard`) + `pages/AdvancedTarotPage.tsx` (`<PremiumGate>`, selector de tirada, pregunta opcional, banner de cuota por tipo, botón "Hacer otra … por 1,79 €" cuando se agota, manejo de retorno `?status=paid/cancelled`, resultado con cartas + 3 secciones, historial desplegable). Ruta protegida `/tarot/avanzado`. Accesos: NavBar Premium, `/perfil/suscripcion`, y upsell del tarot simple (`UpsellCard` con prop `to`). Smoke test 401 sin token. typecheck/lint/build OK. **Verificado E2E por el usuario premium logueado** (cuota mensual por tipo + pago puntual 1,79 € operativos).
- [x] `/numerologia` — dos niveles, igual que la compatibilidad. **GRATUITA** (`/numerologia`, pública, con AdSense): a partir de la **fecha de nacimiento** calcula en el cliente el **número del camino de vida** (1-9, 11, 22, 33) y el **año personal** (1-9, según el año en curso) y muestra textos **fijos en BBDD** (`numerology_meanings`, lectura pública, RLS `select using(true)`), sembrados con `supabase/seed/gen-numerology.mjs` (21 filas: 12 camino de vida + 9 año personal; campos headline/tagline/essence/love/work/advice con técnicas Forer). `features/numerology/` (`calc.ts` reglas pitagóricas + `types.ts`/`api.ts`/`hooks.ts`) + `pages/NumerologyPage.tsx` (input de fecha con prefill del perfil, 2 cards de número + AdSlot + card de marketing hacia la premium). **PREMIUM** (`/numerologia/avanzada`, `<PremiumGate>`): "Tu lectura numerológica personal" narrada por Gemini. Edge Function `generate-numerology` (`verify_jwt=false`, valida JWT a mano): **premium en backend**, lee la `birth_date` del perfil, calcula camino de vida + año/mes personal + día de nacimiento, los integra en 7 secciones (headline/portrait/purpose/strengths/cycle/love/advice, temp 0.8, maxTokens 2400, prompt psicológico) con **enfoque opcional** (pregunta/área). **Cuota = 1 lectura incluida/mes natural + extras a 1,99 €** (tabla `numerology_credits` + columna `billing`; agotada → 402 `payment_required`; pago puntual `create-numerology-payment` mode `payment` → `stripe-webhook` handler `numerology_extra` concede crédito idempotente). `pages/AdvancedNumerologyPage.tsx` (preview de números, textarea de enfoque, banner de cuota, botón de pago extra, retorno `?status=paid`, resultado + historial `<details>`). Migración 0019 (esquema) + 0020 (seed). Enlace en NavBar; acceso premium desde `/perfil/suscripcion`. Smoke test 401 sin token. typecheck/lint/build OK. **Verificado E2E por el usuario** (gratuita + premium con cuota mensual y pago puntual operativos).
- [x] Ocultar todos los anuncios AdSense cuando `useSubscription().active === true`. Doble capa: (1) `components/ads/AdSlot.tsx` ya no renderiza ninguna unidad para premium (`useIsPremium()` → `return null`); (2) `features/legal/ConsentScripts.tsx` **no carga siquiera el script de terceros** `adsbygoogle.js` para usuarios premium (aunque hayan consentido marketing), de modo que el plan de pago no arrastra ni la librería ni el tracking de AdSense. La analítica no se toca. typecheck/lint/build OK.
- [x] **Modelo de cookies «consentir o suscribirse» (consent or pay).** El plan gratuito se financia con publicidad: para usarlo gratis hay que aceptar cookies de analítica+publicidad; la alternativa para no ver anuncios es **suscribirse a Premium** (no hay "rechazar y seguir gratis sin anuncios"). Base legal: **Guía de cookies AEPD (mayo 2024)** admite el muro con alternativa de pago real y precio razonable; el **CEPD 08/2024** solo endurece para "grandes plataformas" (no es nuestro caso). Implementado como **banner destacado, NO muro a pantalla completa** (respeta la regla SEO #12: el contenido sigue indexable). Cambios: `CookieBanner` (2 vías: «Aceptar y seguir gratis» / «Suscribirme sin anuncios» + «Configurar»), `CookiePreferences` (analítica = elección libre; publicidad ligada al plan, sin "rechazar gratis"; premium → publicidad off), `ConsentProvider` (sin `rejectAll`; banner oculto para premium), `LinkButton` admite `onClick`, `LEGAL_VERSION` 1.0→1.1 (re-pregunta), `CookiePolicyPage` y `docs/LEGAL_COMPLIANCE.md` actualizados con la base legal. typecheck/lint/build OK.
- [x] Asegurar coherencia con contenido gratuito previo (regla #7), **solo donde una premium continúa de una gratuita compartiendo contenido**. Auditoría: (a) **Carta natal completa** ya pasaba el texto de la carta básica a Gemini ✓; (b) **Reportes** ya reciben el horóscopo mensual gratuito (mensual) y la carta básica (anual) ✓; (c) **Numerología personal** → AÑADIDO: `generate-numerology` ahora carga de `numerology_meanings` los textos fijos del camino de vida y el año personal (lo que el usuario vio gratis) y se los pasa a Gemini para ampliarlos sin contradecirlos. **No aplica** a: **Tarot** (cada tirada es aleatoria e independiente, la premium no continúa una concreta) ni **Compatibilidad** (la gratuita es genérica signo×signo estática y la premium es sinastría personal persona×persona; no comparten texto). Smoke test 401 OK.

> **⚠️ PENDIENTE DE PRODUCCIÓN — activar anuncios reales de AdSense.** El mecanismo está implementado y blindado, pero hoy **no se muestra ningún anuncio real a nadie** porque faltan dos piezas que solo se configuran al publicar en el dominio: (1) `VITE_ADSENSE_CLIENT` está vacío, y (2) las páginas montan `<AdSlot />` **sin pasar `slot`** (el ID de unidad). **Checklist exacto de activación en `docs/INTEGRATIONS.md` §4** ("Checklist EXACTO para activar AdSense en producción"): crear unidades en AdSense, poner `VITE_ADSENSE_CLIENT=ca-pub-…`, pasar el `slot` a cada `<AdSlot>` (lista de ubicaciones documentada), y verificar (gratis+acepta→anuncios, gratis sin aceptar→no, premium→nunca).

---

## Fase 10 — SEO y rendimiento ✅

- [x] Metadatos por página con `react-helmet-async` (title, description, OG, Twitter Card). Componente central `<Seo>` en `apps/web/src/lib/seo.tsx` (con helper `absoluteUrl`): emite `<title>`, `meta description`, `canonical` (absoluta vía `company.siteUrl`, omitida en `noindex`), Open Graph (`og:site_name`/`og:locale=es_ES`/`og:type`/`og:title`/`og:description`/`og:url`/`og:image` opcional) y Twitter Card (`summary` o `summary_large_image` si hay imagen). Props: `title`, `description`, `path?`, `image?`, `type?` (`website`|`article`), `noindex?`. Refactorizadas TODAS las páginas que tenían `<Helmet>` suelto para usar `<Seo>`: HomePage, HoroscopeView (selector + por signo, `type=article`), EnergyOfDay (selector + por signo, `type=article`), AstroEvents, Numerología, SignCompatibility, Premium, NatalChart, Tarot, LegalPage (nuevo prop `path` + las 4 páginas legales lo pasan), y las `noindex` (AdvancedTarot, AdvancedNumerology, Compatibility avanzada, FullNatalChart, DataPrivacy, NotFound, AuthShell, Subscription, Profile, Reports). Corregidos canonicals inconsistentes previos (HomePage emitía `/` relativo; LegalPage apuntaba a la raíz). Imágenes OG todavía no incluidas (se añaden en la tarea de imágenes de esta fase; `image` queda opcional para no referenciar assets inexistentes). `HelmetProvider` ya estaba en `providers.tsx`. typecheck/lint/build OK.
- [x] Sitemap dinámico. Fuente de verdad tipada en `apps/web/src/lib/seo-routes.ts` (rutas estáticas indexables + variantes por signo derivadas de `ZODIAC_SIGNS`; `getSitemapEntries()` + `buildSitemapXml(siteUrl, lastmod)`). Generado en build por un plugin de Vite (`sitemapPlugin` en `vite.config.ts`, hook `generateBundle` → emite `dist/sitemap.xml`). **63 URLs**: 15 estáticas (home, 3 hubs de horóscopo, energía, eventos, tarot, carta natal, compatibilidad, numerología, premium, 4 legales) + 48 por signo (12 × diario/semanal/mensual/energía). Excluye `noindex` (cuenta, auth, premium personalizado). `changefreq`/`priority` por tipo y `<lastmod>` = fecha del build. La URL base sale de `VITE_SITE_URL` (`loadEnv`); en local cae a `localhost`, en producción toma el dominio real (acción pendiente: definir `VITE_SITE_URL`, ya listada en CLAUDE.md §7). Las páginas `/signo/{slug}` y `/compatibilidad/{a}-{b}` del SEO_STRATEGY.md NO se incluyen porque esas rutas aún no existen. typecheck/lint/build OK.
- [x] `robots.txt` permitiendo crawl excepto rutas de cuenta/auth/premium personalizado. Generado en build por el mismo plugin de Vite que el sitemap (`seoFilesPlugin`, antes `sitemapPlugin`) → emite `dist/robots.txt`. Builder `buildRobotsTxt(siteUrl)` en `seo-routes.ts`: `Allow: /` + `Disallow` de `/login`, `/registro`, `/recuperar-contrasena`, `/restablecer-contrasena`, `/perfil`, `/reportes`, `/tarot/avanzado`, `/numerologia/avanzada`, `/carta-natal/completa`, `/compatibilidad/avanzada` (subpaths premium específicos para no bloquear su variante gratuita indexable) + línea `Sitemap:` con la URL absoluta de `VITE_SITE_URL`. No hay `robots.txt` estático en `public/` (solo `favicon.svg`/`icons.svg`), sin conflicto. typecheck/lint/build OK.
- [x] Datos estructurados Schema.org (JSON-LD). Componente `<JsonLd>` + builders en `seo.tsx` (`websiteSchema`, `organizationSchema`, `articleSchema`, `productSchema`). Aplicado: **home** → `WebSite` + `Organization`; **horóscopo por signo** (`HoroscopeView`, rama con signo) → `Article` (`headline`/`description`/`inLanguage=es-ES`/`url`/`datePublished` = `period_start` de la respuesta o fecha de hoy/`author`+`publisher` Organization); **premium** → `Product` con dos `Offer` (mensual 4.99 €, anual 49.99 €, `InStock`). El JSON se serializa escapando `<` para no romper la etiqueta. Las páginas `/signo/{slug}` con `FAQPage` del SEO_STRATEGY.md NO se incluyen porque esas rutas aún no existen. typecheck/lint/build OK.
- [x] URLs limpias (kebab-case, en español). Verificado: todas las rutas indexables ya son kebab-case en español (`/horoscopo/diario/leo`, `/carta-natal/basica`, `/energia-del-dia/:sign`, `/eventos-astrologicos`, `/politica-de-privacidad`…). Definidas en `app/router.tsx`; no había nada que corregir.
- [x] **Code-splitting** (bundle). `manualChunks` en `vite.config.ts` separa las dependencias grandes en chunks de vendor cacheables: `vendor-react` (~62 kB gzip), `vendor-supabase` (~50 kB), `vendor-router` (~31 kB), `vendor-query` (~11 kB) y `vendor` (resto). El chunk `index` inicial baja de **634 kB → 36 kB** y desaparece el aviso de Rolldown de chunks >500 kB. Las páginas ya estaban lazy-loaded por ruta (Fase 1).
- [x] Imágenes optimizadas. La UI es SVG/emoji (sin rasters), así que no hay imágenes pesadas que convertir. Añadida **imagen de ejemplo de anuncio** en las cards de AdSense: SVG local `public/example-ad.svg` (banner con etiqueta «Anuncio · ejemplo») que se muestra en `<AdSlot>` mientras no haya AdSense real configurado, con `loading="lazy"`, `decoding="async"` y `width`/`height` explícitos (evita CLS). **El mecanismo de AdSense queda intacto**: premium→sin anuncios, el bloque `<ins>` real con `VITE_ADSENSE_CLIENT`+`slot` sustituirá automáticamente la imagen en producción (checklist sin cambios en `docs/INTEGRATIONS.md` §4).
- [x] Prefetch de rutas críticas. `app/route-prefetch.ts` (`prefetchRoute`) precarga el chunk de la ruta al pasar el ratón/enfocar los enlaces de la NavBar (`onMouseEnter`/`onFocus`), reutilizando el mismo `import()` perezoso del router (idempotente). Navegación posterior instantánea.
- [x] Lighthouse (mobile) medido por el usuario sobre el build (`npm run preview`, Chrome incógnito). **Resultados: Rendimiento 82 · Accesibilidad 95 · Prácticas recomendadas 100 · SEO 100.** Optimizaciones aplicadas: lazy routes, code-splitting de vendors, **fuentes de Google cargadas async** (preload+onload con fallback `<noscript>`, para no bloquear el render), `display=swap` + preconnect, imágenes lazy con `width`/`height`, sin JS de terceros salvo AdSense bajo consentimiento. El Rendimiento queda en 82 (por debajo del objetivo 90): los avisos restantes (FCP ~3 s en preview local, ~82 KiB de JS sin usar del framework/Supabase necesario al arranque, CLS leve por swap de fuentes) tienen retorno decreciente y riesgo; **se acepta 82 como suficiente para el TFM** (decisión del usuario). Nota: el FCP en `vite preview` local suele ser peor que en un CDN real de producción.

---

## Fase 10.5 — Rediseño visual (Frontend moderno) 🎨

> **Fase intermedia (previa a la 11), 100 % VISUAL.** Reconstruye la capa de presentación para que la plataforma quede como un producto listo para publicar: moderna, con animaciones, visualmente adictiva y profesional. **No cambia NADA de la lógica de las funcionalidades, ni los contratos de las Edge Functions, ni el modelo de datos, ni el routing funcional, ni la lógica de Stripe/Supabase/Gemini.** Respeta y conserva todo lo de las fases anteriores: **SEO** (metadatos `<Seo>`, Schema.org, sitemap, robots), **rendimiento** (lazy routes, code-splitting, fuentes async), **legal** (banner de cookies, modelo consent-or-pay, páginas legales), y el **mecanismo de AdSense** (incl. la imagen de ejemplo). Si un cambio visual amenaza algo de esto, se adapta sin romperlo.

### Decisiones tomadas (no volver a preguntar)
- **Animaciones:** `framer-motion` (paquete `motion`) para reveals al hacer scroll, aparición de cards, transiciones y micro-interacciones + CSS para lo simple. Siempre respetando `prefers-reduced-motion`.
- **Tipografía:** **Space Grotesk** (display, titulares grandes y contrastados) + **Inter** (texto). Google Fonts, carga async como ya está.
- **Iconos / arte:** **Lucide** (`lucide-react`, MIT) para la UI funcional + **arte cósmico propio** (gradientes, constelaciones SVG, estrellas, auras) por funcionalidad. **Prohibido** usar los glifos genéricos del zodiaco (♈♉…) como recurso visual principal.
- **Ejecución:** por secciones; el usuario revisa/aprueba cada sección antes de pasar a la siguiente.

### Principios de diseño (aplican a TODAS las tareas)
1. **Fondo blanco** + secciones/funcionalidades en **cards** modernas con colores vivos y temáticos (cada funcionalidad con su identidad visual propia y distinta).
2. **Contraste accesible (AA)**: nada de combinaciones que no se vean en pantallas con brillo alto o poca energía (p. ej. **gris claro sobre blanco prohibido**). Texto siempre legible.
3. **Aprovechar todo el ancho**: layouts a sangre (full-bleed), composiciones **asimétricas** y creativas, nada de "todo centrado y estrecho".
4. **Jerarquía tipográfica fuerte**: jugar con tamaños y pesos muy contrastados (titulares enormes, kicker, cuerpo).
5. **Animaciones que enganchan**: aparición progresiva al hacer scroll, micro-interacciones en hover/focus, transiciones suaves; sin marear (reduced-motion).
6. **Cada pestaña tiene su HERO SECTION** arriba (impactante, con copy de marketing/psicológico) y debajo el resto del contenido.
7. **Copys nuevos** de marketing y técnicas psicológicas (Forer, intriga, prueba social, urgencia suave) donde aporten — sin tocar el contenido generado por Gemini.
8. **Loaders/visualizaciones temáticas** mientras se genera contenido (animación cósmica, no un spinner soso).
9. **Routing por estado de usuario** intacto: cada CTA lleva a donde corresponde según anónimo / gratuito / premium.
10. **Quitar "beta"** y cualquier texto/placeholder con pinta de no-producción: la plataforma debe parecer ya publicada.

### 10.5.0 — Cimientos: sistema de diseño y primitivas ✅
- [x] Instaladas dependencias aprobadas: `framer-motion` + `lucide-react` (0 vulnerabilidades). `framer-motion` cae en el chunk `vendor` catch-all; `lucide-react` se tree-shakea hasta usarlo.
- [x] Tokens de diseño ampliados (`src/index.css` `@theme`): display **Space Grotesk** + Inter; `silver` oscurecido (#94a3b8→#64748b) para **contraste AA** sobre blanco; **8 familias temáticas** por funcionalidad (cosmos/tarot/astral/amor/numen/energy/celeste/gold, tonos 50/100/500/600/700, los 600/700 AA para texto); sombras `shadow-soft`/`shadow-lift`; utilidades `text-gradient`/`border-gradient`/`bg-animated`; animaciones como tokens `--animate-*` (float, twinkle, gradient-pan, shimmer, pulse-glow, spin-slow) + sus `@keyframes`. Verificado que las utilidades `animate-*` se generan en el CSS.
- [x] **Space Grotesk** cargada en `index.html` (async, reemplaza a Fraunces, junto a Inter) y mapeada como `--font-display`.
- [x] Primitivas de animación: `src/components/motion/Reveal.tsx` (`<Reveal>` scroll-reveal direccional, `<RevealStagger>`+`<RevealItem>` en cascada) con Framer Motion `whileInView`; hook `src/hooks/usePrefersReducedMotion.ts`. Todas **no-op con `prefers-reduced-motion`** (omiten props de animación, no pasan `undefined` por `exactOptionalPropertyTypes`).
- [x] Layout moderno: `src/components/layout/Section.tsx` (`<Section>` full-bleed con contenedor `narrow/default/wide/full` —`wide`=max-w-7xl para aprovechar ancho— y `<Bleed>` a sangre de viewport).
- [x] Arte cósmico: `src/components/visual/CosmicBackground.tsx` (`<CosmicBackground variant intensity stars>`: blobs de gradiente flotantes + estrellas parpadeantes, por tema; decorativo `aria-hidden`, `-z-10`).
- [x] `<Hero>` (`src/components/visual/Hero.tsx`): kicker + titular grande + subtítulo + CTAs + arte, composición **asimétrica** (texto izq. / arte der.) con fondo cósmico y entrada animada, parametrizable por `ThemeKey`. Sistema de temas central en `src/lib/feature-theme.ts` (`FEATURE_THEMES`/`featureTheme`).
- [x] UI base renovada manteniendo API: `Card` (+ tonos `glass`/`glow`, `shadow-soft`, lift al hover), `Button` (micro-interacciones: lift + scale en primary/secondary/premium), `Skeleton` (shimmer en vez de pulse). `Badge`/`Input`/`Select` ya cumplían contraste AA, sin cambios.
- [x] `<GeneratingLoader>` (`src/components/feedback/GeneratingLoader.tsx`): núcleo luminoso que late + órbita giratoria con estrellas + mensaje, temático por `variant`; accesible (`role=status`, `aria-live`).
- [x] Quitado el badge **"beta"** de la NavBar (y su import huérfano). typecheck/lint/build OK.

### 10.5.1 — Layout global (NavBar, Footer, transiciones) ✅
- [x] **NavBar moderna** (`components/layout/NavBar.tsx`): full-width (max-w-7xl), blur sticky con `shadow-soft`, **logo nuevo** (`components/layout/Logo.tsx`: orbe gradiente + `Sparkles` de Lucide + wordmark display, reutilizable, prop `tone` light/dark), **indicador activo animado** (subrayado con `layoutId="nav-underline"` que se desliza entre items vía Framer Motion; versión estática si reduced-motion), CTA premium destacada (gold + Sparkles), iconos Lucide (`Menu`/`X`/`Flame`), **menú móvil animado** (`AnimatePresence` height/opacity, spread condicional por `exactOptionalPropertyTypes`). Prefetch de rutas conservado. Badge "beta" eliminado. Copys CTA actualizados ("Empezar gratis").
- [x] **Footer moderno** (`components/layout/Footer.tsx`): fondo oscuro degradado (ink→cosmos-900) con **"Zodiaq" gigante a sangre como watermark** (bg-clip-text, ~22-26vw), 4 columnas (marca, Funcionalidades, Explora, Legal + configurar cookies), **newsletter visual** (input + botón, estado "gracias" local, SIN backend nuevo), redes (Instagram SVG inline —Lucide deprecó iconos de marca—, TikTok, X), **badges de confianza** (cifrado AES-256, RGPD, IA Gemini con iconos Lucide), estrellas decorativas, copyright dinámico. Contraste AA: texto slate-300/white sobre fondo oscuro.
- [x] **Transición de página** (`components/layout/PageTransition.tsx`): fundido+desplazamiento de entrada por ruta (`key={pathname}`, sin `AnimatePresence` para no chocar con Suspense de rutas lazy), no-op con reduced-motion. **`<ScrollToTop>`** (`components/layout/ScrollToTop.tsx`) resetea el scroll al cambiar de ruta. Ambos integrados en `Layout.tsx`. typecheck/lint/build OK.

### 10.5.2 — Home page (larga, scroll-reveal, profesional) ✅
- [x] **Hero** con `<Hero>` (full-bleed asimétrico, fondo cósmico, entrada animada): kicker con icono, titular grande con palabra en gradiente, subcopy marketing, **CTAs según estado** (anónimo→Empezar gratis/Ver Premium; logueado free→Mi horóscopo/Hazte Premium; premium→Mi horóscopo/Mi carta natal) y **`<HeroArt>`** decorativo (cards flotantes de horóscopo/energía/tarot con `animate-float`, oculto en móvil).
- [x] **12 cards de funcionalidad** (7 gratuitas + 5 premium), cada una con su **tema de color** (`feature-theme`), icono Lucide en orbe gradiente, copy psicológico y aparición en cascada (`RevealStagger`/`RevealItem`). **Routing por estado** en `<FeatureCard>`: gratuitas→su página; premium→su página si `useIsPremium()`, si no→`/premium`; CTA dinámico (Probar/Abrir/Desbloblequear). Sustituida la rejilla de glifos del zodiaco por una **tira de chips de texto por signo** (enlaces SEO a `/horoscopo/diario/:sign`, sin glifos genéricos).
- [x] **3 `<AdSlot>`** intercalados (tras gratuitas, tras premium, tras testimonios), en `<Section>` propias para que respiren.
- [x] Secciones profesionales: tira de stats (datos veraces, no inventados), **"cómo funciona"** en 3 pasos, gratuitas, premium, **comparativa free vs premium** (teaser → `/premium`), **testimonios** (prueba social), **FAQ** (`<details>` animado) y **CTA final** de conversión con fondo cósmico. Copys con técnicas de marketing/psicología.
- [x] SEO intacto: `<Seo>` + JsonLd (WebSite/Organization) conservados, **un solo `<h1>`** (en el Hero) y `<h2>` por sección con `aria-labelledby`, enlaces internos por signo. typecheck/lint/build OK (HomePage chunk 7,26 kB gzip).

### 10.5.3 — Autenticación (login / registro / recuperar / restablecer)
- [ ] Rediseño moderno y colorido **jugando con el nombre Zodiaq** (display gigante, gradientes, arte cósmico), layout **split asimétrico** (arte a un lado, formulario al otro), animaciones de entrada y de validación. Lógica de auth y validaciones **Zod intactas**.

### 10.5.4 — Funcionalidades gratuitas (cada una con diseño propio)
> Para cada una: Hero propio + explicación breve + el contenido/funcionalidad, con su **tema visual único**, scroll-reveal y `<GeneratingLoader>` temático al generar. **Gate de anónimo:** si el usuario NO está registrado, ve el hero + explicación + el formulario/UI, pero al pulsar "generar" se le redirige a **/login** sin llegar a generar nada (funnel de registro). **Conservando el SEO:** el contenido indexable que hoy se muestra a anónimos (p. ej. horóscopo por signo) se mantiene visible para no perder posicionamiento; el gate aplica a la acción de generar bajo demanda. Resolver caso por caso en implementación.
- [ ] Horóscopo diario/semanal/mensual (`HoroscopeView` + `AreaTabs`): tema "tiempo/tránsito".
- [ ] Energía del día: tema "medidor de energía" con visualización del nivel 1-10.
- [ ] Eventos astrológicos: tema "timeline / calendario celeste".
- [ ] Tarot simple: tema "cartas" con animación de barajado/volteo.
- [ ] Carta natal básica: tema "mapa estelar / rueda".
- [ ] Compatibilidad gratuita (signos): tema "dos energías que se encuentran".
- [ ] Numerología gratuita: tema "números / geometría sagrada".

### 10.5.5 — Funcionalidades premium (cada una con diseño propio)
> Igual que las gratuitas (hero, tema único, reveal, loader temático) + `<PremiumGate>` y banners de cuota rediseñados. Lógica premium/créditos/Stripe **intacta**.
- [ ] Carta natal completa: rueda natal visual.
- [ ] Compatibilidad avanzada: sinastría visual entre dos personas.
- [ ] Reportes mensual/anual: tema "informe editorial premium".
- [ ] Tarot avanzado: tiradas visuales (Cruz Celta / Herradura con posiciones).
- [ ] Numerología avanzada.
- [ ] Página `/premium`: pricing moderno, comparativa de planes, FAQ, prueba social.
- [ ] `/perfil`, `/perfil/datos`, `/perfil/suscripcion`: estilos nuevos aplicados.

### 10.5.6 — Legales y secundarias
- [ ] `LegalPage` con hero + estilos modernos manteniendo legibilidad (el **texto legal no se toca**).
- [ ] 404 renovada y on-brand.
- [ ] Banner/preferencias de cookies con el nuevo estilo (lógica de consentimiento y modelo consent-or-pay **intactos**).

### 10.5.7 — Pulido transversal, accesibilidad y verificación
- [ ] Auditoría de contraste AA en todo (eliminar grises ilegibles sobre blanco, etc.).
- [ ] `prefers-reduced-motion` respetado en todas las animaciones.
- [ ] Responsive verificado en todos los breakpoints, usando todo el ancho.
- [ ] Re-verificar que **SEO** (metadatos/Schema/sitemap/robots), **rendimiento** (Lighthouse no se hunde por las animaciones; medir de nuevo) y **legal** siguen OK.
- [ ] `typecheck` / `lint` / `build` limpios y confirmación de que **ninguna lógica de funcionalidad cambió** (solo capa visual + gate de anónimo).

---

## Fase 11 — Calidad, testing y pulido final

- [ ] Tests unitarios de funciones críticas (`getZodiacSign`, cálculo de rachas, cliente de Gemini).
- [ ] Tests de componentes clave (NavBar, Card de horóscopo, formulario de registro).
- [ ] Test E2E con Playwright: flujo de registro → ver horóscopo → suscribirse (modo test Stripe).
- [ ] Auditoría de seguridad: revisar lista de `docs/SECURITY.md` punto por punto.
- [ ] Auditoría legal: revisar lista de `docs/LEGAL_COMPLIANCE.md` punto por punto.
- [ ] Accesibilidad: navegación por teclado, contrastes AA, atributos ARIA donde aplique.
- [ ] Manejo de errores: pantallas de 404, 500, "no hay conexión", "límite de Gemini alcanzado".
- [ ] Empty states bonitos en todas las listas/historiales.

---

## Fase 12 — Memoria del TFM

- [ ] Esquema de la memoria académica (capítulos: introducción, estado del arte, análisis de competencia, requisitos, arquitectura, implementación, resultados, conclusiones, líneas futuras).
- [ ] Capturas de pantalla de cada funcionalidad para la memoria.
- [ ] Diagrama de arquitectura (Mermaid o draw.io).
- [ ] Diagrama de la base de datos (relacional).
- [ ] Apartado "Próximos pasos" mencionando el despliegue en Vercel y mejoras futuras.

---

## Cosas conscientemente FUERA del alcance del TFM

- Despliegue en producción en Vercel (se menciona como "siguientes pasos").
- App móvil nativa.
- Soporte multiidioma (solo español).
- Pasarela de pago alternativa a Stripe.
- Integración con redes sociales (login con Google, share-to-X, etc.) — puede mencionarse como futuro.

---

## Convenciones de las casillas

- `- [ ]` pendiente.
- `- [x]` completada y probada.
- `⚠️ ACCIÓN MANUAL:` requiere intervención externa (cuenta, API key, decisión de producto). La fase queda pausada hasta que se resuelva.
- Si una tarea genera subtareas no previstas, añadirlas justo debajo con sangría y marcarlas también.
