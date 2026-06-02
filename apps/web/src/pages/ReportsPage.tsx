import { useEffect, useMemo, useRef, useState } from 'react';
import { Seo } from '@/lib/seo';
import {
  Crown,
  Heart,
  Briefcase,
  Leaf,
  CalendarClock,
  Compass,
  Sunrise,
  MoonStar,
  Sprout,
  Lightbulb,
  Clock,
  MapPin,
  Orbit,
  ScrollText,
  ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Section } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { GeneratingLoader } from '@/components/feedback/GeneratingLoader';
import { Shine } from '@/components/visual/Shine';
import { AdSlot } from '@/components/ads/AdSlot';
import { PremiumGate } from '@/components/billing/PremiumGate';
import { cn } from '@/lib/cn';
import { useAuth } from '@/features/auth/AuthProvider';
import { useProfile } from '@/features/profile/hooks';
import {
  useCurrentReport,
  useGenerateReport,
  useReportById,
  useReportHistory,
} from '@/features/reports/hooks';
import type { BodyPosition, Report, ReportKind, TransitAspect } from '@/features/reports/types';
import { searchCities } from '@/features/natal/cities';
import type { City } from '@/features/natal/cities';
import { ZODIAC } from '@/lib/zodiac';
import { decodeByteaText } from '@/lib/bytea';
import { company } from '@/features/legal/company';

const GENERATING_COLORS = { from: '#4f46e5', to: '#7c3aed' } as const;

/** Nebulosa índigo profunda: el papel oscuro del informe editorial. */
const PANEL_BG =
  'bg-[radial-gradient(125%_125%_at_28%_0%,#312e81_0%,#1e1b4b_46%,#070617_100%)]';

interface SectionDef {
  key: string;
  title: string;
  Icon: LucideIcon;
  color: string;
  /** Gradiente vivo de la sección (clases `from-… via-… to-…`). */
  gradient: string;
}

const G = {
  indigo: 'from-indigo-500 via-violet-600 to-indigo-800',
  rose: 'from-rose-500 via-pink-600 to-rose-700',
  amber: 'from-amber-500 via-orange-600 to-amber-700',
  teal: 'from-teal-500 via-emerald-600 to-teal-800',
  violet: 'from-violet-500 via-purple-600 to-violet-800',
  cyan: 'from-cyan-500 via-sky-600 to-blue-700',
  emerald: 'from-emerald-500 via-green-600 to-emerald-800',
} as const;

const SECTIONS: Record<ReportKind, SectionDef[]> = {
  monthly: [
    { key: 'overview', title: 'El clima del mes', Icon: Compass, color: '#4f46e5', gradient: G.indigo },
    { key: 'love', title: 'Amor y vínculos', Icon: Heart, color: '#e11d48', gradient: G.rose },
    { key: 'work', title: 'Trabajo y dinero', Icon: Briefcase, color: '#d97706', gradient: G.amber },
    { key: 'wellbeing', title: 'Bienestar y energía', Icon: Leaf, color: '#0d9488', gradient: G.teal },
    { key: 'key_moments', title: 'Momentos clave', Icon: CalendarClock, color: '#7c3aed', gradient: G.violet },
  ],
  annual: [
    { key: 'overview', title: 'El gran tema de tu año', Icon: Compass, color: '#4f46e5', gradient: G.indigo },
    { key: 'first_half', title: 'Primer semestre', Icon: Sunrise, color: '#d97706', gradient: G.amber },
    { key: 'second_half', title: 'Segundo semestre', Icon: MoonStar, color: '#7c3aed', gradient: G.violet },
    { key: 'love', title: 'Amor y vínculos', Icon: Heart, color: '#e11d48', gradient: G.rose },
    { key: 'career', title: 'Vocación y dinero', Icon: Briefcase, color: '#0891b2', gradient: G.cyan },
    { key: 'growth', title: 'Tu crecimiento', Icon: Sprout, color: '#059669', gradient: G.emerald },
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

/** Color de cada aspecto: armónicos en aguamarina/oro, tensos en rosa. */
const ASPECT_STYLE: Record<string, { color: string; name: string }> = {
  conjunction: { color: '#fbbf24', name: 'Conjunción' },
  sextile: { color: '#67e8f9', name: 'Sextil' },
  trine: { color: '#5eead4', name: 'Trígono' },
  square: { color: '#fb7185', name: 'Cuadratura' },
  opposition: { color: '#f472b6', name: 'Oposición' },
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

// --- Decoración cósmica ----------------------------------------------------
const STARS: { top: number; left: number; size: number; delay: number }[] = [
  { top: 14, left: 10, size: 3, delay: 0 },
  { top: 24, left: 84, size: 2, delay: 0.7 },
  { top: 62, left: 6, size: 2, delay: 1.3 },
  { top: 72, left: 92, size: 3, delay: 0.4 },
  { top: 40, left: 96, size: 2, delay: 1.1 },
  { top: 84, left: 26, size: 2, delay: 0.9 },
  { top: 10, left: 58, size: 2, delay: 1.6 },
  { top: 86, left: 66, size: 3, delay: 0.5 },
  { top: 8, left: 32, size: 2, delay: 1.9 },
  { top: 20, left: 46, size: 1, delay: 0.3 },
  { top: 34, left: 20, size: 2, delay: 1.4 },
  { top: 36, left: 74, size: 1, delay: 0.6 },
  { top: 56, left: 16, size: 2, delay: 2.1 },
  { top: 58, left: 64, size: 1, delay: 1.0 },
  { top: 60, left: 94, size: 2, delay: 1.7 },
  { top: 70, left: 38, size: 1, delay: 0.2 },
  { top: 74, left: 78, size: 2, delay: 1.2 },
  { top: 90, left: 14, size: 2, delay: 2.3 },
  { top: 92, left: 50, size: 1, delay: 0.8 },
  { top: 88, left: 86, size: 2, delay: 1.5 },
];

function StarField() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white shadow-[0_0_6px_2px_rgba(255,255,255,0.7)] animate-twinkle"
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
  );
}

function Nebulae() {
  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-28 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl animate-drift"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl animate-float-slow"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-gold-500/15 blur-3xl animate-float"
      />
    </>
  );
}

