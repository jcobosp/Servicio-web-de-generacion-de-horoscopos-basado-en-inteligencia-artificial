import { Link } from 'react-router-dom';
import type { ZodiacInfo } from '@/lib/zodiac';
import { cn } from '@/lib/cn';

export interface SignCardProps {
  sign: ZodiacInfo;
  to?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'p-4 text-base [&_.sign-glyph]:text-3xl',
  md: 'p-5 text-lg [&_.sign-glyph]:text-4xl',
  lg: 'p-6 text-xl [&_.sign-glyph]:text-5xl',
};

export function SignCard({ sign, to, size = 'md' }: SignCardProps) {
  const href = to ?? `/horoscopo/diario/${sign.slug}`;
  const style = {
    backgroundImage: `linear-gradient(135deg, ${sign.colors.from}, ${sign.colors.to})`,
  };

  return (
    <Link
      to={href}
      aria-label={`Horóscopo de ${sign.name}`}
      className={cn(
        'group relative block overflow-hidden rounded-2xl text-white shadow-sm transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmos-500 focus-visible:ring-offset-2',
        sizes[size],
      )}
      style={style}
    >
      <span
        aria-hidden="true"
        className="absolute -right-3 -top-3 text-7xl opacity-10 transition group-hover:scale-110 group-hover:opacity-20"
      >
        {sign.glyph}
      </span>
      <div className="sign-glyph leading-none">{sign.glyph}</div>
      <div className="mt-3 font-display">{sign.name}</div>
      <div className="mt-1 text-xs opacity-90">{sign.dates}</div>
    </Link>
  );
}
