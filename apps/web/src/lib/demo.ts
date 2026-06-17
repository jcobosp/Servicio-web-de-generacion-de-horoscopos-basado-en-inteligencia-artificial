/**
 * MODO DEMOSTRACIÓN.
 *
 * Activado con `VITE_DEMO_MODE=true`. Su misión es que cualquiera pueda probar
 * TODAS las funcionalidades de la plataforma con el usuario de demostración
 * (ver README) sin que la app llame nunca a la IA (Gemini) y, por tanto, sin
 * generar coste alguno.
 *
 * Funciona interceptando el ÚNICO punto por el que pasa toda la IA del cliente:
 * `supabase.functions.invoke`. En `lib/supabase.ts` se sustituye esa función
 * por `demoInvoke` cuando el modo está activo. Las funciones de generación
 * devuelven resultados de ejemplo precargados (`demo-fixtures.ts`); las de pago
 * y borrado de cuenta devuelven un error controlado.
 *
 * El resto del comportamiento (login real con Supabase, lectura de tablas
 * públicas, RLS, premium por la fila de `subscriptions`) sigue intacto.
 */
import { DEMO_FIXTURES, DEMO_DISABLED_FUNCTIONS } from './demo-fixtures';

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

/** Email del usuario de demostración compartido (ver README). */
export const DEMO_USER_EMAIL = 'demo@zodiaq.app';

/**
 * ¿La sesión actual es la del usuario de demostración compartido?
 * Se usa para proteger esa cuenta común (p. ej. ocultar el borrado de cuenta):
 * si alguien la eliminara, el resto se quedaría sin usuario de prueba.
 */
export function isDemoUser(email: string | null | undefined): boolean {
  return isDemoMode && (email ?? '').toLowerCase() === DEMO_USER_EMAIL;
}

/** Pequeña espera para que se vean las animaciones de carga, como en real. */
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

type InvokeResult = { data: unknown; error: unknown };
type RealInvoke = (name: string, options?: { body?: unknown }) => Promise<InvokeResult>;

/**
 * Sustituto de `supabase.functions.invoke` en modo demo.
 * - Función de generación conocida → resultado de ejemplo.
 * - Función deshabilitada (pagos/borrado) → error amable.
 * - Cualquier otra → se delega en la invocación real (lecturas inocuas).
 */
export async function demoInvoke(
  name: string,
  options: { body?: unknown } | undefined,
  realInvoke: RealInvoke,
): Promise<InvokeResult> {
  const body = (options?.body ?? {}) as Record<string, unknown>;

  const fixture = DEMO_FIXTURES[name];
  if (fixture) {
    await delay(600);
    return { data: fixture(body), error: null };
  }

  if (DEMO_DISABLED_FUNCTIONS.has(name)) {
    await delay(300);
    return {
      data: null,
      error: new Error(
        'Esta acción (pagos y gestión de cuenta) está deshabilitada en la versión de demostración.',
      ),
    };
  }

  return realInvoke(name, options);
}
