# Zodiaq — Plataforma web de horóscopos con IA

Trabajo Fin de Máster · Máster en Ingeniería de Telecomunicación
**Autor:** Jesús Cobos Pozo

Plataforma freemium de horóscopos, carta natal, tarot y compatibilidad astrológica, con contenido generado por inteligencia artificial (Gemini 2.5 Flash), pasarela de pago Stripe para el plan premium y monetización del plan gratuito vía Google AdSense.

## Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4 + React Router 6 + TanStack Query
- **Backend / BBDD:** Supabase (PostgreSQL + Auth + RLS + Edge Functions)
- **IA:** Google Gemini 2.5 Flash (vía Edge Functions, nunca desde el cliente)
- **Pagos:** Stripe Checkout + Customer Portal + Webhooks
- **Publicidad:** Google AdSense (solo plan gratuito)

## Estructura del repositorio

```
tfm/
├── docs/                     ← Documentación operativa del proyecto
│   ├── ROADMAP.md            ← Plan de fases con checkboxes
│   ├── ARCHITECTURE.md       ← Arquitectura técnica
│   ├── DATABASE_SCHEMA.md    ← Esquema Supabase + RLS
│   ├── DESIGN_SYSTEM.md      ← Sistema de diseño visual
│   ├── CONTENT_STRATEGY.md   ← Prompts Gemini + psicología del contenido
│   ├── MARKETING_STRATEGY.md ← Funnel freemium → premium
│   ├── SEO_STRATEGY.md       ← Posicionamiento orgánico
│   ├── SECURITY.md           ← Ciberseguridad y secretos
│   ├── LEGAL_COMPLIANCE.md   ← RGPD / LSSI / Cookies
│   └── INTEGRATIONS.md       ← Conexión paso a paso con servicios externos
├── apps/web/                 ← Aplicación React
└── supabase/                 ← Migraciones y Edge Functions (próximas fases)
```

## Arrancar en local

```bash
cd apps/web
cp .env.example .env.local   # rellenar con los valores reales (ver docs/INTEGRATIONS.md)
npm install
npm run dev                  # http://localhost:5173
```

### Scripts disponibles (apps/web)

| Script | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción (typecheck + bundle) |
| `npm run preview` | Servir el build localmente |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint con autofix |
| `npm run format` | Prettier escribiendo cambios |
| `npm run format:check` | Prettier en modo verificación |
| `npm run typecheck` | Solo type-checking de TypeScript |

## Estado del proyecto

Ver `docs/ROADMAP.md` para el avance detallado fase por fase, con casillas que se van marcando a medida que se completan las tareas.

## Próximos pasos (fuera del alcance del TFM)

- Despliegue en Vercel con dominio propio.
- Activación real de Google AdSense.
- Internacionalización (es-MX, en).
- App móvil nativa.
