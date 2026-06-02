import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Sunrise, Sparkles, Compass, Clock, MapPin, Lock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Seo } from '@/lib/seo';
import { Card } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Section } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { GeneratingLoader } from '@/components/feedback/GeneratingLoader';
import { UpsellCard } from '@/components/horoscope/UpsellCard';
import { AdSlot } from '@/components/ads/AdSlot';
import { useAuth } from '@/features/auth/AuthProvider';
import { useProfile } from '@/features/profile/hooks';
import { useGenerateNatalChart, useNatalChart } from '@/features/natal/hooks';
import { useIsPremium } from '@/features/billing/hooks';
import { searchCities } from '@/features/natal/cities';
import type { City } from '@/features/natal/cities';
import type { NatalChart, Placement } from '@/features/natal/types';
import { ZODIAC, ZODIAC_SIGNS } from '@/lib/zodiac';
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

/** Estrellas decorativas deterministas (% y retardo). Cielo denso. */
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
  { top: 8, left: 30, size: 2, delay: 1.9 },
  { top: 20, left: 48, size: 1, delay: 0.3 },
  { top: 34, left: 22, size: 2, delay: 1.4 },
  { top: 36, left: 72, size: 1, delay: 0.6 },
  { top: 54, left: 18, size: 2, delay: 2.1 },
  { top: 58, left: 62, size: 1, delay: 1.0 },
  { top: 60, left: 92, size: 2, delay: 1.7 },
  { top: 70, left: 40, size: 1, delay: 0.2 },
  { top: 72, left: 76, size: 2, delay: 1.2 },
  { top: 90, left: 16, size: 2, delay: 2.3 },
  { top: 92, left: 52, size: 1, delay: 0.8 },
  { top: 88, left: 84, size: 2, delay: 1.5 },
  { top: 6, left: 74, size: 1, delay: 1.1 },
  { top: 30, left: 6, size: 2, delay: 0.45 },
  { top: 44, left: 84, size: 1, delay: 1.85 },
  { top: 50, left: 34, size: 1, delay: 0.95 },
  { top: 66, left: 54, size: 2, delay: 2.4 },
  { top: 18, left: 68, size: 1, delay: 0.55 },
  { top: 78, left: 6, size: 1, delay: 1.65 },
];

function HeroStars() {
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

// --- Rueda zodiacal --------------------------------------------------------
// Coordenadas polares en un viewBox 100×100, 0º Aries arriba y avance horario.
function polar(r: number, angleDeg: number): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: 50 + r * Math.cos(rad), y: 50 + r * Math.sin(rad) };
}

const GOLD = '#fcd34d';

/** Estilo celeste de cada astro (color del marcador + del icono). */
const BODY_STYLE: Record<string, { color: string; iconColor: string }> = {
  Sol: { color: '#f59e0b', iconColor: '#ffffff' },
  Luna: { color: '#cbd5e1', iconColor: '#1e293b' },
  Ascendente: { color: '#38bdf8', iconColor: '#ffffff' },
};

interface WheelBody {
  label: string;
  Icon: LucideIcon;
  placement: Placement;
}

/** Astrolabio: anillos dorados, divisiones de signo, marcas de grado y los
 *  astros en su longitud real como marcadores que brillan. */
