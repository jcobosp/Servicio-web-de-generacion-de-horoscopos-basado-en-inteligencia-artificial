import { useEffect, useMemo, useRef, useState } from 'react';
import { Seo } from '@/lib/seo';
import { Link } from 'react-router-dom';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { AdSlot } from '@/components/ads/AdSlot';
import { PremiumGate } from '@/components/billing/PremiumGate';
import { useAuth } from '@/features/auth/AuthProvider';
import { useProfile } from '@/features/profile/hooks';
import {
  useCurrentReport,
  useGenerateReport,
  useReportById,
  useReportHistory,
} from '@/features/reports/hooks';
import type { BodyPosition, Report, ReportKind } from '@/features/reports/types';
import { searchCities } from '@/features/natal/cities';
import type { City } from '@/features/natal/cities';
import { ZODIAC } from '@/lib/zodiac';
import { decodeByteaText } from '@/lib/bytea';
import { company } from '@/features/legal/company';

interface SectionDef {
  key: string;
  title: string;
  symbol: string;
}

const SECTIONS: Record<ReportKind, SectionDef[]> = {
  monthly: [
    { key: 'overview', title: 'El clima del mes', symbol: '✦' },
    { key: 'love', title: 'Amor y vínculos', symbol: '♀' },
    { key: 'work', title: 'Trabajo y dinero', symbol: '♃' },
    { key: 'wellbeing', title: 'Bienestar y energía', symbol: '☽' },
    { key: 'key_moments', title: 'Momentos clave', symbol: '☿' },
  ],
  annual: [
    { key: 'overview', title: 'El gran tema de tu año', symbol: '✦' },
    { key: 'first_half', title: 'Primer semestre', symbol: '☉' },
    { key: 'second_half', title: 'Segundo semestre', symbol: '☽' },
    { key: 'love', title: 'Amor y vínculos', symbol: '♀' },
    { key: 'career', title: 'Vocación y dinero', symbol: '♃' },
    { key: 'growth', title: 'Tu crecimiento', symbol: '♄' },
  ],
};

const META: Record<ReportKind, { route: string; title: string; lead: string; gateDesc: string }> = {
  monthly: {
    route: '/reportes/mensual',
    title: 'Tu informe mensual',
    lead: 'Un informe personalizado que cruza tu carta natal con los tránsitos del mes: amor, trabajo, bienestar y los momentos a los que conviene estar atento.',
    gateDesc: 'Suscríbete y recibe cada mes un informe personalizado de tu cielo: amor, trabajo, bienestar y momentos clave —cruzando tu carta natal con los tránsitos reales del mes, además de todo Zodiaq sin anuncios.',
  },
  annual: {
    route: '/reportes/anual',
    title: 'Tu informe anual',
    lead: 'El mapa de tu año: el gran tema, cómo se despliega semestre a semestre, tu amor, tu vocación y el aprendizaje que te espera, a partir de tu carta y los tránsitos del año.',
    gateDesc: 'Suscríbete y desbloquea tu informe anual: el gran tema de tu año, semestre a semestre, amor, vocación y crecimiento —a partir de tu carta natal y los tránsitos del año, además de todo Zodiaq sin anuncios.',
  },
};

