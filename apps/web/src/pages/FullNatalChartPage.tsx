import { useMemo, useState } from 'react';
import {
  Compass,
  Crown,
  Sun,
  Moon,
  Sunrise,
  ArrowUpRight,
  Heart,
  Briefcase,
  Eye,
  CalendarRange,
  Sparkles,
  Clock,
  MapPin,
  Orbit,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Seo } from '@/lib/seo';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Section } from '@/components/layout/Section';
import { Reveal, RevealStagger, RevealItem } from '@/components/motion/Reveal';
import { GeneratingLoader } from '@/components/feedback/GeneratingLoader';
import { AdSlot } from '@/components/ads/AdSlot';
import { PremiumGate } from '@/components/billing/PremiumGate';
import { useProfile } from '@/features/profile/hooks';
import {
  useFullNatalChart,
  useGenerateFullNatalChart,
} from '@/features/natal/hooks';
import { searchCities } from '@/features/natal/cities';
import type { City } from '@/features/natal/cities';
import type {
  FullNatalChart,
  PlanetPosition,
  Placement,
  Aspect,
} from '@/features/natal/types';
import { ZODIAC, ZODIAC_SIGNS } from '@/lib/zodiac';
import { decodeByteaText } from '@/lib/bytea';
import { company } from '@/features/legal/company';

function formatDeg(deg: number): string {
  return `${deg.toFixed(1).replace('.', ',')}º`;
}

const GOLD = '#fcd34d';

/** Fondo de panel premium: nebulosa violeta profunda hacia el negro. */
const PANEL_BG =
  'bg-[radial-gradient(125%_125%_at_28%_0%,#2e1065_0%,#1a1040_44%,#0a0418_100%)]';

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
  { top: 6, left: 72, size: 1, delay: 1.1 },
  { top: 30, left: 4, size: 2, delay: 0.45 },
  { top: 46, left: 88, size: 1, delay: 1.85 },
  { top: 50, left: 32, size: 1, delay: 0.95 },
  { top: 66, left: 52, size: 2, delay: 2.4 },
  { top: 18, left: 66, size: 1, delay: 0.55 },
  { top: 78, left: 4, size: 1, delay: 1.65 },
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

