import { useEffect, useState } from 'react';
import { Seo } from '@/lib/seo';
import { useSearchParams } from 'react-router-dom';
import {
  Crown, Hash, Sparkles, Lightbulb, Heart, Target, Gem, CalendarClock, Fingerprint,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { Shine } from '@/components/visual/Shine';
import { toast } from '@/components/ui/Toast';
import { AdSlot } from '@/components/ads/AdSlot';
import { PremiumGate } from '@/components/billing/PremiumGate';
import { cn } from '@/lib/cn';
import { useProfile } from '@/features/profile/hooks';
import {
  useBuyNumerologyCredit,
  useGenerateNumerology,
  useNumerologyHistory,
  useNumerologyQuota,
} from '@/features/numerology/hooks';
import {
  lifePathNumber,
  personalMonthNumber,
  personalYearNumber,
} from '@/features/numerology/calc';
import type {
  NumerologyNumbers,
  NumerologyReadingContent,
} from '@/features/numerology/types';
import { company } from '@/features/legal/company';

const EXTRA_PRICE = '1,99 €';
const ACCENT = '#0f766e'; // teal-700, AA sobre blanco

/** Nebulosa esmeralda profunda hacia el negro: el papel premium de numerología. */
const PANEL_BG =
  'bg-[radial-gradient(125%_125%_at_50%_0%,#065f46_0%,#022c22_46%,#04140f_100%)]';

const dateFmt = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric', month: 'long', year: 'numeric',
});

