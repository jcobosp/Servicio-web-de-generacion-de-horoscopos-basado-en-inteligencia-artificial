import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  error?: string | undefined;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ label, error, className, id, ...rest }, ref) {
    const reactId = useId();
    const inputId = id ?? reactId;
    return (
      <div>
        <div className="flex items-start gap-2.5">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className={cn(
              'mt-0.5 h-5 w-5 shrink-0 rounded-md border-slate-300 text-cosmos-600',
              'focus:ring-2 focus:ring-cosmos-300 focus:ring-offset-0',
              className,
            )}
            {...rest}
          />
          {label && (
            <label
              htmlFor={inputId}
              className="text-sm leading-relaxed text-graphite"
            >
              {label}
            </label>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  },
);
