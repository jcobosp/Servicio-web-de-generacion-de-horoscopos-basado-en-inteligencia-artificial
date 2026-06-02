import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Crown, Sparkles, Wand2, Gem, RotateCcw, Layers, Eye, Lightbulb,
  Compass, Moon, Flower2, Landmark, Heart, Navigation, ShieldHalf,
  RotateCw, Scale, Hourglass, Skull, FlaskConical, Link as LinkIcon,
  TowerControl, Star, MoonStar, Sun, BellRing, Globe, Droplet, Swords, Coins, Flame,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Seo } from '@/lib/seo';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/layout/Section';
import { Reveal, RevealStagger, RevealItem } from '@/components/motion/Reveal';
import { Shine } from '@/components/visual/Shine';
import { toast } from '@/components/ui/Toast';
import { AdSlot } from '@/components/ads/AdSlot';
import { PremiumGate } from '@/components/billing/PremiumGate';
import { cn } from '@/lib/cn';
import {
  useAdvancedHistory,
  useAdvancedTarotQuota,
  useBuyAdvancedTarotCredit,
  useDrawAdvancedTarot,
} from '@/features/tarot/advanced-hooks';
import { ADVANCED_SPREADS } from '@/features/tarot/advanced-types';
import type {
  AdvancedSpreadType,
  AdvancedTarotContent,
} from '@/features/tarot/advanced-types';
import type { TarotCard } from '@/features/tarot/types';
import { company } from '@/features/legal/company';

const SPREAD_LABEL: Record<AdvancedSpreadType, string> = {
  celtic_cross: 'Cruz Celta',
  horseshoe: 'Herradura',
};

const EXTRA_PRICE = '1,79 €';
const GOLD = '#fbbf24';
const ACCENT = '#b45309'; // amber-700, AA sobre blanco
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Nebulosa amatista profunda hacia el negro: el papel del "oro arcano". */
const PANEL_BG =
  'bg-[radial-gradient(125%_125%_at_50%_0%,#3b0764_0%,#1e1b4b_46%,#0a0414_100%)]';

const dateFmt = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric', month: 'long', year: 'numeric',
});

// --- Iconos propios de cada carta -----------------------------------------
const MAJOR_ICONS: Record<number, LucideIcon> = {
  0: Compass, 1: Wand2, 2: Moon, 3: Flower2, 4: Crown, 5: Landmark,
  6: Heart, 7: Navigation, 8: ShieldHalf, 9: Lightbulb, 10: RotateCw,
  11: Scale, 12: Hourglass, 13: Skull, 14: FlaskConical, 15: LinkIcon,
  16: TowerControl, 17: Star, 18: MoonStar, 19: Sun, 20: BellRing, 21: Globe,
};
const SUIT_ICONS: Record<string, LucideIcon> = {
  copas: Droplet, espadas: Swords, oros: Coins, bastos: Flame,
};

function CardGlyph({ card, className, strokeWidth }: { card: TarotCard; className?: string; strokeWidth?: number }) {
  const Icon =
    card.arcana === 'major'
      ? MAJOR_ICONS[Number(card.id.split('-')[1])] ?? Sparkles
      : SUIT_ICONS[card.suit ?? ''] ?? Sparkles;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}

// --- Decoración cósmica ----------------------------------------------------
const STARS: { top: number; left: number; size: number; delay: number }[] = [
  { top: 14, left: 10, size: 3, delay: 0 }, { top: 24, left: 84, size: 2, delay: 0.7 },
  { top: 62, left: 6, size: 2, delay: 1.3 }, { top: 72, left: 92, size: 3, delay: 0.4 },
  { top: 40, left: 96, size: 2, delay: 1.1 }, { top: 84, left: 26, size: 2, delay: 0.9 },
  { top: 10, left: 58, size: 2, delay: 1.6 }, { top: 86, left: 66, size: 3, delay: 0.5 },
  { top: 8, left: 32, size: 2, delay: 1.9 }, { top: 20, left: 46, size: 1, delay: 0.3 },
  { top: 34, left: 20, size: 2, delay: 1.4 }, { top: 36, left: 74, size: 1, delay: 0.6 },
  { top: 56, left: 16, size: 2, delay: 2.1 }, { top: 58, left: 64, size: 1, delay: 1.0 },
  { top: 60, left: 94, size: 2, delay: 1.7 }, { top: 70, left: 38, size: 1, delay: 0.2 },
  { top: 74, left: 78, size: 2, delay: 1.2 }, { top: 90, left: 14, size: 2, delay: 2.3 },
  { top: 92, left: 50, size: 1, delay: 0.8 }, { top: 88, left: 86, size: 2, delay: 1.5 },
];

