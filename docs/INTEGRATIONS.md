# INTEGRATIONS.md — Conexión paso a paso con servicios externos

> Guía operativa de los proveedores que la plataforma integra. Cada sección se divide en **Provisión** (lo que se configura en la consola del proveedor, manualmente) e **Integración en el código** (lo que entra en el repo).

---

## 1. Supabase

### Provisión
1. Crear cuenta en [supabase.com](https://supabase.com) (puede ser con GitHub).
2. **New Project**:
   - Nombre: `zodiaq-tfm` (o el que se prefiera).
   - Database password: generar contraseña fuerte y guardarla en un gestor.
   - Región: **Frankfurt (eu-central-1)** o **Paris (eu-west-3)** — debe ser UE por RGPD.
   - Plan: Free es suficiente para empezar.
3. Cuando termine de provisionarse, ir a **Project Settings → API** y copiar:
   - `Project URL`.
   - `anon public` key.
   - `service_role` key (mantenerla en secreto; nunca subirla al repositorio ni compartirla salvo necesidad estricta).
4. Subir el `service_role` como secret de Edge Functions desde el dashboard (Project Settings → Edge Functions → Secrets).

### Integración en el código
1. Verificar acceso con la CLI: `supabase projects list` debe mostrar el proyecto.
2. Verificar BBDD vacía con `supabase db dump` (o `supabase db pull`).
3. Aplicar migración inicial:
   - Crear `supabase/migrations/0001_init.sql` con el esquema de `DATABASE_SCHEMA.md`.
   - Aplicar con `supabase db push`.
4. Comprobar que las tablas existen: `supabase db dump --schema public --data-only=false | head`.
5. Ejecutar los Database Advisors desde el dashboard para detectar problemas de seguridad/perf y resolverlos.
6. Generar tipos TypeScript: `supabase gen types typescript --project-id <ref> > apps/web/src/types/supabase.ts`.
7. Añadir al `.env.local` del cliente:
   ```
   VITE_SUPABASE_URL=<url>
   VITE_SUPABASE_ANON_KEY=<anon>
   ```
8. Crear `apps/web/src/lib/supabase.ts`:
   ```ts
   import { createClient } from '@supabase/supabase-js';
   import type { Database } from '@/types/supabase';

   export const supabase = createClient<Database>(
     import.meta.env.VITE_SUPABASE_URL!,
     import.meta.env.VITE_SUPABASE_ANON_KEY!,
   );
   ```

### Edge Functions: setup
- Instalar el CLI local: `npm i -g supabase`.
- `supabase login` (browser).
- `supabase link --project-ref <ref>`.
- `supabase functions new generate-horoscope`.
- `supabase functions deploy generate-horoscope --no-verify-jwt` (o con verify si la función lo requiere).
- Configurar secrets: `supabase secrets set GEMINI_API_KEY=...`.

---

## 2. Gemini (Google AI / Vertex AI)

### Provisión
- API key creada en Google Cloud con límites de tokens configurados.
- Subirla como secret de Supabase (Edge Functions → Secrets): `GEMINI_API_KEY`.
- Confirmar que el modelo `gemini-2.5-flash` está habilitado en el proyecto de Google Cloud.

### Integración en el código
1. Implementar el cliente Gemini en `supabase/functions/generate-horoscope/gemini.ts`:
   ```ts
   const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`;
   const res = await fetch(url, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       contents: [{ role: 'user', parts: [{ text: prompt }] }],
       generationConfig: {
         temperature: 0.85,
         maxOutputTokens: 600,
         responseMimeType: 'application/json',
         responseSchema: { ... },
       },
     }),
   });
   ```
2. Validación de schema con Zod sobre la respuesta.
3. Cacheo en `horoscope_cache` antes de devolver.
4. Probar la función localmente con `supabase functions serve`.

---

## 3. Stripe

### Provisión
1. Crear cuenta en [stripe.com](https://stripe.com).
2. Activar **modo Test** (es el predeterminado al crear cuenta).
3. Crear el producto y los precios desde el dashboard (o con la API):
   - Producto: "Zodiaq Premium".
   - Precio mensual: 4,99 € recurrente cada mes.
   - Precio anual: 49,99 € recurrente cada año (≈ 2 meses gratis vs mensual).
4. **API keys** (Dashboard → Developers → API keys):
   - `Publishable key` (`pk_test_...`) → `.env.local` del cliente.
   - `Secret key` (`sk_test_...`) → secret de Supabase.
5. **Webhook** (Dashboard → Developers → Webhooks → Add endpoint):
   - URL: `https://<proj>.supabase.co/functions/v1/stripe-webhook`.
   - Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
   - Tras crearlo, copiar el `Signing secret` (`whsec_...`) → secret `STRIPE_WEBHOOK_SECRET`.
