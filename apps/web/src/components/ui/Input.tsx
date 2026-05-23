import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leftAddon, rightAddon, className, id, ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const describedBy = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-ink"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftAddon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-silver">
            {leftAddon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'block w-full rounded-xl border bg-white text-base text-ink',
            'h-11 px-4 outline-none transition',
            'placeholder:text-silver',
            'focus:ring-2 focus:ring-offset-1',
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
              : 'border-slate-200 focus:border-cosmos-500 focus:ring-cosmos-200',
            leftAddon ? 'pl-10' : undefined,
            rightAddon ? 'pr-10' : undefined,
            className,
          )}
          {...rest}
        />
        {rightAddon && (
          <span className="absolute inset-y-0 right-3 flex items-center text-silver">
            {rightAddon}
          </span>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-silver">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
