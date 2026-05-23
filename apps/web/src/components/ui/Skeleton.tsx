import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

const roundings = {
  sm: 'rounded-md',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full',
};

export function Skeleton({
  rounded = 'md',
  className,
  ...rest
}: SkeletonProps) {
  return (
    <div
      role="status"
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-gradient-to-r from-mist via-slate-100 to-mist bg-[length:200%_100%]',
        roundings[rounded],
        className,
      )}
      {...rest}
    />
  );
}