function StarField() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white shadow-[0_0_6px_2px_rgba(255,255,255,0.7)] animate-twinkle"
          style={{ top: `${s.top}%`, left: `${s.left}%`, width: `${s.size}px`, height: `${s.size}px`, animationDelay: `${s.delay}s` }}
        />
      ))}
    </span>
  );
}

/** Vértices de un polígono regular en viewBox 100. */
function polyPoints(sides: number, r: number, rot = 0): string {
  const pts: string[] = [];
  for (let k = 0; k < sides; k++) {
    const a = ((k / sides) * 360 + rot - 90) * (Math.PI / 180);
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}

/** Estrella estelar {n/step}: une cada `step` vértices de un n-ágono. */
function starPath(n: number, step: number, r: number): string {
  const pts: [number, number][] = [];
  for (let k = 0; k < n; k++) {
    const a = ((k / n) * 360 - 90) * (Math.PI / 180);
    pts.push([50 + r * Math.cos(a), 50 + r * Math.sin(a)]);
  }
  let d = '';
  let idx = 0;
  for (let k = 0; k < n; k++) {
    const p = pts[idx]!;
    d += `${k === 0 ? 'M' : 'L'} ${p[0].toFixed(2)} ${p[1].toFixed(2)} `;
    idx = (idx + step) % n;
  }
  return d + 'Z';
}

/**
 * Sello arcano que gira: heptagrama dorado + dodecagrama a contramano + anillos
 * y radios + glifos orbitando. La animación de fondo "diferente y muy llamativa".
 */
function ArcaneSeal({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn('pointer-events-none absolute opacity-30', className)}>
      <svg viewBox="0 0 100 100" className="h-full w-full">
        {/* Anillos base */}
        <circle cx="50" cy="50" r="47" fill="none" stroke={GOLD} strokeOpacity="0.4" strokeWidth="0.3" />
        <circle cx="50" cy="50" r="38" fill="none" stroke={GOLD} strokeOpacity="0.3" strokeWidth="0.3" strokeDasharray="0.5 2" />
        <circle cx="50" cy="50" r="22" fill="none" stroke="#f0abfc" strokeOpacity="0.3" strokeWidth="0.3" />

        {/* Heptagrama que gira */}
        <g className="animate-spin-slow" style={{ transformOrigin: 'center', transformBox: 'fill-box' }}>
          <path d={starPath(7, 3, 34)} fill="none" stroke={GOLD} strokeOpacity="0.55" strokeWidth="0.45" />
          {Array.from({ length: 7 }, (_, k) => {
            const a = ((k / 7) * 360 - 90) * (Math.PI / 180);
            return <circle key={k} cx={50 + 34 * Math.cos(a)} cy={50 + 34 * Math.sin(a)} r="0.9" fill={GOLD} />;
          })}
        </g>

        {/* Dodecagrama a contramano */}
        <g className="animate-spin-slow [animation-direction:reverse] [animation-duration:34s]" style={{ transformOrigin: 'center', transformBox: 'fill-box' }}>
          <polygon points={polyPoints(12, 44)} fill="none" stroke="#e9d5ff" strokeOpacity="0.25" strokeWidth="0.3" />
          {Array.from({ length: 24 }, (_, k) => {
            const a = (k * 15 - 90) * (Math.PI / 180);
            return <circle key={k} cx={50 + 44 * Math.cos(a)} cy={50 + 44 * Math.sin(a)} r="0.5" fill="#f0abfc" fillOpacity="0.6" />;
          })}
        </g>

        {/* Radios */}
        {Array.from({ length: 12 }, (_, k) => {
          const a = (k * 30 - 90) * (Math.PI / 180);
          return (
            <line
              key={`r${k}`}
              x1={50 + 22 * Math.cos(a)} y1={50 + 22 * Math.sin(a)}
              x2={50 + 38 * Math.cos(a)} y2={50 + 38 * Math.sin(a)}
              stroke={GOLD} strokeOpacity="0.18" strokeWidth="0.25"
            />
          );
        })}
        <circle cx="50" cy="50" r="2" fill={GOLD} fillOpacity="0.7" className="animate-pulse-glow" style={{ transformOrigin: 'center', transformBox: 'fill-box' }} />
      </svg>
    </span>
  );
}

