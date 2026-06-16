import { Sparkles } from 'lucide-react';
import { isDemoMode } from '@/lib/demo';

/**
 * Aviso superior visible solo en MODO DEMOSTRACIÓN (`VITE_DEMO_MODE=true`).
 * Informa de que los resultados de IA son de ejemplo y recuerda las
 * credenciales del usuario de prueba. No se renderiza en modo normal.
 */
export function DemoBanner() {
  if (!isDemoMode) return null;
  return (
    <div className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-1.5 text-center text-xs sm:text-sm">
        <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
        <span className="font-semibold">Modo demostración:</span>
        <span className="opacity-95">
          resultados de IA precargados (sin coste).
        </span>
        <span className="opacity-95">
          Inicia sesión con{' '}
          <strong className="font-semibold">demo@zodiaq.app</strong> /{' '}
          <strong className="font-semibold">ZodiaqDemo2026</strong>
        </span>
      </div>
    </div>
  );
}
