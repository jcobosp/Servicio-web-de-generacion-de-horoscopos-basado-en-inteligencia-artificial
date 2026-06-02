import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Heart, Flame, MessageCircle, Sparkles, Zap, Lightbulb, HeartHandshake, ArrowLeftRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Seo } from '@/lib/seo';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { LinkButton } from '@/components/ui/Button';
import { Section } from '@/components/layout/Section';
import { Reveal, RevealStagger, RevealItem } from '@/components/motion/Reveal';
import { AdSlot } from '@/components/ads/AdSlot';
import { cn } from '@/lib/cn';
import { useSignCompatibility } from '@/features/sign-compat/hooks';
import type { SignCompatContent, SignCompatReport } from '@/features/sign-compat/types';
import { ZODIAC, ZODIAC_SIGNS } from '@/lib/zodiac';
import type { ZodiacSign } from '@/lib/zodiac';
import { company } from '@/features/legal/company';

const SIGN_OPTIONS = ZODIAC_SIGNS.map((slug) => ({
  value: slug,
  label: ZODIAC[slug].name,
}));

/** Bloques de contenido en bento asimétrico (icono, acento, tamaño). */
const SECTIONS: {
  key: keyof SignCompatContent;
  title: string;
  Icon: LucideIcon;
  color: string;
  span: string;
  /** Card de color lleno (destacada) o blanca con tinte. */
  gradient?: string;
}[] = [
  { key: 'love', title: 'Amor y romance', Icon: Heart, color: '#e11d48', span: 'sm:col-span-2 lg:col-span-3', gradient: 'from-rose-500 via-pink-600 to-rose-700' },
  { key: 'passion', title: 'Pasión y química', Icon: Flame, color: '#ea580c', span: 'sm:col-span-2 lg:col-span-3', gradient: 'from-orange-500 via-red-500 to-rose-700' },
  { key: 'communication', title: 'Comunicación', Icon: MessageCircle, color: '#0ea5e9', span: 'lg:col-span-2' },
  { key: 'strengths', title: 'Lo que os une', Icon: Sparkles, color: '#c026d3', span: 'lg:col-span-2' },
  { key: 'challenges', title: 'Vuestros retos', Icon: Zap, color: '#d97706', span: 'sm:col-span-2 lg:col-span-2' },
];

/** Estrellas decorativas deterministas (% y retardo). */
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
  { top: 20, left: 34, size: 2, delay: 1.4 },
  { top: 70, left: 54, size: 2, delay: 0.3 },
  { top: 34, left: 74, size: 2, delay: 1.9 },
];

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

