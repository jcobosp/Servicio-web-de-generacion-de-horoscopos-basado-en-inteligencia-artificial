export interface DailyEnergyContent {
  headline: string;
  body: string;
  vibe: string;
  /** Nivel de energía del día, entero 1-10, coherente con el resto. */
  energy_level: number;
  mood_emoji: string;
  focus: string;
  caution: string;
  premium_hook: string;
}

export type DailyEnergyResponse =
  | {
      status: 'ok';
      cached: boolean;
      stale?: boolean;
      date?: string;
      content: DailyEnergyContent;
    }
  | { status: 'unavailable'; message: string }
  | { status: 'error'; message: string };