/** Nebulosas que derivan: el ambiente de color del panel. */
function Nebulae() {
  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-28 h-96 w-96 rounded-full bg-aurora-600/30 blur-3xl animate-drift"
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

/**
 * Motivo firma de la página: anillos concéntricos que giran (orrery) y dos
 * cuerpos diminutos que orbitan. Puro decorado, se frena con reduced-motion.
 */
function OrbitField({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${className ?? ''}`}
    >
      <span className="absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2">
        <span className="absolute inset-0 animate-orbit">
          <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-gold-300 shadow-[0_0_10px_3px_rgba(252,211,77,0.7)]" />
        </span>
        <span className="absolute inset-[14%] animate-orbit [animation-direction:reverse] [animation-duration:22s]">
          <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-fuchsia-300 shadow-[0_0_10px_3px_rgba(240,171,252,0.7)]" />
        </span>
      </span>
    </span>
  );
}

// --- Rueda natal -----------------------------------------------------------
// viewBox 100×100, 0º Aries arriba y avance horario.
function polar(r: number, angleDeg: number): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: 50 + r * Math.cos(rad), y: 50 + r * Math.sin(rad) };
}

/** Color de la línea de cada aspecto: armónicos en cian, tensos en rosa. */
const ASPECT_STYLE: Record<string, { color: string; name: string }> = {
  conjunction: { color: '#fbbf24', name: 'Conjunción' },
  sextile: { color: '#67e8f9', name: 'Sextil' },
  trine: { color: '#5eead4', name: 'Trígono' },
  square: { color: '#fb7185', name: 'Cuadratura' },
  opposition: { color: '#f472b6', name: 'Oposición' },
};

/**
 * Reparte los ángulos de los planetas para que sus orbes no se solapen,
 * manteniéndolos lo más cerca posible de su longitud real.
 */
function spreadAngles(longitudes: number[], minSep: number): number[] {
  const items = longitudes.map((lon, idx) => ({ idx, ang: lon }));
  items.sort((a, b) => a.ang - b.ang);
  const n = items.length;
  for (let iter = 0; iter < 260 && n > 1; iter++) {
    let moved = false;
    for (let i = 0; i < n; i++) {
      const a = items[i]!;
      const b = items[(i + 1) % n]!;
      const diff = (b.ang - a.ang + 360) % 360;
      if (diff < minSep - 0.01) {
        const push = (minSep - diff) / 2;
        a.ang = (a.ang - push + 360) % 360;
        b.ang = (b.ang + push) % 360;
        moved = true;
      }
    }
    if (!moved) break;
  }
  const out = new Array<number>(n);
  for (const it of items) out[it.idx] = it.ang;
  return out;
}

function NatalWheel({ chart }: { chart: FullNatalChart }) {
  const { planets, ascendant, midheaven, aspects } = chart;

  const houseForSign = useMemo(() => {
    const map: Record<string, number> = {};
    for (const h of chart.houses) map[h.sign] = h.house;
    return map;
  }, [chart.houses]);

  const display = useMemo(
    () => spreadAngles(planets.map((p) => p.longitude), 14),
    [planets],
  );

  const lonByBody = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of planets) m[p.body] = p.longitude;
    return m;
  }, [planets]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
      {/* Halo y cuerpos orbitando alrededor de la rueda */}
      <span
        aria-hidden="true"
        className="absolute inset-[10%] rounded-full bg-aurora-500/25 blur-3xl"
      />
      <span aria-hidden="true" className="absolute inset-0 animate-orbit">
        <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-white shadow-[0_0_12px_4px_rgba(255,255,255,0.85)]" />
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-[6%] animate-orbit [animation-direction:reverse] [animation-duration:26s]"
      >
        <span className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-fuchsia-200 shadow-[0_0_10px_3px_rgba(245,208,254,0.8)]" />
      </span>

      <svg viewBox="0 0 100 100" className="relative h-full w-full">
        <defs>
          <linearGradient id="signBand" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="50%" stopColor="#f0abfc" />
            <stop offset="100%" stopColor="#fcd34d" />
          </linearGradient>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde68a" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#f0abfc" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f0abfc" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Anillo decorativo que gira (orrery) */}
        <g className="animate-spin-slow" style={{ transformOrigin: 'center', transformBox: 'fill-box' }}>
          <circle cx="50" cy="50" r="48.5" fill="none" stroke={GOLD} strokeOpacity="0.28" strokeWidth="0.3" strokeDasharray="0.6 2.4" />
          {Array.from({ length: 24 }, (_, k) => {
            const p = polar(48.5, k * 15);
            return <circle key={k} cx={p.x} cy={p.y} r="0.5" fill="#f0abfc" fillOpacity="0.6" />;
          })}
        </g>

        {/* Banda de signos (gradiente) y bordes */}
        <circle cx="50" cy="50" r="41.5" fill="none" stroke="url(#signBand)" strokeOpacity="0.22" strokeWidth="9" />
        <circle cx="50" cy="50" r="46" fill="none" stroke={GOLD} strokeOpacity="0.45" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="37" fill="none" stroke={GOLD} strokeOpacity="0.3" strokeWidth="0.4" />
        <circle cx="50" cy="50" r="26" fill="none" stroke="#a78bfa" strokeOpacity="0.3" strokeWidth="0.4" />

        {/* Marcas de grado */}
        {Array.from({ length: 60 }, (_, k) => {
          const a = k * 6;
          const major = k % 5 === 0;
          const p1 = polar(major ? 37 : 38.4, a);
          const p2 = polar(46, a);
          return (
            <line
              key={`t${k}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={GOLD}
              strokeOpacity={major ? 0.5 : 0.2}
              strokeWidth={major ? 0.45 : 0.28}
            />
          );
        })}

        {/* Divisiones de signo, abreviaturas y número de casa */}
        {ZODIAC_SIGNS.map((slug, i) => {
          const a = i * 30;
          const div1 = polar(26, a);
          const div2 = polar(46, a);
          const label = polar(41.5, a + 15);
          const house = polar(30, a + 15);
          return (
            <g key={slug}>
              <line x1={div1.x} y1={div1.y} x2={div2.x} y2={div2.y} stroke="#c4b5fd" strokeOpacity="0.28" strokeWidth="0.4" />
              <text
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="2.5"
                fontWeight={700}
                fill="#fde68a"
                fillOpacity="0.9"
              >
                {ZODIAC[slug].name.slice(0, 3).toUpperCase()}
              </text>
              {houseForSign[slug] && (
                <text
                  x={house.x}
                  y={house.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="2"
                  fontWeight={600}
                  fill="#c4b5fd"
                  fillOpacity="0.75"
                >
                  {houseForSign[slug]}
                </text>
              )}
            </g>
          );
        })}

        {/* Telaraña de aspectos (glow + línea) */}
        {aspects.map((asp: Aspect, idx) => {
          const la = lonByBody[asp.a];
          const lb = lonByBody[asp.b];
          if (la === undefined || lb === undefined) return null;
          const p1 = polar(26, la);
          const p2 = polar(26, lb);
          const color = ASPECT_STYLE[asp.type]?.color ?? GOLD;
          return (
            <g key={`asp${idx}`}>
              <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={color} strokeOpacity="0.18" strokeWidth="1.1" />
              <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={color} strokeOpacity="0.7" strokeWidth="0.35" />
            </g>
          );
        })}

        {/* Ejes Ascendente (AC) y Medio Cielo (MC) */}
        {(
          [
            { lon: ascendant.longitude, label: 'AC', color: '#67e8f9' },
            { lon: midheaven.longitude, label: 'MC', color: '#fcd34d' },
          ] as const
        ).map((axis) => {
          const inner = polar(26, axis.lon);
          const outer = polar(46, axis.lon);
          const tag = polar(43.5, axis.lon);
          return (
            <g key={axis.label}>
              <line
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={axis.color}
                strokeOpacity="0.9"
                strokeWidth="0.7"
                strokeDasharray="1.4 1"
              />
              <circle cx={tag.x} cy={tag.y} r="2.7" fill="#0a0418" stroke={axis.color} strokeWidth="0.5" />
              <text
                x={tag.x}
                y={tag.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="2.1"
                fontWeight={700}
                fill={axis.color}
              >
                {axis.label}
              </text>
            </g>
          );
        })}

        {/* Líneas guía planeta → su grado real */}
        {planets.map((p, i) => {
          const tick = polar(37, p.longitude);
          const m = polar(33, display[i]!);
          return (
            <g key={`g${p.body}`}>
              <line x1={tick.x} y1={tick.y} x2={m.x} y2={m.y} stroke={GOLD} strokeOpacity="0.4" strokeWidth="0.3" />
              <circle cx={tick.x} cy={tick.y} r="0.7" fill={GOLD} />
            </g>
          );
        })}

        {/* Núcleo luminoso que late */}
        <circle cx="50" cy="50" r="13" fill="url(#coreGlow)" className="animate-pulse-glow" style={{ transformOrigin: 'center', transformBox: 'fill-box' }} />
        <circle cx="50" cy="50" r="2" fill={GOLD} />
      </svg>

      {/* Orbes de planetas (overlay HTML, con glow y hover) */}
      {planets.map((p, i) => {
        const m = polar(33, display[i]!);
        const info = ZODIAC[p.sign];
        return (
          <span
            key={p.body}
            className="group absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-default items-center justify-center rounded-full text-sm leading-none text-white ring-2 ring-white/70 transition duration-300 hover:z-20 hover:scale-125 sm:h-9 sm:w-9 sm:text-base"
            style={{
              left: `${m.x}%`,
              top: `${m.y}%`,
              backgroundImage: `linear-gradient(135deg, ${info.colors.from}, ${info.colors.to})`,
              boxShadow: `0 0 14px 2px ${info.colors.from}cc`,
            }}
            title={`${p.name} en ${p.sign_name} · Casa ${p.house}`}
          >
            <span aria-hidden="true">{p.symbol}</span>
          </span>
        );
      })}
    </div>
  );
}

