import { useEffect, useMemo, useRef, useState } from 'react';
import { Seo } from '@/lib/seo';
import { useSearchParams } from 'react-router-dom';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import type { BadgeTone } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/Toast';
import { AdSlot } from '@/components/ads/AdSlot';
import { PremiumGate } from '@/components/billing/PremiumGate';
import { useProfile } from '@/features/profile/hooks';
import {
  useBuyCompatibilityCredit,
  useCompatibilityHistory,
  useCompatibilityQuota,
  useCompatibilityReport,
  useGenerateCompatibility,
} from '@/features/compatibility/hooks';
import type {
  CompatReport,
  PersonPlacements,
  Placement,
} from '@/features/compatibility/types';
import { searchCities } from '@/features/natal/cities';
import type { City } from '@/features/natal/cities';
import { ZODIAC } from '@/lib/zodiac';
import { decodeByteaText } from '@/lib/bytea';
import { company } from '@/features/legal/company';

interface PersonState {
  label: string;
  birthDate: string;
  birthTime: string;
  cityQuery: string;
  city: City | null;
}

const emptyPerson: PersonState = {
  label: '', birthDate: '', birthTime: '', cityQuery: '', city: null,
};

function scoreTone(score: number): BadgeTone {
  if (score >= 85) return 'success';
  if (score >= 70) return 'cosmos';
  return 'warning';
}

/** Autocompletado de ciudad sobre la lista local. */
function CityField({
  label,
  value,
  selected,
  onQueryChange,
  onSelect,
}: {
  label: string;
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
        label={label}
        placeholder="Ciudad (opcional)…"
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
        <ul className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
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

function PersonForm({
  title,
  state,
  onChange,
}: {
  title: string;
  state: PersonState;
  onChange: (next: PersonState) => void;
}) {
  return (
    <Card padding="lg">
      <CardTitle>{title}</CardTitle>
      <div className="mt-4 space-y-4">
        <Input
          label="Nombre"
          placeholder="Su nombre"
          value={state.label}
          onChange={(e) => onChange({ ...state, label: e.target.value })}
        />
        <Input
          type="date"
          label="Fecha de nacimiento"
          value={state.birthDate}
          onChange={(e) => onChange({ ...state, birthDate: e.target.value })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            type="time"
            label="Hora (opcional)"
            hint="Afina la Luna y el Ascendente."
            value={state.birthTime}
            onChange={(e) => onChange({ ...state, birthTime: e.target.value })}
          />
          <CityField
            label="Lugar (opcional)"
            value={state.cityQuery}
            selected={state.city}
            onQueryChange={(q) => onChange({ ...state, cityQuery: q, city: null })}
            onSelect={(c) => onChange({ ...state, cityQuery: c.name, city: c })}
          />
        </div>
      </div>
    </Card>
  );
}

/** Mini-chips con las posiciones clave de una persona. */
function PlacementsRow({ placements }: { placements: PersonPlacements }) {
  const items: { symbol: string; label: string; p: Placement }[] = [
    { symbol: '☉', label: 'Sol', p: placements.sun },
    { symbol: '☽', label: 'Luna', p: placements.moon },
    { symbol: '♀', label: 'Venus', p: placements.venus },
    { symbol: '♂', label: 'Marte', p: placements.mars },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ symbol, label, p }) => {
        const info = ZODIAC[p.sign];
        return (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-graphite"
          >
            <span
              aria-hidden="true"
              className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] text-white"
              style={{
                backgroundImage: `linear-gradient(135deg, ${info.colors.from}, ${info.colors.to})`,
              }}
            >
              {info.glyph}
            </span>
            <span aria-hidden="true">{symbol}</span> {p.sign_name}
          </span>
        );
      })}
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

