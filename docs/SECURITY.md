# SECURITY.md — Ciberseguridad

## 1. Modelo de amenazas resumen

| Activo | Amenaza | Mitigación |
|---|---|---|
| API keys (Gemini, Stripe, service_role) | Filtración pública / leak en cliente | Solo en Edge Functions, nunca en frontend, nunca en repo |
| Datos personales (fecha y datos natales) | Acceso no autorizado | RLS en Supabase + cifrado en columnas sensibles |
| Contraseñas | Robo de credenciales | Supabase Auth (bcrypt), HIBP check, rate-limit |
| Sesiones | Robo de JWT | Cookies httpOnly cuando se pueda, expiración corta, refresh tokens rotados |
| Pagos | Manipulación cliente / fraude | Stripe Checkout hosted + webhook verificado con secret |
| Endpoints serverless | Abuso / coste descontrolado | JWT auth + rate limiting + cuotas |
| XSS | Inyección por contenido de usuario o IA | Sanitización + React por defecto + CSP |
| CSRF | Acciones no autorizadas | Tokens de Supabase + SameSite + verificación de origen |
| Dependencias | Vulns conocidas | `npm audit` en CI, Dependabot equivalente |

## 2. Gestión de secretos

- **Cliente (`apps/web/.env.local`):** SOLO claves públicas.
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (anon key NO da acceso a datos sin RLS),
  - `VITE_STRIPE_PUBLISHABLE_KEY`,
  - `VITE_ADSENSE_CLIENT`.
- **Edge Functions (Supabase Secrets):**
  - `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL`.
- `.gitignore` desde el primer commit:
  ```
  node_modules/
  dist/
  .env
  .env.*
  !.env.example
  .vercel/
  .DS_Store
  Thumbs.db
  *.log
  coverage/
  playwright-report/
  ```
- **Pre-commit hook** (en Fase 1) que escanea diffs con un patrón básico de secretos (regex de `sk_`, `eyJ` prolongado, etc.). Si detecta, bloquea el commit.
- Si una clave se filtra: rotar inmediatamente en el proveedor + revisar logs.

## 3. Supabase Row Level Security

- **Toda tabla con `user_id` tiene RLS ON y políticas explícitas.** Comprobado con `select tablename, rowsecurity from pg_tables where schemaname='public'` después de cada migración.
- Política base: `auth.uid() = user_id` para SELECT/UPDATE/DELETE/INSERT propietario.
- Operaciones de servidor que deben bypassear RLS (webhook Stripe, generación de cache): usan `service_role` desde Edge Function, nunca desde cliente.
- **Nunca exponer `service_role` al cliente.** Esto se vigila en code review.

## 4. Cifrado de datos sensibles en BD

- Hora y lugar de nacimiento (campos `birth_time`, `birth_place`) se guardan como `bytea` cifrado simétrico con `pgcrypto.pgp_sym_encrypt` y una clave guardada en Supabase Vault (`vault.secrets`).
- Para leerlos, las Edge Functions usan `pgp_sym_decrypt` con la clave. El cliente nunca lee el bytea bruto.
- IPs en `legal_consents`: solo se guarda `SHA-256(ip + salt_secreto)`, nunca la IP en claro.
- Supabase ya cifra en reposo (AES-256) a nivel disco — esto es defensa en profundidad adicional.

## 5. Autenticación y sesiones

- Supabase Auth con email + password.
- Política de contraseñas (validación cliente y servidor): mínimo 8 chars, una mayúscula, una minúscula, un dígito.
- Comprobar contra **HIBP (Have I Been Pwned) k-Anonymity API** en el registro: si la contraseña aparece en breaches conocidos, rechazarla. Llamada client-side (no se envía la pass entera, solo los 5 primeros chars del SHA-1).
- Verificación de email obligatoria antes de acceder al producto.
- Refresh tokens rotados (Supabase lo hace por defecto).
- Sesión expira tras 7 días de inactividad.
- Cerrar sesión en TODOS los dispositivos disponible en `/perfil`.
- Captcha en formularios públicos (registro, login) si se detecta abuso — opcional, usando hCaptcha invisible (Cloudflare Turnstile como alternativa). Mencionable en "siguientes pasos" si no se implementa.

## 6. Edge Functions: seguridad

- Verificar JWT del usuario en cada función protegida (`auth.getUser(jwt)`).
- Validar payload con Zod (Deno) — rechazar payloads malformados.
- Rate limit por usuario: limitar generaciones a N/día (almacenar contador en `user_events` o en una tabla `rate_limits`).
- CORS restringido a dominios conocidos (`SITE_URL`).
- Logging de errores sin filtrar secretos.

## 7. Webhook de Stripe

- Verificar la firma con `stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)`. **Sin esta verificación, cualquiera podría falsificar pagos.**
- Idempotencia: usar `event.id` para evitar procesar el mismo evento dos veces (tabla `processed_stripe_events`).
- Procesar eventos relevantes: `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.payment_failed`.

## 8. CSP (Content Security Policy)

Configurar en hosting (Vercel headers, o un proxy). Política base:
```
default-src 'self';
script-src 'self' https://js.stripe.com https://pagead2.googlesyndication.com 'sha256-...';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https:;
connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com https://api.stripe.com;
frame-src https://js.stripe.com https://checkout.stripe.com;
object-src 'none';
base-uri 'self';
form-action 'self';
```

## 9. XSS / Inyección

- React escapa por defecto. Nunca usar `dangerouslySetInnerHTML` con contenido de usuario.
- Contenido de Gemini se renderiza como texto plano o con un Markdown sanitizado (`react-markdown` + `rehype-sanitize`).
- Inputs validados con Zod cliente + Edge Function.
- SQL: usar el cliente de Supabase (parametriza), nunca concatenar strings.

## 10. Logs y monitorización

- Logs de Supabase con `get_logs`.
- Eventos críticos a una tabla `audit_log` (opcional, premium TFM): cambios de email, eliminación de cuenta, fallos de pago.
- Alertas: configurar a posteriori (fuera del TFM, mencionar).

## 11. OWASP Top 10 — checklist específica del proyecto

- [ ] A01 Broken Access Control → RLS estricta.
- [ ] A02 Cryptographic Failures → HTTPS + cifrado columnas + Supabase Vault.
- [ ] A03 Injection → Cliente Supabase + Zod.
- [ ] A04 Insecure Design → Threat model + revisiones.
- [ ] A05 Security Misconfiguration → CSP + headers + no debug en prod.
- [ ] A06 Vulnerable Components → `npm audit` y Dependabot.
- [ ] A07 ID & Auth Failures → Supabase Auth + HIBP + verificación email.
- [ ] A08 Software/Data Integrity → Webhook signing.
- [ ] A09 Logging & Monitoring → audit_log + logs Supabase.
- [ ] A10 SSRF → Edge Functions no aceptan URLs arbitrarias del usuario.

## 12. Backups y recuperación

- Backups automáticos de Supabase (plan free: 1 día; Pro: 7 días). El usuario decide si paga Pro durante el TFM.
- Migraciones en `supabase/migrations/` versionadas en git → reproducibilidad total del esquema.

## 13. Borrado de cuenta (RGPD "derecho al olvido")

- Endpoint `delete-account` (Edge Function): borra `auth.users` → CASCADE limpia todas las tablas relacionadas.
- Solicitar confirmación por email antes (enviar link de confirmación con token de un solo uso).
- Conservar `legal_consents` con `user_id` NULL durante 6 años (obligación legal de demostrar consentimiento) — solo se borran datos personales identificativos, no la prueba de consentimiento (que ya iba con `ip_hash`, no con IP en claro).
