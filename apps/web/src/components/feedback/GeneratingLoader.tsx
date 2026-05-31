import { cn } from '@/lib/cn';
import { featureTheme } from '@/lib/feature-theme';
import type { ThemeKey } from '@/lib/feature-theme';

interface GeneratingLoaderProps {
  variant?: ThemeKey;
  /** Mensaje principal. */
  message?: string;
  /** Texto secundario (qué está pasando). */
  hint?: string;
  className?: string;
}

/**
 * Animación de carga temática para los estados de generación de contenido IA:
 * un núcleo luminoso que late, una órbita que gira con estrellas y un mensaje.
 * Sustituye al spinner soso. Accesible (`role="status"`, `aria-live`). Las
 * animaciones se frenan con `prefers-reduced-motion` (regla global).
 */
export function GeneratingLoader({
  variant = 'cosmos',
  message = 'Consultando los astros…',
  hint = 'Estamos generando tu lectura personalizada. Tardará solo unos segundos.',
  className,
}: GeneratingLoaderProps) {
  const theme = featureTheme(variant);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center gap-6 py-14 text-center',
        className,
      )}
    >
      <div className="relative h-28 w-28">
        {/* Halo */}
        <div
          className={cn(
            'absolute inset-0 rounded-full bg-gradient-to-br blur-xl animate-pulse-glow',
            theme.gradient,
          )}
        />
        {/* Núcleo */}
        <div
          className={cn(
            'absolute inset-4 rounded-full bg-gradient-to-br shadow-lift',
            theme.gradient,
          )}
        />
        {/* Órbita con estrellas */}
        <div className="absolute inset-0 animate-spin-slow">
          <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.9)]" />
          <span className="absolute bottom-1 right-3 h-1.5 w-1.5 rounded-full bg-white/90 shadow-[0_0_6px_1px_rgba(255,255,255,0.8)]" />
        </div>
      </div>

      <div>
        <p className="font-display text-lg font-semibold text-ink">{message}</p>
        <p className="mt-1.5 max-w-sm text-sm text-graphite">{hint}</p>
      </div>
    </div>
  );
}
