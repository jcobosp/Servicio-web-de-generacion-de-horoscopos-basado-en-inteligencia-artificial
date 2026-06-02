import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Zap, Target, ShieldAlert, Sparkles } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { Seo } from '@/lib/seo';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { GeneratingLoader } from '@/components/feedback/GeneratingLoader';
import { UpsellCard } from '@/components/horoscope/UpsellCard';
import { SignPicker } from '@/components/horoscope/SignPicker';
import { AdSlot } from '@/components/ads/AdSlot';
import { useDailyEnergy } from '@/features/daily-energy/hooks';
import { useAuth } from '@/features/auth/AuthProvider';
import { useProfile } from '@/features/profile/hooks';
import { ZODIAC, ZODIAC_SIGNS } from '@/lib/zodiac';
import type { ZodiacInfo, ZodiacSign } from '@/lib/zodiac';
import type { ThemeKey } from '@/lib/feature-theme';
import { company } from '@/features/legal/company';

const todayLabel = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
}).format(new Date());

/** Cada elemento del zodiaco hereda un tema de color para el loader. */
const ELEMENT_THEME: Record<ZodiacInfo['element'], ThemeKey> = {
  fuego: 'energy',
  tierra: 'numen',
  aire: 'celeste',
  agua: 'astral',
};

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

function isZodiacSign(value: string | undefined): value is ZodiacSign {
  return Boolean(value && (ZODIAC_SIGNS as readonly string[]).includes(value));
}

/** Estrellas reutilizables para los heros a sangre. */
function HeroStars() {
  return (
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
  );
}

/**
 * Hook: anima un valor de 0 al objetivo (count-up con easeOutCubic). Devuelve
 * el valor intermedio para mover a la vez el anillo y la cifra. Respeta
 * `prefers-reduced-motion` (salta directo al objetivo).
 */
function useCountUp(target: number | null, durationMs = 1100): number {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const cancel = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
    if (target == null) {
      rafRef.current = requestAnimationFrame(() => setValue(0));
      return cancel;
    }
    if (reduced) {
      rafRef.current = requestAnimationFrame(() => setValue(target));
      return cancel;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return cancel;
  }, [target, durationMs, reduced]);

  return value;
}

