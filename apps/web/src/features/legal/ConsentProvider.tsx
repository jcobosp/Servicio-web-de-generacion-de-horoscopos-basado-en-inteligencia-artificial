import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { LEGAL_VERSION } from './company';
import {
  type ConsentState,
  needsConsent,
  readConsent,
  writeConsent,
} from './consent';
import { recordCookieConsents } from './api';
import { useIsPremium } from '@/features/billing/hooks';

export interface ConsentChoice {
  analytics: boolean;
  marketing: boolean;
}

interface ConsentContextValue {
  /** Elección actual, o null si el usuario todavía no ha decidido. */
  consent: ConsentState | null;
  /** El banner debe estar visible (sin decisión vigente y usuario no premium). */
  bannerVisible: boolean;
  /** El panel de personalización está abierto. */
  preferencesOpen: boolean;
  /** Modelo "consentir o suscribirse": aceptar cookies y seguir en el plan gratuito. */
  acceptAll: () => void;
  save: (choice: ConsentChoice) => void;
  openPreferences: () => void;
  closePreferences: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const isPremium = useIsPremium();

  // Lectura síncrona de la cookie en el primer render (SPA sin SSR): evita el
  // parpadeo del banner y no necesita un efecto.
  const [consent, setConsent] = useState<ConsentState | null>(() =>
    readConsent(),
  );
  const [bannerNeeded, setBannerNeeded] = useState<boolean>(() =>
    needsConsent(readConsent()),
  );
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  const persist = useCallback((choice: ConsentChoice) => {
    const next: ConsentState = {
      version: LEGAL_VERSION,
      timestamp: new Date().toISOString(),
      analytics: choice.analytics,
      marketing: choice.marketing,
    };
    writeConsent(next);
    setConsent(next);
    setBannerNeeded(false);
    setPreferencesOpen(false);
    // Acreditación en BD (no bloqueante: si falla, la cookie ya es válida).
    void recordCookieConsents(choice).catch(() => undefined);
  }, []);

  // "Aceptar y seguir gratis": consiente analítica + publicidad (plan gratuito).
  const acceptAll = useCallback(
    () => persist({ analytics: true, marketing: true }),
    [persist],
  );

  // Modelo "consentir o suscribirse": a un usuario premium no se le piden cookies
  // de publicidad (su plan no muestra anuncios), así que no le mostramos el banner.
  const bannerVisible = bannerNeeded && !isPremium;

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      bannerVisible,
      preferencesOpen,
      acceptAll,
      save: persist,
      openPreferences: () => setPreferencesOpen(true),
      closePreferences: () => setPreferencesOpen(false),
    }),
    [consent, bannerVisible, preferencesOpen, acceptAll, persist],
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error('useConsent debe usarse dentro de <ConsentProvider>');
  }
  return ctx;
}