/** Tarjeta glass de un punto clave (Sol, Luna, Ascendente, Medio Cielo). */
function KeyPlacement({
  Icon,
  label,
  color,
  placement,
}: {
  Icon: LucideIcon;
  label: string;
  color: string;
  placement: Placement | null;
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur transition duration-300 hover:bg-white/[0.12]">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em]" style={{ color }}>
        <Icon className="h-4 w-4" aria-hidden="true" /> {label}
      </p>
      <p className="mt-2 font-display text-2xl font-extrabold leading-none text-white">
        {placement ? placement.sign_name : '·'}
      </p>
      {placement && (
        <p className="mt-1 text-sm text-white/55">{formatDeg(placement.deg_in_sign)}</p>
      )}
    </div>
  );
}

/** Leyenda de los tipos de aspecto presentes. */
function AspectLegend({ aspects }: { aspects: Aspect[] }) {
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
          <span key={t} className="flex items-center gap-2 text-sm text-white/70">
            <span aria-hidden="true" className="h-0.5 w-6 rounded-full" style={{ backgroundColor: style.color }} />
            {style.name}
          </span>
        );
      })}
    </div>
  );
}

/** Mosaico de un planeta con su signo (color del signo), grado y casa. */
function PlanetTile({ p }: { p: PlanetPosition }) {
  const info = ZODIAC[p.sign];
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <span
        aria-hidden="true"
        className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl transition group-hover:opacity-40"
        style={{ backgroundColor: info.colors.from }}
      />
      <div className="relative flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl text-white"
          style={{
            backgroundImage: `linear-gradient(135deg, ${info.colors.from}, ${info.colors.to})`,
            boxShadow: `0 0 16px 0 ${info.colors.from}66`,
          }}
        >
          {p.symbol}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-display text-lg font-extrabold leading-tight text-ink">
            {p.name}
            {p.retrograde && (
              <span
                title="Retrógrado"
                className="rounded-full bg-aurora-100 px-1.5 text-xs font-bold text-aurora-700"
              >
                ℞
              </span>
            )}
          </p>
          <p className="truncate text-sm font-medium text-graphite">
            {p.sign_name} · {formatDeg(p.deg_in_sign)}
          </p>
        </div>
      </div>
      <span
        className="relative mt-3 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold"
        style={{ backgroundColor: `${info.colors.from}1a`, color: info.colors.to }}
      >
        Casa {p.house}
      </span>
    </div>
  );
}

