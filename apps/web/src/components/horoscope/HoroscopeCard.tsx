import { Hash, Palette, Sparkle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import type { HoroscopeResponse } from '@/features/horoscope/types';

interface HoroscopeCardProps {
  isLoading: boolean;
  isError: boolean;
  data: HoroscopeResponse | undefined;
  /** Color de acento del signo para titulares y detalles. */
  accent: string;
}

function SoftMessage({ message }: { message: string }) {
  return (
    <Card padding="lg" className="text-center">
      <div aria-hidden="true" className="text-4xl">
        🌙
      </div>
      <p className="mt-3 text-graphite">{message}</p>
    </Card>
  );
}

/** Píldora de dato (número/color/palabra) con el acento del signo. */
function DataPill({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Hash;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 shadow-soft">
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: accent }}
        aria-hidden="true"
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="text-sm font-medium text-graphite">
        {label}: <span className="font-bold text-ink">{value}</span>
      </span>
    </div>
  );
}

export function HoroscopeCard({
  isLoading,
  isError,
  data,
  accent,
}: HoroscopeCardProps) {
  if (isLoading) {
    return (
      <Card padding="lg">
        <Skeleton className="h-9 w-3/4" />
        <div className="mt-6 space-y-2.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-11/12" />
        </div>
        <div className="mt-6 flex gap-2">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <SoftMessage message="No hemos podido leer las estrellas ahora mismo. Vuelve a intentarlo en un momento." />
    );
  }

  if (!data || data.status !== 'ok') {
    const message =
      data && 'message' in data
        ? data.message
        : 'Las estrellas están alineándose. Vuelve en unos minutos.';
    return <SoftMessage message={message} />;
  }

  const c = data.content;

  return (
    <Card padding="lg" className="relative overflow-hidden">
      {/* Acento de color del signo en el borde superior */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1.5"
        style={{
          backgroundImage: `linear-gradient(90deg, ${accent}, transparent)`,
        }}
      />

      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="text-4xl leading-none">
          {c.mood_emoji}
        </span>
        <h2
          className="font-display text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl"
          style={{ color: accent }}
        >
          {c.headline}
        </h2>
      </div>

      <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-graphite">
        {c.body}
      </p>

      {c.disclaimer && (
        <p className="mt-5 rounded-xl bg-mist px-4 py-2.5 text-xs text-silver">
          {c.disclaimer}
        </p>
      )}

      <div className="mt-7 flex flex-wrap items-center gap-2.5">
        <DataPill
          icon={Hash}
          label="Nº de la suerte"
          value={String(c.lucky_number)}
          accent={accent}
        />
        <DataPill
          icon={Palette}
          label="Color"
          value={c.lucky_color}
          accent={accent}
        />
        <DataPill
          icon={Sparkle}
          label="Clave"
          value={c.keyword}
          accent={accent}
        />
        {data.stale && (
          <span className="rounded-full bg-mist px-3 py-1.5 text-xs font-medium text-silver">
            lectura reciente
          </span>
        )}
      </div>
    </Card>
  );
}
