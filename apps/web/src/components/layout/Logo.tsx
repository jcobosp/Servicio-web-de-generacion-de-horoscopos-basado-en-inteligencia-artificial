import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';

interface LogoProps {
  /** Tamaño del wordmark. */
  size?: 'sm' | 'md' | 'lg';
  /** Color del texto (para fondos oscuros usar `light`). */
  tone?: 'dark' | 'light';
  className?: string;
  /** Si se pasa, envuelve en un Link a esa ruta. */
  to?: string;
  'aria-label'?: string;
}

const TEXT_SIZE = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' } as const;
const MARK_SIZE = { sm: 'h-7 w-7', md: 'h-8 w-8', lg: 'h-10 w-10' } as const;
const ICON_SIZE = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' } as const;

/** Marca de Zodiaq: orbe cósmico con destello + wordmark en display. */
export function Logo({
  size = 'md',
  tone = 'dark',
  className,
  to,
  'aria-label': ariaLabel,
}: LogoProps) {
  const content = (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'relative flex items-center justify-center rounded-xl shadow-glow-cosmos',
          'bg-gradient-to-br from-cosmos-600 via-aurora-500 to-tarot-500',
          MARK_SIZE[size],
        )}
      >
        <Sparkles className={cn('text-white', ICON_SIZE[size])} strokeWidth={2.4} />
      </span>
      <span
        className={cn(
          'font-display font-bold tracking-tight',
          TEXT_SIZE[size],
          tone === 'light' ? 'text-white' : 'text-ink',
        )}
      >
        Zodiaq
      </span>
    </span>
  );

  if (to) {
    return (
      <Link to={to} aria-label={ariaLabel ?? 'Zodiaq, inicio'} className="inline-flex">
        {content}
      </Link>
    );
  }
  return content;
}
