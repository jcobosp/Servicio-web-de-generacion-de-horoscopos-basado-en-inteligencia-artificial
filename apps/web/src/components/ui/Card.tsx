import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type CardTone = 'default' | 'premium' | 'sign';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
  padding?: CardPadding;
  hoverable?: boolean;
}

const tones: Record<CardTone, string> = {
  default: 'bg-white border border-slate-200',
  premium:
    'bg-white border border-gold-300 shadow-glow-gold relative overflow-hidden',
  sign: 'bg-white border border-slate-200 overflow-hidden',
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
        'rounded-2xl shadow-sm transition-all duration-200 ease-out',
        tones[tone],
        paddings[padding],
        hoverable && 'hover:-translate-y-0.5 hover:shadow-md cursor-pointer',
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