6. Anotar IDs de precio y subirlos como secrets `STRIPE_PRICE_MONTHLY` y `STRIPE_PRICE_ANNUAL`.

### Integración en el código
1. Tres Edge Functions:
   - `create-checkout-session`: crea una `checkout.Session` con `customer_email`, `price_id`, `mode: 'subscription'`, `success_url`, `cancel_url`, `metadata: { user_id }`.
   - `create-portal-session`: crea un `customer.portal` para el `stripe_customer_id` del usuario.
   - `stripe-webhook`: verifica firma con `STRIPE_WEBHOOK_SECRET`, procesa los eventos y actualiza la tabla `subscriptions` con `idempotencia` (event.id).
2. Cliente: instalar `@stripe/stripe-js` y crear `lib/stripe.ts` que llama a `create-checkout-session` y redirige a `session.url`.
3. Test E2E con tarjeta de prueba `4242 4242 4242 4242`, fecha futura cualquiera, CVC cualquiera.

### Migración de test a producción (fuera del TFM)
- Activar cuenta real en Stripe (verificación documental).
- Cambiar keys a `pk_live_`/`sk_live_`.
- Crear webhook en producción apuntando al dominio real.
- Mencionar en "siguientes pasos".

---

## 4. Google AdSense

### Provisión
1. Solo se puede dar de alta cuando el sitio esté publicado en un dominio. **AdSense requiere dominio en producción**, no localhost. En el TFM se aborda así:
   - Implementar el código y los slots correctamente con un `VITE_ADSENSE_CLIENT` placeholder.
   - Documentar la activación como "siguiente paso" cuando el sitio se publique.
   - Para pruebas locales se puede usar el **modo test de AdSense** con `data-adtest="on"`, que muestra anuncios de relleno.
