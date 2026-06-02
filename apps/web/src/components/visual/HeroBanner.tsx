import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { featureTheme } from '@/lib/feature-theme';
import type { ThemeKey } from '@/lib/feature-theme';
import { Section } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';

/** Estrellas decorativas deterministas (posición %, tamaño px, retardo s). */
const STARS: { top: number; left: number; size: number; delay: number }[] = [
  { top: 16, left: 12, size: 3, delay: 0 },
  { top: 26, left: 84, size: 2, delay: 0.7 },
  { top: 64, left: 8, size: 2, delay: 1.3 },
  { top: 72, left: 90, size: 3, delay: 0.4 },
  { top: 40, left: 94, size: 2, delay: 1.1 },
  { top: 80, left: 30, size: 2, delay: 0.9 },
  { top: 12, left: 60, size: 2, delay: 1.6 },
  { top: 84, left: 66, size: 3, delay: 0.5 },
  { top: 8, left: 32, size: 2, delay: 1.9 },
  { top: 20, left: 46, size: 2, delay: 0.3 },
  { top: 34, left: 22, size: 3, delay: 1.4 },
  { top: 48, left: 72, size: 2, delay: 0.6 },
  { top: 54, left: 40, size: 2, delay: 2.1 },
  { top: 58, left: 88, size: 2, delay: 1.0 },
  { top: 68, left: 54, size: 3, delay: 1.7 },
  { top: 90, left: 16, size: 2, delay: 0.2 },
  { top: 92, left: 48, size: 2, delay: 1.2 },
  { top: 30, left: 6, size: 2, delay: 2.3 },
  { top: 44, left: 60, size: 2, delay: 0.8 },
  { top: 76, left: 78, size: 2, delay: 1.5 },
];

interface HeroBannerProps {
  variant?: ThemeKey;
  kicker?: ReactNode;
  /** Titular: usa `<Shine gold>` para las palabras que brillan. */
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Marca gigante de fondo (watermark). Por defecto "Zodiaq". */
  watermark?: string;
  className?: string;
}

/**
 * Hero a modo de CARD GIGANTE que ocupa toda la sección: fondo de gradiente
 * temático profundo, marca gigante de fondo (watermark, como el footer pero
 * más llamativo), auras en movimiento y estrellas. Contenido CENTRADO con
 * titular blanco y palabras que brillan en dorado.
 */
export function HeroBanner({
  variant = 'cosmos',
  kicker,
  title,
  subtitle,
  actions,
  watermark = 'ZODIAQ',
  className,
}: HeroBannerProps) {
  const theme = featureTheme(variant);

  return (
    // La card sube hasta el tope (margen superior ≈ lateral) con un margen
    // negativo que la mete bajo la NavBar: la barra queda LEVITANDO por delante
    // (z-50, traslúcida) en su posición de siempre, pisando la parte alta.
    <Section
      width="full"
      className={cn('-mt-[60px] px-3 pb-10 sm:px-4 lg:px-6', className)}
    >
      <Reveal>
        <div
          className={cn(
            'relative isolate flex min-h-[58vh] flex-col items-center justify-center overflow-hidden rounded-[2.5rem] bg-gradient-to-br px-6 py-20 pt-28 text-center text-white shadow-lift sm:px-12 sm:py-24 sm:pt-28 lg:py-28 lg:pt-32',
            theme.gradient,
          )}
        >
          {/* Tinte oscuro para profundizar el morado del fondo */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-950/45 via-violet-950/30 to-indigo-950/55"
          />

          {/* Marca gigante de fondo */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <span className="block -translate-y-[8%] select-none whitespace-nowrap bg-gradient-to-b from-white/15 to-white/[0.15] bg-clip-text px-[0.12em] font-display text-[24vw] font-extrabold leading-none tracking-tighter text-transparent">
              {watermark}
            </span>
          </span>

          {/* Auras en movimiento */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-16 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl animate-drift"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 bottom-0 h-72 w-72 rounded-full bg-white/15 blur-3xl animate-float-slow"
          />

          {/* Estrellas */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-0">
            {STARS.map((s, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.8)] animate-twinkle"
                style={{
                  top: `${s.top}%`,
                  left: `${s.left}%`,
                  width: `${s.size}px`,
                  height: `${s.size}px`,
                  animationDelay: `${s.delay}s`,
                }}
              />
            ))}
          </span>

          {/* Contenido centrado */}
          <div className="relative z-10 mx-auto max-w-5xl">
            {kicker && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-base font-bold text-white ring-1 ring-white/30 backdrop-blur sm:text-lg">
                {kicker}
              </span>
            )}

            <h1 className="mt-8 text-balance font-display text-6xl font-extrabold leading-[0.9] tracking-[-0.035em] sm:text-7xl lg:text-8xl xl:text-[8rem]">
              {title}
            </h1>

            {subtitle && (
              <p className="mx-auto mt-8 max-w-3xl text-xl text-white/85 sm:text-2xl lg:text-[1.7rem]">
                {subtitle}
              </p>
            )}

            {actions && (
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                {actions}
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