/** Cuenta de 0 al objetivo (easeOutCubic). Respeta reduced-motion. */
function useCountUp(target: number, reduce: boolean | null, duration = 1100): number {
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

function scoreWord(score: number): string {
  if (score >= 85) return 'Conexión excepcional';
  if (score >= 70) return 'Muy buena sintonía';
  if (score >= 55) return 'Compatibilidad con matices';
  if (score >= 48) return 'Relación cuesta arriba';
  return 'Choque de energías';
}

/** Orbe luminoso del signo (color propio) + nombre. */
function SignOrb({ sign }: { sign: ZodiacSign }) {
  const info = ZODIAC[sign];
  return (
    <div className="flex flex-col items-center gap-3">
      <span
        className="relative flex h-24 w-24 items-center justify-center rounded-full text-white shadow-lift animate-float sm:h-28 sm:w-28"
        style={{
          backgroundImage: `linear-gradient(135deg, ${info.colors.from}, ${info.colors.to})`,
          boxShadow: `0 0 32px 6px ${info.colors.primary}55`,
        }}
      >
        <Sparkles className="h-9 w-9 text-white/50" aria-hidden="true" />
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
        {info.name}
      </span>
    </div>
  );
}

const SELECT_CLASS =
  'h-12 text-lg font-semibold border-rose-200 focus:border-rose-400 focus:ring-rose-200';

/** Selector «dos energías que se encuentran»: orbes + corazón que late + selects. */
function MatchSelector({
  signA,
  signB,
  onA,
  onB,
  reduce,
}: {
  signA: ZodiacSign;
  signB: ZodiacSign;
  onA: (s: ZodiacSign) => void;
  onB: (s: ZodiacSign) => void;
  reduce: boolean | null;
}) {
  const swap = () => {
    const a = signA;
    onA(signB);
    onB(a);
  };

  return (
    <Card
      padding="lg"
      className="relative overflow-hidden border-rose-100 sm:p-10"
      style={{ backgroundImage: 'linear-gradient(135deg,#fff1f5,#fdf2ff 55%,#ffffff)' }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-10 top-1/3 h-44 w-44 rounded-full bg-rose-300/30 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 top-1/3 h-44 w-44 rounded-full bg-fuchsia-300/30 blur-3xl"
      />

      {/* Fila de orbes con el corazón que late en el centro */}
      <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-8">
        <SignOrb sign={signA} />
        <motion.div
          animate={reduce ? {} : { scale: [1, 1.18, 1] }}
          transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Heart
            className="h-12 w-12 fill-rose-500 text-rose-500 drop-shadow-[0_0_14px_rgba(244,63,94,0.6)] sm:h-16 sm:w-16"
            aria-hidden="true"
          />
        </motion.div>
        <SignOrb sign={signB} />
      </div>

      {/* Selectores justo debajo de cada orbe + botón de intercambio en medio */}
      <div className="relative mt-7 grid grid-cols-[1fr_auto_1fr] items-end gap-3 sm:gap-8">
        <Select
          aria-label="Primer signo"
          options={SIGN_OPTIONS}
          value={signA}
          onChange={(e) => onA(e.target.value as ZodiacSign)}
          className={SELECT_CLASS}
        />
        <button
          type="button"
          onClick={swap}
          aria-label="Intercambiar signos"
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-rose-500 text-white shadow-lift transition-all duration-200 ease-cosmic hover:-translate-y-0.5 hover:bg-rose-600 hover:rotate-180"
        >
          <ArrowLeftRight className="h-5 w-5" aria-hidden="true" />
        </button>
        <Select
          aria-label="Segundo signo"
          options={SIGN_OPTIONS}
          value={signB}
          onChange={(e) => onB(e.target.value as ZodiacSign)}
          className={SELECT_CLASS}
        />
      </div>
    </Card>
  );
}

/** Medidor de amor circular (anillo SVG animado) con la puntuación. */
function LoveMeter({ score, reduce }: { score: number; reduce: boolean | null }) {
  const shown = useCountUp(score, reduce);
  const R = 45;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - shown / 100);
  return (
    <div className="relative h-44 w-44 sm:h-52 sm:w-52">
      <span aria-hidden="true" className="absolute inset-0 rounded-full bg-white/30 blur-2xl" />
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
        <defs>
          <linearGradient id="loveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#f0abfc" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke="url(#loveGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <Heart className="h-6 w-6 fill-white/90 text-white/90" aria-hidden="true" />
        <span className="mt-1 font-display text-5xl font-extrabold leading-none text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.3)] sm:text-6xl">
          {Math.round(shown)}
        </span>
        <span className="text-sm font-bold uppercase tracking-[0.18em] text-white/80">
          de 100
        </span>
      </div>
    </div>
  );
}

/** Tarjeta de un bloque. `gradient` → card de color lleno destacada. */
function CompatSectionCard({
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
          'group relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br p-7 text-white shadow-lift transition-all duration-300 ease-cosmic hover:-translate-y-1 sm:p-8',
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
        <p className="relative mt-3 text-lg leading-relaxed text-white/95">{text}</p>
      </div>
    );
  }
  return (
    <Card
      padding="lg"
      className="relative h-full overflow-hidden transition-all duration-300 ease-cosmic hover:-translate-y-1"
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
      <p className="mt-3 text-lg leading-relaxed text-graphite">{text}</p>
    </Card>
  );
}