// --- Geometría -------------------------------------------------------------
function polyPoints(sides: number, r: number, rot = 0): string {
  const pts: string[] = [];
  for (let k = 0; k < sides; k++) {
    const a = ((k / sides) * 360 + rot - 90) * (Math.PI / 180);
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}

const STARS: { top: number; left: number; size: number; delay: number }[] = [
  { top: 14, left: 10, size: 3, delay: 0 }, { top: 24, left: 84, size: 2, delay: 0.7 },
  { top: 62, left: 6, size: 2, delay: 1.3 }, { top: 72, left: 92, size: 3, delay: 0.4 },
  { top: 40, left: 96, size: 2, delay: 1.1 }, { top: 84, left: 26, size: 2, delay: 0.9 },
  { top: 10, left: 58, size: 2, delay: 1.6 }, { top: 86, left: 66, size: 3, delay: 0.5 },
  { top: 8, left: 32, size: 2, delay: 1.9 }, { top: 20, left: 46, size: 1, delay: 0.3 },
  { top: 34, left: 20, size: 2, delay: 1.4 }, { top: 36, left: 74, size: 1, delay: 0.6 },
  { top: 56, left: 16, size: 2, delay: 2.1 }, { top: 60, left: 94, size: 2, delay: 1.7 },
  { top: 70, left: 38, size: 1, delay: 0.2 }, { top: 74, left: 78, size: 2, delay: 1.2 },
  { top: 90, left: 14, size: 2, delay: 2.3 }, { top: 88, left: 86, size: 2, delay: 1.5 },
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

/**
 * Red armónica: polígonos regulares anidados (3→8 lados) que giran a distinta
 * velocidad y sentido, evocando la vibración de los números. Animación de fondo
 * propia, distinta de la flor de la vida (gratuita) y del sello del tarot.
 */
function HarmonicLattice({ className }: { className?: string }) {
  const polys = [
    { sides: 3, r: 46, rot: 0, dir: '', dur: '38s', op: 0.3 },
    { sides: 4, r: 41, rot: 12, dir: ' [animation-direction:reverse]', dur: '30s', op: 0.28 },
    { sides: 6, r: 35, rot: 0, dir: '', dur: '26s', op: 0.3 },
    { sides: 8, r: 28, rot: 22, dir: ' [animation-direction:reverse]', dur: '22s', op: 0.26 },
    { sides: 12, r: 20, rot: 0, dir: '', dur: '18s', op: 0.24 },
  ];
  return (
    <span aria-hidden="true" className={cn('pointer-events-none absolute opacity-40', className)}>
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <circle cx="50" cy="50" r="47" fill="none" stroke="#fcd34d" strokeOpacity="0.35" strokeWidth="0.3" />
        {polys.map((p, i) => (
          <g
            key={i}
            className={cn('animate-spin-slow', p.dir)}
            style={{ transformOrigin: 'center', transformBox: 'fill-box', animationDuration: p.dur }}
          >
            <polygon
              points={polyPoints(p.sides, p.r, p.rot)}
              fill="none"
              stroke={i % 2 === 0 ? '#fcd34d' : '#5eead4'}
              strokeOpacity={p.op}
              strokeWidth="0.4"
            />
          </g>
        ))}
        {Array.from({ length: 12 }, (_, k) => {
          const a = (k * 30 - 90) * (Math.PI / 180);
          return <circle key={`d${k}`} cx={50 + 47 * Math.cos(a)} cy={50 + 47 * Math.sin(a)} r="0.5" fill="#5eead4" fillOpacity="0.6" />;
        })}
        <circle cx="50" cy="50" r="1.6" fill="#fcd34d" fillOpacity="0.8" className="animate-pulse-glow" style={{ transformOrigin: 'center', transformBox: 'fill-box' }} />
      </svg>
    </span>
  );
}

/** Medallón de un número: marco de polígonos que giran + número en oro. */
function NumberMedallion({
  n,
  label,
  hint,
  big,
}: {
  n: number;
  label: string;
  hint?: string;
  big?: boolean;
}) {
  // Nº de lados decorativo derivado del número (3..11).
  const sides = Math.max(3, ((n - 1) % 9) + 3);
  return (
    <div className="flex flex-col items-center text-center">
      <div className={cn('relative aspect-square', big ? 'w-36 sm:w-44' : 'w-24 sm:w-28')}>
        <span aria-hidden="true" className="absolute inset-[18%] rounded-full bg-emerald-300/25 blur-2xl" />
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          <g className="animate-spin-slow" style={{ transformOrigin: 'center', transformBox: 'fill-box' }}>
            <polygon points={polyPoints(sides, 46)} fill="none" stroke="#fcd34d" strokeOpacity="0.55" strokeWidth="0.7" />
            {Array.from({ length: sides }, (_, k) => {
              const a = ((k / sides) * 360 - 90) * (Math.PI / 180);
              return <circle key={k} cx={50 + 46 * Math.cos(a)} cy={50 + 46 * Math.sin(a)} r="1" fill="#fcd34d" />;
            })}
          </g>
          <g className="animate-spin-slow [animation-direction:reverse] [animation-duration:24s]" style={{ transformOrigin: 'center', transformBox: 'fill-box' }}>
            <polygon points={polyPoints(sides, 37, 18)} fill="none" stroke="#5eead4" strokeOpacity="0.4" strokeWidth="0.6" />
          </g>
          <circle cx="50" cy="50" r="29" fill="none" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="0.4" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              'font-display font-black text-gold-200 [text-shadow:0_2px_14px_rgba(0,0,0,0.55),0_0_24px_rgba(252,211,77,0.5)]',
              big ? 'text-7xl sm:text-8xl' : 'text-5xl sm:text-6xl',
            )}
          >
            {n}
          </span>
        </div>
      </div>
      <p className={cn('mt-3 font-bold uppercase tracking-[0.1em] text-white', big ? 'text-xl' : 'text-base')}>
        {label}
      </p>
      {hint && <p className="mt-0.5 text-base font-semibold text-white/70">{hint}</p>}
    </div>
  );
}

/** Matriz de los cuatro números (camino de vida como protagonista). */
function NumbersMatrix({ numbers }: { numbers: NumerologyNumbers }) {
  return (
    <div className="flex flex-wrap items-start justify-center gap-7 sm:gap-10">
      <NumberMedallion n={numbers.life_path} label="Camino de vida" big />
      <div className="flex flex-wrap items-start justify-center gap-7 sm:gap-9">
        <NumberMedallion n={numbers.personal_year} label="Año personal" hint={String(numbers.year)} />
        <NumberMedallion n={numbers.personal_month} label="Mes personal" />
        <NumberMedallion n={numbers.birthday} label="Día de nacimiento" />
      </div>
    </div>
  );
}

/** Emblema geométrico con icono (para las secciones narrativas). */
function GemEmblem({ Icon, color, sides }: { Icon: LucideIcon; color: string; sides: number }) {
  return (
    <div className="relative h-16 w-16 shrink-0">
      <span aria-hidden="true" className="absolute inset-[18%] rounded-full opacity-30 blur-xl" style={{ backgroundColor: color }} />
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-spin-slow" style={{ transformOrigin: 'center', transformBox: 'fill-box' }}>
        <polygon points={polyPoints(sides, 46)} fill="none" stroke={color} strokeOpacity="0.5" strokeWidth="3" />
        <polygon points={polyPoints(sides, 33, 30)} fill="none" stroke={color} strokeOpacity="0.3" strokeWidth="2" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">
        <Icon className="h-6 w-6" style={{ color }} aria-hidden="true" />
      </span>
    </div>
  );
}

