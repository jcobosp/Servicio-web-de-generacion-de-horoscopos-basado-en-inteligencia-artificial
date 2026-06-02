import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Moon, ShieldCheck, Stars } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Seo } from '@/lib/seo';
import { cn } from '@/lib/cn';
import { featureTheme } from '@/lib/feature-theme';
import type { ThemeKey } from '@/lib/feature-theme';
import { Reveal } from '@/components/motion/Reveal';
import { Shine } from '@/components/visual/Shine';

interface AuthShellProps {
  title: string;
  subtitle?: ReactNode;
  metaTitle: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Tema de color del panel cósmico (por defecto cosmos). */
  variant?: ThemeKey;
  /** Titular grande del panel de arte (juega con la marca). */
  pitch?: ReactNode;
  /** Ventajas listadas en el panel de arte. */
  highlights?: { icon: LucideIcon; text: string }[];
}

/** Estrellas decorativas deterministas del panel de arte (% y retardo). */
const STARS: { top: number; left: number; size: number; delay: number }[] = [
  { top: 14, left: 18, size: 3, delay: 0 },
  { top: 22, left: 82, size: 2, delay: 0.7 },
  { top: 38, left: 8, size: 2, delay: 1.3 },
  { top: 30, left: 60, size: 2, delay: 0.4 },
  { top: 56, left: 88, size: 3, delay: 1.1 },
  { top: 64, left: 24, size: 2, delay: 0.9 },
  { top: 78, left: 70, size: 2, delay: 1.6 },
  { top: 84, left: 40, size: 3, delay: 0.5 },
  { top: 48, left: 44, size: 2, delay: 2.0 },
  { top: 12, left: 46, size: 2, delay: 1.4 },
];

const DEFAULT_HIGHLIGHTS: { icon: LucideIcon; text: string }[] = [
  { icon: Sparkles, text: 'Lecturas escritas con IA, distintas cada día' },
  { icon: Moon, text: 'Tu signo y tu carta natal al instante' },
  { icon: ShieldCheck, text: 'Tus datos cifrados y protegidos (RGPD)' },
];

/** Marca pequeña reutilizable (orbe + wordmark) que enlaza al inicio. */
function BrandLink({ tone }: { tone: 'light' | 'dark' }) {
  return (
    <Link
      to="/"
      className={cn(
        'inline-flex items-center gap-2 font-display text-xl font-extrabold tracking-tight',
        tone === 'dark' ? 'text-white' : 'text-ink',
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-xl shadow-soft',
          tone === 'dark'
            ? 'bg-white/15 ring-1 ring-white/30 backdrop-blur'
            : 'bg-gradient-to-br from-cosmos-600 via-aurora-500 to-tarot-500',
        )}
      >
        <Stars className="h-5 w-5 text-white" aria-hidden="true" />
      </span>
      Zodiaq
    </Link>
  );
}

/**
 * Marco de las páginas de autenticación: split asimétrico a sangre. A la
 * izquierda, un panel cósmico de color vivo que juega con la marca «Zodiaq»
 * (titular gigante, brillo dorado, auras y estrellas en movimiento); a la
 * derecha, la tarjeta del formulario sobre blanco. En móvil el panel de arte
 * pasa arriba (compacto) y el formulario debajo. Solo capa visual: la lógica
 * de auth y las validaciones Zod viven en las páginas.
 */
export function AuthShell({
  title,
  subtitle,
  metaTitle,
  children,
  footer,
  variant = 'cosmos',
  pitch,
  highlights = DEFAULT_HIGHLIGHTS,
}: AuthShellProps) {
  const theme = featureTheme(variant);

  return (
    <>
      <Seo
        title={metaTitle}
        description="Accede a tu cuenta de Zodiaq para consultar tu horóscopo, tu carta natal y tus lecturas personalizadas."
        noindex
      />

      <div className="w-full px-3 pb-10 pt-4 sm:px-4 lg:px-6">
        <div className="grid min-h-[82vh] overflow-hidden rounded-[2.5rem] shadow-lift lg:grid-cols-[1.05fr_0.95fr]">
          {/* Panel de arte cósmico */}
          <aside
            className={cn(
              'relative isolate flex flex-col justify-between overflow-hidden bg-gradient-to-br p-8 text-white sm:p-10 lg:p-12',
              theme.gradient,
            )}
          >
            {/* Tinte oscuro para profundidad */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-950/45 via-violet-950/25 to-indigo-950/55"
            />
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

            <div className="relative z-10">
              <BrandLink tone="dark" />
            </div>

            <Reveal direction="up" className="relative z-10 my-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.14em] ring-1 ring-white/30 backdrop-blur">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                El cielo, a tu nombre
              </span>
              <h2 className="mt-6 font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.035em] sm:text-6xl lg:text-[4.25rem]">
                {pitch ?? (
                  <>
                    Tu universo
                    <br />
                    empieza en <Shine gold>Zodiaq</Shine>.
                  </>
                )}
              </h2>
              <ul className="mt-8 space-y-3.5">
                {highlights.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 text-lg text-white/90">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </Reveal>

            <p className="relative z-10 text-sm font-medium text-white/70">
              12 signos · IA Gemini · Gratis para empezar hoy
            </p>
          </aside>

          {/* Panel del formulario */}
          <div className="flex items-center justify-center bg-white px-6 py-12 sm:px-10 lg:px-14">
            <Reveal direction="up" className="w-full max-w-md">
              <div className="mb-8 lg:hidden">
                <BrandLink tone="light" />
              </div>
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-3 text-lg text-graphite">{subtitle}</p>
              )}
              <div className="mt-8">{children}</div>
              {footer && (
                <div className="mt-8 text-base text-graphite">{footer}</div>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </>
  );
}
