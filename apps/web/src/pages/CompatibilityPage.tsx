import { useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  Crown,
  Heart,
  HeartHandshake,
  Sparkles,
  MessageCircle,
  Flame,
  Zap,
  Lightbulb,
  User,
  Calendar,
  Clock,
  MapPin,
  Gem,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Seo } from '@/lib/seo';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Section } from '@/components/layout/Section';
import { Reveal, RevealStagger, RevealItem } from '@/components/motion/Reveal';
import { GeneratingLoader } from '@/components/feedback/GeneratingLoader';
import { Shine } from '@/components/visual/Shine';
import { toast } from '@/components/ui/Toast';
import { AdSlot } from '@/components/ads/AdSlot';
import { PremiumGate } from '@/components/billing/PremiumGate';
import { cn } from '@/lib/cn';
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

const GENERATING_COLORS = { from: '#e11d48', to: '#a21caf' } as const;

/** Nebulosa rosa-violeta profunda: el fondo de las piezas premium. */
const PANEL_BG =
  'bg-[radial-gradient(125%_125%_at_28%_0%,#4a044e_0%,#3b0764_46%,#0a0418_100%)]';

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

function scoreWord(score: number): string {
  if (score >= 90) return 'Conexión de otro mundo';
  if (score >= 80) return 'Química magnética';
  if (score >= 70) return 'Muy buena sintonía';
  if (score >= 60) return 'Atracción con matices';
  return 'Amor que se trabaja';
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

/** Nebulosas que derivan: el ambiente de color de las piezas premium. */
function Nebulae() {
  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-28 h-96 w-96 rounded-full bg-rose-500/25 blur-3xl animate-drift"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl animate-float-slow"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-gold-500/15 blur-3xl animate-float"
      />
    </>
  );
}

/** Cuenta de 0 al objetivo (easeOutCubic). Respeta reduced-motion. */
function useCountUp(target: number, reduce: boolean | null, duration = 1200): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const cancel = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
    if (reduce) {
      rafRef.current = requestAnimationFrame(() => setValue(target));
      return cancel;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return cancel;
  }, [target, reduce, duration]);
  return value;
}

/** Orbe luminoso de una persona, coloreado por su signo solar. */
function PersonOrb({ label, sun }: { label: string; sun: Placement }) {
  const info = ZODIAC[sun.sign];
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span
        className="relative flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lift animate-float sm:h-24 sm:w-24"
        style={{
          backgroundImage: `linear-gradient(135deg, ${info.colors.from}, ${info.colors.to})`,
          boxShadow: `0 0 34px 6px ${info.colors.primary}66`,
        }}
      >
        <Sparkles className="h-8 w-8 text-white/55" aria-hidden="true" />
      </span>
      <div>
        <p className="font-display text-lg font-extrabold leading-tight text-white sm:text-xl">
          {label}
        </p>
        <p className="text-sm font-medium text-white/70">{sun.sign_name}</p>
      </div>
    </div>
  );
}

/** Anillo de afinidad premium con count-up sobre fondo oscuro. */
function AffinityRing({ score, reduce }: { score: number; reduce: boolean | null }) {
  const shown = useCountUp(score, reduce);
  const R = 45;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - shown / 100);
  return (
    <div className="relative h-40 w-40 sm:h-48 sm:w-48">
      <span aria-hidden="true" className="absolute inset-0 rounded-full bg-rose-400/30 blur-2xl" />
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
        <defs>
          <linearGradient id="affinityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="55%" stopColor="#f0abfc" />
            <stop offset="100%" stopColor="#fcd34d" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="7" />
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke="url(#affinityGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <Heart className="h-5 w-5 fill-rose-300 text-rose-300" aria-hidden="true" />
        <span className="mt-1 font-display text-5xl font-black leading-none text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.4)] sm:text-6xl">
          {Math.round(shown)}
        </span>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
          de 100
        </span>
      </div>
    </div>
  );
}

