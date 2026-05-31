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
 * Hero reutilizable para la cabecera de cada página: kicker + titular grande +
 * subtítulo + CTAs, con fondo cósmico temático y entrada animada. Por defecto
 * usa una composición asimétrica (texto a la izquierda, arte a la derecha) que
 * aprovecha todo el ancho.
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
      className={cn('overflow-hidden pt-12 pb-14 sm:pt-16 sm:pb-20', className)}
    >
      <CosmicBackground variant={variant} intensity="normal" />

      <div
        className={cn(
          'grid items-center gap-10',
          art && !centered ? 'lg:grid-cols-[1.15fr_0.85fr]' : 'grid-cols-1',
        )}
      >
        <Reveal direction="up">
          <div className={cn(centered && 'mx-auto max-w-3xl text-center')}>
            {kicker && (
              <span
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold',
                  theme.bgSoft,
                  theme.text,
                )}
              >
                {kicker}
              </span>
            )}

            <h1
              className={cn(
                'mt-5 font-display font-bold tracking-tight text-ink',
                'text-4xl sm:text-5xl lg:text-6xl',
                'text-balance leading-[1.05]',
              )}
            >
              {title}
            </h1>

            {subtitle && (
              <p
                className={cn(
                  'mt-5 text-lg leading-relaxed text-graphite sm:text-xl',
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
