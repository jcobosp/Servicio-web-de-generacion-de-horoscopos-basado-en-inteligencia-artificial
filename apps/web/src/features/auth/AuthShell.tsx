import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '@/lib/seo';

interface AuthShellProps {
  title: string;
  subtitle?: ReactNode;
  metaTitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({
  title,
  subtitle,
  metaTitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <>
      <Seo
        title={metaTitle}
        description="Accede a tu cuenta de Zodiaq para consultar tu horóscopo, tu carta natal y tus lecturas personalizadas."
        noindex
      />
      <div className="mx-auto flex max-w-md flex-col px-4 py-12 sm:py-16">
        <Link
          to="/"
          className="mx-auto mb-8 flex items-center gap-2 font-display text-2xl text-ink"
        >
          <span
            aria-hidden="true"
            className="text-3xl bg-gradient-to-br from-cosmos-600 via-aurora-500 to-gold-500 bg-clip-text text-transparent"
          >
            ✦
          </span>
          Zodiaq
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="font-display text-2xl text-ink">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-graphite">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && (
          <div className="mt-6 text-center text-sm text-graphite">{footer}</div>
        )}
      </div>
    </>
  );
}