// --- Cartas ----------------------------------------------------------------
/** Dorso ornamentado premium (oro sobre amatista). */
function TarotCardBack() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-700 via-indigo-800 to-[#100726] shadow-lift ring-1 ring-gold-300/40">
      <span aria-hidden="true" className="absolute inset-1.5 rounded-lg border border-gold-300/50" />
      <span aria-hidden="true" className="pointer-events-none absolute -right-4 -top-5 h-16 w-16 rounded-full bg-gold-300/20 blur-xl" />
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full opacity-70">
        <path d={starPath(7, 3, 30)} fill="none" stroke={GOLD} strokeOpacity="0.55" strokeWidth="1" />
        <circle cx="50" cy="50" r="36" fill="none" stroke={GOLD} strokeOpacity="0.35" strokeWidth="0.8" />
      </svg>
      <Sparkles className="relative h-8 w-8 text-gold-200" aria-hidden="true" />
      <span className="absolute left-3 top-3 h-1 w-1 rounded-full bg-gold-200/80 animate-twinkle" />
      <span className="absolute bottom-4 right-4 h-1 w-1 rounded-full bg-white/70 animate-twinkle [animation-delay:0.8s]" />
    </div>
  );
}

/** Cara revelada premium (glifo en chip dorado + nombre + invertida). */
function TarotCardFront({ card }: { card: TarotCard }) {
  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 bg-gradient-to-b from-white to-amber-50/60 p-2 text-center shadow-lift',
        card.reversed ? 'border-gold-400' : 'border-amber-200',
      )}
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-soft sm:h-11 sm:w-11"
        style={{ backgroundImage: 'linear-gradient(135deg,#7c3aed,#b45309)' }}
      >
        <CardGlyph card={card} className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.1} />
      </span>
      <span className="font-display text-[11px] font-extrabold leading-tight tracking-tight text-ink sm:text-sm">
        {card.name}
      </span>
      {card.reversed && (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-amber-800 sm:text-[9px]">
          <RotateCcw className="h-2.5 w-2.5" aria-hidden="true" /> inv.
        </span>
      )}
    </div>
  );
}

/** Carta del mapa de la tirada: voltea (dorso→cara), nº y posición. */
function SpreadCard({
  card,
  number,
  index,
  reduce,
  cross,
  caption,
}: {
  card: TarotCard;
  number: number;
  index: number;
  reduce: boolean | null;
  cross?: boolean;
  caption?: boolean;
}) {
  const [revealed, setRevealed] = useState<boolean>(Boolean(reduce));
  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setRevealed(true), 250 + index * 190);
    return () => clearTimeout(t);
  }, [index, reduce]);

  return (
    <div className={cn('flex flex-col items-center', cross && 'z-20')}>
      <div className={cn('relative [perspective:1000px]', cross && 'rotate-90')}>
        <span
          aria-hidden="true"
          className="absolute -left-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-[#1e1b4b] shadow"
          style={{ backgroundColor: GOLD }}
        >
          {number}
        </span>
        <motion.div
          className="relative h-24 w-16 [transform-style:preserve-3d] sm:h-[7.25rem] sm:w-[4.75rem]"
          initial={false}
          animate={{ rotateY: revealed ? 180 : 0 }}
          transition={{ duration: reduce ? 0 : 0.7, ease: EASE }}
        >
          <div className="absolute inset-0 [backface-visibility:hidden]">
            <TarotCardBack />
          </div>
          <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]">
            <TarotCardFront card={card} />
          </div>
        </motion.div>
      </div>
      {caption && (
        <p className="mt-1.5 max-w-[5rem] text-center text-[10px] font-bold uppercase leading-tight tracking-wide text-amber-700">
          {card.position}
        </p>
      )}
    </div>
  );
}

