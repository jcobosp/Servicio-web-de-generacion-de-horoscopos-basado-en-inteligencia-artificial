import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { LEGAL_LAST_UPDATED, company } from '@/features/legal/company';

interface LegalPageProps {
  /** Título visible y base del <title> del documento. */
  title: string;
  /** Descripción para SEO (<meta name="description">). */
  description: string;
  /** Cuerpo del documento (encabezados h2, párrafos, listas...). */
  children: ReactNode;
}

/**
 * Marco común de las páginas legales: cabecera, fecha de actualización y un
 * contenedor con estilos tipográficos aplicados por selector (no requiere el
 * plugin @tailwindcss/typography).
 */
export function LegalPage({ title, description, children }: LegalPageProps) {
  return (
    <>
      <Helmet>
        <title>{`${title} · ${company.brand}`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${company.siteUrl}`} />
      </Helmet>

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="border-b border-slate-200 pb-6">
          <h1 className="font-display text-3xl text-ink sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-silver">
            Última actualización: {LEGAL_LAST_UPDATED}
          </p>
        </header>

        <div
          className={[
            'mt-8',
            '[&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:text-ink',
            '[&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-ink',
            '[&_p]:mt-3 [&_p]:leading-relaxed [&_p]:text-graphite',
            '[&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5',
            '[&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5',
            '[&_li]:text-graphite [&_li]:leading-relaxed',
            '[&_a]:text-cosmos-700 [&_a]:underline hover:[&_a]:text-cosmos-800',
            '[&_strong]:text-ink',
            '[&_table]:mt-4 [&_table]:w-full [&_table]:text-left [&_table]:text-sm',
            '[&_th]:border-b [&_th]:border-slate-200 [&_th]:py-2 [&_th]:pr-4 [&_th]:font-semibold [&_th]:text-ink',
            '[&_td]:border-b [&_td]:border-slate-100 [&_td]:py-2 [&_td]:pr-4 [&_td]:align-top [&_td]:text-graphite',
          ].join(' ')}
        >
          {children}
        </div>
      </article>
    </>
  );
}