// --- Puente de sinastría ---------------------------------------------------
const BRIDGE_BODIES: { key: keyof PersonPlacements; symbol: string; label: string }[] = [
  { key: 'sun', symbol: '☉', label: 'Sol' },
  { key: 'moon', symbol: '☽', label: 'Luna' },
  { key: 'mercury', symbol: '☿', label: 'Mercurio' },
  { key: 'venus', symbol: '♀', label: 'Venus' },
  { key: 'mars', symbol: '♂', label: 'Marte' },
];

function placementOf(p: PersonPlacements, key: string): Placement | null {
  switch (key) {
    case 'sun': return p.sun;
    case 'moon': return p.moon;
    case 'mercury': return p.mercury;
    case 'venus': return p.venus;
    case 'mars': return p.mars;
    case 'ascendant': return p.ascendant;
    default: return null;
  }
}

const HARMONY = { good: '#5eead4', tense: '#fb7185' } as const;

/**
 * Visualiza la sinastría: las posiciones de cada persona en dos columnas y los
 * aspectos cruzados como arcos coloreados (armónicos en aguamarina, tensos en
 * rosa). Es la "firma" visual de la compatibilidad avanzada.
 */
function SynastryBridge({ report }: { report: CompatReport }) {
  const a = report.placements_a;
  const b = report.placements_b;

  const bodies = useMemo(() => {
    const list = [...BRIDGE_BODIES];
    if (a.ascendant && b.ascendant) {
      list.push({ key: 'ascendant', symbol: 'Asc', label: 'Ascendente' });
    }
    return list;
  }, [a.ascendant, b.ascendant]);

  const n = bodies.length;
  const rowIdx = useMemo(() => {
    const m: Record<string, number> = {};
    bodies.forEach((bd, i) => (m[bd.key as string] = i));
    return m;
  }, [bodies]);

  const top = 9;
  const bottom = 91;
  const rowY = (i: number) => (n <= 1 ? 50 : top + (i * (bottom - top)) / (n - 1));
  const LEFT = 22;
  const RIGHT = 78;

  const W = 100;
  const H = 64;
  const sx = W / 100;
  const sy = H / 100;

  return (
    <div className="relative">
      {/* Cabeceras de columna */}
      <div className="mb-5 flex items-center justify-between gap-4 px-1">
        <span className="min-w-0 truncate font-display text-2xl font-extrabold text-rose-200 sm:text-3xl">
          {report.label_a}
        </span>
        <span className="min-w-0 truncate text-right font-display text-2xl font-extrabold text-fuchsia-200 sm:text-3xl">
          {report.label_b}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Aspectos de sinastría entre las dos cartas"
      >
        {/* Arcos de aspecto (cruzados) */}
        {report.aspects.map((asp, idx) => {
          const ia = rowIdx[asp.a];
          const ib = rowIdx[asp.b];
          if (ia === undefined || ib === undefined) return null;
          const x1 = LEFT * sx;
          const y1 = rowY(ia) * sy;
          const x2 = RIGHT * sx;
          const y2 = rowY(ib) * sy;
          const cx = 50 * sx;
          const cy = ((rowY(ia) + rowY(ib)) / 2) * sy;
          const color = asp.harmonious ? HARMONY.good : HARMONY.tense;
          return (
            <g key={`${asp.a}-${asp.b}-${asp.type}-${idx}`}>
              <path
                d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                fill="none"
                stroke={color}
                strokeOpacity="0.14"
                strokeWidth="1"
              />
              <path
                d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                fill="none"
                stroke={color}
                strokeOpacity="0.7"
                strokeWidth="0.28"
              />
            </g>
          );
        })}

        {/* Nodos de cada persona */}
        {bodies.map((bd, i) => {
          const pa = placementOf(a, bd.key as string);
          const pb = placementOf(b, bd.key as string);
          const y = rowY(i) * sy;
          const ca = pa ? ZODIAC[pa.sign].colors.primary : '#94a3b8';
          const cb = pb ? ZODIAC[pb.sign].colors.primary : '#94a3b8';
          return (
            <g key={bd.key as string}>
              {/* Izquierda (A) */}
              <circle cx={LEFT * sx} cy={y} r="1.9" fill={ca} stroke="#ffffff" strokeWidth="0.35" strokeOpacity="0.85" />
              <text x={LEFT * sx} y={y} textAnchor="middle" dominantBaseline="central" fontSize="1.7" fill="#ffffff">
                {bd.symbol}
              </text>
              <text x={(LEFT - 3.2) * sx} y={y} textAnchor="end" dominantBaseline="central" fontSize="2.3" fontWeight={600} fill="#fbcfe8">
                {pa ? pa.sign_name : '—'}
              </text>
              {/* Derecha (B) */}
              <circle cx={RIGHT * sx} cy={y} r="1.9" fill={cb} stroke="#ffffff" strokeWidth="0.35" strokeOpacity="0.85" />
              <text x={RIGHT * sx} y={y} textAnchor="middle" dominantBaseline="central" fontSize="1.7" fill="#ffffff">
                {bd.symbol}
              </text>
              <text x={(RIGHT + 3.2) * sx} y={y} textAnchor="start" dominantBaseline="central" fontSize="2.3" fontWeight={600} fill="#f5d0fe">
                {pb ? pb.sign_name : '—'}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Leyenda */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/70">
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="h-0.5 w-6 rounded-full" style={{ backgroundColor: HARMONY.good }} />
          Conexión que fluye
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="h-0.5 w-6 rounded-full" style={{ backgroundColor: HARMONY.tense }} />
          Chispa que reta
        </span>
      </div>
    </div>
  );
}

/** Bloques narrativos del bento (clave de interpretación, icono, color, tamaño). */
const SECTIONS: {
  key: keyof CompatReport['interpretation'];
  title: string;
  Icon: LucideIcon;
  color: string;
  span: string;
  gradient?: string;
}[] = [
  { key: 'love', title: 'Amor y pasión', Icon: Flame, color: '#e11d48', span: 'sm:col-span-2 lg:col-span-3', gradient: 'from-rose-500 via-pink-600 to-rose-700' },
  { key: 'longterm', title: 'A largo plazo', Icon: Sparkles, color: '#c026d3', span: 'sm:col-span-2 lg:col-span-3', gradient: 'from-fuchsia-600 via-purple-600 to-violet-800' },
  { key: 'emotional', title: 'Emoción y comunicación', Icon: MessageCircle, color: '#0ea5e9', span: 'sm:col-span-2 lg:col-span-3' },
  { key: 'friction', title: 'Lo que toca trabajar', Icon: Zap, color: '#d97706', span: 'sm:col-span-2 lg:col-span-3' },
];

function SectionCard({
  Icon,
  title,
  color,
  text,
  gradient,
}: {
  Icon: LucideIcon;
  title: string;
  color: string;
  text: string;
  gradient?: string;
}) {
  if (gradient) {
    return (
      <div
        className={cn(
          'group relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br p-7 text-white shadow-lift transition-all duration-300 ease-cosmic hover:-translate-y-1 sm:p-9',
          gradient,
        )}
      >
        <Icon
          aria-hidden="true"
          strokeWidth={1.3}
          className="pointer-events-none absolute -bottom-6 -right-4 h-40 w-40 text-white/10 transition-transform duration-500 ease-cosmic group-hover:scale-110 group-hover:-rotate-6"
        />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </span>
        <h3 className="relative mt-5 font-display text-3xl font-extrabold tracking-tight [text-shadow:0_2px_14px_rgba(0,0,0,0.25)]">
          {title}
        </h3>
        <p className="relative mt-3 whitespace-pre-line text-lg leading-relaxed text-white/95">{text}</p>
      </div>
    );
  }
  return (
    <Card
      padding="lg"
      className="relative h-full overflow-hidden transition-all duration-300 ease-cosmic hover:-translate-y-1 sm:p-9"
      style={{ backgroundImage: `linear-gradient(135deg, ${color}1f, #ffffff 60%)` }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ backgroundImage: `linear-gradient(90deg, ${color}, transparent)` }}
      />
      <span
        className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-soft"
        style={{ backgroundColor: color, boxShadow: `0 0 14px 1px ${color}55` }}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-ink">
        {title}
      </h3>
      <p className="mt-3 whitespace-pre-line text-lg leading-relaxed text-graphite">{text}</p>
    </Card>
  );
}

function CompatResult({ report, reduce }: { report: CompatReport; reduce: boolean | null }) {
  const i = report.interpretation;

  return (
    <div className="space-y-8">
      {/* Pieza central: orbes + anillo de afinidad sobre nebulosa */}
      <Reveal>
        <div className={`relative isolate overflow-hidden rounded-[2.5rem] ${PANEL_BG} p-6 text-white shadow-lift ring-1 ring-white/10 sm:p-10 lg:p-14`}>
          <StarField />
          <Nebulae />
          <div className="relative z-10">
            <p className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-gold-300">
              <Crown className="h-4 w-4" aria-hidden="true" /> Vuestra sinastría premium
            </p>

            <div className="mt-8 grid items-center gap-6 sm:grid-cols-[1fr_auto_1fr] sm:gap-4">
              <div className="flex justify-center sm:justify-end">
                <PersonOrb label={report.label_a} sun={report.placements_a.sun} />
              </div>
              <div className="flex justify-center">
                <AffinityRing score={report.score} reduce={reduce} />
              </div>
              <div className="flex justify-center sm:justify-start">
                <PersonOrb label={report.label_b} sun={report.placements_b.sun} />
              </div>
            </div>

            <div className="mt-8 text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-base font-bold ring-1 ring-white/20 backdrop-blur">
                <Sparkles className="h-4 w-4 text-gold-300" aria-hidden="true" />
                {scoreWord(report.score)}
              </span>
              <p className="mx-auto mt-5 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-white/90">
                {i.connection}
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Puente entre las dos cartas */}
      {report.aspects.length > 0 && (
        <Reveal>
          <div className={`relative isolate overflow-hidden rounded-[2.5rem] ${PANEL_BG} p-6 text-white shadow-lift ring-1 ring-white/10 sm:p-10`}>
            <StarField />
            <div className="relative z-10">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-fuchsia-200 sm:text-base">
                <HeartHandshake className="h-5 w-5" aria-hidden="true" /> El puente entre vuestras cartas
              </p>
              <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
                Dónde os encontráis
              </h2>
              <p className="mt-4 max-w-3xl text-xl leading-relaxed text-white/85 sm:text-2xl">
                Cada hilo une un astro tuyo con uno de la otra persona: así se
                teje, en lo invisible, la química que sentís.
              </p>
              <div className="mt-8">
                <SynastryBridge report={report} />
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* Bloques narrativos en bento */}
      <RevealStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
        {SECTIONS.map((s) => (
          <RevealItem key={s.key} className={s.span}>
            <SectionCard
              Icon={s.Icon}
              title={s.title}
              color={s.color}
              text={i[s.key]}
              {...(s.gradient ? { gradient: s.gradient } : {})}
            />
          </RevealItem>
        ))}
      </RevealStagger>

      {/* Consejo destacado */}
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-fuchsia-600 via-rose-600 to-pink-700 p-8 text-white shadow-lift sm:p-12">
          <StarField />
          <div className="relative z-10">
            <p className="flex items-center gap-2.5 text-sm font-extrabold uppercase tracking-[0.16em] text-gold-200">
              <Lightbulb className="h-5 w-5" aria-hidden="true" /> El consejo para los dos
            </p>
            <p className="mt-4 whitespace-pre-line font-display text-xl font-semibold leading-relaxed sm:text-2xl">
              {i.advice}
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
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
        <ul className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {results.map((c) => (
            <li key={`${c.name}-${c.lat}`}>
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-sm text-graphite hover:bg-amor-50 hover:text-ink"
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
  accent,
  Icon,
  state,
  onChange,
}: {
  title: string;
  accent: string;
  Icon: LucideIcon;
  state: PersonState;
  onChange: (next: PersonState) => void;
}) {
  return (
    <Card padding="lg" className="relative overflow-hidden">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ backgroundImage: `linear-gradient(90deg, ${accent}, transparent)` }}
      />
      <p className="flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight text-ink">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-soft"
          style={{ backgroundColor: accent, boxShadow: `0 0 14px 1px ${accent}55` }}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        {title}
      </p>
      <div className="mt-5 space-y-4">
        <Input
          label="Nombre"
          placeholder="Su nombre"
          leftAddon={<User className="h-4 w-4" />}
          value={state.label}
          onChange={(e) => onChange({ ...state, label: e.target.value })}
        />
        <Input
          type="date"
          label="Fecha de nacimiento"
          leftAddon={<Calendar className="h-4 w-4" />}
          value={state.birthDate}
          onChange={(e) => onChange({ ...state, birthDate: e.target.value })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            type="time"
            label="Hora (opcional)"
            hint="Afina la Luna y el Ascendente."
            leftAddon={<Clock className="h-4 w-4" />}
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

function CompatBody() {
  const reduce = useReducedMotion();
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
    if (!q.includedUsed) return 'Tienes incluida tu sinastría de este mes.';
    if (q.credits > 0)
      return `Sinastría incluida usada · ${q.credits} extra disponible${q.credits > 1 ? 's' : ''}.`;
    return 'Ya has usado tu sinastría incluida de este mes.';
  }

  return (
    <div className="space-y-8">
      {/* Formularios de las dos personas */}
      <RevealStagger className="grid gap-6 md:grid-cols-2">
        <RevealItem>
          <PersonForm
            title="Tú"
            accent="#e11d48"
            Icon={Heart}
            state={personA}
            onChange={setPersonA}
          />
        </RevealItem>
        <RevealItem>
          <PersonForm
            title="La otra persona"
            accent="#c026d3"
            Icon={HeartHandshake}
            state={personB}
            onChange={setPersonB}
          />
        </RevealItem>
      </RevealStagger>

      {/* Barra de acción + cuota */}
      <Reveal>
        <Card padding="lg" className="relative overflow-hidden border-amor-100">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-fuchsia-200/40 blur-3xl"
          />
          <div className="relative">
            {q && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amor-50 px-4 py-1.5 text-sm font-semibold text-amor-700 ring-1 ring-amor-100">
                <Sparkles className="h-4 w-4" aria-hidden="true" /> {quotaLabel()}
              </div>
            )}

            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-base text-graphite">
                Con la fecha basta; la hora y la ciudad afinan la Luna y el
                Ascendente de cada uno.
              </p>
              {needsPayment ? (
                <Button
                  variant="premium"
                  onClick={onBuy}
                  disabled={buy.isPending}
                  size="lg"
                  leftIcon={<Gem className="h-5 w-5" />}
                >
                  {buy.isPending ? 'Abriendo el pago…' : 'Otra sinastría · 1,99 €'}
                </Button>
              ) : (
                <Button
                  onClick={onGenerate}
                  disabled={!ready || gen.isPending}
                  size="lg"
                  leftIcon={<HeartHandshake className="h-5 w-5" />}
                >
                  {gen.isPending ? 'Leyendo los astros…' : 'Ver nuestra compatibilidad'}
                </Button>
              )}
            </div>

            {needsPayment && (
              <p className="mt-4 rounded-2xl bg-mist/60 p-4 text-sm leading-relaxed text-graphite">
                Ya has usado tu compatibilidad incluida de este mes. Puedes generar
                todas las que quieras por <strong>1,99 €</strong> cada una; el mes que
                viene tendrás otra incluida en tu plan.
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
          </div>
        </Card>
      </Reveal>

      {/* Estados de carga */}
      {gen.isPending && (
        <GeneratingLoader
          colors={GENERATING_COLORS}
          message="Cruzando vuestras cartas…"
          hint="Comparando vuestros astros y midiendo los aspectos entre los dos."
        />
      )}
      {selectedId && selected.isPending && (
        <GeneratingLoader
          colors={GENERATING_COLORS}
          message="Abriendo vuestra sinastría…"
          hint="Recuperando el informe guardado."
        />
      )}

      {/* Resultado */}
      {shownReport && (
        <div ref={resultRef}>
          <CompatResult report={shownReport} reduce={reduce} />
        </div>
      )}

      {/* Historial */}
      {history.data && history.data.length > 0 && (
        <Reveal>
          <Card padding="lg">
            <p className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight text-ink">
              <HeartHandshake className="h-6 w-6 text-amor-600" aria-hidden="true" />
              Vuestras compatibilidades anteriores
            </p>
            <p className="mt-1 text-sm text-graphite">
              Toca cualquiera para volver a ver su resultado.
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {history.data.map((h) => {
                const active = h.id === selectedId;
                return (
                  <li key={h.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(h.id)}
                      aria-current={active}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-200 ease-cosmic hover:-translate-y-0.5',
                        active
                          ? 'border-amor-200 bg-amor-50 ring-1 ring-amor-200'
                          : 'border-slate-200 bg-white hover:border-amor-100 hover:shadow-soft',
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-ink">
                          {h.label_a} & {h.label_b}
                        </span>
                        <span className="text-xs font-medium text-graphite">
                          {scoreWord(h.score)}
                        </span>
                      </span>
                      <span
                        className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-full text-white shadow-soft"
                        style={{ backgroundImage: 'linear-gradient(135deg,#fb7185,#c026d3)' }}
                      >
                        <span className="font-display text-base font-extrabold leading-none">
                          {h.score}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        </Reveal>
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

      {/* Hero premium a sangre */}
      <Section width="full" className="px-3 pt-4 sm:px-4 lg:px-6">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-rose-600 via-fuchsia-700 to-purple-900 px-6 py-16 text-center text-white shadow-lift sm:px-12 sm:py-24">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/30 via-black/10 to-black/50"
            />
            <Nebulae />
            <StarField />
            <div className="relative z-10 mx-auto max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.16em] text-gold-200 ring-1 ring-white/30 backdrop-blur">
                <Crown className="h-4 w-4" aria-hidden="true" />
                Compatibilidad premium
              </span>
              <h1 className="mt-6 font-display text-5xl font-black leading-[0.9] tracking-[-0.035em] [text-shadow:0_2px_24px_rgba(0,0,0,0.4)] sm:text-7xl lg:text-[5.5rem]">
                Vuestra <Shine gold>química real</Shine>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90 sm:text-xl">
                La sinastría cruza vuestras dos cartas —Sol, Luna, Venus, Marte y
                los aspectos exactos entre ambas— para revelar cómo conectáis, qué
                os enciende, qué os reta y hasta dónde podéis llegar juntos.
              </p>
            </div>
          </div>
        </Reveal>
      </Section>

      <Section width="xwide" className="py-10">
        <PremiumGate
          title="La compatibilidad avanzada es premium"
          description="Suscríbete y descubre la sinastría entre dos cartas: afinidad, amor, comunicación, roces y potencial a largo plazo. Incluye una compatibilidad al mes —además de todo Zodiaq sin anuncios."
        >
          <CompatBody />
        </PremiumGate>

        <AdSlot className="mt-8" />
      </Section>
    </>
  );
}