/** Medidor circular (anillo SVG animado) del nivel 1-10, protagonista del hero. */
function EnergyGauge({
  level,
  pending,
}: {
  level: number | undefined;
  pending: boolean;
}) {
  const target = level != null ? Math.max(0, Math.min(10, level)) : null;
  const shown = useCountUp(target);

  // Geometría del anillo (idéntica esté en carga o cargado).
  const R = 45;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - (shown * 10) / 100);

  return (
    <div
      className="relative h-44 w-44 flex-shrink-0 sm:h-52 sm:w-52"
      role="meter"
      aria-valuenow={level ?? undefined}
      aria-valuemin={1}
      aria-valuemax={10}
      aria-label={
        level != null ? `Nivel de energía ${level} de 10` : 'Calculando energía'
      }
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-white/30 blur-2xl"
      />
      {/* Disco interior (mismo tamaño siempre): inset = grosor del anillo */}
      <div className="absolute inset-[13px] rounded-full bg-black/25 backdrop-blur" />

      {/* Anillo: pista + progreso animado, empezando arriba (-90º) */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="7"
        />
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke="#ffffff"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
        />
      </svg>

      {/* Cifra centrada (tamaño constante en ambos estados) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {pending && target == null ? (
          <span className="font-display text-5xl font-extrabold text-white/75 animate-pulse">
            ···
          </span>
        ) : (
          <>
            <span className="font-display text-6xl font-extrabold leading-none text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.35)] sm:text-7xl">
              {Math.round(shown)}
            </span>
            <span className="mt-1 text-sm font-bold uppercase tracking-[0.2em] text-white/80">
              de 10
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/** Hero a sangre con el color del propio signo + medidor circular. */
function EnergyHero({
  info,
  level,
  vibe,
  pending,
}: {
  info: ZodiacInfo;
  level: number | undefined;
  vibe: string | undefined;
  pending: boolean;
}) {
  return (
    <Section width="full" className="px-3 pt-4 sm:px-4 lg:px-6">
      <Reveal>
        <div
          className="relative isolate overflow-hidden rounded-[2.5rem] px-6 py-12 text-white shadow-lift sm:px-12 sm:py-16 lg:py-20"
          style={{
            backgroundImage: `linear-gradient(135deg, ${info.colors.primary}, ${info.colors.from} 55%, ${info.colors.to})`,
          }}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/35 via-black/20 to-black/55"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-16 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl animate-drift"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 bottom-0 h-72 w-72 rounded-full bg-white/15 blur-3xl animate-float-slow"
          />
          <HeroStars />

          {/* Texto + medidor, agrupados y centrados en la card */}
          <div className="relative z-10 flex flex-col items-center gap-10 lg:flex-row lg:justify-center lg:gap-20">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.14em] ring-1 ring-white/30 backdrop-blur">
                <Zap className="h-4 w-4" aria-hidden="true" />
                Energía del día
              </span>
              <h1 className="mt-6 font-display text-6xl font-extrabold leading-[0.9] tracking-[-0.035em] [text-shadow:0_2px_24px_rgba(0,0,0,0.35)] sm:text-7xl lg:text-8xl">
                {info.name}
              </h1>
              <p className="mt-4 text-xl font-medium capitalize text-white/90">
                {todayLabel}
              </p>
              {vibe && !pending && (
                <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-base font-bold ring-1 ring-white/25 backdrop-blur">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  {vibe}
                </span>
              )}
            </div>

            <EnergyGauge level={level} pending={pending} />
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/** Medidor segmentado (10 bloques) que se encienden hasta el nivel. */
function SegmentMeter({ level, info }: { level: number; info: ZodiacInfo }) {
  const lit = Math.max(0, Math.min(10, level));
  return (
    <div>
      <span className="text-base font-extrabold uppercase tracking-[0.12em] text-graphite sm:text-lg">
        Nivel de energía
      </span>
      <div className="mt-2.5 flex gap-1.5" aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            className="h-3.5 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i < lit ? undefined : 'rgb(226 232 240)',
              backgroundImage:
                i < lit
                  ? `linear-gradient(90deg, ${info.colors.from}, ${info.colors.to})`
                  : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function EnergyDetails({ sign, info }: { sign: ZodiacSign; info: ZodiacInfo }) {
  const { data, isPending, isError } = useDailyEnergy(sign);
  const accent = info.colors.primary;

  if (isPending) {
    return (
      <GeneratingLoader
        variant={ELEMENT_THEME[info.element]}
        colors={{ from: info.colors.primary, to: info.colors.to }}
        message="Midiendo tu energía…"
        hint={`Calculando la energía de hoy para ${info.name}.`}
      />
    );
  }

  if (isError || !data || data.status !== 'ok') {
    const message =
      data && 'message' in data
        ? data.message
        : 'La energía del día se está asentando. Vuelve en unos minutos.';
    return (
      <Card padding="lg" className="text-center">
        <div aria-hidden="true" className="text-4xl">
          🌙
        </div>
        <p className="mt-3 text-graphite">{message}</p>
      </Card>
    );
  }

  const c = data.content;

  return (
    <Reveal>
      <Card padding="lg" className="relative overflow-hidden sm:p-10">
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1.5"
          style={{ backgroundImage: `linear-gradient(90deg, ${accent}, transparent)` }}
        />

        {/* Cabecera: titular + puntuación grande en la esquina derecha */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span aria-hidden="true" className="text-5xl leading-none sm:text-6xl">
              {c.mood_emoji}
            </span>
            <h2
              className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl"
              style={{ color: accent }}
            >
              {c.headline}
            </h2>
          </div>
          <div className="flex-shrink-0 text-right leading-none">
            <span
              className="font-display text-5xl font-extrabold sm:text-6xl"
              style={{ color: accent }}
            >
              {c.energy_level}
              <span className="text-2xl text-silver sm:text-3xl">/10</span>
            </span>
            <span className="mt-1 block text-sm font-extrabold uppercase tracking-[0.14em] text-silver sm:text-base">
              Nivel
            </span>
          </div>
        </div>

        <div className="mt-7">
          <SegmentMeter level={c.energy_level} info={info} />
        </div>

        {/* Cuerpo a la izquierda; a la derecha «foco» encima de «cuida» */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <p className="whitespace-pre-line text-lg leading-relaxed text-graphite">
            {c.body}
          </p>

          <div className="flex flex-col gap-3">
            <div
              className="rounded-2xl border-2 px-5 py-4"
              style={{
                backgroundColor: info.colors.secondary,
                borderColor: `${accent}33`,
              }}
            >
              <p
                className="flex items-center gap-2 text-lg font-extrabold uppercase tracking-[0.07em] sm:text-xl"
                style={{ color: accent }}
              >
                <Target className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" /> Pon el foco en
              </p>
              <p className="mt-1.5 text-lg leading-snug text-ink">{c.focus}</p>
            </div>
            <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-100 px-5 py-4">
              <p className="flex items-center gap-2 text-lg font-extrabold uppercase tracking-[0.07em] text-red-600 sm:text-xl">
                <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" /> Cuida hoy
              </p>
              <p className="mt-1.5 text-lg leading-snug text-ink">{c.caution}</p>
            </div>
          </div>
        </div>
      </Card>
    </Reveal>
  );
}

/** Contenido con signo resuelto: hero (con medidor) + detalle + upsell. */
function EnergyContent({ sign, info }: { sign: ZodiacSign; info: ZodiacInfo }) {
  const { data, isPending } = useDailyEnergy(sign);
  const content = data?.status === 'ok' ? data.content : null;

  return (
    <>
      <Seo
        title={`Energía del día de ${info.name} · ${company.brand}`}
        description={`La energía astrológica de hoy para ${info.name}: tu nivel del día, en qué poner el foco y qué cuidar.`}
        path={`/energia-del-dia/${info.slug}`}
        type="article"
      />

      <EnergyHero
        info={info}
        level={content?.energy_level}
        vibe={content?.vibe}
        pending={isPending}
      />

      <Section width="xwide" className="py-10">
        <EnergyDetails sign={sign} info={info} />

        <UpsellCard variant="energy" premiumHook={content?.premium_hook} />

        <AdSlot className="mt-8" />

        <div className="mt-14 border-t border-slate-200 pt-10">
          <SignPicker
            hrefFor={(slug) => `/energia-del-dia/${slug}`}
            title="Ver la energía de otro signo"
          />
        </div>
      </Section>
    </>
  );
}

export function EnergyOfDayPage() {
  const { sign: signParam } = useParams();
  const { session } = useAuth();
  const { data: profile } = useProfile();

  const paramSign = isZodiacSign(signParam) ? signParam : null;
  const profileSign = (profile?.sun_sign as ZodiacSign | undefined) ?? null;
  const sign = paramSign ?? profileSign;
  const info = sign ? ZODIAC[sign] : null;

  // Sin signo resuelto: hero de invitación + rejilla de signos.
  if (!sign || !info) {
    return (
      <>
        <Seo
          title={`Energía del día · ${company.brand}`}
          description="La energía astrológica de hoy para tu signo: tu nivel del día, en qué poner el foco y qué cuidar."
          path="/energia-del-dia"
        />
        <Section width="full" className="px-3 pt-4 sm:px-4 lg:px-6">
          <Reveal>
            <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-amber-500 via-orange-600 to-rose-700 px-6 py-16 text-center text-white shadow-lift sm:px-12 sm:py-20">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/25 via-black/10 to-black/45"
              />
              <HeroStars />
              <span className="relative z-10 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.14em] ring-1 ring-white/30 backdrop-blur">
                <Zap className="h-4 w-4" aria-hidden="true" />
                Energía del día
              </span>
              <h1 className="relative z-10 mx-auto mt-6 max-w-3xl font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
                Elige tu signo
              </h1>
              <p className="relative z-10 mx-auto mt-5 max-w-xl text-lg text-white/90">
                Ve tu energía de hoy, tu nivel del 1 al 10 y dónde poner el foco.{' '}
                {!session && 'Si te registras, la verás siempre sin elegirla.'}
              </p>
            </div>
          </Reveal>
        </Section>

        <Section width="xwide" className="py-10">
          <Reveal>
            <SignPicker hrefFor={(slug) => `/energia-del-dia/${slug}`} />
          </Reveal>
          <AdSlot className="mt-10" />
        </Section>
      </>
    );
  }

  return <EnergyContent sign={sign} info={info} />;
}
