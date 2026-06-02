import { cn } from '@/lib/cn';
import { featureTheme } from '@/lib/feature-theme';
import type { ThemeKey } from '@/lib/feature-theme';

interface GeneratingLoaderProps {
  variant?: ThemeKey;
  /** Mensaje principal. */
  message?: string;
  /** Texto secundario (qué está pasando). */
  hint?: string;
  /**
   * Colores propios (hex) para el núcleo/halo, p. ej. el color temático de un
   * signo. Si se pasan, mandan sobre el gradiente del `variant`.
   */
  colors?: { from: string; to: string };
  className?: string;
}

/**
 * Animación de carga temática para los estados de generación de contenido IA:
 * núcleo luminoso que late, dos anillos que orbitan con destellos y un mensaje
 * en grande. Llamativa, con movimiento. Accesible (`role="status"`,
 * `aria-live`). Las animaciones se frenan con `prefers-reduced-motion`.
 */
export function GeneratingLoader({
  variant = 'cosmos',
  message = 'Consultando los astros…',
  hint = 'Estamos generando tu lectura personalizada. Tardará solo unos segundos.',
  colors,
  className,
}: GeneratingLoaderProps) {
  const theme = featureTheme(variant);
  // Gradiente del signo (hex) si se pasa; si no, el del tema por clases.
  const customGradient = colors
    ? `linear-gradient(135deg, ${colors.from}, ${colors.to})`
    : undefined;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center gap-7 py-16 text-center',
        className,
      )}
    >
      <div className="relative h-32 w-32">
        {/* Halo que late */}
        <div
          className={cn(
            'absolute inset-0 rounded-full opacity-70 blur-2xl animate-pulse-glow',
            !colors && cn('bg-gradient-to-br', theme.gradient),
          )}
          style={customGradient ? { backgroundImage: customGradient } : undefined}
        />
        {/* Núcleo */}
        <div
          className={cn(
            'absolute inset-8 rounded-full shadow-lift',
            !colors && cn('bg-gradient-to-br bg-animated animate-gradient-fast', theme.gradient),
          )}
          style={customGradient ? { backgroundImage: customGradient } : undefined}
        />
        {/* Anillo exterior con destello */}
        <div className="absolute inset-0 animate-orbit">
          <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-white shadow-[0_0_12px_3px_rgba(255,255,255,0.9)]" />
          <span className="absolute bottom-2 right-4 h-2 w-2 rounded-full bg-white/90 shadow-[0_0_8px_2px_rgba(255,255,255,0.8)]" />
        </div>
        {/* Anillo interior, gira al revés y más rápido */}
        <div className="absolute inset-3 animate-orbit [animation-direction:reverse] [animation-duration:9s]">
          <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.8)]" />
        </div>
      </div>

      <div>
        <p className="font-display text-2xl font-extrabold tracking-tight text-ink">
          {message}
        </p>
        <p className="mt-2 max-w-sm text-sm text-graphite">{hint}</p>
      </div>
    </div>
  );
}
