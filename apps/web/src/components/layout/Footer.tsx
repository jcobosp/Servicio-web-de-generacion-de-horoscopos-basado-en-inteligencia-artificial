import { Link } from 'react-router-dom';

const productLinks = [
  { label: 'Horóscopo diario', to: '/horoscopo/diario' },
  { label: 'Horóscopo semanal', to: '/horoscopo/semanal' },
  { label: 'Horóscopo mensual', to: '/horoscopo/mensual' },
  { label: 'Tarot', to: '/tarot/simple' },
  { label: 'Carta natal', to: '/carta-natal/basica' },
  { label: 'Compatibilidad', to: '/compatibilidad' },
];

const legalLinks = [
  { label: 'Aviso legal', to: '/aviso-legal' },
  { label: 'Política de privacidad', to: '/politica-de-privacidad' },
  { label: 'Política de cookies', to: '/politica-de-cookies' },
  { label: 'Términos y condiciones', to: '/terminos-y-condiciones' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 font-display text-xl text-ink"
            >
              <span
                aria-hidden="true"
                className="text-2xl bg-gradient-to-br from-cosmos-600 via-aurora-500 to-gold-500 bg-clip-text text-transparent"
              >
                ✦
              </span>
              Zodiaq
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-graphite">
              Tu horóscopo personalizado, escrito con inteligencia artificial y
              pensado para que te suene.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="rounded-lg p-2 text-silver transition hover:bg-mist hover:text-ink"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="TikTok"
                className="rounded-lg p-2 text-silver transition hover:bg-mist hover:text-ink"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16.5 3v2.5a4 4 0 0 0 4 4V12a6.4 6.4 0 0 1-4-1.4V16a5 5 0 1 1-5-5v2.5a2.5 2.5 0 1 0 2.5 2.5V3h2.5Z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="X"
                className="rounded-lg p-2 text-silver transition hover:bg-mist hover:text-ink"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.3 4H21l-6.5 7.4L22 20h-6.1l-4.8-5.7L5.7 20H3l7-8L2.6 4h6.2l4.3 5.2L18.3 4Zm-1 14.4h1.6L7.7 5.5H6L17.3 18.4Z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-graphite">
              Producto
            </h4>
            <ul className="space-y-2">
              {productLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-graphite transition hover:text-cosmos-700"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-graphite">
              Legal
            </h4>
            <ul className="space-y-2">
              {legalLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-graphite transition hover:text-cosmos-700"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-sm text-silver sm:flex-row">
          <p>© {year} Zodiaq. Todos los derechos reservados.</p>
          <p>Contenido astrológico con fines de entretenimiento.</p>
        </div>
      </div>
    </footer>
  );
}
