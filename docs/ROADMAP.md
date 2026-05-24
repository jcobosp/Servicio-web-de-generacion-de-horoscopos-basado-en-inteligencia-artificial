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

## Fase 7 — Funcionalidades gratuitas

- [x] Página `/horoscopo/diario` (carga por signo del usuario, fallback a selector `<SignPicker>` si no hay sesión). Acepta `/horoscopo/diario/:sign` (URLs limpias por signo, SEO).
- [x] Página `/horoscopo/semanal` y `/horoscopo/mensual` (misma estructura, vía `<HoroscopeView scope>`; navegación entre periodos en la cabecera).
- [x] Tabs por área: general, amor, salud, dinero, trabajo (`<AreaTabs>`).
- [ ] Página `/energia-del-dia` con la energía global de la jornada (independiente del signo).
- [ ] Página `/eventos-astrologicos` (lista de eventos del mes: lunas, tránsitos importantes).
- [ ] Página `/carta-natal/basica` — pide hora y lugar (opcional, con autocompletado de ciudades) y muestra Sol/Luna/Ascendente. **DECISIÓN (usuario):** calcular Luna/Ascendente con la librería de efemérides `astronomy-engine` (MIT, sin dependencias) en el cliente; el Sol ya sale de la fecha. Pendiente de implementar.
- [ ] Página `/tarot/simple` — tirada de 1 o 3 cartas (24 horas de cooldown gratuito).
- [x] Sistema de rachas: badge 🔥 en NavBar con días consecutivos; toasts de hito (3/7/14/30) vía RPC `increment_streak` al ver el horóscopo diario (`features/streaks/`).
- [x] Card de upsell al final de cada resultado gratuito (`<UpsellCard>`, copys de `docs/MARKETING_STRATEGY.md` + `premium_hook` de Gemini).
- [x] Integrar AdSense en las páginas gratuitas (`<AdSlot>`): solo plan free + consentimiento de publicidad; script cargado por `ConsentScripts`. Placeholder en dev hasta tener dominio/cliente en producción.

**Notas técnicas (Fase 7, núcleo de horóscopos):**
- `features/horoscope/` (api+hooks+types) invoca la Edge Function `generate-horoscope` (pública). `<HoroscopeView scope>` resuelve el signo (parámetro de URL → `profiles.sun_sign` → selector), gestiona tabs de área y compone tarjeta + upsell + anuncio + picker de otros signos.
- `features/billing/useIsPremium()` (lectura de `subscriptions`) oculta anuncios a premium; se ampliará en Fase 8.
- Verificado: `typecheck`, `lint` y `build` OK. La generación real ya se validó en Fase 6 (hay cache de Leo/diario).
- **Pendiente de esta fase:** energía del día, eventos astrológicos, carta natal básica (con decisión de efemérides) y tarot simple.

---

## Fase 8 — Stripe y plan premium

- [ ] ⚠️ ACCIÓN MANUAL: crear cuenta en [Stripe](https://stripe.com), activar modo test y obtener `publishable key` y `secret key` (la secret va a Edge Functions). Pasos en `docs/INTEGRATIONS.md` → Stripe.
- [ ] Crear producto en Stripe: "Zodiaq Premium" con dos precios: mensual y anual.
- [ ] Crear Edge Function `create-checkout-session` (genera URL de Checkout para el usuario).
- [ ] Crear Edge Function `stripe-webhook` que escucha `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` y actualiza la tabla `subscriptions`.
- [ ] Crear Edge Function `create-portal-session` (Customer Portal para gestionar suscripción).
- [ ] Página `/premium` con plan, beneficios, precio, CTA.
- [ ] Hook `useSubscription()` que lee la suscripción activa del usuario.
- [ ] Componente `<PremiumGate />` que envuelve funcionalidades premium.
- [ ] Página `/perfil/suscripcion` con estado, próxima factura, botón "Gestionar suscripción".

---

## Fase 9 — Funcionalidades premium

- [ ] `/carta-natal/completa` — interpretación detallada de las 12 casas y aspectos principales.
- [ ] `/compatibilidad` — formulario para dos personas, devuelve sinastría narrada por Gemini.
- [ ] `/reportes/mensual` y `/reportes/anual` — informes largos personalizados.
- [ ] `/tarot/avanzado` — tiradas complejas (cruz celta, herradura).
- [ ] `/numerologia` — cálculo de números clave + interpretación.
- [ ] Ocultar todos los anuncios AdSense cuando `useSubscription().active === true`.
- [ ] Asegurar coherencia con contenido gratuito previo (premium continúa de gratuito cuando aplique).

---

## Fase 10 — SEO y rendimiento

- [ ] Metadatos por página con `react-helmet-async` o equivalente (title, description, OG, Twitter Card).
- [ ] Sitemap dinámico (incluye una URL por signo y por scope).
- [ ] `robots.txt` permitiendo crawl excepto rutas de cuenta.
- [ ] Datos estructurados Schema.org (`WebSite`, `Article` en cada horóscopo).
- [ ] URLs limpias (kebab-case, en español: `/horoscopo/diario/leo`).
- [ ] Lighthouse score ≥ 90 en Performance, Accessibility, Best Practices, SEO en mobile.
- [ ] Imágenes optimizadas (`<img loading="lazy" />`, formatos modernos).
- [ ] Prefetch de rutas críticas.

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
