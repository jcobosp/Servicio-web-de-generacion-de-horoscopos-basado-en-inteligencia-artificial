/* eslint-disable react-refresh/only-export-components */
import { useEffect } from 'react';
import { create } from 'zustand';
import { cn } from '@/lib/cn';

export type ToastTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
  durationMs: number;
}

interface ToastStore {
  toasts: ToastItem[];
  push: (message: string, options?: { tone?: ToastTone; durationMs?: number }) => void;
  dismiss: (id: string) => void;
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (message, options) => {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `t-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set((s) => ({
      toasts: [
        ...s.toasts,
        {
          id,
          message,
          tone: options?.tone ?? 'neutral',
          durationMs: options?.durationMs ?? 4000,
        },
      ],
    }));
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  show: (message: string) => useToastStore.getState().push(message),
  success: (message: string) =>
    useToastStore.getState().push(message, { tone: 'success' }),
  warning: (message: string) =>
    useToastStore.getState().push(message, { tone: 'warning' }),
  error: (message: string) =>
    useToastStore.getState().push(message, { tone: 'danger' }),
};

const toneStyles: Record<ToastTone, string> = {
  neutral: 'bg-white text-ink border-slate-200',
  success: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  warning: 'bg-amber-50 text-amber-900 border-amber-200',
  danger: 'bg-red-50 text-red-900 border-red-200',
};

function ToastCard({ item }: { item: ToastItem }) {
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    const t = setTimeout(() => dismiss(item.id), item.durationMs);
    return () => clearTimeout(t);
  }, [item.id, item.durationMs, dismiss]);

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-md',
        toneStyles[item.tone],
        'animate-[fadeInRight_0.2s_ease-out]',
      )}
    >
      <p className="flex-1 text-sm leading-relaxed">{item.message}</p>
      <button
        type="button"
        onClick={() => dismiss(item.id)}
        aria-label="Cerrar aviso"
        className="rounded-md p-1 text-current/60 hover:bg-black/5"
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path
            d="m6 6 8 8M14 6l-8 8"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 top-4 z-[200] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} item={t} />
      ))}
    </div>
  );
}
