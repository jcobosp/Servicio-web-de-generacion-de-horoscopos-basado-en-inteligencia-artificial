import { Compass, Home, Sparkles } from 'lucide-react';
import { Seo } from '@/lib/seo';
import { LinkButton } from '@/components/ui/Button';
import { Section } from '@/components/layout/Section';
import { Shine } from '@/components/visual/Shine';

const STARS = [
  { top: 16, left: 12, size: 3, delay: 0 }, { top: 26, left: 86, size: 2, delay: 0.7 },
  { top: 64, left: 8, size: 2, delay: 1.3 }, { top: 74, left: 90, size: 3, delay: 0.4 },
  { top: 40, left: 95, size: 2, delay: 1.1 }, { top: 82, left: 28, size: 2, delay: 0.9 },
  { top: 12, left: 60, size: 2, delay: 1.6 }, { top: 84, left: 68, size: 3, delay: 0.5 },
  { top: 48, left: 46, size: 2, delay: 2.0 }, { top: 20, left: 34, size: 2, delay: 1.4 },
  { top: 70, left: 54, size: 2, delay: 0.3 }, { top: 34, left: 74, size: 2, delay: 1.9 },
];

export function NotFoundPage() {
  return (
    <>
      <Seo
        title="Página no encontrada · Zodiaq"
        description="La página que buscas no existe o se ha movido. Vuelve al inicio para seguir explorando tu horóscopo."
        noindex
      />

      <Section width="full" className="px-3 pt-4 sm:px-4 lg:px-6">
        <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-800 via-violet-900 to-[#0a0418] px-6 py-20 text-center text-white shadow-lift sm:px-12 sm:py-28">
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/30 via-black/10 to-black/55" />
          <span aria-hidden="true" className="pointer-events-none absolute -left-16 -top-20 h-80 w-80 rounded-full bg-violet-500/25 blur-3xl animate-drift" />
          <span aria-hidden="true" className="pointer-events-none absolute -right-12 bottom-0 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl animate-float-slow" />
          <span aria-hidden="true" className="pointer-events-none absolute inset-0">
            {STARS.map((s, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.7)] animate-twinkle"
                style={{ top: `${s.top}%`, left: `${s.left}%`, width: `${s.size}px`, height: `${s.size}px`, animationDelay: `${s.delay}s` }}
              />
            ))}
          </span>

          <div className="relative z-10 mx-auto max-w-2xl">
            {/* Agujero negro: anillos que orbitan alrededor del 404 */}
            <div className="relative mx-auto mb-8 h-32 w-32">
              <span aria-hidden="true" className="absolute inset-0 rounded-full bg-gradient-to-br from-fuchsia-500/40 to-indigo-500/30 blur-2xl animate-pulse-glow" />
              <span aria-hidden="true" className="absolute inset-0 animate-orbit">
                <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-gold-300 shadow-[0_0_12px_3px_rgba(252,211,77,0.8)]" />
              </span>
              <span aria-hidden="true" className="absolute inset-3 animate-orbit [animation-direction:reverse] [animation-duration:9s]">
                <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-fuchsia-200 shadow-[0_0_10px_3px_rgba(245,208,254,0.8)]" />
              </span>
              <span className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-12 w-12 text-white/80" aria-hidden="true" />
              </span>
            </div>

            <p className="font-display text-7xl font-black leading-none tracking-tight [text-shadow:0_2px_24px_rgba(0,0,0,0.4)] sm:text-8xl">
              <Shine gold>404</Shine>
            </p>
            <h1 className="mt-5 font-display text-3xl font-black tracking-tight sm:text-4xl">
              Las estrellas no encuentran esta página
            </h1>
            <p className="mx-auto mt-3 max-w-md text-lg text-white/85">
              Puede que la ruta haya cambiado o que aún no exista. Volvamos a un camino
              conocido.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <LinkButton to="/" size="lg" variant="premium" leftIcon={<Home className="h-5 w-5" />}>
                Ir al inicio
              </LinkButton>
              <LinkButton to="/horoscopo/diario" size="lg" variant="secondary" leftIcon={<Compass className="h-5 w-5" />}>
                Ver el horóscopo de hoy
              </LinkButton>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