function CompatResult({ report }: { report: CompatReport }) {
  const i = report.interpretation;
  return (
    <div className="space-y-6">
      <Card padding="lg">
        <div className="flex flex-col items-center text-center">
          <p className="text-sm text-silver">Afinidad astrológica</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-display text-5xl text-ink">{report.score}</span>
            <span className="text-xl text-silver">/100</span>
          </div>
          <Badge tone={scoreTone(report.score)} className="mt-2">
            {report.label_a} & {report.label_b}
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-silver">
              {report.label_a}
            </p>
            <div className="mt-2">
              <PlacementsRow placements={report.placements_a} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-silver">
              {report.label_b}
            </p>
            <div className="mt-2">
              <PlacementsRow placements={report.placements_b} />
            </div>
          </div>
        </div>

        {report.aspects.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-silver">
              Conexiones principales
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {report.aspects.slice(0, 8).map((a, idx) => (
                <li
                  key={`${a.a}-${a.b}-${a.type}-${idx}`}
                  className={`rounded-full px-2.5 py-1 text-xs ${
                    a.harmonious
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {a.a_name} · {a.type_name} · {a.b_name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card padding="lg">
        <p className="leading-relaxed text-graphite">{i.connection}</p>
        <div className="mt-6 space-y-6">
          <Section title="Emoción y comunicación" symbol="☽" text={i.emotional} />
          <Section title="Amor y pasión" symbol="♀" text={i.love} />
          <Section title="Lo que toca trabajar" symbol="△" text={i.friction} />
          <Section title="A largo plazo" symbol="✦" text={i.longterm} />
        </div>
        <div className="mt-6 rounded-xl bg-cosmos-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-cosmos-700">
            Un consejo para los dos
          </p>
          <p className="mt-1 leading-relaxed text-graphite">{i.advice}</p>
        </div>
      </Card>
    </div>
  );
}

function CompatBody() {
  const { data: profile } = useProfile();
  const gen = useGenerateCompatibility();
  const history = useCompatibilityHistory();
  const quota = useCompatibilityQuota();
  const buy = useBuyCompatibilityCredit();
  const [params, setParams] = useSearchParams();

  // Informe seleccionado del historial (null = mostrar el recién generado).
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useCompatibilityReport(selectedId);
  const resultRef = useRef<HTMLDivElement>(null);

  const [personA, setPersonA] = useState<PersonState>(emptyPerson);
  const [personB, setPersonB] = useState<PersonState>(emptyPerson);

  // Prefill de la persona A con los datos del usuario.
  const [prefilledFor, setPrefilledFor] = useState<string | null>(null);
  if (profile && profile.id !== prefilledFor) {
    setPrefilledFor(profile.id);
    const time = decodeByteaText(profile.birth_time);
    const placeName = decodeByteaText(profile.birth_place);
    const match = placeName ? searchCities(placeName, 1)[0] : null;
    setPersonA({
      label: profile.display_name ?? 'Yo',
      birthDate: profile.birth_date ?? '',
      birthTime: time ? time.slice(0, 5) : '',
      cityQuery: placeName ?? '',
      city: match ?? null,
    });
  }

  // Retorno de Stripe tras el pago puntual.
  useEffect(() => {
    const status = params.get('status');
    if (status !== 'paid' && status !== 'cancelled') return undefined;
    const isPaid = status === 'paid';
    if (isPaid) {
      toast.success('¡Pago recibido! Ya puedes generar otra compatibilidad.');
    }
    params.delete('status');
    setParams(params, { replace: true });
    if (!isPaid) return undefined;
    // El crédito lo concede el webhook; refrescamos la cuota un par de veces.
    const t1 = setTimeout(() => quota.refetch(), 1500);
    const t2 = setTimeout(() => quota.refetch(), 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const report = gen.data?.status === 'ok' ? gen.data.report : null;
  // Lo que se muestra: el informe del historial seleccionado o el recién generado.
  const shownReport = selectedId ? (selected.data ?? null) : report;
  const ready = Boolean(personA.birthDate && personB.birthDate);

  // Al cargar un informe del historial, llevamos la vista al resultado.
  useEffect(() => {
    if (selectedId && selected.data && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedId, selected.data]);

  // ¿Puede generar sin pagar? (incluida del mes libre o créditos disponibles).
  const q = quota.data;
  const canGenerate = q ? !q.includedUsed || q.credits > 0 : true;
  // Si el backend ya respondió que hace falta pago, o la cuota está agotada.
  const needsPayment =
    gen.data?.status === 'payment_required' || (Boolean(q) && !canGenerate);

  function toParams(p: PersonState, fallback: string) {
    return {
      label: p.label.trim() || fallback,
      birth_date: p.birthDate,
      birth_time: p.birthTime || null,
      lat: p.city?.lat ?? null,
      lng: p.city?.lng ?? null,
      tz: p.city?.tz ?? null,
      place_label: p.city?.name ?? null,
    };
  }

  function onGenerate() {
    setSelectedId(null); // mostramos el nuevo resultado, no uno del historial
    gen.mutate({
      person_a: toParams(personA, 'Persona A'),
      person_b: toParams(personB, 'Persona B'),
    });
  }

  function onBuy() {
    buy.mutate(undefined, {
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'No se pudo iniciar el pago.');
      },
    });
  }

  function quotaLabel(): string {
    if (!q) return '';
    if (!q.includedUsed) return 'Tienes incluida tu generación de este mes.';
    if (q.credits > 0)
      return `Generación incluida usada · ${q.credits} extra disponible${q.credits > 1 ? 's' : ''}.`;
    return 'Ya has usado tu generación incluida de este mes.';
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <PersonForm title="Tú" state={personA} onChange={setPersonA} />
        <PersonForm title="La otra persona" state={personB} onChange={setPersonB} />
      </div>

      <Card padding="lg">
        {q && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-mist/60 px-3 py-2 text-sm text-graphite">
            <span aria-hidden="true">✨</span> {quotaLabel()}
          </div>
        )}

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-silver">
            Con la fecha basta; la hora y la ciudad afinan el resultado.
          </p>
          {needsPayment ? (
            <Button
              variant="premium"
              onClick={onBuy}
              disabled={buy.isPending}
              size="lg"
            >
              {buy.isPending ? 'Abriendo el pago…' : 'Generar otra por 1,99 €'}
            </Button>
          ) : (
            <Button onClick={onGenerate} disabled={!ready || gen.isPending} size="lg">
              {gen.isPending ? 'Leyendo los astros…' : 'Ver compatibilidad'}
            </Button>
          )}
        </div>

        {needsPayment && (
          <p className="mt-3 text-sm text-graphite">
            Ya has usado tu compatibilidad incluida de este mes. Puedes generar
            todas las que quieras por <strong>1,99 €</strong> cada una; el mes que
            viene tendrás otra incluida.
          </p>
        )}
        {gen.data && gen.data.status !== 'ok' && gen.data.status !== 'payment_required' && (
          <p className="mt-3 text-sm text-graphite">{gen.data.message}</p>
        )}
        {gen.isError && (
          <p className="mt-3 text-sm text-red-600">
            No se pudo calcular la compatibilidad. Inténtalo de nuevo en un momento.
          </p>
        )}
      </Card>

      {gen.isPending && (
        <Card padding="lg">
          <Skeleton className="mx-auto h-16 w-40" />
          <div className="mt-6 space-y-2.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </Card>
      )}

      {selectedId && selected.isPending && (
        <Card padding="lg">
          <Skeleton className="mx-auto h-16 w-40" />
          <div className="mt-6 space-y-2.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </Card>
      )}

      {shownReport && (
        <div ref={resultRef}>
          <CompatResult report={shownReport} />
        </div>
      )}

      {history.data && history.data.length > 0 && (
        <Card padding="lg">
          <CardTitle>Tus compatibilidades anteriores</CardTitle>
          <p className="mt-1 text-sm text-silver">
            Toca cualquiera para volver a ver su resultado.
          </p>
          <ul className="mt-3 space-y-1">
            {history.data.map((h) => {
              const active = h.id === selectedId;
              return (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(h.id)}
                    aria-current={active}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      active
                        ? 'bg-cosmos-50 text-ink ring-1 ring-cosmos-200'
                        : 'text-graphite hover:bg-mist/60'
                    }`}
                  >
                    <span className="truncate">
                      {h.label_a} & {h.label_b}
                    </span>
                    <Badge tone={scoreTone(h.score)}>{h.score}/100</Badge>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}

export function CompatibilityPage() {
  return (
    <>
      <Seo
        title={`Compatibilidad avanzada · ${company.brand}`}
        description="Compatibilidad avanzada: sinastría completa entre dos cartas, con afinidad, amor, comunicación, roces y potencial a largo plazo."
        noindex
      />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <header>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">
            Compatibilidad avanzada
          </h1>
          <p className="mt-3 max-w-2xl text-graphite">
            La sinastría compara dos cartas para revelar la química real entre dos
            personas: cómo conectáis, cómo os comunicáis, qué os une y qué tendréis
            que cuidar. Tu plan incluye una compatibilidad cada mes.
          </p>
        </header>

        <div className="mt-8">
          <PremiumGate
            title="La compatibilidad avanzada es premium"
            description="Suscríbete y descubre la sinastría entre dos cartas: afinidad, amor, comunicación, roces y potencial a largo plazo. Incluye una compatibilidad al mes —además de todo Zodiaq sin anuncios."
          >
            <CompatBody />
          </PremiumGate>
        </div>

        <AdSlot className="mt-8" />
      </div>
    </>
  );
}
