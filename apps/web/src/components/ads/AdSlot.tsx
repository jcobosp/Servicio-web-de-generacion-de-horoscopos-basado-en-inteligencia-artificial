import { useEffect, useRef } from 'react';
import { useConsent } from '@/features/legal/ConsentProvider';
import { useIsPremium } from '@/features/billing/hooks';
import { cn } from '@/lib/cn';

interface AdSlotProps {
  /** ID de la unidad publicitaria de AdSense (data-ad-slot). */
  slot?: string;
  className?: string;
}

const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;

/**
 * Espacio publicitario de AdSense. Reglas (INTEGRATIONS §4):
 * - Solo en plan FREE.
 * - Solo si el usuario consintió cookies de publicidad.
 * - El script lo carga `ConsentScripts`; aquí solo dibujamos la unidad.
 *
 * Sin `VITE_ADSENSE_CLIENT` (caso actual hasta tener dominio en producción) no
 * hay anuncio real: mostramos una imagen de ejemplo (`/example-ad.svg`) para
 * visualizar cómo quedará el anuncio en la card. En cuanto se configure
 * `VITE_ADSENSE_CLIENT` + `slot`, el anuncio real de AdSense (bloque `<ins>`
 * de arriba) sustituye automáticamente a la imagen de ejemplo. La imagen es un
 * SVG estático local, sin tracking, así que no depende del consentimiento.
 */
export function AdSlot({ slot, className }: AdSlotProps) {
  const isPremium = useIsPremium();
  const { consent } = useConsent();
  const insRef = useRef<HTMLModElement>(null);

  const canShowRealAd = Boolean(
    !isPremium && consent?.marketing && ADSENSE_CLIENT && slot,
  );

  useEffect(() => {
    if (!canShowRealAd) return;
    // El script global lo inyecta ConsentScripts; empujamos la unidad si existe.
    const w = window as unknown as { adsbygoogle?: unknown[] };
    try {
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch {
      // Si el script aún no cargó, AdSense reintenta al estar disponible.
    }
  }, [canShowRealAd]);

  // Premium: nunca hay anuncios.
  if (isPremium) return null;

  if (canShowRealAd) {
    return (
      <ins
        ref={insRef}
        className={cn('adsbygoogle block', className)}
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    );
  }

  // Aún no hay anuncio real (falta `VITE_ADSENSE_CLIENT` + `slot`, pendiente de
  // producción): imagen de ejemplo para ver cómo quedará el anuncio en la card.
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-slate-200',
        className,
      )}
    >
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        aria-label="Anuncio de ejemplo"
        className="block"
      >
        <img
          src="/example-ad.svg"
          alt="Anuncio de ejemplo"
          width={728}
          height={120}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
      </a>
    </div>
  );
}
