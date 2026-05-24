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
 * hay anuncio real: en desarrollo mostramos un placeholder para visualizar la
 * ubicación; en producción no se renderiza nada.
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

  // Placeholder de demostración (solo en desarrollo).
  if (import.meta.env.DEV) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          'flex min-h-[90px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-mist text-xs uppercase tracking-wider text-silver',
          className,
        )}
      >
        Espacio publicitario {consent?.marketing ? '' : '(requiere consentimiento)'}
      </div>
    );
  }

  return null;
}