// Disposición de la Cruz Celta en una rejilla 4×4 (col, row).
const CELTIC: { col: number; row: number; cross?: boolean }[] = [
  { col: 2, row: 2 },              // 1 · situación
  { col: 2, row: 2, cross: true }, // 2 · lo que la cruza
  { col: 2, row: 3 },              // 3 · base
  { col: 1, row: 2 },              // 4 · pasado
  { col: 2, row: 1 },              // 5 · meta
  { col: 3, row: 2 },              // 6 · futuro
  { col: 4, row: 4 },              // 7 · tú
  { col: 4, row: 3 },              // 8 · entorno
  { col: 4, row: 2 },              // 9 · esperanzas
  { col: 4, row: 1 },              // 10 · desenlace
];

// Arco de la Herradura (desplazamiento vertical por carta, en rem).
const HORSESHOE = [3, 1.5, 0.5, 0, 0.5, 1.5, 3];

/** Mapa visual de la tirada con las cartas en sus posiciones tradicionales. */
function SpreadMap({
  spread,
  cards,
  reduce,
}: {
  spread: AdvancedSpreadType;
  cards: TarotCard[];
  reduce: boolean | null;
}) {
  if (spread === 'celtic_cross') {
    return (
      <div className="overflow-x-auto pb-2">
        <div className="mx-auto grid w-max grid-cols-4 grid-rows-4 place-items-center gap-x-2 gap-y-3 sm:gap-x-3">
          {cards.map((c, i) => {
            const slot = CELTIC[i];
            if (!slot) return null;
            return (
              <div
                key={`${c.id}-${i}`}
                style={{ gridColumn: slot.col, gridRow: slot.row }}
                className="flex items-center justify-center"
              >
                <SpreadCard card={c} number={i + 1} index={i} reduce={reduce} {...(slot.cross ? { cross: true } : {})} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  // Herradura
  return (
    <div className="overflow-x-auto pb-2">
      <div className="mx-auto flex w-max items-start gap-2 sm:gap-3">
        {cards.map((c, i) => (
          <div key={`${c.id}-${i}`} style={{ marginTop: `${HORSESHOE[i] ?? 0}rem` }}>
            <SpreadCard card={c} number={i + 1} index={i} reduce={reduce} caption />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Baraja que se abanica mientras se genera la tirada. */
function ShuffleFan({ reduce }: { reduce: boolean | null }) {
  return (
    <div role="status" aria-live="polite" className="relative flex flex-col items-center justify-center gap-8 py-14 text-center">
      <ArcaneSeal className="left-1/2 top-8 h-64 w-64 -translate-x-1/2" />
      <div className="relative h-40 w-28">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            animate={reduce ? {} : { x: [0, (i - 2) * 30, 0], y: [0, -10, 0], rotate: [0, (i - 2) * 11, 0] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 }}
          >
            <TarotCardBack />
          </motion.div>
        ))}
      </div>
      <p className="relative font-display text-2xl font-extrabold tracking-tight text-ink">
        Barajando los arcanos…
      </p>
    </div>
  );
}

/** Tarjeta de significado de una carta (numerada, dorada). */
function MeaningCard({ card, number }: { card: TarotCard; number: number }) {
  return (
    <Card padding="lg" className="relative h-full overflow-hidden transition-all duration-300 ease-cosmic hover:-translate-y-1">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundImage: `linear-gradient(90deg, ${ACCENT}, transparent)` }} />
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-display text-lg font-black text-white shadow-soft" style={{ backgroundImage: 'linear-gradient(135deg,#7c3aed,#b45309)' }}>
          {number}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em]" style={{ color: ACCENT }}>
            <CardGlyph card={card} className="h-3.5 w-3.5" /> {card.position}
          </p>
          <h3 className="flex flex-wrap items-center gap-2 font-display text-xl font-extrabold tracking-tight text-ink">
            {card.name}
            {card.reversed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                <RotateCcw className="h-3 w-3" aria-hidden="true" /> invertida
              </span>
            )}
          </h3>
        </div>
      </div>
      <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-graphite">{card.meaning}</p>
    </Card>
  );
}

function ReadingView({
  spread,
  question,
  content,
  reduce,
}: {
  spread: AdvancedSpreadType;
  question: string | null;
  content: AdvancedTarotContent;
  reduce: boolean | null;
}) {
  return (
    <div className="space-y-8">
      {/* Mapa de la tirada sobre el sello arcano */}
      <Reveal>
        <div className={`relative isolate overflow-hidden rounded-[2.5rem] ${PANEL_BG} p-6 text-white shadow-lift ring-1 ring-white/10 sm:p-10 lg:p-12`}>
          <ArcaneSeal className="left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2" />
          <StarField />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-gold-300">
                <Crown className="h-4 w-4" aria-hidden="true" /> Tirada de {SPREAD_LABEL[spread]}
              </p>
              <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/85 ring-1 ring-white/20 backdrop-blur">
                {content.cards.length} cartas
              </span>
            </div>
            {question && (
              <p className="mt-3 text-lg italic text-white/80">Tu pregunta: «{question}»</p>
            )}
            <div className="mt-9">
              <SpreadMap spread={spread} cards={content.cards} reduce={reduce} />
            </div>
          </div>
        </div>
      </Reveal>

      {/* El tema de la tirada */}
      {content.overview && (
        <Reveal>
          <Card padding="lg" className="relative overflow-hidden sm:p-10" style={{ backgroundImage: `linear-gradient(135deg, ${ACCENT}1c, #ffffff 60%)` }}>
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundImage: `linear-gradient(90deg, ${ACCENT}, transparent)` }} />
            <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.14em]" style={{ color: ACCENT }}>
              <Layers className="h-5 w-5" aria-hidden="true" /> El tema de tu tirada
            </p>
            <p className="mt-3 whitespace-pre-line text-lg leading-relaxed text-ink">{content.overview}</p>
          </Card>
        </Reveal>
      )}

      {/* Significado carta a carta */}
      <RevealStagger className="grid gap-5 sm:grid-cols-2">
        {content.cards.map((c, i) => (
          <RevealItem key={`${c.id}-m-${i}`}>
            <MeaningCard card={c} number={i + 1} />
          </RevealItem>
        ))}
      </RevealStagger>

      {/* Síntesis */}
      {content.synthesis && (
        <Reveal>
          <div className={`relative isolate overflow-hidden rounded-[2.5rem] ${PANEL_BG} p-8 text-white shadow-lift ring-1 ring-white/10 sm:p-12`}>
            <ArcaneSeal className="left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2" />
            <StarField />
            <div className="relative z-10 mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-extrabold uppercase tracking-[0.18em] text-gold-300 ring-1 ring-white/20 backdrop-blur">
                <Eye className="h-4 w-4" aria-hidden="true" /> La lectura, en conjunto
              </span>
              <p className="mt-6 whitespace-pre-line font-display text-2xl font-bold leading-relaxed text-white sm:text-[1.7rem]">
                {content.synthesis}
              </p>
            </div>
          </div>
        </Reveal>
      )}

      {/* Consejo */}
      {content.advice && (
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-amber-500 via-orange-600 to-amber-800 p-8 text-white shadow-lift sm:p-12">
            <StarField />
            <div className="relative z-10">
              <p className="flex items-center gap-2.5 text-sm font-extrabold uppercase tracking-[0.16em] text-amber-50">
                <Lightbulb className="h-5 w-5" aria-hidden="true" /> Tu consejo
              </p>
              <p className="mt-4 whitespace-pre-line font-display text-xl font-semibold leading-relaxed sm:text-2xl">
                {content.advice}
              </p>
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}

/** Cuerpo premium: selector + resultado + historial. */
function AdvancedTarotBody() {
  const reduce = useReducedMotion();
  const history = useAdvancedHistory();
  const quota = useAdvancedTarotQuota();
  const draw = useDrawAdvancedTarot();
  const buy = useBuyAdvancedTarotCredit();
  const [params, setParams] = useSearchParams();

  const [spread, setSpread] = useState<AdvancedSpreadType>('celtic_cross');
  const [question, setQuestion] = useState('');

  const fresh = draw.data?.status === 'ok' ? draw.data : null;

  // Retorno de Stripe tras el pago puntual.
  useEffect(() => {
    const status = params.get('status');
    if (status !== 'paid' && status !== 'cancelled') return undefined;
    const isPaid = status === 'paid';
    if (isPaid) {
      toast.success('¡Pago recibido! Ya puedes hacer tu tirada extra.');
    }
    params.delete('status');
    params.delete('spread');
    setParams(params, { replace: true });
    if (!isPaid) return undefined;
    const t1 = setTimeout(() => quota.refetch(), 1500);
    const t2 = setTimeout(() => quota.refetch(), 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // Cuota del tipo de tirada seleccionado.
  const sq = quota.data ? quota.data[spread] : undefined;
  const spreadLabel = SPREAD_LABEL[spread];
  const needsPayment =
    (draw.data?.status === 'payment_required' && draw.data.spread === spread) ||
    Boolean(sq && sq.includedUsed && sq.credits === 0);

  function onDraw() {
    draw.mutate({ spread, question });
  }

  function onBuy() {
    buy.mutate(spread, {
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'No se pudo iniciar el pago.');
      },
    });
  }

  function quotaLabel(): string {
    if (!sq) return '';
    if (!sq.includedUsed) return `Tienes incluida tu tirada de ${spreadLabel} de este mes.`;
    if (sq.credits > 0)
      return `Tirada de ${spreadLabel} incluida usada · ${sq.credits} extra disponible${sq.credits > 1 ? 's' : ''}.`;
    return `Ya has usado tu tirada de ${spreadLabel} incluida de este mes.`;
  }

  return (
    <div className="space-y-8">
      {/* Selector sobre el sello arcano (card de color con animación de fondo) */}
      <Reveal>
        <div className={`relative isolate overflow-hidden rounded-[2.5rem] ${PANEL_BG} p-6 text-white shadow-lift ring-1 ring-white/10 sm:p-10`}>
          <ArcaneSeal className="-right-16 top-1/2 h-[150%] w-[150%] -translate-y-1/2" />
          <StarField />
          <div className="relative z-10">
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-gold-300">
              <Wand2 className="h-4 w-4" aria-hidden="true" /> Elige tu tirada
            </p>
            <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
              ¿Qué arcanos vas a abrir?
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {ADVANCED_SPREADS.map((s) => {
                const active = s.key === spread;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSpread(s.key)}
                    className={cn(
                      'rounded-2xl border-2 p-5 text-left backdrop-blur transition-all duration-200 ease-cosmic hover:-translate-y-0.5',
                      active
                        ? 'border-gold-300 bg-white/15 ring-2 ring-gold-300/50'
                        : 'border-white/15 bg-white/[0.06] hover:border-gold-300/60',
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 font-display text-xl font-extrabold text-white">
                        <Sparkles className="h-5 w-5 text-gold-300" aria-hidden="true" />
                        {s.label}
                      </span>
                      <span className="rounded-full bg-gold-300/20 px-2.5 py-0.5 text-xs font-bold text-gold-200">
                        {s.cards} cartas
                      </span>
                    </span>
                    <span className="mt-2 block text-base leading-relaxed text-white/75">
                      {s.description}
                    </span>
                  </button>
                );
              })}
            </div>

            <label htmlFor="adv-tarot-question" className="mt-6 block text-base font-semibold text-white">
              ¿Sobre qué quieres preguntar? (opcional)
            </label>
            <textarea
              id="adv-tarot-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={300}
              rows={2}
              placeholder="Ej.: ¿Hacia dónde va esta etapa de mi vida?"
              className="mt-2 w-full resize-none rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder:text-white/45 backdrop-blur focus:border-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-300/40"
            />

            {sq && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-gold-100 ring-1 ring-white/20 backdrop-blur">
                <Sparkles className="h-4 w-4 text-gold-300" aria-hidden="true" /> {quotaLabel()}
              </div>
            )}

            <div className="mt-6">
              {needsPayment ? (
                <Button variant="premium" onClick={onBuy} disabled={buy.isPending} size="lg" leftIcon={<Gem className="h-5 w-5" />}>
                  {buy.isPending ? 'Abriendo el pago…' : `Otra ${spreadLabel} · ${EXTRA_PRICE}`}
                </Button>
              ) : (
                <Button onClick={onDraw} disabled={draw.isPending} size="lg" leftIcon={<Wand2 className="h-5 w-5" />}>
                  {draw.isPending ? 'Barajando los arcanos…' : 'Hacer mi tirada avanzada'}
                </Button>
              )}
            </div>

            {needsPayment && (
              <p className="mt-4 rounded-2xl bg-white/[0.06] p-4 text-sm leading-relaxed text-white/80 ring-1 ring-white/10">
                Ya has usado tu tirada de <strong className="text-white">{spreadLabel}</strong> incluida
                de este mes. Puedes hacer todas las que quieras por <strong className="text-white">{EXTRA_PRICE}</strong> cada
                una; el mes que viene tendrás otra incluida.
              </p>
            )}
            {draw.data?.status === 'unavailable' && (
              <p className="mt-3 text-sm text-white/80">{draw.data.message}</p>
            )}
            {draw.isError && (
              <p className="mt-3 text-sm text-rose-300">
                No se pudo hacer la tirada. Inténtalo de nuevo en un momento.
              </p>
            )}
          </div>
        </div>
      </Reveal>

      {/* Resultado */}
      {draw.isPending ? (
        <ShuffleFan reduce={reduce} />
      ) : fresh ? (
        <ReadingView spread={fresh.spread} question={fresh.question} content={fresh.content} reduce={reduce} />
      ) : null}

      {/* Historial */}
      {history.data && history.data.length > 0 && (
        <Reveal>
          <div>
            <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              <Layers className="h-6 w-6" style={{ color: ACCENT }} aria-hidden="true" />
              Tus tiradas anteriores
            </h2>
            <p className="mt-2 text-graphite">Despliega cualquiera para volver a verla.</p>
            <div className="mt-5 space-y-3">
              {history.data
                .filter((r) => r.id !== fresh?.id)
                .map((r) => (
                  <details
                    key={r.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition open:shadow-lift"
                  >
                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 p-5">
                      <span className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ backgroundImage: 'linear-gradient(135deg,#7c3aed,#b45309)' }} aria-hidden="true">
                          <Sparkles className="h-5 w-5" />
                        </span>
                        <span>
                          <span className="block font-display text-base font-bold text-ink">
                            {SPREAD_LABEL[r.spread_type]}
                          </span>
                          {r.question && (
                            <span className="block text-sm italic text-graphite">«{r.question}»</span>
                          )}
                        </span>
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="text-sm text-graphite">{dateFmt.format(new Date(r.created_at))}</span>
                        <RotateCcw className="h-4 w-4 text-amber-700 transition-transform duration-300 group-open:rotate-180" aria-hidden="true" />
                      </span>
                    </summary>
                    <div className="border-t border-slate-100 p-5">
                      <ReadingView spread={r.spread_type} question={r.question} content={r.content} reduce={reduce} />
                    </div>
                  </details>
                ))}
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}

export function AdvancedTarotPage() {
  return (
    <>
      <Seo
        title={`Tarot avanzado · ${company.brand}`}
        description="Tiradas de tarot avanzadas: Cruz Celta de 10 cartas y Herradura de 7, interpretadas a fondo para tu momento vital."
        noindex
      />

      {/* Hero premium a sangre */}
      <Section width="full" className="px-3 pt-4 sm:px-4 lg:px-6">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-800 via-indigo-900 to-[#120824] px-6 py-16 text-center text-white shadow-lift sm:px-12 sm:py-24">
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/30 via-black/10 to-black/50" />
            <ArcaneSeal className="left-1/2 top-1/2 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2" />
            <StarField />
            <div className="relative z-10 mx-auto max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.16em] text-gold-200 ring-1 ring-white/30 backdrop-blur">
                <Crown className="h-4 w-4" aria-hidden="true" />
                Tarot avanzado premium
              </span>
              <h1 className="mt-6 font-display text-5xl font-black leading-[0.9] tracking-[-0.035em] [text-shadow:0_2px_24px_rgba(0,0,0,0.4)] sm:text-7xl lg:text-[5.5rem]">
                Los <Shine gold>grandes arcanos</Shine>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90 sm:text-xl">
                La Cruz Celta y la Herradura: las tiradas que despliegan tu historia
                entera, carta a carta y en sus posiciones tradicionales, tejidas en
                un único relato escrito para tu momento.
              </p>
            </div>
          </div>
        </Reveal>
      </Section>

      <Section width="xwide" className="py-10">
        <PremiumGate
          title="Las tiradas avanzadas te esperan"
          description="La tirada de una y tres cartas es solo el comienzo. Suscríbete y desbloquea la Cruz Celta (10 cartas) y la Herradura (7 cartas), con una lectura profunda y personal —además de todo Zodiaq sin anuncios."
        >
          <AdvancedTarotBody />
        </PremiumGate>

        <AdSlot className="mt-8" />
      </Section>
    </>
  );
}