/** Píldora de un astro del cielo del periodo (color del signo). */
function TransitChip({ b }: { b: BodyPosition }) {
  const info = ZODIAC[b.sign];
  return (
    <span className="inline-flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/[0.09] px-4 py-2.5 text-base text-white backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.16]">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-white"
        style={{
          backgroundImage: `linear-gradient(135deg, ${info.colors.from}, ${info.colors.to})`,
          boxShadow: `0 0 12px 0 ${info.colors.from}aa`,
        }}
      >
        {b.symbol}
      </span>
      <span className="font-bold">{b.name}</span>
      <span className="text-white/70">en {b.sign_name}</span>
      {b.retrograde && (
        <span title="Retrógrado" className="font-bold text-gold-300">℞</span>
      )}
    </span>
  );
}

/** Leyenda de los tipos de aspecto presentes. */
function AspectLegend({ aspects }: { aspects: TransitAspect[] }) {
  const present = useMemo(() => {
    const seen = new Set<string>();
    for (const a of aspects) seen.add(a.type);
    return ['conjunction', 'sextile', 'square', 'trine', 'opposition'].filter((t) =>
      seen.has(t),
    );
  }, [aspects]);
  if (present.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {present.map((t) => {
        const style = ASPECT_STYLE[t]!;
        return (
          <span key={t} className="flex items-center gap-2 text-base text-white/80">
            <span aria-hidden="true" className="h-0.5 w-7 rounded-full" style={{ backgroundColor: style.color }} />
            {style.name}
          </span>
        );
      })}
    </div>
  );
}

/**
 * Capítulo editorial moderno: banda superior de gradiente vivo de la sección
 * (con nº gigante de marca de agua e icono fantasma que reacciona al hover) y
 * el cuerpo del texto debajo sobre blanco.
 */
function Chapter({
  index,
  Icon,
  gradient,
  title,
  text,
}: {
  index: string;
  Icon: LucideIcon;
  gradient: string;
  title: string;
  text: string;
}) {
  return (
    <Reveal>
      <Card
        padding="none"
        className="group relative overflow-hidden transition-all duration-300 ease-cosmic hover:-translate-y-1"
      >
        {/* Banda de gradiente */}
        <div className={cn('relative overflow-hidden bg-gradient-to-br p-7 text-white sm:p-9', gradient)}>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-2 -top-12 select-none font-display text-[10rem] font-black leading-none text-white/10 [text-shadow:0_2px_24px_rgba(0,0,0,0.15)]"
          >
            {index}
          </span>
          <Icon
            aria-hidden="true"
            strokeWidth={1.3}
            className="pointer-events-none absolute -bottom-8 right-8 h-40 w-40 text-white/10 transition-transform duration-500 ease-cosmic group-hover:scale-110 group-hover:-rotate-6"
          />
          <span className="relative inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-[0.18em] ring-1 ring-white/25 backdrop-blur">
            Capítulo {index}
          </span>
          <h3 className="relative mt-4 flex items-center gap-3 font-display text-3xl font-extrabold tracking-tight [text-shadow:0_2px_14px_rgba(0,0,0,0.25)] sm:text-4xl">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            {title}
          </h3>
        </div>
        {/* Cuerpo */}
        <div className="p-7 sm:p-10">
          <p className="whitespace-pre-line text-lg leading-relaxed text-graphite">{text}</p>
        </div>
      </Card>
    </Reveal>
  );
}