interface SecDef {
  key: keyof NumerologyReadingContent;
  title: string;
  Icon: LucideIcon;
  color: string;
  sides: number;
}

const SECTIONS: SecDef[] = [
  { key: 'portrait', title: 'Quién eres', Icon: Fingerprint, color: '#0f766e', sides: 5 },
  { key: 'purpose', title: 'Tu propósito', Icon: Target, color: '#0d9488', sides: 6 },
  { key: 'strengths', title: 'Tus dones y tus sombras', Icon: Gem, color: '#b45309', sides: 7 },
  { key: 'cycle', title: 'Tu momento actual', Icon: CalendarClock, color: '#0e7490', sides: 8 },
  { key: 'love', title: 'El amor y tus vínculos', Icon: Heart, color: '#059669', sides: 6 },
];

function SectionCard({
  def,
  text,
  flip,
}: {
  def: SecDef;
  text: string;
  flip?: boolean;
}) {
  if (!text) return null;
  return (
    <Reveal direction={flip ? 'right' : 'left'}>
      <Card padding="lg" className="relative overflow-hidden sm:p-10">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundImage: `linear-gradient(90deg, ${def.color}, transparent)` }} />
        <span aria-hidden="true" className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-[0.12] blur-3xl" style={{ backgroundColor: def.color }} />
        <div className={cn('relative flex flex-col gap-5 sm:items-start sm:gap-7', flip ? 'sm:flex-row-reverse sm:text-right' : 'sm:flex-row')}>
          <GemEmblem Icon={def.Icon} color={def.color} sides={def.sides} />
          <div>
            <h3 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              {def.title}
            </h3>
            <p className="mt-3 whitespace-pre-line text-lg leading-relaxed text-graphite">{text}</p>
          </div>
        </div>
      </Card>
    </Reveal>
  );
}

