import { AREAS } from '@/features/horoscope/types';
import type { Area } from '@/features/horoscope/types';
import { cn } from '@/lib/cn';

interface AreaTabsProps {
  value: Area;
  onChange: (area: Area) => void;
}

export function AreaTabs({ value, onChange }: AreaTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Áreas de la vida"
      className="flex flex-wrap gap-2"
    >
      {AREAS.map((area) => {
        const active = area.key === value;
        return (
          <button
            key={area.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(area.key)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmos-500 focus-visible:ring-offset-2',
              active
                ? 'bg-cosmos-700 text-white shadow-sm'
                : 'bg-mist text-graphite hover:bg-cosmos-50 hover:text-cosmos-700',
            )}
          >
            <span aria-hidden="true">{area.emoji}</span>
            {area.label}
          </button>
        );
      })}
    </div>
  );
}
