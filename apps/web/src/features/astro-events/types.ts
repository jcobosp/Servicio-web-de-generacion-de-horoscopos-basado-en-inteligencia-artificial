export type EventKind =
  | 'new_moon'
  | 'full_moon'
  | 'sun_ingress'
  | 'mercury_ingress'
  | 'venus_ingress'
  | 'mars_ingress';

export interface AstroEvent {
  id: string;
  event_date: string;
  kind: EventKind;
  title: string;
  description: string;
  is_premium: boolean;
}

export type AstroEventsResponse =
  | { status: 'ok'; cached: boolean; month: string; events: AstroEvent[] }
  | { status: 'unavailable'; message: string }
  | { status: 'error'; message: string };

/** Etiquetas e iconos por tipo de evento (para tarjetas en la UI). */
export const EVENT_META: Record<
  EventKind,
  { label: string; icon: string; accent: string }
> = {
  new_moon: { label: 'Luna nueva', icon: '🌑', accent: '#1f2937' },
  full_moon: { label: 'Luna llena', icon: '🌕', accent: '#facc15' },
  sun_ingress: { label: 'Ingreso del Sol', icon: '☀️', accent: '#f59e0b' },
  mercury_ingress: { label: 'Ingreso de Mercurio', icon: '☿', accent: '#a3a3a3' },
  venus_ingress: { label: 'Ingreso de Venus', icon: '♀', accent: '#ec4899' },
  mars_ingress: { label: 'Ingreso de Marte', icon: '♂', accent: '#dc2626' },
};
