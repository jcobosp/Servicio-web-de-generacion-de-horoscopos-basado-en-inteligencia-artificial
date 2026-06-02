import { cn } from '@/lib/cn';
import { featureTheme } from '@/lib/feature-theme';
import type { ThemeKey } from '@/lib/feature-theme';

/** Estrellas deterministas (posición %, tamaño px, retardo s). */
const STARS: { top: number; left: number; size: number; delay: number }[] = [
  { top: 10, left: 8, size: 2, delay: 0 },
  { top: 18, left: 70, size: 3, delay: 0.6 },
  { top: 26, left: 32, size: 2, delay: 1.2 },
  { top: 14, left: 50, size: 2, delay: 0.3 },
  { top: 34, left: 88, size: 3, delay: 1.8 },
  { top: 44, left: 16, size: 2, delay: 0.9 },
  { top: 52, left: 60, size: 2, delay: 1.5 },
  { top: 62, left: 40, size: 3, delay: 0.45 },
  { top: 30, left: 96, size: 2, delay: 2.1 },
  { top: 58, left: 80, size: 2, delay: 0.75 },
  { top: 8, left: 38, size: 2, delay: 1.35 },
  { top: 72, left: 24, size: 2, delay: 1.05 },
  { top: 78, left: 64, size: 3, delay: 0.2 },
  { top: 84, left: 12, size: 2, delay: 1.7 },
  { top: 88, left: 84, size: 2, delay: 0.55 },
  { top: 40, left: 6, size: 2, delay: 2.3 },
  { top: 66, left: 92, size: 2, delay: 1.1 },
  { top: 20, left: 22, size: 2, delay: 0.85 },
];

interface StarfieldBackgroundProps {
  variant?: ThemeKey;
  /** Intensidad de las nebulosas. */
  intensity?: 'soft' | 'normal' | 'bold';
  className?: string;
}

/**
 * Fondo de "espacio" animado para cards llamativas: nebulosas de color que
 * derivan, un brillo que viaja, un cielo de estrellas que parpadean y dos
 * estrellas fugaces que cruzan en diagonal. Decorativo (`aria-hidden`); va
 * detrás del contenido (usa `relative z-10` en el contenido de la card). Se
 * frena con `prefers-reduced-motion` (regla global).
 */
export function StarfieldBackground({
  variant = 'cosmos',
  intensity = 'normal',
  className,
}: StarfieldBackgroundProps) {
  const theme = featureTheme(variant);

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className,
      )}
    >
      {/* Profundidad: oscurece bordes/abajo para que el texto claro resalte */}
      <span className="absolute inset-0 bg-[radial-gradient(125%_120%_at_50%_-10%,transparent_45%,rgba(2,6,23,0.55))]" />
      {/* Brillo de color MUY sutil (no mancha clara), solo da profundidad */}
      <span
        className={cn(
          'absolute -right-24 -top-24 h-80 w-80 rounded-full blur-3xl animate-float-slow',
          theme.blobB,
          intensity === 'bold' ? 'opacity-20' : 'opacity-15',
        )}
      />

      {/* Estrellas que parpadean */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white shadow-[0_0_7px_2px_rgba(255,255,255,0.6)] animate-twinkle"
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
