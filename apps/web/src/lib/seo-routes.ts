import { ZODIAC_SIGNS } from './zodiac';

/**
 * Fuente de verdad de las rutas indexables del sitio para el sitemap. Solo se
 * incluyen páginas públicas indexables: quedan FUERA las rutas de cuenta,
 * autenticación y las funcionalidades premium personalizadas (que llevan
 * `noindex`). Ver `docs/SEO_STRATEGY.md` §5.
 *
 * Este módulo no importa React a propósito: lo consume el plugin de Vite que
 * genera `sitemap.xml` en tiempo de build (ver `vite.config.ts`).
 */

export type ChangeFreq =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

export interface SitemapEntry {
  /** Ruta relativa (con `/` inicial). */
  path: string;
  changefreq: ChangeFreq;
  /** Prioridad relativa 0.0–1.0. */
  priority: number;
}

/** Rutas estáticas indexables (sin las variantes dinámicas por signo). */
const STATIC_ENTRIES: SitemapEntry[] = [
  { path: '/', changefreq: 'daily', priority: 1.0 },

  // Hubs de horóscopo (selector general por scope)
  { path: '/horoscopo/diario', changefreq: 'daily', priority: 0.9 },
  { path: '/horoscopo/semanal', changefreq: 'weekly', priority: 0.8 },
  { path: '/horoscopo/mensual', changefreq: 'monthly', priority: 0.8 },

  // Otras funcionalidades gratuitas
  { path: '/energia-del-dia', changefreq: 'daily', priority: 0.7 },
  { path: '/eventos-astrologicos', changefreq: 'weekly', priority: 0.7 },
  { path: '/tarot/simple', changefreq: 'weekly', priority: 0.7 },
  { path: '/carta-natal/basica', changefreq: 'monthly', priority: 0.7 },
  { path: '/compatibilidad', changefreq: 'monthly', priority: 0.7 },
  { path: '/numerologia', changefreq: 'monthly', priority: 0.7 },

  // Conversión
  { path: '/premium', changefreq: 'monthly', priority: 0.6 },

  // Legales
  { path: '/aviso-legal', changefreq: 'yearly', priority: 0.3 },
  { path: '/politica-de-privacidad', changefreq: 'yearly', priority: 0.3 },
  { path: '/terminos-y-condiciones', changefreq: 'yearly', priority: 0.3 },
  { path: '/politica-de-cookies', changefreq: 'yearly', priority: 0.3 },
];

/**
 * Devuelve todas las entradas indexables del sitio: las estáticas más las
 * variantes por signo del horóscopo (diario/semanal/mensual = 36 URLs) y de la
 * energía del día (12 URLs).
 */
export function getSitemapEntries(): SitemapEntry[] {
  const perSign: SitemapEntry[] = [];

  for (const sign of ZODIAC_SIGNS) {
    perSign.push(
      { path: `/horoscopo/diario/${sign}`, changefreq: 'daily', priority: 0.8 },
      { path: `/horoscopo/semanal/${sign}`, changefreq: 'weekly', priority: 0.7 },
      { path: `/horoscopo/mensual/${sign}`, changefreq: 'monthly', priority: 0.7 },
      { path: `/energia-del-dia/${sign}`, changefreq: 'daily', priority: 0.6 },
    );
  }

  return [...STATIC_ENTRIES, ...perSign];
}

/**
 * Prefijos de ruta que NO deben rastrearse: cuenta, autenticación y las
 * funcionalidades premium personalizadas (todas `noindex`). Los subpaths
 * premium son específicos para no bloquear su variante gratuita indexable
 * (p. ej. se bloquea `/tarot/avanzado` pero no `/tarot/simple`).
 */
const DISALLOWED_PATHS: string[] = [
  '/login',
  '/registro',
  '/recuperar-contrasena',
  '/restablecer-contrasena',
  '/perfil',
  '/reportes',
  '/tarot/avanzado',
  '/numerologia/avanzada',
  '/carta-natal/completa',
  '/compatibilidad/avanzada',
];

/**
 * Construye el `robots.txt`: permite el rastreo general, bloquea las rutas de
 * cuenta/auth/premium y enlaza el sitemap absoluto. Ver `docs/SEO_STRATEGY.md`
 * §5.
 */
export function buildRobotsTxt(siteUrl: string): string {
  const base = siteUrl.replace(/\/+$/, '');
  const disallow = DISALLOWED_PATHS.map((p) => `Disallow: ${p}`).join('\n');

  return `User-agent: *
Allow: /
${disallow}

Sitemap: ${base}/sitemap.xml
`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function joinUrl(siteUrl: string, path: string): string {
  const base = siteUrl.replace(/\/+$/, '');
  const rel = path.startsWith('/') ? path : `/${path}`;
  return `${base}${rel}`;
}

/**
 * Construye el XML del sitemap. `siteUrl` es la URL base del sitio (sin barra
 * final) y `lastmod` la fecha ISO `YYYY-MM-DD` que se usa como `<lastmod>` de
 * todas las entradas (la fecha del build, señal de frescura para el crawler).
 */
export function buildSitemapXml(siteUrl: string, lastmod: string): string {
  const urls = getSitemapEntries()
    .map((entry) => {
      const loc = escapeXml(joinUrl(siteUrl, entry.path));
      return [
        '  <url>',
        `    <loc>${loc}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority.toFixed(1)}</priority>`,
        '  </url>',
      ].join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}
