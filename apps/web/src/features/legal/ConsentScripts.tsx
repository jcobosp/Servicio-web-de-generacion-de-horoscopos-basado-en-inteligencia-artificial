import { useEffect } from 'react';
import { useConsent } from './ConsentProvider';
import { useIsPremium } from '@/features/billing/hooks';

/**
 * Inyecta un <script> externo una sola vez, identificándolo por `id` para
 * evitar duplicados entre renders.
 */
function loadScriptOnce(
  id: string,
  src: string,
  attrs: Record<string, string> = {},
): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(id)) return;
  const el = document.createElement('script');
  el.id = id;
  el.async = true;
  el.src = src;
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  document.head.appendChild(el);
}

/**
 * Carga condicional de scripts de terceros que NO son estrictamente necesarios.
 *
 * Cumple el bloqueo previo exigido por la Ley de Cookies: ningún script de
 * analítica ni de publicidad se inserta hasta que el usuario ha consentido la
 * categoría correspondiente. Los identificadores se leen de variables de
 * entorno; mientras estén vacías (caso actual, hasta tener dominio y cuentas en
 * producción) no se carga nada aunque haya consentimiento.
 *
 * AdSense se integra en la Fase 7 y la analítica en la Fase 10; este componente
 * deja el mecanismo de bloqueo listo y centralizado.
 */
export function ConsentScripts() {
  const { consent } = useConsent();
  const isPremium = useIsPremium();

  // Analítica (p. ej. Google Analytics) — solo con consentimiento "analytics".
  useEffect(() => {
    if (!consent?.analytics) return;
    const gaId = import.meta.env.VITE_GA_ID as string | undefined;
    if (!gaId) return;
    loadScriptOnce(
      'ga-script',
      `https://www.googletagmanager.com/gtag/js?id=${gaId}`,
    );
  }, [consent?.analytics]);

  // Publicidad (Google AdSense) — solo con consentimiento "marketing" y NUNCA
  // para usuarios premium (el plan de pago es sin anuncios: no cargamos siquiera
  // el script de terceros).
  useEffect(() => {
    if (isPremium) return;
    if (!consent?.marketing) return;
    const adsClient = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;
    if (!adsClient) return;
    loadScriptOnce(
      'adsense-script',
      `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsClient}`,
      { crossorigin: 'anonymous' },
    );
  }, [consent?.marketing, isPremium]);

  return null;
}
