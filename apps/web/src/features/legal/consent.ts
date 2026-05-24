import { LEGAL_VERSION } from './company';

/**
 * Modelo de consentimiento de cookies (Ley de Cookies — art. 22.2 LSSI).
 *
 * Categorías:
 * - `necessary`: técnicas/estrictamente necesarias. Siempre activas, no
 *   requieren consentimiento (sesión de Supabase, recordar la propia elección).
 * - `analytics`: medición de uso. Requiere consentimiento.
 * - `marketing`: publicidad (AdSense). Requiere consentimiento.
 */
export interface ConsentState {
  /** Versión de la política aceptada (ver LEGAL_VERSION). */
  version: string;
  /** Marca de tiempo ISO de la decisión. */
  timestamp: string;
  analytics: boolean;
  marketing: boolean;
}

/** Nombre de la cookie que persiste la elección (documentado en la política). */
export const CONSENT_COOKIE = 'cookie-consent';

/**
 * Caducidad del consentimiento: la AEPD recomienda re-preguntar cada 24 meses.
 * En segundos para el atributo `max-age`.
 */
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365 * 2;
const CONSENT_MAX_AGE_MS = CONSENT_MAX_AGE_SECONDS * 1000;

/** El estado por defecto antes de consentir: solo lo estrictamente necesario. */
export const DEFAULT_CONSENT: Omit<ConsentState, 'timestamp'> = {
  version: LEGAL_VERSION,
  analytics: false,
  marketing: false,
};

function isValidShape(value: unknown): value is ConsentState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.version === 'string' &&
    typeof v.timestamp === 'string' &&
    typeof v.analytics === 'boolean' &&
    typeof v.marketing === 'boolean'
  );
}

/** Lee la cookie de consentimiento. Devuelve null si no existe o es ilegible. */
export function readConsent(): ConsentState | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${CONSENT_COOKIE}=`));
  if (!match) return null;
  try {
    const raw = decodeURIComponent(match.slice(CONSENT_COOKIE.length + 1));
    const parsed = JSON.parse(raw);
    return isValidShape(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Persiste la elección en la cookie `cookie-consent`. */
export function writeConsent(state: ConsentState): void {
  if (typeof document === 'undefined') return;
  const value = encodeURIComponent(JSON.stringify(state));
  document.cookie =
    `${CONSENT_COOKIE}=${value}; ` +
    `path=/; max-age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax`;
}

/**
 * Decide si hay que mostrar el banner: no hay decisión previa, es de una versión
 * anterior de la política, o ha caducado (más de 24 meses).
 */
export function needsConsent(state: ConsentState | null): boolean {
  if (!state) return true;
  if (state.version !== LEGAL_VERSION) return true;
  const age = Date.now() - new Date(state.timestamp).getTime();
  if (Number.isNaN(age) || age > CONSENT_MAX_AGE_MS) return true;
  return false;
}
