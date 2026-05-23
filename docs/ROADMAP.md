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

## Fase 2 — Sistema de diseño y layout global

- [ ] Definir tokens de Tailwind (colores, sombras, radios, espaciados) según `docs/DESIGN_SYSTEM.md`.
- [ ] Definir la paleta de colores por signo (`signColors`) en un módulo central.
- [ ] Crear componentes base: `Button`, `Card`, `Badge`, `Input`, `Select`, `Modal`, `Toast`, `Skeleton`.
- [ ] Crear `<NavBar />` sticky superior (logo, links, login/perfil, indicador premium).
- [ ] Crear `<Footer />` con enlaces legales, RRSS placeholder y copyright.
- [ ] Crear `<Layout />` que envuelve todas las páginas (NavBar + outlet + Footer).
- [ ] Implementar `useScrollDirection` para animar la NavBar (opcional).
- [ ] Crear un componente `<SignCard />` reutilizable (icono, nombre, colores del signo).
- [ ] Crear página `/` (landing) con hero, grid de 12 signos, sección de funcionalidades, CTA premium.
- [ ] Diseño 100% responsive (mobile-first). Probar en 360px, 768px, 1280px.
- [ ] Smoke test visual: capturas de la landing en escritorio y móvil.

---

## Fase 3 — Supabase: proyecto, esquema y RLS

- [ ] ⚠️ ACCIÓN MANUAL: crear proyecto en [Supabase](https://supabase.com) y compartir `Project URL` y `anon public key`. Pasos detallados en `docs/INTEGRATIONS.md` → sección Supabase.
- [ ] ⚠️ ACCIÓN MANUAL: guardar la `service_role key` en un gestor de secretos personal (NO entregarla por chat sin necesidad — solo se usa en Edge Functions).
- [ ] Instalar `@supabase/supabase-js` en `apps/web`.
- [ ] Crear `apps/web/src/lib/supabase.ts` con el cliente configurado por env vars.
- [ ] Crear `supabase/migrations/0001_init.sql` con tablas según `docs/DATABASE_SCHEMA.md`:
  - `profiles`, `subscriptions`, `horoscope_cache`, `tarot_readings`, `natal_charts`, `compatibility_reports`, `streaks`, `user_events`, `legal_consents`.
- [ ] Activar RLS en TODAS las tablas y escribir las políticas indicadas en `docs/DATABASE_SCHEMA.md`.
- [ ] Crear funciones SQL auxiliares: `get_zodiac_sign(birth_date date)`, `increment_streak(user_id uuid)`.
- [ ] Crear trigger `on_auth_user_created` que cree la fila en `profiles` cuando se registra un usuario en `auth.users`.
- [ ] Ejecutar las migraciones contra el proyecto Supabase y verificar con `list_tables`.
- [ ] Ejecutar el advisor de Supabase y resolver cualquier warning de seguridad/performance.

---

## Fase 4 — Autenticación de usuarios

- [ ] Crear `features/auth/` con: `SignInPage`, `SignUpPage`, `ForgotPasswordPage`, `ResetPasswordPage`.
- [ ] Formulario de registro con validación (Zod o similar): email, contraseña (mínimo 8 chars, 1 mayúscula, 1 número), nombre, fecha de nacimiento (date picker), checkboxes obligatorios de T&C y Política de Privacidad.
- [ ] Calcular signo solar a partir de la fecha de nacimiento en el cliente (`getZodiacSign(date)`).
- [ ] Llamar a `supabase.auth.signUp()` y guardar en `profiles` (vía trigger) el `display_name`, `birth_date`, `sun_sign` y los consentimientos en `legal_consents`.
- [ ] Implementar inicio de sesión, cerrar sesión, recuperar contraseña.
- [ ] Crear hook `useAuth()` (envuelve `supabase.auth.onAuthStateChange`).
- [ ] Crear `<ProtectedRoute />` que redirige a `/login` si no hay sesión.
- [ ] Página `/perfil` con datos del usuario, botón de cerrar sesión, opción de editar perfil (nombre, hora y lugar de nacimiento opcionales para carta natal).
- [ ] Página `/perfil/datos` para descargar/eliminar datos (derecho RGPD).
- [ ] Implementar verificación de email obligatoria antes de acceder al producto.

---

## Fase 5 — Cumplimiento legal (RGPD / LSSI / Cookies)

- [ ] Páginas estáticas: `/aviso-legal`, `/politica-de-privacidad`, `/terminos-y-condiciones`, `/politica-de-cookies`. Plantillas base en `docs/LEGAL_COMPLIANCE.md`.
- [ ] ⚠️ ACCIÓN MANUAL: rellenar los datos del responsable (nombre, NIF/DNI, email de contacto) en las plantillas legales.
- [ ] Banner de cookies con consentimiento granular (técnicas / analíticas / publicidad) — sin "accept all" por defecto.
- [ ] Bloquear scripts de AdSense y analíticas hasta que el usuario consienta.
- [ ] Guardar el consentimiento en `legal_consents` (versión, timestamp, IP hasheada).
- [ ] Enlaces a las páginas legales desde el footer y desde los checkboxes del registro.
- [ ] Implementar endpoint de "Exportar mis datos" (descarga JSON con todos los datos del usuario).
- [ ] Implementar endpoint de "Eliminar mi cuenta" (borrado real, no soft delete, con confirmación por email).

---

## Fase 6 — Motor de generación de horóscopos (Gemini)

- [ ] ⚠️ ACCIÓN MANUAL: confirmar la API key de Gemini disponible en Google Cloud y los límites de tokens. Compartir como secreto de Supabase (NO en .env del cliente). Pasos en `docs/INTEGRATIONS.md` → sección Gemini.
- [ ] Crear Edge Function `supabase/functions/generate-horoscope/index.ts`.
- [ ] Implementar dentro: llamada a Gemini 2.5 Flash con prompts de `docs/CONTENT_STRATEGY.md`, control de longitud por tipo de contenido, validación del JSON de salida.
- [ ] Implementar cache: si ya existe fila en `horoscope_cache` para `(sun_sign, scope, area, date)`, devolverla; si no, generar, guardar y devolver.
- [ ] Implementar control de coste: si el contador diario de la función supera el límite, devolver contenido del día anterior o un mensaje suave.
- [ ] Test manual: invocar la función desde un script y verificar formato, longitud y tono.

---

## Fase 7 — Funcionalidades gratuitas

- [ ] Página `/horoscopo/diario` (carga por signo del usuario, fallback a selector si no hay sesión).
- [ ] Página `/horoscopo/semanal` y `/horoscopo/mensual` (misma estructura).
- [ ] Tabs por área: general, amor, salud, dinero, trabajo.
- [ ] Página `/energia-del-dia` con la energía global de la jornada (independiente del signo).
- [ ] Página `/eventos-astrologicos` (lista de eventos del mes: lunas, tránsitos importantes).
- [ ] Página `/carta-natal/basica` — pide hora y lugar (opcional, con autocompletado de ciudades) y muestra Sol/Luna/Ascendente.
- [ ] Página `/tarot/simple` — tirada de 1 o 3 cartas (24 horas de cooldown gratuito).
- [ ] Sistema de rachas: badge en NavBar con días consecutivos, animación al subir.
- [ ] Card de upsell al final de cada resultado gratuito (copys en `docs/MARKETING_STRATEGY.md`).
- [ ] Integrar AdSense en las páginas gratuitas según pautas de `docs/INTEGRATIONS.md` → AdSense.

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
