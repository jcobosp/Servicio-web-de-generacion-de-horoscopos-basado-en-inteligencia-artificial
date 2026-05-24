import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
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

export function HoroscopeCard({
  isLoading,
  isError,
  data,
  accent,
}: HoroscopeCardProps) {
  if (isLoading) {
    return (
      <Card padding="lg">
        <Skeleton className="h-7 w-3/4" />
        <div className="mt-5 space-y-2.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-11/12" />
        </div>
        <div className="mt-6 flex gap-2">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
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
    <Card padding="lg">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="text-3xl leading-none">
          {c.mood_emoji}
        </span>
        <h2
          className="font-display text-2xl leading-tight sm:text-3xl"
          style={{ color: accent }}
        >
          {c.headline}
        </h2>
      </div>

      <p className="mt-5 whitespace-pre-line leading-relaxed text-graphite">
        {c.body}
      </p>

      {c.disclaimer && (
        <p className="mt-4 rounded-lg bg-mist px-3 py-2 text-xs text-silver">
          {c.disclaimer}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Badge tone="cosmos">Nº de la suerte: {c.lucky_number}</Badge>
        <Badge tone="neutral">Color: {c.lucky_color}</Badge>
        <Badge tone="premium">{c.keyword}</Badge>
        {data.stale && <Badge tone="neutral">lectura reciente</Badge>}
      </div>
    </Card>
  );
}