function ZodiacWheel({ bodies }: { bodies: WheelBody[] }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <span
        aria-hidden="true"
        className="absolute inset-[14%] rounded-full bg-indigo-500/20 blur-3xl"
      />
      <svg viewBox="0 0 100 100" className="relative h-full w-full">
        <defs>
          <radialGradient id="natalCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde68a" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Anillos */}
        <circle cx="50" cy="50" r="47" fill="none" stroke={GOLD} strokeOpacity="0.5" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="40" fill="none" stroke={GOLD} strokeOpacity="0.25" strokeWidth="0.4" />
        <circle cx="50" cy="50" r="33" fill="none" stroke={GOLD} strokeOpacity="0.45" strokeWidth="0.5" />

        {/* Marcas de grado (cada 6º; más largas cada 30º) */}
        {Array.from({ length: 60 }, (_, k) => {
          const a = k * 6;
          const major = k % 5 === 0;
          const p1 = polar(major ? 44 : 45.4, a);
          const p2 = polar(47, a);
          return (
            <line
              key={`t${k}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={GOLD}
              strokeOpacity={major ? 0.55 : 0.25}
              strokeWidth={major ? 0.5 : 0.3}
            />
          );
        })}

        {/* Divisiones de signo + abreviaturas en oro tenue */}
        {ZODIAC_SIGNS.map((slug, i) => {
          const a = i * 30;
          const d1 = polar(33, a);
          const d2 = polar(47, a);
          const mid = polar(36.5, a + 15);
          return (
            <g key={slug}>
              <line x1={d1.x} y1={d1.y} x2={d2.x} y2={d2.y} stroke={GOLD} strokeOpacity="0.3" strokeWidth="0.4" />
              <text
                x={mid.x}
                y={mid.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="2.7"
                fontWeight={700}
                fill="#fde68a"
                fillOpacity="0.85"
              >
                {ZODIAC[slug].name.slice(0, 3).toUpperCase()}
              </text>
            </g>
          );
        })}

        {/* Líneas de los astros desde el centro */}
        {bodies.map((b) => {
          const p = polar(30, b.placement.longitude);
          const color = BODY_STYLE[b.label]?.color ?? GOLD;
          return (
            <line
              key={`l${b.label}`}
              x1="50"
              y1="50"
              x2={p.x}
              y2={p.y}
              stroke={color}
              strokeWidth="0.7"
              strokeOpacity="0.85"
            />
          );
        })}

        {/* Núcleo luminoso */}
        <circle cx="50" cy="50" r="11" fill="url(#natalCore)" />
        <circle cx="50" cy="50" r="2" fill={GOLD} />
      </svg>

      {/* Insignias de astros superpuestas (iconos Lucide que brillan) */}
      {bodies.map((b) => {
        const p = polar(30, b.placement.longitude);
        const style = BODY_STYLE[b.label] ?? { color: GOLD, iconColor: '#1e293b' };
        return (
          <span
            key={b.label}
            className="absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-lift ring-2 ring-white/80"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              backgroundColor: style.color,
              boxShadow: `0 0 16px 2px ${style.color}aa`,
            }}
            title={`${b.label} en ${b.placement.sign_name}`}
          >
            <b.Icon className="h-5 w-5" style={{ color: style.iconColor }} aria-hidden="true" />
          </span>
        );
      })}
    </div>
  );
}

/** Chip de un astro (Sol, Luna, Ascendente) sobre el mapa oscuro. */
function PlacementChip({
  label,
  Icon,
  placement,
}: {
  label: string;
  Icon: LucideIcon;
  placement: Placement | null;
}) {
  if (!placement) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-dashed border-white/25 bg-white/5 p-5">
        <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white/50">
          <Lock className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-white/60">
            {label}
          </p>
          <p className="text-base text-white/60">Añade tu hora y lugar</p>
        </div>
      </div>
    );
  }
  const style = BODY_STYLE[label] ?? { color: GOLD, iconColor: '#1e293b' };
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
      <span
        className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl shadow-soft"
        style={{ backgroundColor: style.color, boxShadow: `0 0 16px 1px ${style.color}99` }}
      >
        <Icon className="h-7 w-7" style={{ color: style.iconColor }} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/70">
          {label}
        </p>
        <p className="font-display text-3xl font-extrabold leading-[1.05] text-white sm:text-4xl">
          {placement.sign_name}
        </p>
      </div>
      <span className="flex-shrink-0 font-display text-3xl font-extrabold text-white/90 sm:text-4xl">
        {formatDeg(placement.deg_in_sign)}
      </span>
    </div>
  );
}

/** Tarjeta de un bloque narrativo (Sol/Luna/Ascendente). */
function NarrativeCard({
  body,
  Icon,
  title,
  text,
}: {
  body: string;
  Icon: LucideIcon;
  title: string;
  text: string;
}) {
  const style = BODY_STYLE[body] ?? { color: GOLD, iconColor: '#1e293b' };
  return (
    <Card padding="lg" className="relative h-full overflow-hidden">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ backgroundImage: `linear-gradient(90deg, ${style.color}, transparent)` }}
      />
      <span
        className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-soft"
        style={{ backgroundColor: style.color, boxShadow: `0 0 14px 1px ${style.color}66` }}
      >
        <Icon className="h-6 w-6" style={{ color: style.iconColor }} aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-ink">
        {title}
      </h3>
      <p className="mt-3 text-lg leading-relaxed text-graphite">{text}</p>
    </Card>
  );
}

function ChartResult({ chart, isPremium }: { chart: NatalChart; isPremium: boolean }) {
  const i = chart.interpretation;
  const bodies: WheelBody[] = [
    { label: 'Sol', Icon: Sun, placement: chart.sun },
    { label: 'Luna', Icon: Moon, placement: chart.moon },
    ...(chart.ascendant
      ? [{ label: 'Ascendente', Icon: Sunrise, placement: chart.ascendant } as WheelBody]
      : []),
  ];

  return (
    <div className="space-y-8">
      {/* Mapa estelar (rueda) sobre cielo nocturno profundo */}
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-[radial-gradient(120%_120%_at_30%_0%,#1e1b4b_0%,#0b1030_45%,#05030f_100%)] p-6 text-white shadow-lift ring-1 ring-white/10 sm:p-10">
          <HeroStars />
          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_0.85fr]">
            <ZodiacWheel bodies={bodies} />
            <div className="space-y-4">
              <p className="flex items-center gap-3 font-display text-2xl font-extrabold uppercase tracking-[0.12em] text-white sm:text-3xl">
                <Compass className="h-8 w-8 text-gold-300" aria-hidden="true" /> Tu mapa estelar
              </p>
              <PlacementChip label="Sol" Icon={Sun} placement={chart.sun} />
              <PlacementChip label="Luna" Icon={Moon} placement={chart.moon} />
              <PlacementChip label="Ascendente" Icon={Sunrise} placement={chart.ascendant} />
            </div>
          </div>
          {chart.moon_approximate && (
            <p className="relative z-10 mt-5 rounded-xl bg-white/10 px-4 py-2.5 text-sm text-white/80">
              Tu Luna se ha calculado sin hora exacta: si naciste muy cerca de un
              cambio de signo, podría variar. Añade tu hora para afinarla.
            </p>
          )}
        </div>
      </Reveal>

      {/* Intro */}
      <Reveal>
        <Card padding="lg" className="sm:p-10">
          <p className="text-xl leading-relaxed text-graphite">{i.intro}</p>
        </Card>
      </Reveal>

      {/* Sol / Luna / Ascendente, cada uno en su tarjeta */}
      <Reveal>
        <div className="grid gap-5 lg:grid-cols-3">
          <NarrativeCard
            body="Sol"
            Icon={Sun}
            title={`Tu Sol en ${chart.sun.sign_name}`}
            text={i.sun}
          />
          <NarrativeCard
            body="Luna"
            Icon={Moon}
            title={`Tu Luna en ${chart.moon.sign_name}`}
            text={i.moon}
          />
          <NarrativeCard
            body="Ascendente"
            Icon={Sunrise}
            title={
              chart.ascendant
                ? `Tu Ascendente en ${chart.ascendant.sign_name}`
                : 'Tu Ascendente'
            }
            text={i.ascendant}
          />
        </div>
      </Reveal>

      {/* Síntesis destacada (cielo nocturno) */}
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-[radial-gradient(120%_120%_at_30%_0%,#1e1b4b_0%,#0b1030_45%,#05030f_100%)] p-8 text-white shadow-lift ring-1 ring-white/10 sm:p-12">
          <HeroStars />
          <div className="relative z-10">
            <p className="flex items-center gap-2.5 text-sm font-extrabold uppercase tracking-[0.16em] text-gold-300">
              <Sparkles className="h-5 w-5" aria-hidden="true" /> Tú, en una sola mirada
            </p>
            <p className="mt-4 font-display text-xl font-semibold leading-relaxed text-white sm:text-2xl">
              {i.synthesis}
            </p>
          </div>
        </div>
      </Reveal>

      {isPremium ? (
        <Card tone="premium" padding="lg" className="relative overflow-hidden sm:p-10">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-gold-700">
            <Sparkles className="h-4 w-4" aria-hidden="true" /> Tu plan premium
          </p>
          <h3 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Esto es solo la portada de tu carta
          </h3>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-graphite">
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
        <UpsellCard variant="natal" premiumHook={i.premium_hook} to="/carta-natal/completa" />
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
        hint="Junto con la hora, desbloquea tu Ascendente."
        placeholder="Empieza a escribir tu ciudad…"
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
                className="block w-full px-4 py-2 text-left text-sm text-graphite hover:bg-astral-50 hover:text-ink"
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
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const existing = useNatalChart();
  const gen = useGenerateNatalChart();
  const isPremium = useIsPremium();

  const [birthTime, setBirthTime] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
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
    // Gate de anónimo: ve la UI, pero al calcular se le envía a registrarse.
    if (!session) {
      navigate('/login', { state: { from: '/carta-natal/basica' } });
      return;
    }
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
      <Seo
        title={`Carta natal · ${company.brand}`}
        description="Tu carta natal básica gratuita: descubre tu Sol, tu Luna y tu Ascendente, e interpreta quién eres de verdad."
        path="/carta-natal/basica"
      />

      {/* Hero — mapa estelar */}
      <Section width="full" className="px-3 pt-4 sm:px-4 lg:px-6">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-900 px-6 py-14 text-center text-white shadow-lift sm:px-12 sm:py-20">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/25 via-black/10 to-black/45"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -left-16 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl animate-drift"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 bottom-0 h-72 w-72 rounded-full bg-indigo-300/25 blur-3xl animate-float-slow"
            />
            <HeroStars />
            <div className="relative z-10 mx-auto max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.14em] ring-1 ring-white/30 backdrop-blur">
                <Compass className="h-4 w-4" aria-hidden="true" />
                Mapa estelar
              </span>
              <h1 className="mt-6 font-display text-6xl font-extrabold leading-[0.9] tracking-[-0.035em] [text-shadow:0_2px_24px_rgba(0,0,0,0.35)] sm:text-7xl lg:text-8xl">
                Tu carta natal
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90">
                El Sol dice quién quieres ser; la Luna, lo que sientes; el
                Ascendente, cómo te ve el mundo. Estos tres puntos son el corazón
                de tu carta.
              </p>
            </div>
          </div>
        </Reveal>
      </Section>

      <Section width="xwide" className="py-10">
        {session && existing.isLoading ? (
          <GeneratingLoader
            variant="astral"
            message="Abriendo tu mapa…"
            hint="Recuperando tu carta natal."
          />
        ) : hasChart && chart ? (
          // Ya tiene su carta: la mostramos sin formulario (generación única).
          <ChartResult chart={chart} isPremium={isPremium} />
        ) : gen.isPending ? (
          <GeneratingLoader
            variant="astral"
            message="Trazando tu mapa estelar…"
            hint="Calculando tu Sol, tu Luna y tu Ascendente."
          />
        ) : (
          // No tiene carta: formulario para calcularla por primera vez.
          <Reveal>
            <Card padding="lg" className="mx-auto max-w-2xl sm:p-10">
              <p className="font-display text-2xl font-extrabold tracking-tight text-ink">
                Calcula tu carta
              </p>
              <p className="mt-2 text-base text-graphite">
                Solo se calcula una vez, así que tómate un momento para añadir la
                hora y el lugar si los recuerdas: con ellos desbloqueas tu
                Ascendente.
              </p>

              {profile?.birth_date && (
                <p className="mt-4 text-sm text-silver">
                  Fecha de nacimiento:{' '}
                  <span className="font-semibold text-graphite">
                    {formatBirthDate(profile.birth_date)}
                  </span>{' '}
                  · La cambias en tu{' '}
                  <a className="font-medium text-astral-700 underline" href="/perfil">
                    perfil
                  </a>
                  .
                </p>
              )}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Input
                  type="time"
                  label="Hora de nacimiento (opcional)"
                  hint="Afina tu Luna y desbloquea tu Ascendente."
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

              {birthTime && !selectedCity && (
                <p className="mt-3 text-sm text-silver">
                  Para calcular el Ascendente necesitamos también tu ciudad de
                  nacimiento (elígela de la lista).
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Button
                  onClick={onGenerate}
                  disabled={gen.isPending}
                  size="lg"
                  leftIcon={<Compass className="h-5 w-5" />}
                >
                  {gen.isPending ? 'Trazando…' : 'Calcular mi carta'}
                </Button>
                {!session && (
                  <span className="text-sm text-silver">
                    Necesitas una cuenta gratuita para calcularla.
                  </span>
                )}
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
          </Reveal>
        )}

        <AdSlot className="mt-8" />
      </Section>
    </>
  );
}
