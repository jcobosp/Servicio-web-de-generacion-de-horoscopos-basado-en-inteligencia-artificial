import { Helmet } from 'react-helmet-async';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { UpsellCard } from '@/components/horoscope/UpsellCard';
import { AdSlot } from '@/components/ads/AdSlot';
import { useAstroEvents } from '@/features/astro-events/hooks';
import { EVENT_META } from '@/features/astro-events/types';
import type { AstroEvent } from '@/features/astro-events/types';
import { company } from '@/features/legal/company';

const monthLabel = new Intl.DateTimeFormat('es-ES', {
  month: 'long',
  year: 'numeric',
}).format(new Date());

const MONTHS_SHORT_ES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

function formatDay(iso: string): string {
  const parts = iso.split('-');
  const m = Number(parts[1] ?? '1');
  const d = Number(parts[2] ?? '1');
  return `${d} ${MONTHS_SHORT_ES[m - 1] ?? ''}`;
}

function EventCard({ event }: { event: AstroEvent }) {
  const meta = EVENT_META[event.kind] ?? {
    label: event.kind,
    icon: '✨',
    accent: '#7c3aed',
  };
  return (
    <Card padding="lg" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -right-4 -top-4 text-7xl opacity-10"
      >
        {meta.icon}
      </div>
      <div className="flex items-start gap-4">
        <div
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl text-white shadow-sm"
          style={{ backgroundColor: meta.accent }}
        >
          {meta.icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-graphite">
            {meta.label} · {formatDay(event.event_date)}
          </p>
          <h2 className="mt-1 font-display text-xl text-ink sm:text-2xl">
            {event.title}
          </h2>
          <p className="mt-3 leading-relaxed text-graphite">
            {event.description}
          </p>
        </div>
      </div>
    </Card>
  );
}

function EventsBody() {
  const { data, isPending, isError } = useAstroEvents();

  if (isPending) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <Card key={i} padding="lg">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="mt-3 h-6 w-2/3" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !data || data.status !== 'ok') {
    const message =
      data && 'message' in data
        ? data.message
        : 'El cielo astrológico se está alineando. Vuelve en unos minutos.';
    return (
      <Card padding="lg" className="text-center">
        <div aria-hidden="true" className="text-4xl">
          🌙
        </div>
        <p className="mt-3 text-graphite">{message}</p>
      </Card>
    );
  }

  if (data.events.length === 0) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-graphite">
          Este mes no hay grandes eventos astrológicos reseñables.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {data.events.map((ev) => (
        <EventCard key={ev.id} event={ev} />
      ))}
    </div>
  );
}

export function AstroEventsPage() {
  return (
    <>
      <Helmet>
        <title>{`Eventos astrológicos · ${company.brand}`}</title>
        <meta
          name="description"
          content="Eventos astrológicos del mes: lunas nuevas y llenas e ingresos planetarios, con interpretación emocional para cada momento."
        />
        <link rel="canonical" href={`${company.siteUrl}/eventos-astrologicos`} />
      </Helmet>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <header>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">
            Eventos astrológicos
          </h1>
          <p className="mt-2 capitalize text-silver">{monthLabel}</p>
          <p className="mt-3 max-w-xl text-graphite">
            Las fechas exactas de las lunaciones e ingresos planetarios del mes,
            con su lectura emocional. Los cálculos son astronómicos reales; la
            interpretación se renueva cada mes.
          </p>
        </header>

        <div className="mt-8">
          <EventsBody />
        </div>

        <UpsellCard variant="events" />
        <AdSlot className="mt-8" />
      </div>
    </>
  );
}