/** Capítulo narrativo editorial (índice + orbe de icono + texto). */
function Chapter({
  index,
  Icon,
  color,
  title,
  text,
  flip,
}: {
  index: string;
  Icon: LucideIcon;
  color: string;
  title: string;
  text: string;
  flip?: boolean;
}) {
  return (
    <Reveal direction={flip ? 'right' : 'left'}>
      <Card padding="lg" className="relative overflow-hidden sm:p-10">
        <span
          aria-hidden="true"
          className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-[0.12] blur-3xl"
          style={{ backgroundColor: color }}
        />
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1.5"
          style={{ backgroundImage: `linear-gradient(to bottom, ${color}, transparent)` }}
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-7">
          <div className="flex shrink-0 items-center gap-4">
            <span
              className="font-display text-5xl font-black leading-none"
              style={{ color: `${color}33`, WebkitTextStroke: `1px ${color}` }}
            >
              {index}
            </span>
            <span
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-soft"
              style={{ backgroundColor: color, boxShadow: `0 0 18px 1px ${color}66` }}
            >
              <Icon className="h-7 w-7" aria-hidden="true" />
            </span>
          </div>
          <div>
            <h3 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              {title}
            </h3>
            <p className="mt-3 whitespace-pre-line text-lg leading-relaxed text-graphite">
              {text}
            </p>
          </div>
        </div>
      </Card>
    </Reveal>
  );
}

