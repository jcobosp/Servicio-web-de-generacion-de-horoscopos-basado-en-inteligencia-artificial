import { Link } from 'react-router-dom';
import type { ZodiacInfo } from '@/lib/zodiac';
import { cn } from '@/lib/cn';

export interface SignCardProps {
  sign: ZodiacInfo;
  to?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'p-5 [&_.sign-name]:text-xl',
  md: 'min-h-[130px] p-6 [&_.sign-name]:text-2xl sm:[&_.sign-name]:text-3xl',
  lg: 'min-h-[160px] p-8 [&_.sign-name]:text-3xl sm:[&_.sign-name]:text-4xl lg:[&_.sign-name]:text-5xl',
};

/** Estrellas decorativas deterministas dentro de cada card de signo. */
const STAR_DOTS = [
  { top: 18, left: 80, size: 2, delay: 0 },
  { top: 30, left: 22, size: 2, delay: 0.7 },
  { top: 70, left: 88, size: 3, delay: 1.2 },
  { top: 78, left: 16, size: 2, delay: 0.4 },
];

export function SignCard({ sign, to, size = 'md' }: SignCardProps) {
  const href = to ?? `/horoscopo/diario/${sign.slug}`;
  // Gradiente más vivo/potente: del color primario del signo a su tono claro.
  const style = {
    backgroundImage: `linear-gradient(140deg, ${sign.colors.primary}, ${sign.colors.from})`,
  };

  return (
    <Link
      to={href}
      aria-label={`Horóscopo de ${sign.name}`}
      className={cn(
        'group relative flex flex-col justify-end overflow-hidden rounded-2xl text-white shadow-soft transition-all duration-200 ease-cosmic',
        'hover:-translate-y-1 hover:shadow-lift',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmos-500 focus-visible:ring-offset-2',
        sizes[size],
      )}
      style={style}
    >
      {/* Tinte oscuro: garantiza contraste AA del texto blanco en signos claros */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-black/45"
      />
      {/* Aura blanca en movimiento */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/25 blur-2xl animate-drift"
      />
      {/* Estrellas que parpadean */}
      {STAR_DOTS.map((s, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full bg-white shadow-[0_0_6px_2px_rgba(255,255,255,0.7)] animate-twinkle"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      <div className="relative">
        <div className="sign-name font-display font-extrabold leading-[0.95] tracking-tight [text-shadow:0_2px_14px_rgba(0,0,0,0.45)]">
          {sign.name}
        </div>
        <div className="mt-2 text-sm font-semibold text-white/95 [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">
          {sign.dates}
        </div>
      </div>
    </Link>
  );
}
