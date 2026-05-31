/* eslint-disable react-refresh/only-export-components */
import { Helmet } from 'react-helmet-async';
import { company } from '@/features/legal/company';

/**
 * Convierte una ruta relativa (`/tarot/simple`) en una URL absoluta basada en
 * `company.siteUrl` (que en local es `http://localhost:5173` y en producción el
 * dominio real vía `VITE_SITE_URL`). Acepta URLs ya absolutas sin tocarlas.
 */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = company.siteUrl.replace(/\/+$/, '');
  const rel = path.startsWith('/') ? path : `/${path}`;
  return `${base}${rel}`;
}

export interface SeoProps {
  /** Título completo de la pestaña y de `og:title` / `twitter:title`. */
  title: string;
  /** Meta description (140-160 chars recomendado). */
  description: string;
  /**
   * Ruta canónica relativa (p. ej. `/horoscopo/diario/leo`). Si se omite, no se
   * emite `<link rel="canonical">` ni `og:url` (útil para páginas sin URL
   * canónica estable). En páginas `noindex` la canónica se omite igualmente.
   */
  path?: string;
  /**
   * Imagen para Open Graph / Twitter Card (ruta relativa o absoluta). Si se
   * indica, la Twitter Card pasa a `summary_large_image`. Si no, se emite una
   * `summary` sin imagen (las imágenes OG se añaden en la tarea de imágenes de
   * la Fase 10). Ver `docs/SEO_STRATEGY.md` §3.
   */
  image?: string;
  /** Tipo de Open Graph. `website` por defecto; `article` para contenido. */
  type?: 'website' | 'article';
  /** Excluye la página de los índices (cuenta, auth, premium personalizado). */
  noindex?: boolean;
}

/**
 * Metadatos SEO unificados para todas las páginas (title, description,
 * canonical, Open Graph y Twitter Card). Reemplaza los `<Helmet>` sueltos para
 * que cada página comparta el mismo contrato. Ver `docs/SEO_STRATEGY.md` §3.
 */
export function Seo({
  title,
  description,
  path,
  image,
  type = 'website',
  noindex = false,
}: SeoProps) {
  const url = path && !noindex ? absoluteUrl(path) : undefined;
  const imageUrl = image ? absoluteUrl(image) : undefined;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, follow" />}
      {url && <link rel="canonical" href={url} />}

      {/* Open Graph */}
      <meta property="og:site_name" content={company.brand} />
      <meta property="og:locale" content="es_ES" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {url && <meta property="og:url" content={url} />}
      {imageUrl && <meta property="og:image" content={imageUrl} />}

      {/* Twitter Card */}
      <meta
        name="twitter:card"
        content={imageUrl ? 'summary_large_image' : 'summary'}
      />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
    </Helmet>
  );
}

// ---------------------------------------------------------------------------
// Datos estructurados (Schema.org / JSON-LD). Ver `docs/SEO_STRATEGY.md` §4.
// ---------------------------------------------------------------------------

type JsonLdData = Record<string, unknown>;

/**
 * Inserta un bloque JSON-LD de datos estructurados. Serializa nosotros mismos
 * y escapamos `<` para no poder romper la etiqueta `</script>`.
 */
export function JsonLd({ data }: { data: JsonLdData }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}

/** Esquema `WebSite` de la marca (para la home). */
export function websiteSchema(): JsonLdData {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: company.brand,
    url: absoluteUrl('/'),
    inLanguage: 'es-ES',
    description:
      'Horóscopos diarios, semanales y mensuales personalizados por tu signo, carta natal, tarot y compatibilidad escritos por inteligencia artificial.',
  };
}

/** Esquema `Organization` de la marca (para la home). */
export function organizationSchema(): JsonLdData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.brand,
    url: absoluteUrl('/'),
  };
}

/** Esquema `Article` para una pieza de contenido (p. ej. un horóscopo). */
export function articleSchema(args: {
  headline: string;
  description: string;
  path: string;
  /** Fecha de publicación ISO (`YYYY-MM-DD` o completa). */
  datePublished: string;
}): JsonLdData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: args.headline,
    description: args.description,
    inLanguage: 'es-ES',
    url: absoluteUrl(args.path),
    datePublished: args.datePublished,
    author: { '@type': 'Organization', name: company.brand },
    publisher: { '@type': 'Organization', name: company.brand },
  };
}

/** Esquema `Product` con sus ofertas (para la página premium). */
export function productSchema(args: {
  name: string;
  description: string;
  path: string;
  offers: { price: string; priceCurrency: string; description: string }[];
}): JsonLdData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: args.name,
    description: args.description,
    url: absoluteUrl(args.path),
    brand: { '@type': 'Brand', name: company.brand },
    offers: args.offers.map((o) => ({
      '@type': 'Offer',
      price: o.price,
      priceCurrency: o.priceCurrency,
      description: o.description,
      availability: 'https://schema.org/InStock',
      url: absoluteUrl(args.path),
    })),
  };
}