2. Cuando llegue el momento real: solicitar AdSense en [adsense.google.com](https://adsense.google.com), añadir el dominio, esperar aprobación (días).
3. Recibir el `ca-pub-XXXXXXXXXXXXXXXX` y los IDs de slot por unidad publicitaria.

### Integración en el código (estado ACTUAL, ya implementado)
El mecanismo está completo y "blindado"; solo falta configurar el cliente y los IDs de slot al publicar (ver checklist más abajo).
1. **`features/legal/ConsentScripts.tsx`** inyecta el script `adsbygoogle.js?client=...` (async, `crossorigin="anonymous"`, una sola vez) **solo si**: hay consentimiento de marketing, existe `VITE_ADSENSE_CLIENT`, y el usuario **NO es premium** (`useIsPremium()`).
2. **`components/ads/AdSlot.tsx`** dibuja la unidad `<ins class="adsbygoogle" data-ad-client data-ad-slot data-ad-format="auto" data-full-width-responsive>` y dispara `(adsbygoogle = window.adsbygoogle || []).push({})`. **Solo renderiza un anuncio real si TODO se cumple**: `!isPremium && consent.marketing && VITE_ADSENSE_CLIENT && slot`. En `DEV` sin configurar muestra un placeholder gris (no en producción). Premium → `return null` (doble capa con el punto 1).
3. **Premium = sin anuncios** garantizado en dos capas (script no se carga + unidad no se pinta). El plan gratuito ve anuncios solo si acepta cookies de publicidad (modelo "consentir o suscribirse", ver `LEGAL_COMPLIANCE.md` §cookies).

### ✅ Checklist EXACTO para activar AdSense en producción
Cuando el sitio esté publicado en su dominio y AdSense aprobado:
1. **Crear las unidades** en AdSense (una por ubicación; recomendado: una unidad "display" responsive) y anotar cada `data-ad-slot` (ID numérico).
2. **Configurar el cliente**: poner `VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX` en las variables de entorno de producción (Vercel) y en `.env.local` para pruebas. (En `.env.example` queda vacío.)
3. **Pasar el `slot` a cada `<AdSlot>`**: hoy las páginas montan `<AdSlot />` **sin `slot`**, por lo que no se pinta anuncio aunque haya cliente. Hay que pasar el ID: `<AdSlot slot="1234567890" />`. El `<AdSlot>` está en **todas las páginas de funcionalidad + la home** (no en auth/legal/cuenta/venta); cada una renderiza uno siempre visible (anónimo y gratis; premium → null). Ubicaciones: `pages/HomePage.tsx`, `components/horoscope/HoroscopeView.tsx` (ambas ramas), `pages/EnergyOfDayPage.tsx` (ambas ramas), `pages/AstroEventsPage.tsx`, `pages/TarotPage.tsx`, `pages/NatalChartPage.tsx`, `pages/SignCompatibilityPage.tsx`, `pages/NumerologyPage.tsx`, y las premium `pages/FullNatalChartPage.tsx`, `pages/CompatibilityPage.tsx`, `pages/ReportsPage.tsx`, `pages/AdvancedTarotPage.tsx`, `pages/AdvancedNumerologyPage.tsx`. (Recomendado: centralizar el ID en una constante/`.env` y pasarlo a todas — `grep -rn "<AdSlot" apps/web/src`.)
4. **Pruebas locales**: añadir `data-adtest="on"` temporalmente en el `<ins>` de `AdSlot` para ver anuncios de relleno sin riesgo de clics inválidos.
5. **Verificar**: usuario gratis con cookies aceptadas → ve anuncios; usuario gratis sin aceptar → no; usuario premium → nunca (ni el script).
- Cumplir políticas de AdSense: contenido suficiente, navegación clara, sin clics propios, **sin anuncios en páginas legales ni en registro/checkout**.

---

## 5. Dominio y email (fuera del TFM, mencionado)

- Comprar dominio (`zodiaq.app` o similar) en un registrador.
- Configurar email transaccional: opciones recomendadas Resend (fácil), MailerSend, o el SMTP propio de Supabase (suficiente para recuperación de contraseña).
- **No implementar en el TFM,** solo documentar.

---

## 6. Vercel (despliegue) — siguientes pasos del TFM

- Conectar repo de GitHub a Vercel.
- Configurar variables de entorno en Vercel (mismas del `.env.local` salvo `VITE_SITE_URL` apuntando al dominio prod).
- Asegurar que **no se commitea ningún `.env` con valores reales**.
- Configurar headers de seguridad y CSP en `vercel.json`.

Este punto entra en la memoria del TFM como sección "Líneas futuras", no se ejecuta.

---

## 7. Resumen de variables de entorno consolidado

### `apps/web/.env.example` (commiteado, sin valores)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_ADSENSE_CLIENT=
VITE_SITE_URL=http://localhost:5173
```

### Supabase → Project Settings → Edge Functions → Secrets
```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_MONTHLY
STRIPE_PRICE_ANNUAL
SITE_URL
HIBP_USER_AGENT=zodiaq-tfm
COLUMN_ENC_KEY  (para pgp_sym_encrypt — generar valor aleatorio fuerte)
IP_HASH_SALT    (para hashear IPs en legal_consents)
```

---

## 8. Reglas operativas durante el setup

- Confirmar antes de operaciones que generan coste real (upgrade de plan, activación de webhooks live).
- No guardar claves sensibles en el código fuente bajo ninguna circunstancia.
- Trabajar exclusivamente en modo "test" de Stripe hasta que el proyecto se publique realmente.
- Aplicar las migraciones de Supabase en orden y nunca editar una migración ya aplicada — crear una nueva.
