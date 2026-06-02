import { cn } from '@/lib/cn';
import { featureTheme } from '@/lib/feature-theme';
import type { ThemeKey } from '@/lib/feature-theme';

/** Estrellas deterministas (posición %, tamaño px, retardo s) para el parpadeo. */
const STARS: { top: number; left: number; size: number; delay: number }[] = [
  { top: 12, left: 8, size: 3, delay: 0 },
  { top: 22, left: 82, size: 2, delay: 0.6 },
  { top: 38, left: 24, size: 2, delay: 1.2 },
  { top: 16, left: 54, size: 4, delay: 0.3 },
  { top: 64, left: 14, size: 2, delay: 1.8 },
  { top: 72, left: 88, size: 3, delay: 0.9 },
  { top: 48, left: 68, size: 2, delay: 1.5 },
  { top: 84, left: 40, size: 3, delay: 0.45 },
  { top: 30, left: 94, size: 2, delay: 2.1 },
  { top: 58, left: 48, size: 2, delay: 0.75 },
  { top: 8, left: 34, size: 2, delay: 1.35 },
  { top: 90, left: 70, size: 2, delay: 1.05 },
];

interface CosmicBackgroundProps {
  variant?: ThemeKey;
  /** Mostrar las estrellas parpadeantes (por defecto sí). */
  stars?: boolean;
  /** Intensidad de los blobs (opacidad). */
  intensity?: 'soft' | 'normal' | 'bold';
  className?: string;
}

const INTENSITY: Record<NonNullable<CosmicBackgroundProps['intensity']>, string> = {
  soft: 'opacity-25',
  normal: 'opacity-40',
  bold: 'opacity-60',
};

/**
 * Capa decorativa de fondo "cósmico": dos blobs de gradiente difuminados que
 * flotan + estrellas que parpadean, teñidos según la funcionalidad. Puramente
 * decorativo (aria-hidden, sin eventos). Las animaciones se desactivan solas
 * con `prefers-reduced-motion` (regla global en index.css).
 */
export function CosmicBackground({
  variant = 'cosmos',
  stars = true,
  intensity = 'normal',
  className,
}: CosmicBackgroundProps) {
  const theme = featureTheme(variant);

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 overflow-hidden',
        className,
      )}
    >
      <div
        className={cn(
          'absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl animate-float',
          theme.blobA,
          INTENSITY[intensity],
        )}
      />
      <div
        className={cn(
          'absolute -right-20 top-10 h-80 w-80 rounded-full blur-3xl animate-float-slow',
          theme.blobB,
          INTENSITY[intensity],
        )}
      />
      <div
        className={cn(
          'absolute -bottom-28 left-1/3 h-72 w-72 rounded-full blur-3xl animate-pulse-glow',
          theme.blobA,
          'opacity-30',
        )}
      />

      {stars &&
        STARS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white shadow-[0_0_6px_1px_rgba(255,255,255,0.8)] animate-twinkle"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
    </div>
  );
}
