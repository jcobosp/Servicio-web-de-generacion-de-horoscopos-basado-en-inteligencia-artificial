import { CalendarRange, Sparkles, Telescope } from 'lucide-react';
import { Seo } from '@/lib/seo';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/layout/Section';
import { Reveal, RevealStagger, RevealItem } from '@/components/motion/Reveal';
import { GeneratingLoader } from '@/components/feedback/GeneratingLoader';
import { UpsellCard } from '@/components/horoscope/UpsellCard';
import { AdSlot } from '@/components/ads/AdSlot';
import { cn } from '@/lib/cn';
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

/** Estrellas decorativas deterministas del hero (% y retardo). */
const STARS: { top: number; left: number; size: number; delay: number }[] = [
  { top: 16, left: 12, size: 3, delay: 0 },
  { top: 26, left: 86, size: 2, delay: 0.7 },
  { top: 64, left: 8, size: 2, delay: 1.3 },
  { top: 74, left: 90, size: 3, delay: 0.4 },
  { top: 40, left: 95, size: 2, delay: 1.1 },
  { top: 82, left: 28, size: 2, delay: 0.9 },
  { top: 12, left: 60, size: 2, delay: 1.6 },
  { top: 84, left: 68, size: 3, delay: 0.5 },
  { top: 48, left: 46, size: 2, delay: 2.0 },
];

function eventDay(iso: string): { day: string; month: string } {
  const parts = iso.split('-');
  const m = Number(parts[1] ?? '1');
  const d = Number(parts[2] ?? '1');
  return { day: String(d), month: MONTHS_SHORT_ES[m - 1] ?? '' };
}

/** Hero a sangre con identidad «calendario celeste». */
function EventsHero() {
  return (
    <Section width="full" className="px-3 pt-4 sm:px-4 lg:px-6">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-800 px-6 py-14 text-center text-white shadow-lift sm:px-12 sm:py-20">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/30 via-black/15 to-black/50"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-16 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl animate-drift"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 bottom-0 h-72 w-72 rounded-full bg-cyan-200/25 blur-3xl animate-float-slow"
          />
          <span aria-hidden="true" className="pointer-events-none absolute inset-0">
            {STARS.map((s, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.8)] animate-twinkle"
                style={{
                  top: `${s.top}%`,
                  left: `${s.left}%`,
                  width: `${s.size}px`,
                  height: `${s.size}px`,
                  animationDelay: `${s.delay}s`,
                }}
              />
            ))}
          </span>

          <div className="relative z-10 mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.14em] ring-1 ring-white/30 backdrop-blur">
              <Telescope className="h-4 w-4" aria-hidden="true" />
              Calendario celeste
            </span>
            <h1 className="mt-6 font-display text-6xl font-extrabold leading-[0.9] tracking-[-0.035em] [text-shadow:0_2px_24px_rgba(0,0,0,0.35)] sm:text-7xl lg:text-8xl">
              Eventos astrológicos
            </h1>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-lg font-bold capitalize ring-1 ring-white/25 backdrop-blur">
              <CalendarRange className="h-5 w-5" aria-hidden="true" />
              {monthLabel}
            </p>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90">
              Las lunaciones e ingresos planetarios del mes, con fechas
              astronómicas reales y su lectura emocional renovada cada mes.
            </p>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/** Tarjeta de evento (icono de acento + etiqueta·fecha + título + lectura). */
function EventCard({ event }: { event: AstroEvent }) {
  const meta =
    EVENT_META[event.kind] ??
    ({ label: event.kind, icon: Sparkles, accent: '#0ea5e9' } as const);
  const Icon = meta.icon;
  const { day, month } = eventDay(event.event_date);

  return (
    <Card
      padding="lg"
      className="relative h-full overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, ${meta.accent}24, #ffffff 58%)`,
      }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ backgroundImage: `linear-gradient(90deg, ${meta.accent}, transparent)` }}
      />
      <div className="flex items-start gap-4">
        <div
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-soft"
          style={{ backgroundColor: meta.accent }}
        >
          <Icon className="h-7 w-7" strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          <p
            className="text-sm font-bold uppercase tracking-[0.1em]"
            style={{ color: meta.accent }}
          >
            {meta.label} · {day} {month}
          </p>
          <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-3xl">
            {event.title}
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-graphite">
            {event.description}
          </p>
        </div>
      </div>
    </Card>
  );
}

/** Timeline vertical: espina celeste con nodos de fecha y cards alternas. */
function EventsTimeline({ events }: { events: AstroEvent[] }) {
  return (
    <div className="relative">
      {/* Espina (izquierda en móvil, centrada en lg) */}
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-5 top-0 w-1 rounded-full bg-gradient-to-b from-cyan-400 via-sky-500 to-blue-600 lg:left-1/2 lg:-translate-x-1/2"
      />
      <RevealStagger className="space-y-8 lg:space-y-12">
        {events.map((ev, i) => {
          const meta = EVENT_META[ev.kind];
          const accent = meta?.accent ?? '#0ea5e9';
          const { day } = eventDay(ev.event_date);
          const right = i % 2 === 1;
          return (
            <RevealItem key={ev.id} className="relative">
              {/* Nodo de fecha sobre la espina */}
              <span
                aria-hidden="true"
                className="absolute left-5 top-2 z-10 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-white font-display text-lg font-extrabold shadow-lift lg:left-1/2"
                style={{ color: accent, boxShadow: `0 0 0 4px ${accent}22` }}
              >
                {day}
              </span>
              {/* Card: a un lado u otro de la espina en lg */}
              <div
                className={cn(
                  'pl-14 lg:w-[calc(50%-3rem)] lg:pl-0',
                  right ? 'lg:ml-auto' : 'lg:mr-auto',
                )}
              >
                <EventCard event={ev} />
              </div>
            </RevealItem>
          );
        })}
      </RevealStagger>
    </div>
  );
}

function EventsBody() {
  const { data, isPending, isError } = useAstroEvents();

  if (isPending) {
    return (
      <GeneratingLoader
        variant="celeste"
        message="Cartografiando el cielo…"
        hint="Calculando las lunaciones e ingresos planetarios del mes."
      />
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
        <p className="mt-3 text-lg text-graphite">{message}</p>
      </Card>
    );
  }

  if (data.events.length === 0) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-lg text-graphite">
          Este mes no hay grandes eventos astrológicos reseñables.
        </p>
      </Card>
    );
  }

  return <EventsTimeline events={data.events} />;
}

export function AstroEventsPage() {
  return (
    <>
      <Seo
        title={`Eventos astrológicos · ${company.brand}`}
        description="Eventos astrológicos del mes: lunas nuevas y llenas e ingresos planetarios, con interpretación emocional para cada momento."
        path="/eventos-astrologicos"
      />

      <EventsHero />

      <Section width="xwide" className="py-10">
        <EventsBody />

        <UpsellCard variant="events" to="/reportes/mensual" />
        <AdSlot className="mt-8" />
      </Section>
    </>
  );
}
