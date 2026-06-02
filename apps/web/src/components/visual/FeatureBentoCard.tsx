import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { featureTheme } from '@/lib/feature-theme';
import type { ThemeKey } from '@/lib/feature-theme';

/** Estrellas decorativas sutiles dentro de la card (toque "espacio"). */
const STAR_DOTS = [
  { top: 14, left: 16, size: 2, delay: 0 },
  { top: 22, left: 78, size: 3, delay: 0.6 },
  { top: 40, left: 90, size: 2, delay: 1.2 },
  { top: 30, left: 44, size: 2, delay: 0.9 },
  { top: 60, left: 24, size: 2, delay: 1.6 },
  { top: 16, left: 60, size: 2, delay: 0.3 },
];

export interface FeatureBentoCardProps {
  to: string;
  theme: ThemeKey;
  icon: LucideIcon;
  title: ReactNode;
  /** Frase de venta (distinta para cada funcionalidad). Admite <Shine>. */
  phrase: ReactNode;
  /** Etiqueta corta (pill) que distingue la card (p. ej. "cada día", "2 signos"). */
  tag?: string;
  cta?: string;
  premium?: boolean;
  /** Título más grande y arte mayor para las celdas grandes del bento. */
  featured?: boolean;
  /** Clases de span del grid (col-span/row-span). Controla el tamaño. */
  className?: string;
}

/**
 * Card de funcionalidad con FONDO DE COLOR VIVO (gradiente temático profundo),
 * texto blanco GRANDE con glow, frase de venta propia, etiqueta distintiva,
 * aura en movimiento e icono fantasma gigante. Reactiva al hover: se eleva,
 * intensifica el glow de su color y mueve el icono. El contenido se reparte a
 * lo alto para aprovechar el espacio (título abajo, etiqueta/icono arriba).
 */
export function FeatureBentoCard({
  to,
  theme,
  icon: Icon,
  title,
  phrase,
  tag,
  cta = 'Probar',
  premium = false,
  featured = false,
  className,
}: FeatureBentoCardProps) {
  const t = featureTheme(theme);

  return (
    <Link to={to} className={cn('group relative block', className)}>
      <article
        className={cn(
          'relative flex h-full min-h-[200px] flex-col overflow-hidden rounded-3xl p-6 sm:p-7',
          'bg-gradient-to-br text-white shadow-lift transition-all duration-300 ease-cosmic',
          'hover:-translate-y-2',
          t.gradient,
          t.glow,
          premium && 'ring-2 ring-gold-300/60',
        )}
      >
        {/* Aura blanca en movimiento */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-10 h-44 w-44 rounded-full bg-white/25 blur-3xl animate-drift"
        />
        {/* Acento dorado para las premium */}
        {premium && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-gold-400/30 blur-3xl animate-float-slow"
          />
        )}
        {/* Estrellas sutiles (toque "espacio") */}
        {STAR_DOTS.map((s, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full bg-white/70 animate-twinkle"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}

        {/* Icono fantasma gigante (más grande en las destacadas) */}
        <Icon
          aria-hidden="true"
          strokeWidth={1.3}
          className={cn(
            'pointer-events-none absolute text-white/10 transition-transform duration-500 ease-cosmic group-hover:scale-110 group-hover:-rotate-6',
            featured ? '-bottom-12 -right-10 h-80 w-80' : '-bottom-8 -right-6 h-52 w-52',
          )}
        />

        {/* Arriba: icono + etiqueta/insignia */}
        <div className="relative flex items-center justify-between gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
            <Icon className="h-6 w-6" strokeWidth={2.2} aria-hidden="true" />
          </span>
          {premium ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ring-white/30 backdrop-blur-sm">
              <Sparkles className="h-3 w-3" aria-hidden="true" /> Premium
            </span>
          ) : tag ? (
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ring-white/25 backdrop-blur-sm">
              {tag}
            </span>
          ) : null}
        </div>

        {/* Abajo (empujado con mt-auto): título grande con glow + frase + CTA */}
        <div className="relative mt-auto pt-6">
          <h3
            className={cn(
              'font-display font-extrabold leading-[0.92] tracking-tight text-white [text-shadow:0_0_30px_rgba(255,255,255,0.28)]',
              featured
                ? 'text-5xl sm:text-6xl lg:text-7xl'
                : 'text-[2rem] sm:text-4xl',
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              'mt-4 font-medium text-white/90',
              featured
                ? 'max-w-2xl text-xl sm:text-2xl'
                : 'text-base sm:text-lg',
            )}
          >
            {phrase}
          </p>
          <span
            className={cn(
              'mt-5 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold ring-1 backdrop-blur-sm transition-colors duration-300 sm:text-base',
              premium
                ? 'bg-gold-400/25 ring-gold-200/50 group-hover:bg-gold-400/45'
                : 'bg-white/15 ring-white/25 group-hover:bg-white/25',
            )}
          >
            {cta}
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-300 ease-cosmic group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </article>
    </Link>
  );
}
