# DATABASE_SCHEMA.md — Esquema de Supabase

## Convenciones globales

- Todas las tablas usan `id uuid primary key default gen_random_uuid()` salvo cache key compuesto.
- `created_at timestamptz default now()` y `updated_at timestamptz default now()` en todas las tablas con datos mutables.
- Trigger genérico `set_updated_at` mantiene `updated_at`.
- **RLS activada en TODAS las tablas con datos de usuario** desde el primer momento.
- Nombres de tablas y columnas: `snake_case` en inglés.
- Las FKs hacen referencia a `auth.users(id)` cuando apuntan a un usuario.
- Los datos sensibles (hora y lugar de nacimiento) se guardan cifrados con `pgcrypto` (función `pgp_sym_encrypt`) usando una clave guardada en `vault.secrets`.

---

## Tablas

### `profiles`
Perfil público y configuración del usuario. Una fila por usuario, creada vía trigger `on_auth_user_created`.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` PK FK → `auth.users(id)` ON DELETE CASCADE | Mismo id que el user de auth |
| `display_name` | `text` NOT NULL | Solo el nombre, sin apellidos por defecto |
| `birth_date` | `date` NOT NULL | Para calcular signo |
| `sun_sign` | `text` NOT NULL CHECK (en los 12 signos) | Calculado en cliente, validado en server con función SQL |
| `birth_time` | `bytea` NULL | Cifrado con pgp_sym_encrypt si el usuario lo aporta |
| `birth_place` | `bytea` NULL | Cifrado |
| `birth_lat` | `numeric(7,4)` NULL | Para carta natal |
| `birth_lng` | `numeric(7,4)` NULL | Para carta natal |
| `timezone` | `text` NULL | IANA, ej. "Europe/Madrid" |
| `avatar_url` | `text` NULL | |
| `marketing_emails` | `boolean` NOT NULL DEFAULT false | Opt-in explícito |
| `created_at`, `updated_at` | `timestamptz` | |

**RLS:**
- SELECT: `auth.uid() = id`.
- UPDATE: `auth.uid() = id`.
- INSERT/DELETE: solo via service_role (trigger / delete-account function).

### `subscriptions`
Estado de la suscripción Stripe de cada usuario.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` PK | |
| `user_id` | `uuid` FK → `auth.users(id)` ON DELETE CASCADE UNIQUE | Una por usuario |
| `stripe_customer_id` | `text` UNIQUE NOT NULL | |
| `stripe_subscription_id` | `text` UNIQUE | |
| `status` | `text` NOT NULL | `active`, `trialing`, `past_due`, `canceled`, `incomplete`, `none` |
| `plan` | `text` NULL | `monthly`, `annual` |
| `current_period_end` | `timestamptz` NULL | |
| `cancel_at_period_end` | `boolean` NOT NULL DEFAULT false | |
| `created_at`, `updated_at` | `timestamptz` | |

**RLS:**
- SELECT: `auth.uid() = user_id`.
- INSERT/UPDATE/DELETE: solo service_role (lo escribe el webhook de Stripe).

