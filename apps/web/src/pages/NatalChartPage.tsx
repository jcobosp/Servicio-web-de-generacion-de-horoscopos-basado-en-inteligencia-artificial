import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { UpsellCard } from '@/components/horoscope/UpsellCard';
import { AdSlot } from '@/components/ads/AdSlot';
import { useAuth } from '@/features/auth/AuthProvider';
import { useProfile } from '@/features/profile/hooks';
import { useGenerateNatalChart, useNatalChart } from '@/features/natal/hooks';
import { useIsPremium } from '@/features/billing/hooks';
import { searchCities } from '@/features/natal/cities';
import type { City } from '@/features/natal/cities';
import type { NatalChart, Placement } from '@/features/natal/types';
import { ZODIAC } from '@/lib/zodiac';
import { company } from '@/features/legal/company';

function formatDeg(deg: number): string {
  return `${deg.toFixed(1).replace('.', ',')}º`;
}

function formatBirthDate(iso: string): string {
  const parts = iso.split('-').map(Number);
  const y = parts[0] ?? 1970;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** Tarjeta de un astro (Sol, Luna) o del Ascendente. */
function PlacementCard({
  label,
  symbol,
  placement,
}: {
  label: string;
  symbol: string;
  placement: Placement | null;
}) {
  if (!placement) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-mist/40 p-5 text-center">
        <span aria-hidden="true" className="text-2xl opacity-40">
          🔒
        </span>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-silver">
          {label}
        </p>
        <p className="mt-1 text-sm text-silver">Añade tu hora y lugar</p>
      </div>
    );
  }

  const info = ZODIAC[placement.sign];
  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
      <span
        aria-hidden="true"
        className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl text-white shadow-sm"
        style={{
          backgroundImage: `linear-gradient(135deg, ${info.colors.from}, ${info.colors.to})`,
        }}
      >
        {info.glyph}
      </span>
      <p className="mt-3 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-graphite">
        <span aria-hidden="true">{symbol}</span> {label}
      </p>
      <p className="mt-0.5 font-display text-lg text-ink">{placement.sign_name}</p>
      <p className="text-sm text-silver">{formatDeg(placement.deg_in_sign)}</p>
    </div>
  );
}

