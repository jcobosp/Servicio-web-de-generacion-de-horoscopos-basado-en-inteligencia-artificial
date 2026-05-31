import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, Lock, Mail } from 'lucide-react';
import { useConsent } from '@/features/legal/ConsentProvider';
import { Logo } from '@/components/layout/Logo';
import { cn } from '@/lib/cn';

const productLinks = [
  { label: 'Horóscopo diario', to: '/horoscopo/diario' },
  { label: 'Horóscopo semanal', to: '/horoscopo/semanal' },
  { label: 'Energía del día', to: '/energia-del-dia' },
  { label: 'Eventos astrológicos', to: '/eventos-astrologicos' },
  { label: 'Carta natal', to: '/carta-natal/basica' },
];

const exploreLinks = [
  { label: 'Tarot', to: '/tarot/simple' },
  { label: 'Compatibilidad', to: '/compatibilidad' },
  { label: 'Numerología', to: '/numerologia' },
  { label: 'Reportes premium', to: '/reportes/mensual' },
  { label: 'Hazte Premium', to: '/premium' },
];

const legalLinks = [
  { label: 'Aviso legal', to: '/aviso-legal' },
  { label: 'Política de privacidad', to: '/politica-de-privacidad' },
  { label: 'Política de cookies', to: '/politica-de-cookies' },
  { label: 'Términos y condiciones', to: '/terminos-y-condiciones' },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; to: string }[];
}) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/60">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="text-sm text-slate-300 transition hover:text-white"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  return (
    <form
      className="mt-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (email.trim()) setDone(true);
      }}
    >
      {done ? (
        <p className="flex items-center gap-2 text-sm font-medium text-aurora-300">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          ¡Listo! Te avisaremos de las novedades.
        </p>
      ) : (
        <div className="flex max-w-sm items-center gap-2 rounded-xl border border-white/15 bg-white/5 p-1.5 focus-within:border-aurora-400">
          <span className="pl-2 text-white/50" aria-hidden="true">
            <Mail className="h-4 w-4" />
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tu email para recibir tu horóscopo"
            aria-label="Tu email"
            className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-cosmos-500 to-aurora-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:from-cosmos-400 hover:to-aurora-400"
          >
            Unirme
          </button>
        </div>
      )}
    </form>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const { openPreferences } = useConsent();

  return (
    <footer className="relative mt-auto overflow-hidden bg-gradient-to-b from-ink via-cosmos-900 to-ink text-white">
      {/* Estrellas decorativas */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <span className="absolute left-[12%] top-10 h-1.5 w-1.5 rounded-full bg-white/70 animate-twinkle" />
        <span className="absolute left-[78%] top-16 h-1 w-1 rounded-full bg-white/60 animate-twinkle [animation-delay:0.8s]" />
        <span className="absolute left-[45%] top-24 h-1 w-1 rounded-full bg-white/50 animate-twinkle [animation-delay:1.4s]" />
        <span className="absolute left-[90%] top-32 h-1.5 w-1.5 rounded-full bg-white/60 animate-twinkle [animation-delay:0.5s]" />
        <span className="absolute left-[28%] top-40 h-1 w-1 rounded-full bg-white/50 animate-twinkle [animation-delay:1.1s]" />
        <span className="absolute left-[62%] top-44 h-1.5 w-1.5 rounded-full bg-white/60 animate-twinkle [animation-delay:0.3s]" />
        <span className="absolute left-[6%] top-52 h-1 w-1 rounded-full bg-white/40 animate-twinkle [animation-delay:1.7s]" />
        <span className="absolute left-[52%] top-12 h-1 w-1 rounded-full bg-white/60 animate-twinkle [animation-delay:2s]" />
        <span className="absolute left-[34%] top-64 h-1.5 w-1.5 rounded-full bg-white/50 animate-twinkle [animation-delay:0.9s]" />
        <span className="absolute left-[84%] top-56 h-1 w-1 rounded-full bg-white/50 animate-twinkle [animation-delay:1.3s]" />
        <span className="absolute left-[70%] top-72 h-1 w-1 rounded-full bg-white/40 animate-twinkle [animation-delay:0.6s]" />
        <span className="absolute left-[18%] top-80 h-1 w-1 rounded-full bg-white/40 animate-twinkle [animation-delay:1.9s]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Wordmark gigante de fondo, centrado tras las columnas */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
          >
            <span
              className={cn(
                'block select-none bg-gradient-to-b from-white/20 to-white/[0.04] bg-clip-text text-transparent',
                'font-display font-bold leading-[0.8] tracking-tighter',
                'text-[24vw] md:text-[18vw]',
              )}
            >
              Zodiaq
            </span>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-10 md:grid-cols-12">
          {/* Marca + newsletter */}
          <div className="col-span-2 md:col-span-5">
            <Logo to="/" size="lg" tone="light" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
              Tu horóscopo personalizado, escrito con inteligencia artificial y
              pensado para que te suene de verdad. Astrología moderna, todos los
              días.
            </p>
            <NewsletterForm />
            <div className="mt-6 flex items-center gap-2">
              <a
                href="#"
                aria-label="Instagram"
                className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="TikTok"
                className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16.5 3v2.5a4 4 0 0 0 4 4V12a6.4 6.4 0 0 1-4-1.4V16a5 5 0 1 1-5-5v2.5a2.5 2.5 0 1 0 2.5 2.5V3h2.5Z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="X"
                className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.3 4H21l-6.5 7.4L22 20h-6.1l-4.8-5.7L5.7 20H3l7-8L2.6 4h6.2l4.3 5.2L18.3 4Zm-1 14.4h1.6L7.7 5.5H6L17.3 18.4Z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="md:col-span-2 md:col-start-7">
            <FooterColumn title="Funcionalidades" links={productLinks} />
          </div>
          <div className="md:col-span-2">
            <FooterColumn title="Explora" links={exploreLinks} />
          </div>
          <div className="col-span-2 md:col-span-2">
            <FooterColumn title="Legal" links={legalLinks} />
            <button
              type="button"
              onClick={openPreferences}
              className="mt-2.5 text-sm text-slate-300 transition hover:text-white"
            >
              Configurar cookies
            </button>
          </div>
          </div>
        </div>

        {/* Badges de confianza */}
        <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-4 w-4 text-aurora-300" /> Datos cifrados (AES-256)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-aurora-300" /> Cumplimiento RGPD
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-aurora-300" /> Contenido con IA (Gemini)
          </span>
        </div>

        {/* Barra inferior */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-sm text-slate-400 sm:flex-row">
          <p>© {year} Zodiaq. Todos los derechos reservados.</p>
          <p>Contenido astrológico con fines de entretenimiento.</p>
        </div>
      </div>
    </footer>
  );
}
