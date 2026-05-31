import { Link } from 'react-router-dom';
import { Button, LinkButton } from '@/components/ui/Button';
import { useConsent } from './ConsentProvider';

/**
 * Banner de cookies con modelo "consentir o suscribirse" (consent or pay).
 *
 * Base legal: Guía de cookies de la AEPD (mayo 2024), que admite condicionar el
 * acceso a la aceptación de cookies siempre que exista una ALTERNATIVA REAL —que
 * no tiene por qué ser gratuita—. Aquí esa alternativa es la suscripción Premium
 * (precio razonable y proporcionado), que permite navegar SIN publicidad. No
 * somos una "gran plataforma en línea" (CEPD 08/2024), por lo que el binomio
 * "aceptar / suscribirse" es admisible. Cookies técnicas siempre activas; sin
 * consentimiento no se carga ningún script de analítica ni de AdSense.
 *
 * El usuario tiene dos caminos claros: aceptar cookies y seguir gratis (con
 * anuncios), o suscribirse a Premium (sin anuncios). No hay "rechazar y seguir
 * gratis sin anuncios". Se conserva el acceso al panel para gestionar la
 * analítica y revocar el consentimiento (RGPD art. 7.3).
 */
export function CookieBanner() {
  const { bannerVisible, acceptAll, openPreferences } = useConsent();

  if (!bannerVisible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-[90] px-4 pb-4 sm:px-6"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
        <h2 className="font-display text-lg text-ink">Cookies en Zodiaq</h2>
        <p className="mt-2 text-sm leading-relaxed text-graphite">
          Para usar Zodiaq <strong>gratis</strong> necesitamos cookies técnicas y,
          además, cookies analíticas y de <strong>publicidad</strong> que financian
          el servicio. Si prefieres navegar <strong>sin anuncios</strong>, puedes{' '}
          <strong>suscribirte a Premium</strong>. Tú eliges. Más detalles en la{' '}
          <Link to="/politica-de-cookies" className="text-cosmos-700 underline">
            política de cookies
          </Link>
          .
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="ghost"
            onClick={openPreferences}
            className="sm:mr-auto"
          >
            Configurar
          </Button>
          <LinkButton to="/premium" variant="secondary">
            Suscribirme sin anuncios
          </LinkButton>
          <Button onClick={acceptAll}>Aceptar y seguir gratis</Button>
        </div>
      </div>
    </div>
  );
}