function periodLabelFromStart(kind: ReportKind, periodStart: string): string {
  if (kind === 'annual') return periodStart.slice(0, 4);
  try {
    return new Intl.DateTimeFormat('es-ES', {
      month: 'long', year: 'numeric', timeZone: 'UTC',
    }).format(new Date(periodStart));
  } catch {
    return periodStart;
  }
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
        hint="Afina tu Ascendente y el detalle del informe."
        placeholder="Ciudad…"
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

function TransitChip({ b }: { b: BodyPosition }) {
  const info = ZODIAC[b.sign];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-graphite">
      <span
        aria-hidden="true"
        className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] text-white"
        style={{ backgroundImage: `linear-gradient(135deg, ${info.colors.from}, ${info.colors.to})` }}
      >
        {info.glyph}
      </span>
      <span aria-hidden="true">{b.symbol}</span> {b.name} en {b.sign_name}
      {b.retrograde && <span title="Retrógrado" className="text-cosmos-600">℞</span>}
    </span>
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

function ReportResult({ report }: { report: Report }) {
  const i = report.interpretation;
  const sections = SECTIONS[report.kind];
  return (
    <div className="space-y-6">
      <Card padding="lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-silver">
              {report.kind === 'monthly' ? 'Informe mensual' : 'Informe anual'}
            </p>
            <CardTitle className="mt-0.5 capitalize">{report.period_label}</CardTitle>
          </div>
          {report.place && <Badge tone="cosmos">{report.place}</Badge>}
        </div>

        {i.headline && (
          <p className="mt-3 font-display text-lg text-cosmos-700">{i.headline}</p>
        )}

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-silver">
            El cielo de {report.period_label}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {report.transits.map((b) => (
              <TransitChip key={b.body} b={b} />
            ))}
          </div>
        </div>

        {report.aspects.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-silver">
              Tránsitos que tocan tu carta
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {report.aspects.slice(0, 8).map((a, idx) => (
                <li
                  key={`${a.transit}-${a.natal}-${a.type}-${idx}`}
                  className={`rounded-full px-2.5 py-1 text-xs ${
                    a.harmonious ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {a.transit_name} · {a.type_name} · {a.natal_name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card padding="lg">
        <div className="space-y-6">
          {sections.map((s) => {
            const text = i[s.key];
            return text ? (
              <Section key={s.key} title={s.title} symbol={s.symbol} text={text} />
            ) : null;
          })}
        </div>
        {i.advice && (
          <div className="mt-6 rounded-xl bg-cosmos-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-cosmos-700">
              Tu consejo {report.kind === 'monthly' ? 'del mes' : 'del año'}
            </p>
            <p className="mt-1 leading-relaxed text-graphite">{i.advice}</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function ReportBody({ kind }: { kind: ReportKind }) {
  const { data: profile } = useProfile();
  const existing = useCurrentReport(kind);
  const gen = useGenerateReport(kind);
  const history = useReportHistory(kind);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useReportById(selectedId);
  const resultRef = useRef<HTMLDivElement>(null);

  const [birthTime, setBirthTime] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Prefill con lo que ya hubiera en el perfil (de la carta natal).
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

  const fresh = gen.data?.status === 'ok' ? gen.data.report : null;
  const currentReport = fresh ?? existing.data ?? null;
  // Lo mostrado: un informe del historial seleccionado o el del periodo en curso.
  const shownReport = selectedId ? (selected.data ?? null) : currentReport;

  useEffect(() => {
    if (selectedId && selected.data && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedId, selected.data]);

  function onGenerate() {
    setSelectedId(null);
    gen.mutate({
      kind,
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
        Cargando tu informe…
      </Card>
    );
  }

  const periodWord = kind === 'monthly' ? 'mes' : 'año';

  return (
    <div className="space-y-6">
      {!currentReport && (
        <Card padding="lg">
          <CardTitle>Genera tu informe de este {periodWord}</CardTitle>
          <p className="mt-1 text-sm text-silver">
            Está incluido en tu plan premium. Con tu fecha de nacimiento basta; la
            hora y la ciudad afinan tu Ascendente y el detalle del informe.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Input
              type="time"
              label="Hora de nacimiento (opcional)"
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

          <div className="mt-5">
            <Button onClick={onGenerate} disabled={gen.isPending} size="lg">
              {gen.isPending ? 'Escribiendo tu informe…' : `Generar mi informe ${kind === 'monthly' ? 'mensual' : 'anual'}`}
            </Button>
          </div>

          {gen.data && gen.data.status !== 'ok' && (
            <p className="mt-3 text-sm text-graphite">{gen.data.message}</p>
          )}
          {gen.isError && (
            <p className="mt-3 text-sm text-red-600">
              No se pudo generar tu informe. Inténtalo de nuevo en un momento.
            </p>
          )}
        </Card>
      )}

      {gen.isPending && (
        <Card padding="lg">
          <Skeleton className="h-6 w-48" />
          <div className="mt-4 flex flex-wrap gap-2">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-7 w-28" />
          </div>
          <div className="mt-6 space-y-2.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </Card>
      )}

      {selectedId && selected.isPending && (
        <Card padding="lg">
          <Skeleton className="h-6 w-48" />
          <div className="mt-6 space-y-2.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </Card>
      )}

      {shownReport && (
        <div ref={resultRef}>
          <ReportResult report={shownReport} />
        </div>
      )}

      {history.data && history.data.length > 0 && (
        <Card padding="lg">
          <CardTitle>Tus informes anteriores</CardTitle>
          <p className="mt-1 text-sm text-silver">
            Toca cualquiera para volver a leerlo.
          </p>
          <ul className="mt-3 space-y-1">
            {history.data.map((h) => {
              const active = h.id === selectedId;
              return (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(active ? null : h.id)}
                    aria-current={active}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm capitalize transition-colors ${
                      active
                        ? 'bg-cosmos-50 text-ink ring-1 ring-cosmos-200'
                        : 'text-graphite hover:bg-mist/60'
                    }`}
                  >
                    <span>{periodLabelFromStart(kind, h.period_start)}</span>
                    {h.period_start === (currentReport?.period_start ?? '') && (
                      <Badge tone="cosmos">Actual</Badge>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <Card padding="lg" className="bg-mist/40">
        <p className="text-sm text-graphite">
          {kind === 'monthly' ? (
            <>
              ¿Quieres una mirada más amplia? Descubre también tu{' '}
              <Link to="/reportes/anual" className="font-medium text-cosmos-700 hover:underline">
                informe anual
              </Link>.
            </>
          ) : (
            <>
              ¿Prefieres el detalle del momento? Consulta tu{' '}
              <Link to="/reportes/mensual" className="font-medium text-cosmos-700 hover:underline">
                informe mensual
              </Link>.
            </>
          )}
        </p>
      </Card>
    </div>
  );
}

function ReportsPage({ kind }: { kind: ReportKind }) {
  const meta = META[kind];
  const { session } = useAuth();
  return (
    <>
      <Seo
        title={`${meta.title} · ${company.brand}`}
        description={meta.lead}
        noindex
      />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <header>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">{meta.title}</h1>
          <p className="mt-3 max-w-xl text-graphite">{meta.lead}</p>
        </header>

        <div className="mt-8">
          {!session ? (
            <Card padding="lg" className="text-center">
              <div aria-hidden="true" className="text-4xl">
                📜
              </div>
              <p className="mt-3 text-graphite">
                Para acceder a tus informes personalizados necesitas iniciar
                sesión en tu cuenta.
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
          ) : (
            <PremiumGate title={`${meta.title} es premium`} description={meta.gateDesc}>
              <ReportBody kind={kind} />
            </PremiumGate>
          )}
        </div>

        <AdSlot className="mt-8" />
      </div>
    </>
  );
}

export function MonthlyReportPage() {
  return <ReportsPage kind="monthly" />;
}

export function AnnualReportPage() {
  return <ReportsPage kind="annual" />;
}