function ChartResult({ chart, isPremium }: { chart: NatalChart; isPremium: boolean }) {
  const i = chart.interpretation;
  return (
    <>
      <Card padding="lg">
        <div className="grid grid-cols-3 gap-3">
          <PlacementCard label="Sol" symbol="☉" placement={chart.sun} />
          <PlacementCard label="Luna" symbol="☽" placement={chart.moon} />
          <PlacementCard label="Ascendente" symbol="↑" placement={chart.ascendant} />
        </div>

        {chart.moon_approximate && (
          <p className="mt-4 rounded-lg bg-mist/60 px-3 py-2 text-xs text-silver">
            Tu Luna se ha calculado sin hora exacta: si naciste muy cerca de un
            cambio de signo, podría variar. Añade tu hora para afinarla.
          </p>
        )}

        <p className="mt-6 leading-relaxed text-graphite">{i.intro}</p>

        <div className="mt-6 space-y-5">
          <section>
            <h3 className="flex items-center gap-2 font-display text-lg text-ink">
              <span aria-hidden="true">☉</span> Tu Sol en {chart.sun.sign_name}
            </h3>
            <p className="mt-1 leading-relaxed text-graphite">{i.sun}</p>
          </section>
          <section>
            <h3 className="flex items-center gap-2 font-display text-lg text-ink">
              <span aria-hidden="true">☽</span> Tu Luna en {chart.moon.sign_name}
            </h3>
            <p className="mt-1 leading-relaxed text-graphite">{i.moon}</p>
          </section>
          <section>
            <h3 className="flex items-center gap-2 font-display text-lg text-ink">
              <span aria-hidden="true">↑</span>{' '}
              {chart.ascendant
                ? `Tu Ascendente en ${chart.ascendant.sign_name}`
                : 'Tu Ascendente'}
            </h3>
            <p className="mt-1 leading-relaxed text-graphite">{i.ascendant}</p>
          </section>
        </div>

        <div className="mt-6 rounded-xl bg-cosmos-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-cosmos-700">
            Tú, en una sola mirada
          </p>
          <p className="mt-1 leading-relaxed text-graphite">{i.synthesis}</p>
        </div>
      </Card>

      {isPremium ? (
        <Card tone="premium" padding="lg" className="mt-8">
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gold-600">
            <span aria-hidden="true">✨</span> Tu plan premium
          </p>
          <h3 className="mt-2 font-display text-2xl text-ink">
            Esto es solo la portada de tu carta
          </h3>
          <p className="mt-3 max-w-2xl leading-relaxed text-graphite">
            Tu carta completa incluye los 10 planetas, las 12 casas y los
            aspectos entre ellos, con una lectura profunda de tu identidad,
            emociones, vínculos y vocación.
          </p>
          <div className="mt-6">
            <LinkButton to="/carta-natal/completa" variant="premium" size="lg">
              Ver mi carta natal completa →
            </LinkButton>
          </div>
        </Card>
      ) : (
        <>
          <UpsellCard variant="natal" premiumHook={i.premium_hook} />
          <AdSlot className="mt-8" />
        </>
      )}
    </>
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
        label="Lugar de nacimiento (opcional)"
        hint="Junto con la hora, desbloquea tu Ascendente."
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

export function NatalChartPage() {
  const { session } = useAuth();
  const { data: profile } = useProfile();
  const existing = useNatalChart();
  const gen = useGenerateNatalChart();
  const isPremium = useIsPremium();

  const [birthTime, setBirthTime] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  // Prefill con lo que ya hubiera en el perfil. Lo hacemos durante el render
  // con un guard (patrón "adjusting state while rendering" de React), no en un
  // useEffect: solo dispara un re-render adicional la primera vez que llega
  // el perfil, igual que un useEffect, pero sin el coste de un commit extra.
  const [prefilledFor, setPrefilledFor] = useState<string | null>(null);
  if (profile && profile.id !== prefilledFor) {
    setPrefilledFor(profile.id);
    if (profile.birth_time) setBirthTime(profile.birth_time.slice(0, 5));
    if (profile.birth_place) {
      setCityQuery(profile.birth_place);
      const match = searchCities(profile.birth_place, 1)[0];
      if (match) setSelectedCity(match);
    }
  }

  const fresh = gen.data?.status === 'ok' ? gen.data.chart : null;
  const chart = fresh ?? existing.data ?? null;
  const hasChart = Boolean(chart);

  function onGenerate() {
    gen.mutate({
      birth_time: birthTime || null,
      lat: selectedCity?.lat ?? null,
      lng: selectedCity?.lng ?? null,
      tz: selectedCity?.tz ?? null,
      place_label: selectedCity?.name ?? null,
    });
  }

  return (
    <>
      <Helmet>
        <title>{`Carta natal · ${company.brand}`}</title>
        <meta
          name="description"
          content="Tu carta natal básica gratuita: descubre tu Sol, tu Luna y tu Ascendente, e interpreta quién eres de verdad."
        />
        <link rel="canonical" href={`${company.siteUrl}/carta-natal/basica`} />
      </Helmet>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <header>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">
            Tu carta natal
          </h1>
          <p className="mt-3 max-w-xl text-graphite">
            El Sol dice quién quieres ser; la Luna, lo que sientes; el
            Ascendente, cómo te ve el mundo. Estos tres puntos son el corazón de
            tu carta.
          </p>
        </header>

        {!session ? (
          <Card padding="lg" className="mt-8 text-center">
            <div aria-hidden="true" className="text-4xl">
              🌌
            </div>
            <p className="mt-3 text-graphite">
              Inicia sesión para calcular tu carta natal a partir de tu fecha de
              nacimiento.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <LinkButton to="/login" variant="secondary">
                Iniciar sesión
              </LinkButton>
              <LinkButton to="/registro" variant="primary">
                Crear cuenta
              </LinkButton>
            </div>
          </Card>
        ) : existing.isPending ? (
          <Card padding="lg" className="mt-8 text-center text-silver">
            Cargando tu carta…
          </Card>
        ) : hasChart && chart ? (
          // Ya tiene su carta: la mostramos sin formulario. La carta natal se
          // calcula UNA sola vez por usuario (también blindado en el backend),
          // así que no ofrecemos regenerar.
          <div className="mt-8">
            <ChartResult chart={chart} isPremium={isPremium} />
          </div>
        ) : (
          // No tiene carta: formulario para calcularla por primera vez.
          <>
            <Card padding="lg" className="mt-8">
              <p className="font-display text-lg text-ink">Calcula tu carta</p>
              <p className="mt-1 text-sm text-silver">
                Solo se calcula una vez, así que tómate un momento para añadir
                la hora y el lugar si los recuerdas: con ellos desbloqueas tu
                Ascendente.
              </p>

              {profile?.birth_date && (
                <p className="mt-3 text-sm text-silver">
                  Fecha de nacimiento:{' '}
                  <span className="font-medium text-graphite">
                    {formatBirthDate(profile.birth_date)}
                  </span>{' '}
                  · La cambias en tu{' '}
                  <a className="text-cosmos-700 underline" href="/perfil">
                    perfil
                  </a>
                  .
                </p>
              )}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Input
                  type="time"
                  label="Hora de nacimiento (opcional)"
                  hint="Afina tu Luna y desbloquea tu Ascendente."
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

              {birthTime && !selectedCity && (
                <p className="mt-3 text-xs text-silver">
                  Para calcular el Ascendente necesitamos también tu ciudad de
                  nacimiento (elígela de la lista).
                </p>
              )}

              <div className="mt-5">
                <Button onClick={onGenerate} disabled={gen.isPending} size="lg">
                  {gen.isPending
                    ? 'Trazando tu mapa estelar…'
                    : 'Calcular mi carta'}
                </Button>
              </div>

              {gen.data && gen.data.status !== 'ok' && (
                <p className="mt-3 text-sm text-graphite">{gen.data.message}</p>
              )}
              {gen.isError && (
                <p className="mt-3 text-sm text-red-600">
                  No se pudo calcular tu carta. Inténtalo de nuevo en un momento.
                </p>
              )}
            </Card>

            {gen.isPending && (
              <Card padding="lg" className="mt-6">
                <div className="grid grid-cols-3 gap-3">
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                </div>
                <div className="mt-6 space-y-2.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
}
