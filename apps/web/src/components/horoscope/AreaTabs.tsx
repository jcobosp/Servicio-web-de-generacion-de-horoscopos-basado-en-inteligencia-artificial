import { Compass, Heart, HeartPulse, Coins, Briefcase } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AREAS } from '@/features/horoscope/types';
import type { Area } from '@/features/horoscope/types';
import { cn } from '@/lib/cn';

interface AreaTabsProps {
  value: Area;
  onChange: (area: Area) => void;
  /** Color de acento del signo para la pestaña activa (por defecto cosmos). */
  accentColor?: string;
}

/** Icono Lucide de cada área (mismo estilo de línea que los datos). */
const AREA_ICON: Record<Area, LucideIcon> = {
  general: Compass,
  love: Heart,
  health: HeartPulse,
  money: Coins,
  work: Briefcase,
};

export function AreaTabs({ value, onChange, accentColor }: AreaTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Áreas de la vida"
      className="flex flex-wrap gap-2"
    >
      {AREAS.map((area) => {
        const active = area.key === value;
        const Icon = AREA_ICON[area.key];
        return (
          <button
            key={area.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(area.key)}
            style={
              active && accentColor
                ? { backgroundColor: accentColor }
                : undefined
            }
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-200 ease-cosmic',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmos-500 focus-visible:ring-offset-2',
              active
                ? cn('text-white shadow-lift', !accentColor && 'bg-cosmos-700')
                : 'bg-mist text-graphite hover:-translate-y-0.5 hover:bg-cosmos-50 hover:text-cosmos-700',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {area.label}
          </button>
        );
      })}
    </div>
  );
}
