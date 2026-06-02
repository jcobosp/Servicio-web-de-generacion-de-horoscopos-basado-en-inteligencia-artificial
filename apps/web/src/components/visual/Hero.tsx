import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { featureTheme } from '@/lib/feature-theme';
import type { ThemeKey } from '@/lib/feature-theme';
import { Section } from '@/components/layout/Section';
import { CosmicBackground } from '@/components/visual/CosmicBackground';
import { Reveal } from '@/components/motion/Reveal';

interface HeroProps {
  variant?: ThemeKey;
  /** Texto pequeño superior (categoría/gancho). */
  kicker?: ReactNode;
  /** Titular principal (admite JSX para mezclar tamaños/gradientes). */
  title: ReactNode;
  /** Subtítulo/descripción. */
  subtitle?: ReactNode;
  /** Botones/acciones. */
  actions?: ReactNode;
  /** Arte/ilustración a la derecha (composición asimétrica). */
  art?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

/**
 * Hero reutilizable para la cabecera de cada página: kicker (chip de color
 * vivo) + titular display GORDO + subtítulo + CTAs, con fondo cósmico
 * temático y entrada animada. Composición asimétrica por defecto (texto a la
 * izquierda, arte a la derecha) que aprovecha todo el ancho.
 */
export function Hero({
  variant = 'cosmos',
  kicker,
  title,
  subtitle,
  actions,
  art,
  align = 'left',
  className,
}: HeroProps) {
  const theme = featureTheme(variant);
  const centered = align === 'center';

  return (
    <Section
      width="wide"
      className={cn('overflow-hidden pt-10 pb-12 sm:pt-14 sm:pb-16', className)}
    >
      <CosmicBackground variant={variant} intensity="normal" stars={!centered} />

      <div
        className={cn(
          'grid items-center gap-10',
          art && !centered ? 'lg:grid-cols-[1.05fr_0.95fr]' : 'grid-cols-1',
        )}
      >
        <Reveal direction="up">
          <div className={cn(centered && 'mx-auto max-w-3xl text-center')}>
            {kicker && (
              <span
                className={cn(
                  'inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-1.5 text-sm font-bold text-white shadow-lift',
                  theme.gradient,
                )}
              >
                {kicker}
              </span>
            )}

            <h1
              className={cn(
                'mt-6 font-display font-extrabold text-ink',
                'text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem]',
                'text-balance leading-[0.92] tracking-[-0.035em]',
              )}
            >
              {title}
            </h1>

            {subtitle && (
              <p
                className={cn(
                  'mt-6 text-lg leading-relaxed text-graphite sm:text-xl',
                  centered ? 'mx-auto max-w-2xl' : 'max-w-xl',
                )}
              >
                {subtitle}
              </p>
            )}

            {actions && (
              <div
                className={cn(
                  'mt-8 flex flex-wrap gap-3',
                  centered && 'justify-center',
                )}
              >
                {actions}
              </div>
            )}
          </div>
        </Reveal>

        {art && !centered && (
          <Reveal direction="left" delay={0.15}>
            <div className="relative">{art}</div>
          </Reveal>
        )}
      </div>
    </Section>
  );
}
