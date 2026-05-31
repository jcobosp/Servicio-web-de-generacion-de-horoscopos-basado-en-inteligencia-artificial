import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type SectionWidth = 'default' | 'wide' | 'narrow' | 'full';

const WIDTHS: Record<SectionWidth, string> = {
  narrow: 'max-w-3xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
  full: 'max-w-none',
};

interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Etiqueta semántica (por defecto `section`). */
  as?: ElementType;
  /** Ancho del contenedor interno. `full` = a sangre, sin contenedor. */
  width?: SectionWidth;
  /** Clases del contenedor interno (padding horizontal incluido salvo en `full`). */
  innerClassName?: string;
  children: ReactNode;
}

/**
 * Envoltorio de sección a todo el ancho de la pantalla (full-bleed) con un
 * contenedor interno centrado y ancho configurable. Pensado para composiciones
 * modernas: el fondo/decoración ocupa toda la pantalla y el contenido respira.
 */
export function Section({
  as: Tag = 'section',
  width = 'default',
  className,
  innerClassName,
  children,
  ...rest
}: SectionProps) {
  return (
    <Tag className={cn('relative w-full', className)} {...rest}>
      {width === 'full' ? (
        children
      ) : (
        <div
          className={cn(
            'mx-auto w-full px-4 sm:px-6 lg:px-8',
            WIDTHS[width],
            innerClassName,
          )}
        >
          {children}
        </div>
      )}
    </Tag>
  );
}

/**
 * Rompe el contenedor padre para ocupar todo el ancho del viewport (útil para
 * fondos/franjas a sangre dentro de una página con contenedor estrecho).
 */
export function Bleed({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('relative left-1/2 right-1/2 -mx-[50vw] w-screen', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