function FullChartResult({ chart }: { chart: FullNatalChart }) {
  const i = chart.interpretation;
  const sun = chart.planets.find((p) => p.body === 'sun') ?? null;
  const moon = chart.planets.find((p) => p.body === 'moon') ?? null;

  return (
    <div className="space-y-10">
      {/* Observatorio: rueda natal sobre nebulosa violeta */}
      <Reveal>
        <div className={`relative isolate overflow-hidden rounded-[2.5rem] ${PANEL_BG} p-6 text-white shadow-lift ring-1 ring-white/10 sm:p-10 lg:p-14`}>
          <StarField />
          <Nebulae />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-gold-300">
                  <Crown className="h-4 w-4" aria-hidden="true" /> Tu carta premium
                </p>
                <h2 className="mt-2 font-display text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Tu rueda natal
                </h2>
              </div>
              {chart.place && (
                <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/85 ring-1 ring-white/20 backdrop-blur">
                  {chart.place}
                </span>
              )}
            </div>

            <div className="mt-8">
              <NatalWheel chart={chart} />
            </div>

            {/* Puntos clave a lo ancho */}
            <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KeyPlacement Icon={Sun} label="Sol" color="#fbbf24" placement={sun} />
              <KeyPlacement Icon={Moon} label="Luna" color="#c4b5fd" placement={moon} />
              <KeyPlacement Icon={Sunrise} label="Ascendente" color="#67e8f9" placement={chart.ascendant} />
              <KeyPlacement Icon={ArrowUpRight} label="Medio Cielo" color="#fcd34d" placement={chart.midheaven} />
            </div>

            <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-base leading-relaxed text-white/70">
                Cada planeta cae en su signo y su casa; las líneas del centro son
                los aspectos, los diálogos entre tus astros que dan forma a tu
                carácter.
              </p>
              <AspectLegend aspects={chart.aspects} />
            </div>
          </div>
        </div>
      </Reveal>

      {/* Tu cielo en detalle: mosaico de planetas + aspectos */}
      <Reveal>
        <Card padding="lg" className="relative overflow-hidden sm:p-10">
          <span
            aria-hidden="true"
            className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-aurora-200/40 blur-3xl"
          />
          <div className="relative">
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-aurora-600">
              <Orbit className="h-4 w-4" aria-hidden="true" /> Tu cielo en detalle
            </p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Tu mapa planetario
            </h2>

            <RevealStagger className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {chart.planets.map((p) => (
                <RevealItem key={p.body}>
                  <PlanetTile p={p} />
                </RevealItem>
              ))}
            </RevealStagger>

            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-silver">
                Aspectos principales
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {chart.aspects.slice(0, 12).map((a) => {
                  const color = ASPECT_STYLE[a.type]?.color ?? GOLD;
                  return (
                    <li
                      key={`${a.a}-${a.b}-${a.type}`}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-graphite shadow-sm"
                    >
                      <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                      {a.a_name} <span className="text-silver">{a.type_name.toLowerCase()}</span> {a.b_name}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </Card>
      </Reveal>

      {/* Retrato (identidad) como lead */}
      <Reveal>
        <Card padding="lg" className="relative overflow-hidden sm:p-12">
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-gold-400 via-fuchsia-400 to-aurora-500"
          />
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-gold-600">
            <Sparkles className="h-4 w-4" aria-hidden="true" /> Tu retrato
          </p>
          <p className="mt-4 font-display text-2xl font-semibold leading-relaxed text-ink sm:text-[1.7rem]">
            {i.identity}
          </p>
        </Card>
      </Reveal>

      {/* Capítulos narrativos */}
      <div className="space-y-6">
        <Chapter index="01" Icon={Moon} color="#7c3aed" title="Tu vida emocional" text={i.emotional} />
        <Chapter index="02" Icon={Heart} color="#db2777" title="Vínculos y amor" text={i.love} flip />
        <Chapter index="03" Icon={Briefcase} color="#d97706" title="Vocación y propósito" text={i.vocation} />
        <Chapter index="04" Icon={Eye} color="#9333ea" title="Tu sombra y tu trabajo personal" text={i.shadow} flip />
        <Chapter index="05" Icon={CalendarRange} color="#c026d3" title="Los próximos 12 meses" text={i.year_ahead} />
      </div>

      {/* Síntesis: gran cierre */}
      <Reveal>
        <div className={`relative isolate overflow-hidden rounded-[2.5rem] ${PANEL_BG} p-8 text-white shadow-lift ring-1 ring-white/10 sm:p-14`}>
          <StarField />
          <Nebulae />
          <OrbitField className="h-[120%] w-[120%]" />
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-extrabold uppercase tracking-[0.18em] text-gold-300 ring-1 ring-white/20 backdrop-blur">
              <Crown className="h-4 w-4" aria-hidden="true" /> Tú, en una sola mirada
            </span>
            <p className="mt-6 font-display text-2xl font-bold leading-relaxed text-white sm:text-[1.9rem]">
              {i.summary}
            </p>
          </div>
        </div>
      </Reveal>
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
                className="block w-full px-4 py-2 text-left text-sm text-graphite hover:bg-aurora-50 hover:text-ink"
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
      <GeneratingLoader
        colors={{ from: '#7c3aed', to: '#c026d3' }}
        message="Abriendo tu carta…"
        hint="Recuperando tu rueda natal."
      />
    );
  }

  if (chart) {
    return <FullChartResult chart={chart} />;
  }

  if (gen.isPending) {
    return (
      <GeneratingLoader
        colors={{ from: '#7c3aed', to: '#c026d3' }}
        message="Trazando tu carta completa…"
        hint="Calculando tus 10 planetas, tus 12 casas y sus aspectos."
      />
    );
  }

  const ready = Boolean(birthTime && selectedCity);

  return (
    <Reveal>
      <Card padding="lg" className="relative mx-auto max-w-2xl overflow-hidden sm:p-10">
        <span
          aria-hidden="true"
          className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-fuchsia-200/40 blur-3xl"
        />
        <div className="relative">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-aurora-600">
            <Compass className="h-4 w-4" aria-hidden="true" /> Tu observatorio personal
          </p>
          <p className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink">
            Calcula tu carta completa
          </p>
          <p className="mt-2 text-base text-graphite">
            Se calcula una sola vez. Necesitamos tu hora y ciudad de nacimiento
            exactas: con ellas trazamos tus 12 casas, tu Ascendente y tu Medio
            Cielo.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Input
              type="time"
              label="Hora de nacimiento"
              hint="Cuanto más exacta, más precisa será tu carta."
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

          {!ready && (
            <p className="mt-3 text-sm text-silver">
              Indica tu hora y elige tu ciudad de la lista para continuar.
            </p>
          )}

          <div className="mt-6">
            <Button
              onClick={onGenerate}
              disabled={!ready || gen.isPending}
              size="lg"
              leftIcon={<Compass className="h-5 w-5" />}
            >
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
        </div>
      </Card>
    </Reveal>
  );
}

export function FullNatalChartPage() {
  return (
    <>
      <Seo
        title={`Carta natal completa · ${company.brand}`}
        description="Tu carta natal completa: 10 planetas, 12 casas y los aspectos entre ellos, interpretados a fondo. El mapa que explica por qué eres tú."
        noindex
      />

      {/* Hero premium */}
      <Section width="full" className="px-3 pt-4 sm:px-4 lg:px-6">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-aurora-600 via-fuchsia-700 to-aurora-900 px-6 py-16 text-center text-white shadow-lift sm:px-12 sm:py-24">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/30 via-black/10 to-black/50"
            />
            <Nebulae />
            <StarField />
            <OrbitField className="h-[150%] w-[150%]" />
            <div className="relative z-10 mx-auto max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.16em] text-gold-200 ring-1 ring-white/30 backdrop-blur">
                <Crown className="h-4 w-4" aria-hidden="true" />
                Carta natal premium
              </span>
              <h1 className="mt-6 font-display text-5xl font-black leading-[0.9] tracking-[-0.035em] [text-shadow:0_2px_24px_rgba(0,0,0,0.4)] sm:text-7xl lg:text-[5.5rem]">
                Tu carta natal completa
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90 sm:text-xl">
                Diez planetas, doce casas y los aspectos que los conectan. El
                retrato profundo de tu identidad, tus emociones, tus vínculos, tu
                vocación y tu camino de crecimiento.
              </p>
            </div>
          </div>
        </Reveal>
      </Section>

      <Section width="xwide" className="py-10">
        <PremiumGate
          title="Tu carta natal completa te espera"
          description="Sol, Luna y Ascendente son solo el principio. Suscríbete y desbloquea tu carta completa: 10 planetas, 12 casas, tus aspectos y una lectura profunda de quién eres, además de todo Zodiaq sin anuncios."
        >
          <FullChartBody />
        </PremiumGate>

        <AdSlot className="mt-8" />
      </Section>
    </>
  );
}
