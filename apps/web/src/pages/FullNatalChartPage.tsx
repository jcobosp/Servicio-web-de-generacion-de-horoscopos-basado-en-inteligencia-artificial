import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PremiumGate } from '@/components/billing/PremiumGate';
import { useProfile } from '@/features/profile/hooks';
import {
  useFullNatalChart,
  useGenerateFullNatalChart,
} from '@/features/natal/hooks';
import { searchCities } from '@/features/natal/cities';
import type { City } from '@/features/natal/cities';
import type { FullNatalChart, PlanetPosition } from '@/features/natal/types';
import { ZODIAC } from '@/lib/zodiac';
import { decodeByteaText } from '@/lib/bytea';
import { company } from '@/features/legal/company';

function formatDeg(deg: number): string {
  return `${deg.toFixed(1).replace('.', ',')}º`;
}

/** Fila/chip de un planeta con su glifo, signo y casa. */
function PlanetChip({ p }: { p: PlanetPosition }) {
  const info = ZODIAC[p.sign];
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg text-white"
        style={{
          backgroundImage: `linear-gradient(135deg, ${info.colors.from}, ${info.colors.to})`,
        }}
      >
        {info.glyph}
      </span>
      <div className="min-w-0">
        <p className="flex items-center gap-1 text-sm font-medium text-ink">
          <span aria-hidden="true">{p.symbol}</span> {p.name}
          {p.retrograde && (
            <span
              title="Retrógrado"
              className="ml-1 text-xs font-semibold text-cosmos-600"
            >
              ℞
            </span>
          )}
        </p>
        <p className="truncate text-xs text-silver">
          {p.sign_name} · {formatDeg(p.deg_in_sign)} · Casa {p.house}
        </p>
      </div>
    </div>
  );
}

function Section({ title, symbol, text }: { title: string; symbol: string; text: string }) {
  return (
    <section>
      <h3 className="flex items-center gap-2 font-display text-xl text-ink">
        <span aria-hidden="true">{symbol}</span> {title}
      </h3>
      <p className="mt-2 whitespace-pre-line leading-relaxed text-graphite">{text}</p>
    </section>
  );
}