function ReadingView({
  numbers,
  focus,
  content,
}: {
  numbers: NumerologyNumbers;
  focus: string | null;
  content: NumerologyReadingContent;
}) {
  return (
    <div className="space-y-8">
      {/* Portada: retrato + matriz de números sobre la red armónica */}
      <Reveal>
        <div className={`relative isolate overflow-hidden rounded-[2.5rem] ${PANEL_BG} p-7 text-white shadow-lift ring-1 ring-white/10 sm:p-12 lg:p-14`}>
          <HarmonicLattice className="left-1/2 top-1/2 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2" />
          <StarField />
          <div className="relative z-10">
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-gold-300">
              <Crown className="h-4 w-4" aria-hidden="true" /> Tu retrato numerológico
            </p>
            <h2 className="mt-3 font-display text-4xl font-black leading-[1.02] tracking-tight text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.4)] sm:text-5xl lg:text-6xl">
              {content.headline}
            </h2>
            {focus && (
              <p className="mt-3 text-lg italic text-white/80">Tu enfoque: «{focus}»</p>
            )}
            <div className="mt-10">
              <NumbersMatrix numbers={numbers} />
            </div>
          </div>
        </div>
      </Reveal>

      {/* Secciones narrativas */}
      <div className="space-y-6">
        {SECTIONS.map((def, idx) => (
          <SectionCard key={def.key} def={def} text={content[def.key]} {...(idx % 2 === 1 ? { flip: true } : {})} />
        ))}
      </div>

      {/* Consejo */}
      {content.advice && (
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 p-8 text-white shadow-lift sm:p-14">
            <HarmonicLattice className="left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2" />
            <StarField />
            <div className="relative z-10 mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-extrabold uppercase tracking-[0.18em] text-gold-300 ring-1 ring-white/20 backdrop-blur">
                <Lightbulb className="h-4 w-4" aria-hidden="true" /> Tu consejo
              </span>
              <p className="mt-6 whitespace-pre-line font-display text-2xl font-bold leading-relaxed text-white sm:text-[1.9rem]">
                {content.advice}
              </p>
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}

/** Loader: la red armónica girando mientras se lee. */
function LatticeLoader() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center justify-center gap-7 py-16 text-center">
      <div className="relative h-36 w-36">
        <span aria-hidden="true" className="absolute inset-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 opacity-70 blur-2xl animate-pulse-glow" />
        <HarmonicLattice className="inset-0 h-full w-full opacity-90" />
      </div>
      <div>
        <p className="font-display text-2xl font-extrabold tracking-tight text-ink">Leyendo tus números…</p>
        <p className="mt-2 max-w-sm text-sm text-graphite">Entretejiendo tu camino de vida con tu ciclo actual.</p>
      </div>
    </div>
  );
}

function AdvancedNumerologyBody() {
  const { data: profile } = useProfile();
  const quota = useNumerologyQuota();
  const gen = useGenerateNumerology();
  const buy = useBuyNumerologyCredit();
  const history = useNumerologyHistory();
  const [params, setParams] = useSearchParams();

  const [focus, setFocus] = useState('');

  // Números del usuario, calculados en cliente para mostrarlos antes de generar.
  const previewNumbers: NumerologyNumbers | null =
    profile?.birth_date
      ? (() => {
          const now = new Date();
          const year = now.getFullYear();
          const month = now.getMonth() + 1;
          return {
            life_path: lifePathNumber(profile.birth_date),
            personal_year: personalYearNumber(profile.birth_date, year),
            personal_month: personalMonthNumber(profile.birth_date, year, month),
            birthday: Number(profile.birth_date.split('-')[2]),
            year,
            month,
          };
        })()
      : null;

  // Retorno de Stripe tras el pago puntual.
  useEffect(() => {
    const status = params.get('status');
    if (status !== 'paid' && status !== 'cancelled') return undefined;
    const isPaid = status === 'paid';
    if (isPaid) {
      toast.success('¡Pago recibido! Ya puedes generar tu lectura extra.');
    }
    params.delete('status');
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

  const fresh = gen.data?.status === 'ok' ? gen.data : null;

  const q = quota.data;
  const needsPayment =
    gen.data?.status === 'payment_required' ||
    Boolean(q && q.includedUsed && q.credits === 0);

  function onGenerate() {
    gen.mutate(focus);
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
    if (!q.includedUsed) return 'Tienes incluida tu lectura de este mes.';
    if (q.credits > 0)
      return `Lectura incluida usada · ${q.credits} extra disponible${q.credits > 1 ? 's' : ''}.`;
    return 'Ya has usado tu lectura incluida de este mes.';
  }

  return (
    <div className="space-y-8">
      {/* Card del selector: números en preview + enfoque, sobre la red armónica */}
      <Reveal>
        <div className={`relative isolate overflow-hidden rounded-[2.5rem] ${PANEL_BG} p-7 text-white shadow-lift ring-1 ring-white/10 sm:p-10`}>
          <HarmonicLattice className="-right-20 top-1/2 h-[160%] w-[160%] -translate-y-1/2" />
          <StarField />
          <div className="relative z-10">
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-gold-300">
              <Hash className="h-4 w-4" aria-hidden="true" /> Tu lectura personal
            </p>
            <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
              Tus números, listos para hablar
            </h2>

            {previewNumbers ? (
              <div className="mt-9">
                <NumbersMatrix numbers={previewNumbers} />
              </div>
            ) : (
              <p className="mt-4 max-w-xl text-white/80">
                Añade tu fecha de nacimiento en tu perfil para calcular tus números.
              </p>
            )}

            <label htmlFor="num-focus" className="mt-9 block text-base font-semibold text-white">
              ¿Quieres orientar la lectura a algo? (opcional)
            </label>
            <textarea
              id="num-focus"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              maxLength={300}
              rows={2}
              placeholder="Ej.: mi rumbo profesional, una decisión que tengo entre manos…"
              className="mt-2 w-full resize-none rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder:text-white/45 backdrop-blur focus:border-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-300/40"
            />

            {q && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-gold-100 ring-1 ring-white/20 backdrop-blur">
                <Sparkles className="h-4 w-4 text-gold-300" aria-hidden="true" /> {quotaLabel()}
              </div>
            )}

            <div className="mt-6">
              {needsPayment ? (
                <Button variant="premium" onClick={onBuy} disabled={buy.isPending} size="lg" leftIcon={<Gem className="h-5 w-5" />}>
                  {buy.isPending ? 'Abriendo el pago…' : `Otra lectura · ${EXTRA_PRICE}`}
                </Button>
              ) : (
                <Button onClick={onGenerate} disabled={gen.isPending} size="lg" leftIcon={<Sparkles className="h-5 w-5" />}>
                  {gen.isPending ? 'Leyendo tus números…' : 'Generar mi lectura personal'}
                </Button>
              )}
            </div>

            {needsPayment && (
              <p className="mt-4 rounded-2xl bg-white/[0.06] p-4 text-sm leading-relaxed text-white/80 ring-1 ring-white/10">
                Ya has usado tu lectura incluida de este mes. Puedes generar todas las
                que quieras por <strong className="text-white">{EXTRA_PRICE}</strong> cada
                una; el mes que viene tendrás otra incluida.
              </p>
            )}
            {(gen.data?.status === 'missing_data' || gen.data?.status === 'unavailable') && (
              <p className="mt-3 text-sm text-white/80">{gen.data.message}</p>
            )}
            {gen.isError && (
              <p className="mt-3 text-sm text-rose-300">
                No se pudo generar la lectura. Inténtalo de nuevo en un momento.
              </p>
            )}
          </div>
        </div>
      </Reveal>

      {/* Resultado */}
      {gen.isPending ? (
        <LatticeLoader />
      ) : fresh ? (
        <ReadingView numbers={fresh.numbers} focus={fresh.focus} content={fresh.content} />
      ) : null}

      {/* Historial */}
      {history.data && history.data.length > 0 && (
        <Reveal>
          <div>
            <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              <Hash className="h-6 w-6" style={{ color: ACCENT }} aria-hidden="true" />
              Tus lecturas anteriores
            </h2>
            <p className="mt-2 text-graphite">Despliega cualquiera para volver a leerla.</p>
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
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ backgroundImage: 'linear-gradient(135deg,#0d9488,#b45309)' }} aria-hidden="true">
                          <Hash className="h-5 w-5" />
                        </span>
                        <span>
                          <span className="block font-display text-base font-bold text-ink">
                            {r.content.headline || 'Lectura numerológica'}
                          </span>
                          {r.focus && (
                            <span className="block text-sm italic text-graphite">«{r.focus}»</span>
                          )}
                        </span>
                      </span>
                      <span className="text-sm text-graphite">{dateFmt.format(new Date(r.created_at))}</span>
                    </summary>
                    <div className="border-t border-slate-100 p-5">
                      <ReadingView numbers={r.numbers} focus={r.focus} content={r.content} />
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

export function AdvancedNumerologyPage() {
  return (
    <>
      <Seo
        title={`Numerología personal · ${company.brand}`}
        description="Tu lectura numerológica personal: un retrato único que entreteje tu camino de vida con tu año y mes personal, escrito para tu momento exacto."
        noindex
      />

      {/* Hero premium a sangre */}
      <Section width="full" className="px-3 pt-4 sm:px-4 lg:px-6">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-950 px-6 py-16 text-center text-white shadow-lift sm:px-12 sm:py-24">
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/30 via-black/10 to-black/50" />
            <HarmonicLattice className="left-1/2 top-1/2 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2" />
            <StarField />
            <div className="relative z-10 mx-auto max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.16em] text-gold-200 ring-1 ring-white/30 backdrop-blur">
                <Crown className="h-4 w-4" aria-hidden="true" />
                Numerología personal premium
              </span>
              <h1 className="mt-6 font-display text-5xl font-black leading-[0.9] tracking-[-0.035em] [text-shadow:0_2px_24px_rgba(0,0,0,0.4)] sm:text-7xl lg:text-[5.5rem]">
                El código de <Shine gold>quién eres</Shine>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90 sm:text-xl">
                Más allá de los números sueltos: tu retrato numerológico entreteje tu
                camino de vida con el ciclo que vives ahora y lo narra solo para ti,
                orientado a lo que tú elijas.
              </p>
            </div>
          </div>
        </Reveal>
      </Section>

      <Section width="xwide" className="py-10">
        <PremiumGate
          title="La numerología personal es premium"
          description="Suscríbete y desbloquea tu retrato numerológico personal: un texto único que integra tu camino de vida con tu año y tu mes personal, orientado a lo que tú elijas. Incluye una lectura al mes —además de todo Zodiaq sin anuncios."
        >
          <AdvancedNumerologyBody />
        </PremiumGate>

        <AdSlot className="mt-8" />
      </Section>
    </>
  );
}
