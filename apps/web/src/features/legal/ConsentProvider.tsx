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

export interface ConsentChoice {
  analytics: boolean;
  marketing: boolean;
}

interface ConsentContextValue {
  /** Elección actual, o null si el usuario todavía no ha decidido. */
  consent: ConsentState | null;
  /** El banner debe estar visible (no hay decisión válida y vigente). */
  bannerVisible: boolean;
  /** El panel de personalización está abierto. */
  preferencesOpen: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  save: (choice: ConsentChoice) => void;
  openPreferences: () => void;
  closePreferences: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  // Lectura síncrona de la cookie en el primer render (SPA sin SSR): evita el
  // parpadeo del banner y no necesita un efecto.
  const [consent, setConsent] = useState<ConsentState | null>(() =>
    readConsent(),
  );
  const [bannerVisible, setBannerVisible] = useState<boolean>(() =>
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
    setBannerVisible(false);
    setPreferencesOpen(false);
    // Acreditación en BD (no bloqueante: si falla, la cookie ya es válida).
    void recordCookieConsents(choice).catch(() => undefined);
  }, []);

  const acceptAll = useCallback(
    () => persist({ analytics: true, marketing: true }),
    [persist],
  );
  const rejectAll = useCallback(
    () => persist({ analytics: false, marketing: false }),
    [persist],
  );

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      bannerVisible,
      preferencesOpen,
      acceptAll,
      rejectAll,
      save: persist,
      openPreferences: () => setPreferencesOpen(true),
      closePreferences: () => setPreferencesOpen(false),
    }),
    [consent, bannerVisible, preferencesOpen, acceptAll, rejectAll, persist],
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