function FullChartResult({ chart }: { chart: FullNatalChart }) {
  const i = chart.interpretation;
  return (
    <div className="space-y-6">
      <Card padding="lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Tu mapa planetario</CardTitle>
          {chart.place && <Badge tone="cosmos">{chart.place}</Badge>}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {chart.planets.map((p) => (
            <PlanetChip key={p.body} p={p} />
          ))}
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-silver">
              Puntos angulares
            </p>
            <ul className="mt-2 space-y-1 text-sm text-graphite">
              <li>
                <span aria-hidden="true">↑</span> Ascendente en{' '}
                <span className="font-medium text-ink">{chart.ascendant.sign_name}</span>{' '}
                ({formatDeg(chart.ascendant.deg_in_sign)})
              </li>
              <li>
                <span aria-hidden="true">⊕</span> Medio Cielo en{' '}
                <span className="font-medium text-ink">{chart.midheaven.sign_name}</span>{' '}
                ({formatDeg(chart.midheaven.deg_in_sign)})
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-silver">
              Aspectos principales
            </p>
            <ul className="mt-2 space-y-1 text-sm text-graphite">
              {chart.aspects.slice(0, 8).map((a) => (
                <li key={`${a.a}-${a.b}-${a.type}`}>
                  {a.a_name} <span aria-hidden="true">{a.symbol}</span> {a.b_name}{' '}
                  <span className="text-silver">· {a.type_name} ({formatDeg(a.orb)})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <Card padding="lg">
        <p className="leading-relaxed text-graphite">{i.identity}</p>
        <div className="mt-6 space-y-6">
          <Section title="Tu vida emocional" symbol="☽" text={i.emotional} />
          <Section title="Vínculos y amor" symbol="♀" text={i.love} />
          <Section title="Vocación y propósito" symbol="⊕" text={i.vocation} />
          <Section title="Tu sombra y tu trabajo personal" symbol="♇" text={i.shadow} />
          <Section title="Los próximos 12 meses" symbol="✦" text={i.year_ahead} />
        </div>

        <div className="mt-6 rounded-xl bg-cosmos-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-cosmos-700">
            Tú, en una sola mirada
          </p>
          <p className="mt-1 leading-relaxed text-graphite">{i.summary}</p>
        </div>
      </Card>
    </div>
  );
}

/** Autocompletado de ciudad de nacimiento sobre la lista local. */
function CityField({
  value,
  selected,
  onQueryChange,
  onSelect,
}: {
  value: string;
  selected: City | null;
  onQueryChange: (q: string) => void;
  onSelect: (c: City) => void;
}) {
  const [open, setOpen] = useState(false);
  const results = useMemo(
    () => (selected && selected.name === value ? [] : searchCities(value)),
    [value, selected],
  );

  return (
    <div className="relative">
      <Input
        label="Lugar de nacimiento"
        hint="Necesario para tus casas y el Ascendente."
        placeholder="Empieza a escribir tu ciudad…"
        value={value}
        autoComplete="off"
        onChange={(e) => {
          onQueryChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        rightAddon={selected ? <span aria-hidden="true">✓</span> : undefined}
      />
      {open && results.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {results.map((c) => (
            <li key={`${c.name}-${c.lat}`}>
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-sm text-graphite hover:bg-cosmos-50 hover:text-ink"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(c);
                  setOpen(false);
                }}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Cuerpo premium: muestra la carta guardada o el formulario de cálculo. */
function FullChartBody() {
  const { data: profile } = useProfile();
  const existing = useFullNatalChart();
  const gen = useGenerateFullNatalChart();

  const [birthTime, setBirthTime] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Prefill con lo que ya hubiera en el perfil (de la carta básica).
  const [prefilledFor, setPrefilledFor] = useState<string | null>(null);
  if (profile && profile.id !== prefilledFor) {
    setPrefilledFor(profile.id);
    const time = decodeByteaText(profile.birth_time);
    const placeName = decodeByteaText(profile.birth_place);
    if (time) setBirthTime(time.slice(0, 5));
    if (placeName) {
      setCityQuery(placeName);
      const match = searchCities(placeName, 1)[0];
      if (match) setSelectedCity(match);
    }
  }

  const fresh = gen.data?.status === 'ok' ? gen.data.chart : null;
  const chart = fresh ?? existing.data ?? null;

  function onGenerate() {
    gen.mutate({
      birth_time: birthTime || null,
      lat: selectedCity?.lat ?? null,
      lng: selectedCity?.lng ?? null,
      tz: selectedCity?.tz ?? null,
      place_label: selectedCity?.name ?? null,
    });
  }

  if (existing.isPending) {
    return (
      <Card padding="lg" className="text-center text-silver">
        Cargando tu carta…
      </Card>
    );
  }

  if (chart) {
    return <FullChartResult chart={chart} />;
  }

  const ready = Boolean(birthTime && selectedCity);

  return (
    <>
      <Card padding="lg">
        <CardTitle>Calcula tu carta completa</CardTitle>
        <p className="mt-1 text-sm text-silver">
          Se calcula una sola vez. Necesitamos tu hora y ciudad de nacimiento
          exactas: con ellas trazamos tus 12 casas, tu Ascendente y tu Medio
          Cielo.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Input
            type="time"
            label="Hora de nacimiento"
            hint="Cuanto más exacta, más precisa será tu carta."
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
          />
          <CityField
            value={cityQuery}
            selected={selectedCity}
            onQueryChange={(q) => {
              setCityQuery(q);
              setSelectedCity(null);
            }}
            onSelect={(c) => {
              setSelectedCity(c);
              setCityQuery(c.name);
            }}
          />
        </div>

        {!ready && (
          <p className="mt-3 text-xs text-silver">
            Indica tu hora y elige tu ciudad de la lista para continuar.
          </p>
        )}

        <div className="mt-5">
          <Button onClick={onGenerate} disabled={!ready || gen.isPending} size="lg">
            {gen.isPending ? 'Trazando tu carta completa…' : 'Generar mi carta completa'}
          </Button>
        </div>

        {gen.data && gen.data.status !== 'ok' && (
          <p className="mt-3 text-sm text-graphite">{gen.data.message}</p>
        )}
        {gen.isError && (
          <p className="mt-3 text-sm text-red-600">
            No se pudo generar tu carta. Inténtalo de nuevo en un momento.
          </p>
        )}
      </Card>

      {gen.isPending && (
        <Card padding="lg" className="mt-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
          <div className="mt-6 space-y-2.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </Card>
      )}
    </>
  );
}

export function FullNatalChartPage() {
  return (
    <>
      <Helmet>
        <title>{`Carta natal completa · ${company.brand}`}</title>
        <meta
          name="description"
          content="Tu carta natal completa: 10 planetas, 12 casas y los aspectos entre ellos, interpretados a fondo. El mapa que explica por qué eres tú."
        />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href={`${company.siteUrl}/carta-natal/completa`} />
      </Helmet>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <header>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">
            Tu carta natal completa
          </h1>
          <p className="mt-3 max-w-xl text-graphite">
            Diez planetas, doce casas y los aspectos que los conectan. El retrato
            profundo de tu identidad, tus emociones, tus vínculos, tu vocación y
            tu camino de crecimiento.
          </p>
        </header>

        <div className="mt-8">
          <PremiumGate
            title="Tu carta natal completa te espera"
            description="Sol, Luna y Ascendente son solo el principio. Suscríbete y desbloquea tu carta completa: 10 planetas, 12 casas, tus aspectos y una lectura profunda de quién eres —además de todo Zodiaq sin anuncios."
          >
            <FullChartBody />
          </PremiumGate>
        </div>
      </div>
    </>
  );
}