function ReportResult({ report }: { report: Report }) {
  const i = report.interpretation;
  const sections = SECTIONS[report.kind].filter((s) => i[s.key]);
  const kindWord = report.kind === 'monthly' ? 'mensual' : 'anual';

  return (
    <div className="space-y-8">
      {/* Portada editorial */}
      <Reveal>
        <div className={`relative isolate overflow-hidden rounded-[2.5rem] ${PANEL_BG} p-7 text-white shadow-lift ring-1 ring-white/10 sm:p-12 lg:p-16`}>
          <StarField />
          <Nebulae />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.22em] text-gold-300">
                <Crown className="h-4 w-4" aria-hidden="true" /> Informe {kindWord} · premium
              </p>
              {report.place && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/85 ring-1 ring-white/20 backdrop-blur">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {report.place}
                </span>
              )}
            </div>

            <p className="mt-7 font-display text-2xl font-bold capitalize text-white/55 sm:text-3xl">
              {report.period_label}
            </p>
            {i.headline ? (
              <h2 className="mt-2 font-display text-4xl font-black leading-[1.02] tracking-tight text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.4)] sm:text-6xl lg:text-7xl">
                {i.headline}
              </h2>
            ) : (
              <h2 className="mt-2 font-display text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-6xl">
                Tu cielo, capítulo a capítulo
              </h2>
            )}

            <div className="mt-8 h-px w-full bg-gradient-to-r from-gold-400/60 via-white/15 to-transparent" />
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
              Un informe escrito para ti, cruzando tu carta natal con los tránsitos
              reales {report.kind === 'monthly' ? 'del mes' : 'del año'}. Esto es lo
              que el cielo tiene reservado.
            </p>
          </div>
        </div>
      </Reveal>

      {/* El cielo del periodo: tránsitos + aspectos a tu carta */}
      {(report.transits.length > 0 || report.aspects.length > 0) && (
        <Reveal>
          <div className={`relative isolate overflow-hidden rounded-[2.5rem] ${PANEL_BG} p-7 text-white shadow-lift ring-1 ring-white/10 sm:p-10`}>
            <StarField />
            <div className="relative z-10">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-indigo-200">
                <Orbit className="h-4 w-4" aria-hidden="true" /> El cielo de {report.period_label}
              </p>
              <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
                Dónde están los astros
              </h2>

              {report.transits.length > 0 && (
                <div className="mt-7 flex flex-wrap gap-3">
                  {report.transits.map((b) => (
                    <TransitChip key={b.body} b={b} />
                  ))}
                </div>
              )}

              {report.aspects.length > 0 && (
                <div className="mt-10 border-t border-white/10 pt-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-base font-bold uppercase tracking-[0.14em] text-gold-300">
                      Tránsitos que tocan tu carta
                    </p>
                    <AspectLegend aspects={report.aspects} />
                  </div>
                  <ul className="mt-5 flex flex-wrap gap-3">
                    {report.aspects.slice(0, 12).map((a, idx) => {
                      const color = ASPECT_STYLE[a.type]?.color ?? '#fbbf24';
                      return (
                        <li
                          key={`${a.transit}-${a.natal}-${a.type}-${idx}`}
                          className="inline-flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/[0.08] px-4 py-2.5 text-base text-white backdrop-blur"
                        >
                          <span aria-hidden="true" className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                          <span className="font-semibold">{a.transit_name}</span>
                          <span className="text-white/55">{a.type_name.toLowerCase()}</span>
                          <span className="font-semibold">{a.natal_name}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      )}

      {/* Sumario: índice en mosaicos de color */}
      <Reveal>
        <div>
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-cosmos-700">
            <ScrollText className="h-4 w-4" aria-hidden="true" /> El sumario
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {sections.length} capítulo{sections.length === 1 ? '' : 's'} para tu {report.kind === 'monthly' ? 'mes' : 'año'}
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((s, idx) => (
              <div
                key={s.key}
                className={cn(
                  'group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-soft transition-all duration-300 ease-cosmic hover:-translate-y-1',
                  s.gradient,
                )}
              >
                <s.Icon
                  aria-hidden="true"
                  strokeWidth={1.3}
                  className="pointer-events-none absolute -bottom-4 -right-3 h-24 w-24 text-white/10 transition-transform duration-500 ease-cosmic group-hover:scale-110 group-hover:-rotate-6"
                />
                <span className="relative font-display text-3xl font-black leading-none text-white/40">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="relative flex items-center gap-2 font-display text-lg font-extrabold leading-tight">
                  <s.Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Capítulos */}
      <div className="space-y-6">
        {sections.map((s, idx) => (
          <Chapter
            key={s.key}
            index={String(idx + 1).padStart(2, '0')}
            Icon={s.Icon}
            gradient={s.gradient}
            title={s.title}
            text={i[s.key] ?? ''}
          />
        ))}
      </div>

      {/* Consejo de cierre */}
      {i.advice && (
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-violet-700 to-indigo-900 p-8 text-white shadow-lift sm:p-14">
            <StarField />
            <Nebulae />
            <div className="relative z-10 mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-extrabold uppercase tracking-[0.18em] text-gold-300 ring-1 ring-white/20 backdrop-blur">
                <Lightbulb className="h-4 w-4" aria-hidden="true" /> Tu consejo {report.kind === 'monthly' ? 'del mes' : 'del año'}
              </span>
              <p className="mt-6 whitespace-pre-line font-display text-2xl font-bold leading-relaxed text-white sm:text-[1.9rem]">
                {i.advice}
              </p>
            </div>
          </div>
        </Reveal>
      )}
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
        label="Lugar de nacimiento (opcional)"
        hint="Afina tu Ascendente y el detalle del informe."
        placeholder="Ciudad…"
        value={value}
        autoComplete="off"
        leftAddon={<MapPin className="h-4 w-4" />}
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
      <GeneratingLoader
        colors={GENERATING_COLORS}
        message="Abriendo tu informe…"
        hint="Recuperando tu informe del periodo en curso."
      />
    );
  }

  const periodWord = kind === 'monthly' ? 'mes' : 'año';
  const kindWord = kind === 'monthly' ? 'mensual' : 'anual';

  return (
    <div className="space-y-8">
      {!currentReport && !gen.isPending && (
        <Reveal>
          <Card padding="lg" className="relative mx-auto max-w-2xl overflow-hidden sm:p-10">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-200/40 blur-3xl"
            />
            <div className="relative">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-cosmos-700">
                <ScrollText className="h-4 w-4" aria-hidden="true" /> Tu informe editorial
              </p>
              <p className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink">
                Genera tu informe de este {periodWord}
              </p>
              <p className="mt-2 text-base text-graphite">
                Está incluido en tu plan premium. Con tu fecha de nacimiento basta;
                la hora y la ciudad afinan tu Ascendente y el detalle del informe.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Input
                  type="time"
                  label="Hora de nacimiento (opcional)"
                  leftAddon={<Clock className="h-4 w-4" />}
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

              <div className="mt-6">
                <Button
                  onClick={onGenerate}
                  disabled={gen.isPending}
                  size="lg"
                  leftIcon={<ScrollText className="h-5 w-5" />}
                >
                  {gen.isPending ? 'Escribiendo tu informe…' : `Generar mi informe ${kindWord}`}
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
            </div>
          </Card>
        </Reveal>
      )}

      {gen.isPending && (
        <GeneratingLoader
          colors={GENERATING_COLORS}
          message="Escribiendo tu informe…"
          hint="Cruzando tu carta natal con los tránsitos y redactando cada capítulo."
        />
      )}

      {selectedId && selected.isPending && (
        <GeneratingLoader
          colors={GENERATING_COLORS}
          message="Abriendo tu informe…"
          hint="Recuperando el informe guardado."
        />
      )}

      {shownReport && (
        <div ref={resultRef}>
          <ReportResult report={shownReport} />
        </div>
      )}

      {/* Historial */}
      {history.data && history.data.length > 0 && (
        <Reveal>
          <Card padding="lg">
            <p className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight text-ink">
              <ScrollText className="h-6 w-6 text-cosmos-700" aria-hidden="true" />
              Tus informes anteriores
            </p>
            <p className="mt-1 text-sm text-graphite">
              Toca cualquiera para volver a leerlo.
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {history.data.map((h) => {
                const active = h.id === selectedId;
                const isCurrent = h.period_start === (currentReport?.period_start ?? '');
                return (
                  <li key={h.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(active ? null : h.id)}
                      aria-current={active}
                      className={
                        'flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left capitalize transition-all duration-200 ease-cosmic hover:-translate-y-0.5 ' +
                        (active
                          ? 'border-cosmos-200 bg-cosmos-50 ring-1 ring-cosmos-200'
                          : 'border-slate-200 bg-white hover:border-cosmos-100 hover:shadow-soft')
                      }
                    >
                      <span className="font-semibold text-ink">
                        {periodLabelFromStart(kind, h.period_start)}
                      </span>
                      {isCurrent && (
                        <span className="rounded-full bg-cosmos-600 px-2.5 py-0.5 text-xs font-bold text-white">
                          Actual
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        </Reveal>
      )}

      {/* Cross-sell entre mensual y anual */}
      <Reveal>
        <Card tone="premium" padding="lg" className="relative overflow-hidden">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg text-graphite">
              {kind === 'monthly' ? (
                <>¿Quieres una mirada más amplia? Descubre también tu <strong className="text-ink">informe anual</strong>.</>
              ) : (
                <>¿Prefieres el detalle del momento? Consulta tu <strong className="text-ink">informe mensual</strong>.</>
              )}
            </p>
            <LinkButton
              to={kind === 'monthly' ? '/reportes/anual' : '/reportes/mensual'}
              variant="premium"
              size="lg"
            >
              {kind === 'monthly' ? 'Ver mi informe anual' : 'Ver mi informe mensual'}
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </LinkButton>
          </div>
        </Card>
      </Reveal>
    </div>
  );
}

function ReportsPage({ kind }: { kind: ReportKind }) {
  const meta = META[kind];
  const { session } = useAuth();
  const kindWord = kind === 'monthly' ? 'mensual' : 'anual';

  return (
    <>
      <Seo
        title={`${meta.title} · ${company.brand}`}
        description={meta.lead}
        noindex
      />

      {/* Hero editorial premium */}
      <Section width="full" className="px-3 pt-4 sm:px-4 lg:px-6">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-violet-700 to-indigo-950 px-6 py-16 text-center text-white shadow-lift sm:px-12 sm:py-24">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/30 via-black/10 to-black/50"
            />
            <Nebulae />
            <StarField />
            <div className="relative z-10 mx-auto max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.16em] text-gold-200 ring-1 ring-white/30 backdrop-blur">
                <Crown className="h-4 w-4" aria-hidden="true" />
                Informe {kindWord} premium
              </span>
              <h1 className="mt-6 font-display text-5xl font-black leading-[0.9] tracking-[-0.035em] [text-shadow:0_2px_24px_rgba(0,0,0,0.4)] sm:text-7xl lg:text-[5.5rem]">
                Tu <Shine gold>{kind === 'monthly' ? 'mes' : 'año'}</Shine>, escrito por los astros
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90 sm:text-xl">
                {meta.lead}
              </p>
            </div>
          </div>
        </Reveal>
      </Section>

      <Section width="xwide" className="py-10">
        {!session ? (
          <Reveal>
            <Card padding="lg" className="relative mx-auto max-w-xl overflow-hidden text-center sm:p-12">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cosmos-200/40 blur-3xl"
              />
              <div className="relative">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lift">
                  <ScrollText className="h-8 w-8" aria-hidden="true" />
                </span>
                <p className="mt-5 text-lg text-graphite">
                  Para acceder a tus informes personalizados necesitas iniciar
                  sesión en tu cuenta.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <LinkButton to="/login" variant="secondary">
                    Iniciar sesión
                  </LinkButton>
                  <LinkButton to="/registro" variant="primary">
                    Crear cuenta
                  </LinkButton>
                </div>
              </div>
            </Card>
          </Reveal>
        ) : (
          <PremiumGate title={`${meta.title} es premium`} description={meta.gateDesc}>
            <ReportBody kind={kind} />
          </PremiumGate>
        )}

        <AdSlot className="mt-8" />
      </Section>
    </>
  );
}

export function MonthlyReportPage() {
  return <ReportsPage kind="monthly" />;
}

export function AnnualReportPage() {
  return <ReportsPage kind="annual" />;
}
