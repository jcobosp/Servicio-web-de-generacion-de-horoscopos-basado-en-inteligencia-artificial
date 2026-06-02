import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ShineProps {
  children: ReactNode;
  /**
   * `gold` para fondos de color/oscuros (dorado que brilla). Por defecto, un
   * gradiente cósmico animado con halo, pensado para fondos claros (como el
   * keyword del hero).
   */
  gold?: boolean;
  className?: string;
}

/**
 * Resalta una palabra/expresión con BRILLO, igual que el keyword del hero.
 * Úsalo para destacar palabras importantes en titulares, frases de venta y
 * párrafos. Decorativo: el texto sigue siendo seleccionable y legible.
 */
export function Shine({ children, gold = false, className }: ShineProps) {
  if (gold) {
    return (
      <span
        className={cn(
          'font-bold text-gold-300 text-glow-gold animate-glow-gold',
          className,
        )}
      >
        {children}
      </span>
    );
  }
  return (
    <span
      className={cn(
        'bg-gradient-to-r from-cosmos-500 via-aurora-500 to-tarot-500 bg-clip-text font-bold text-transparent bg-animated text-glow animate-gradient-fast',
        className,
      )}
    >
      {children}
    </span>
  );
}
