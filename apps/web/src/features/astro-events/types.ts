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

import { Moon, MoonStar, Sun, Orbit, Heart, Flame } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/** Etiquetas, icono Lucide y color de acento por tipo de evento. */
export const EVENT_META: Record<
  EventKind,
  { label: string; icon: LucideIcon; accent: string }
> = {
  new_moon: { label: 'Luna nueva', icon: Moon, accent: '#475569' },
  full_moon: { label: 'Luna llena', icon: MoonStar, accent: '#6366f1' },
  sun_ingress: { label: 'Ingreso del Sol', icon: Sun, accent: '#f59e0b' },
  mercury_ingress: { label: 'Ingreso de Mercurio', icon: Orbit, accent: '#0ea5e9' },
  venus_ingress: { label: 'Ingreso de Venus', icon: Heart, accent: '#ec4899' },
  mars_ingress: { label: 'Ingreso de Marte', icon: Flame, accent: '#dc2626' },
};