function Result({ report, reduce }: { report: SignCompatReport; reduce: boolean | null }) {
  const c = report.content;
  const a = ZODIAC[report.sign_a];
  const b = ZODIAC[report.sign_b];

  return (
    <div className="space-y-8">
      {/* Puntuación + titular sobre card amor (destacada) */}
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-500 via-pink-600 to-fuchsia-800 p-6 text-white shadow-lift sm:p-10">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/25 via-black/10 to-black/45"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-16 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl animate-drift"
          />
          <HeroStars />
          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[auto_1fr]">
            <div className="mx-auto lg:mx-0">
              <LoveMeter score={report.score} reduce={reduce} />
            </div>
            <div className="text-center lg:text-left">
              <p className="flex flex-wrap items-center justify-center gap-2 text-lg font-bold lg:justify-start">
                {a.name}
                <Heart className="h-5 w-5 fill-white text-white" aria-hidden="true" />
                {b.name}
              </p>
              <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-base font-bold ring-1 ring-white/25 backdrop-blur">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {scoreWord(report.score)}
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight [text-shadow:0_2px_18px_rgba(0,0,0,0.3)] sm:text-4xl">
                {c.headline}
              </h2>
              <p className="mt-3 max-w-2xl text-lg text-white/90">{c.overview}</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Bloques en bento asimétrico (color + tinte) */}
      <RevealStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
        {SECTIONS.map((s) => (
          <RevealItem key={s.key} className={s.span}>
            <CompatSectionCard
              Icon={s.Icon}
              title={s.title}
              color={s.color}
              text={c[s.key]}
              {...(s.gradient ? { gradient: s.gradient } : {})}
            />
          </RevealItem>
        ))}
      </RevealStagger>

      {/* Consejo destacado */}
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-fuchsia-600 via-rose-600 to-pink-700 p-8 text-white shadow-lift sm:p-12">
          <HeroStars />
          <div className="relative z-10">
            <p className="flex items-center gap-2.5 text-sm font-extrabold uppercase tracking-[0.16em] text-white/85">
              <Lightbulb className="h-5 w-5" aria-hidden="true" /> El consejo de los astros
            </p>
            <p className="mt-4 font-display text-xl font-semibold leading-relaxed sm:text-2xl">
              {c.advice}
            </p>
          </div>
        </div>
      </Reveal>

      {/* Upsell hacia la compatibilidad avanzada (premium) */}
      <Card tone="premium" padding="lg" className="relative overflow-hidden sm:p-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1.25fr_1fr]">
          {/* Texto + CTA (más grande) */}
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-gold-700">
              <HeartHandshake className="h-4 w-4" aria-hidden="true" /> Vuestra historia real
            </p>
            <h3 className="mt-3 font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-ink sm:text-5xl">
              Dos signos no cuentan toda la verdad
            </h3>
            <p className="mt-4 text-xl leading-relaxed text-graphite">
              Lo que acabas de leer es el mapa general entre {a.name} y {b.name}.
              Pero vuestra química real se esconde en algo más profundo: vuestras
              Lunas, vuestros Venus y Marte y los aspectos exactos entre vuestras
              dos cartas. Ahí está el «por qué» de lo que sentís.
            </p>
            <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <LinkButton to="/compatibilidad/avanzada" variant="premium" size="lg">
                Calcular nuestra compatibilidad real →
              </LinkButton>
              <span className="text-sm text-silver">
                Análisis personalizado · incluido en Premium
              </span>
            </div>
          </div>

          {/* Panel de arte que llena la derecha */}
          <div className="relative flex min-h-[240px] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-pink-600 to-fuchsia-800 p-6 text-white shadow-lift">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/15 to-black/35"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl animate-drift"
            />
            <HeroStars />
            {/* Corazones flotantes */}
            <Heart
              aria-hidden="true"
              className="pointer-events-none absolute left-6 top-8 h-6 w-6 fill-white/40 text-white/40 animate-float"
            />
            <Sparkles
              aria-hidden="true"
              className="pointer-events-none absolute bottom-8 right-8 h-6 w-6 text-gold-200 animate-twinkle"
            />
            <div className="relative z-10 flex flex-col items-center text-center">
              <HeartHandshake
                className="h-24 w-24 text-white drop-shadow-[0_0_22px_rgba(255,255,255,0.45)] sm:h-28 sm:w-28"
                aria-hidden="true"
              />
              <p className="mt-4 flex flex-wrap items-center justify-center gap-2 font-display text-2xl font-extrabold">
                {a.name}
                <Heart className="h-5 w-5 fill-white text-white" aria-hidden="true" />
                {b.name}
              </p>
              <p className="mt-1 text-sm font-medium text-white/80">
                Sinastría real entre vuestras cartas
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function SignCompatibilityPage() {
  const reduce = useReducedMotion();
  const [signA, setSignA] = useState<ZodiacSign>('aries');
  const [signB, setSignB] = useState<ZodiacSign>('leo');
  const { data: report, isPending } = useSignCompatibility(signA, signB);

  return (
    <>
      <Seo
        title={`Compatibilidad de signos del zodiaco · ${company.brand}`}
        description="Descubre la compatibilidad entre dos signos del zodiaco: amor, pasión, comunicación y los retos de cada pareja, con su puntuación de afinidad."
        path="/compatibilidad"
      />

      {/* Hero — dos energías que se encuentran */}
      <Section width="full" className="px-3 pt-4 sm:px-4 lg:px-6">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-rose-500 via-pink-600 to-fuchsia-800 px-6 py-14 text-center text-white shadow-lift sm:px-12 sm:py-20">
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
              className="pointer-events-none absolute -right-12 bottom-0 h-72 w-72 rounded-full bg-rose-200/25 blur-3xl animate-float-slow"
            />
            <HeroStars />
            <div className="relative z-10 mx-auto max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.14em] ring-1 ring-white/30 backdrop-blur">
                <HeartHandshake className="h-4 w-4" aria-hidden="true" />
                Compatibilidad de signos
              </span>
              <h1 className="mt-6 font-display text-6xl font-extrabold leading-[0.9] tracking-[-0.035em] [text-shadow:0_2px_24px_rgba(0,0,0,0.35)] sm:text-7xl lg:text-8xl">
                Cuando dos signos se encuentran
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90">
                Elige dos signos y descubre cómo se llevan en el amor, la pasión y
                el día a día. Cada combinación tiene su historia… y su puntuación
                de afinidad.
              </p>
            </div>
          </div>
        </Reveal>
      </Section>

      <Section width="xwide" className="py-10">
        <Reveal>
          <MatchSelector
            signA={signA}
            signB={signB}
            onA={setSignA}
            onB={setSignB}
            reduce={reduce}
          />
        </Reveal>

        <div className="mt-8">
          {isPending ? (
            <div className="flex justify-center py-16">
              <LoveMeter score={0} reduce={reduce} />
            </div>
          ) : report ? (
            <Result report={report} reduce={reduce} />
          ) : (
            <Card padding="lg" className="text-center text-silver">
              No encontramos esta combinación. Prueba con otros dos signos.
            </Card>
          )}
        </div>

        <AdSlot className="mt-8" />
      </Section>
    </>
  );
}
