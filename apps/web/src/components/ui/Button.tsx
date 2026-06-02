import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'premium'
  | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-xl ' +
  'transition-all duration-200 ease-cosmic ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmos-500 focus-visible:ring-offset-2 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ' +
  'whitespace-nowrap select-none';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-cosmos-700 text-white shadow-soft hover:bg-cosmos-800 hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]',
  secondary:
    'bg-white text-cosmos-700 border border-cosmos-200 hover:bg-cosmos-50 hover:border-cosmos-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]',
  ghost: 'bg-transparent text-graphite hover:bg-mist hover:text-ink active:scale-[0.97]',
  premium:
    'bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 text-white shadow-glow-gold ' +
    'hover:from-gold-500 hover:to-gold-600 hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:scale-[0.97] shadow-sm hover:shadow-md',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-base',
  lg: 'h-13 px-7 text-lg',
  xl: 'h-14 px-8 text-lg sm:h-16 sm:px-10 sm:text-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth,
    leftIcon,
    rightIcon,
    className,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
});

export interface LinkButtonProps {
  to: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  children?: ReactNode;
  external?: boolean;
  onClick?: () => void;
}

export function LinkButton({
  to,
  variant = 'primary',
  size = 'md',
  fullWidth,
  leftIcon,
  rightIcon,
  className,
  children,
  external,
  onClick,
}: LinkButtonProps) {
  const classes = cn(
    base,
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className,
  );

  if (external) {
    return (
      <a
        href={to}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
      >
        {leftIcon}
        {children}
        {rightIcon}
      </a>
    );
  }

  return (
    <Link to={to} className={classes} onClick={onClick}>
      {leftIcon}
      {children}
      {rightIcon}
    </Link>
  );
}
