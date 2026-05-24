import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useConsent } from './ConsentProvider';

/**
 * Banner de cookies (art. 22.2 LSSI). Aparece en la primera visita y mientras
 * no haya una decisión válida y vigente. "Rechazar todas" es tan accesible como
 * "Aceptar todas" (exigencia AEPD 2024) y no hay ninguna opción preseleccionada.
 */
export function CookieBanner() {
  const { bannerVisible, acceptAll, rejectAll, openPreferences } = useConsent();

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
          Usamos cookies técnicas necesarias para que la plataforma funcione y,
          solo con tu permiso, cookies analíticas y de publicidad. Puedes
          aceptarlas, rechazarlas o configurarlas. Más información en la{' '}
          <Link to="/politica-de-cookies" className="text-cosmos-700 underline">
            política de cookies
          </Link>
          .
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            onClick={openPreferences}
            className="sm:mr-auto"
          >
            Personalizar
          </Button>
          <Button variant="secondary" onClick={rejectAll}>
            Rechazar todas
          </Button>
          <Button onClick={acceptAll}>Aceptar todas</Button>
        </div>
      </div>
    </div>
  );
}
