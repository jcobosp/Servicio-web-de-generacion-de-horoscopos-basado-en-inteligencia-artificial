import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type CardTone = 'default' | 'premium' | 'sign' | 'glass' | 'glow';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
  padding?: CardPadding;
  hoverable?: boolean;
}

const tones: Record<CardTone, string> = {
  default: 'bg-white border border-slate-200 shadow-soft',
  premium:
    'bg-white border border-gold-300 shadow-glow-gold relative overflow-hidden',
  sign: 'bg-white border border-slate-200 overflow-hidden shadow-soft',
  glass:
    'bg-white/70 backdrop-blur-md border border-white/60 shadow-soft relative overflow-hidden',
  glow: 'bg-white border border-slate-200 shadow-lift',
};

const paddings: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    tone = 'default',
    padding = 'md',
    hoverable = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl transition-all duration-300 ease-out',
        tones[tone],
        paddings[padding],
        hoverable && 'hover:-translate-y-1 hover:shadow-lift cursor-pointer',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

export function CardHeader({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('font-display text-xl text-ink', className)}
      {...rest}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('mt-1 text-sm text-graphite', className)} {...rest}>
      {children}
    </p>
  );
}

export function CardFooter({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-6 flex items-center justify-between', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
