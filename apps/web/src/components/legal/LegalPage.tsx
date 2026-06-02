import type { ReactNode } from 'react';
import { Scale } from 'lucide-react';
import { LEGAL_LAST_UPDATED, company } from '@/features/legal/company';
import { Seo } from '@/lib/seo';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';

interface LegalPageProps {
  /** Título visible y base del <title> del documento. */
  title: string;
  /** Descripción para SEO (<meta name="description">). */
  description: string;
  /** Ruta canónica del documento (p. ej. `/aviso-legal`). */
  path: string;
  /** Cuerpo del documento (encabezados h2, párrafos, listas...). */
  children: ReactNode;
}

const STARS = [
  { top: 18, left: 12, size: 2, delay: 0 }, { top: 30, left: 84, size: 2, delay: 0.7 },
  { top: 64, left: 8, size: 2, delay: 1.3 }, { top: 72, left: 90, size: 3, delay: 0.4 },
  { top: 44, left: 95, size: 1, delay: 1.1 }, { top: 26, left: 60, size: 2, delay: 1.6 },
  { top: 78, left: 30, size: 1, delay: 0.9 }, { top: 14, left: 38, size: 1, delay: 1.9 },
];

/**
 * Marco común de las páginas legales: hero, fecha de actualización y un
 * contenedor con estilos tipográficos aplicados por selector (no requiere el
 * plugin @tailwindcss/typography). El texto legal de cada página no se toca.
 */
export function LegalPage({ title, description, path, children }: LegalPageProps) {
  return (
    <>
      <Seo title={`${title} · ${company.brand}`} description={description} path={path} />

      {/* Hero legal */}
      <Section width="full" className="px-3 pt-4 sm:px-4 lg:px-6">
        <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-700 via-violet-700 to-indigo-950 px-6 py-12 text-white shadow-lift sm:px-12 sm:py-16">
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/25 via-black/5 to-black/45" />
          <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-violet-400/25 blur-3xl animate-float-slow" />
          <span aria-hidden="true" className="pointer-events-none absolute inset-0">
            {STARS.map((s, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-white shadow-[0_0_6px_2px_rgba(255,255,255,0.6)] animate-twinkle"
                style={{ top: `${s.top}%`, left: `${s.left}%`, width: `${s.size}px`, height: `${s.size}px`, animationDelay: `${s.delay}s` }}
              />
            ))}
          </span>
          <div className="relative z-10 mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.16em] text-white/90 ring-1 ring-white/30 backdrop-blur">
              <Scale className="h-4 w-4" aria-hidden="true" /> Información legal
            </span>
            <h1 className="mt-5 font-display text-4xl font-black leading-[1.02] tracking-tight [text-shadow:0_2px_18px_rgba(0,0,0,0.3)] sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-sm text-white/80 ring-1 ring-white/20 backdrop-blur">
              Última actualización: {LEGAL_LAST_UPDATED}
            </p>
          </div>
        </div>
      </Section>

      <Section width="default" className="py-8">
        <Reveal>
          <Card padding="lg" className="mx-auto max-w-3xl sm:p-10 lg:p-12">
            <article
              className={[
                'text-[1.05rem]',
                '[&_h2]:mt-10 [&_h2]:flex [&_h2]:items-center [&_h2]:gap-3 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:text-ink',
                "[&_h2]:before:h-6 [&_h2]:before:w-1.5 [&_h2]:before:rounded-full [&_h2]:before:bg-gradient-to-b [&_h2]:before:from-cosmos-500 [&_h2]:before:to-violet-600 [&_h2]:before:content-['']",
                '[&_h3]:mt-7 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-ink',
                '[&_p]:mt-3.5 [&_p]:leading-relaxed [&_p]:text-graphite',
                '[&_ul]:mt-3.5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:marker:text-cosmos-400',
                '[&_ol]:mt-3.5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_ol]:marker:text-cosmos-400',
                '[&_li]:leading-relaxed [&_li]:text-graphite',
                '[&_a]:font-medium [&_a]:text-cosmos-700 [&_a]:underline hover:[&_a]:text-cosmos-800',
                '[&_strong]:font-bold [&_strong]:text-ink',
                '[&_table]:mt-4 [&_table]:w-full [&_table]:overflow-hidden [&_table]:rounded-xl [&_table]:text-left [&_table]:text-sm',
                '[&_thead]:bg-mist/60',
                '[&_th]:border-b [&_th]:border-slate-200 [&_th]:px-3 [&_th]:py-2.5 [&_th]:font-bold [&_th]:text-ink',
                '[&_td]:border-b [&_td]:border-slate-100 [&_td]:px-3 [&_td]:py-2.5 [&_td]:align-top [&_td]:text-graphite',
              ].join(' ')}
            >
              {children}
            </article>
          </Card>
        </Reveal>
      </Section>
    </>
  );
}