### `horoscope_cache`
Contenido de horóscopos generado por Gemini, cacheado por signo y fecha. **Compartido entre todos los usuarios del mismo signo.**

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` PK | |
| `sun_sign` | `text` NOT NULL | |
| `scope` | `text` NOT NULL | `daily`, `weekly`, `monthly` |
| `area` | `text` NOT NULL | `general`, `love`, `health`, `money`, `work` |
| `period_start` | `date` NOT NULL | Día / lunes de la semana / 1º del mes |
| `content` | `jsonb` NOT NULL | `{ headline, body, lucky_number, lucky_color, mood, premium_hook }` |
| `model` | `text` NOT NULL DEFAULT 'gemini-2.5-flash' | Para trazabilidad |
| `created_at` | `timestamptz` | |

**Índice único:** `(sun_sign, scope, area, period_start)`.

**RLS:**
- SELECT: cualquier usuario autenticado (`auth.role() = 'authenticated'`). También `anon` puede leer sin sesión si interesa hacerlo público para SEO (decisión en Fase 7).
- INSERT/UPDATE/DELETE: solo service_role.

### `daily_energy`
Energía global del día (no depende del signo).

| Columna | Tipo |
|---|---|
| `id` `uuid` PK | |
| `date` `date` UNIQUE NOT NULL | |
| `content` `jsonb` NOT NULL | |
| `created_at` `timestamptz` | |

**RLS:** SELECT público, INSERT/UPDATE service_role.

### `astro_events`
Eventos astrológicos del mes (luna llena, retrógrados, eclipses, etc.). Se pueden generar mes a mes con Gemini.

| Columna | Tipo |
|---|---|
| `id` `uuid` PK | |
| `event_date` `date` NOT NULL | |
| `kind` `text` NOT NULL | |
| `title` `text` NOT NULL | |
| `description` `text` NOT NULL | |
| `is_premium` `boolean` DEFAULT false | |

**RLS:** SELECT a todos; service_role escribe.

### `tarot_readings`
Tiradas de tarot guardadas por usuario.

| Columna | Tipo | Notas |
|---|---|---|
| `id` `uuid` PK | | |
| `user_id` `uuid` FK | | |
| `spread_type` `text` NOT NULL | `one_card`, `three_cards`, `celtic_cross`, `horseshoe` |
| `is_premium_spread` `boolean` NOT NULL | | |
| `cards` `jsonb` NOT NULL | Cartas extraídas (id, posición, invertida) |
| `interpretation` `text` NOT NULL | Generada por Gemini |
| `question` `text` NULL | Pregunta opcional |
| `created_at` `timestamptz` | | |

**RLS:** SELECT/INSERT donde `auth.uid() = user_id`; UPDATE/DELETE igual.

### `natal_charts`
Cartas natales calculadas para usuarios premium.

| Columna | Tipo |
|---|---|
| `id` `uuid` PK | |
| `user_id` `uuid` FK | |
| `is_full` `boolean` NOT NULL | true = premium completa, false = básica (sol/luna/asc) |
| `planets` `jsonb` NOT NULL | posiciones planetarias |
| `houses` `jsonb` NOT NULL | casas |
| `aspects` `jsonb` NULL | aspectos (solo full) |
| `interpretation` `text` NOT NULL | Generada por Gemini |
| `created_at` `timestamptz` | |

**RLS:** SELECT/INSERT/DELETE donde `auth.uid() = user_id`.

### `compatibility_reports`
Sinastrías entre dos personas (premium).

| Columna | Tipo |
|---|---|
| `id` `uuid` PK | |
| `user_id` `uuid` FK | |
| `person_a_label` `text` NOT NULL | "Yo", "Mi pareja"... |
| `person_a` `jsonb` NOT NULL | datos natales (cifrados a nivel app) |
| `person_b_label` `text` NOT NULL | |
| `person_b` `jsonb` NOT NULL | |
| `score` `int` NOT NULL CHECK BETWEEN 0 AND 100 | |
| `report` `text` NOT NULL | |
| `created_at` `timestamptz` | |

**RLS:** SELECT/INSERT/DELETE donde `auth.uid() = user_id`.

### `streaks`
Racha de días consecutivos accediendo a la plataforma.

| Columna | Tipo |
|---|---|
| `user_id` `uuid` PK FK | |
| `current_streak` `int` NOT NULL DEFAULT 0 | |
| `longest_streak` `int` NOT NULL DEFAULT 0 | |
| `last_visit` `date` NULL | |
| `updated_at` `timestamptz` | |

**RLS:** SELECT/UPDATE donde `auth.uid() = user_id`; INSERT via función `increment_streak`.

### `user_events`
Eventos analíticos minimalistas para entender uso (no es Google Analytics).

| Columna | Tipo |
|---|---|
| `id` `uuid` PK | |
| `user_id` `uuid` NULL FK | NULL si anónimo |
| `event` `text` NOT NULL | `view_daily`, `view_premium`, `click_upsell`... |
| `payload` `jsonb` NULL | |
| `created_at` `timestamptz` | |

**RLS:** INSERT abierto a authenticated y anon; SELECT solo service_role.

### `legal_consents`
Registro de consentimientos legales para cumplimiento RGPD.

| Columna | Tipo |
|---|---|
| `id` `uuid` PK | |
| `user_id` `uuid` FK | |
| `consent_type` `text` NOT NULL | `terms`, `privacy`, `cookies_analytics`, `cookies_marketing`, `marketing_emails` |
| `version` `text` NOT NULL | versión del documento aceptado |
| `granted` `boolean` NOT NULL | |
| `ip_hash` `text` NOT NULL | SHA-256 de la IP (no la IP en claro) |
| `user_agent` `text` NULL | |
| `created_at` `timestamptz` | |

**RLS:** SELECT donde `auth.uid() = user_id`; INSERT via service_role.

---

## Funciones SQL

### `public.get_zodiac_sign(birth date) returns text`
Función inmutable que devuelve el signo solar dada una fecha. Se usa en checks y triggers para evitar que el cliente mienta sobre su signo.

### `public.handle_new_user() returns trigger`
Trigger en `auth.users` AFTER INSERT que crea la fila correspondiente en `profiles` con los datos de `raw_user_meta_data` (`display_name`, `birth_date`) y calcula `sun_sign` con `get_zodiac_sign`.

### `public.increment_streak() returns void`
Llamada por el cliente al cargar el dashboard. Si `last_visit < today`: incrementa `current_streak` si fue ayer, resetea a 1 si no. Actualiza `last_visit`.

### `public.is_premium(uid uuid) returns boolean`
`SELECT EXISTS (SELECT 1 FROM subscriptions WHERE user_id = uid AND status IN ('active','trialing'))`. Útil para políticas RLS de tablas premium.

---

## Índices

- `horoscope_cache (sun_sign, scope, area, period_start)` UNIQUE.
- `tarot_readings (user_id, created_at DESC)`.
- `natal_charts (user_id)`.
- `compatibility_reports (user_id, created_at DESC)`.
- `subscriptions (user_id)` UNIQUE.
- `user_events (created_at)` BRIN.

---

## Seguridad adicional

- `auth.users` permanece intacta (gestión de Supabase Auth).
- Nunca hacer FK a campos sensibles desde tablas inseguras.
- Las Edge Functions usan `service_role` solo para operaciones legítimas (escritura en `subscriptions` desde webhook, generación de cache, borrado de cuenta).
- Los borrados de cuenta son CASCADE para que un `auth.users DELETE` arrastre todo el dato del usuario.
- Snapshots automáticos de Supabase activados (en plan free son limitados — el usuario decide si paga el Pro durante el TFM).

---

## Plantilla de migración

`supabase/migrations/0001_init.sql` debe contener:

1. `CREATE EXTENSION IF NOT EXISTS pgcrypto;`
2. Función `get_zodiac_sign`.
3. `CREATE TABLE` para todas las tablas anteriores.
4. Trigger `set_updated_at` genérico.
5. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` en todas las tablas.
6. `CREATE POLICY ...` con las políticas descritas.
7. Función `handle_new_user` + trigger en `auth.users`.
8. Función `increment_streak`.
9. Función `is_premium`.
10. Índices.

Las migraciones se aplican con `supabase db push` (CLI local) o via MCP de Supabase (`apply_migration`).
