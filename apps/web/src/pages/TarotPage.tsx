import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import {
  Wand2, Sparkles, Clock, RotateCcw, CreditCard, History, Check,
  Compass, Moon, Flower2, Crown, Landmark, Heart, Navigation, ShieldHalf,
  Lightbulb, RotateCw, Scale, Hourglass, Skull, FlaskConical, Link as LinkIcon,
  TowerControl, Star, MoonStar, Sun, BellRing, Globe, Droplet, Swords, Coins, Flame,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Seo } from '@/lib/seo';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { UpsellCard } from '@/components/horoscope/UpsellCard';
import { AdSlot } from '@/components/ads/AdSlot';
import { cn } from '@/lib/cn';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  useDrawTarot,
  useLastReading,
  useTarotHistory,
  useTarotCredits,
  useBuySimpleTarotCredit,
  cooldownUntil,
} from '@/features/tarot/hooks';
import { SPREADS } from '@/features/tarot/types';
import type { SpreadType, TarotCard } from '@/features/tarot/types';
import type { StoredReading } from '@/features/tarot/api';
import { company } from '@/features/legal/company';

const TAROT_ACCENT = '#a21caf'; // fuchsia-700 (AA sobre blanco)
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Icono Lucide propio de cada arcano mayor (por índice del id `major-N`). */
const MAJOR_ICONS: Record<number, LucideIcon> = {
  0: Compass, 1: Wand2, 2: Moon, 3: Flower2, 4: Crown, 5: Landmark,
  6: Heart, 7: Navigation, 8: ShieldHalf, 9: Lightbulb, 10: RotateCw,
  11: Scale, 12: Hourglass, 13: Skull, 14: FlaskConical, 15: LinkIcon,
  16: TowerControl, 17: Star, 18: MoonStar, 19: Sun, 20: BellRing, 21: Globe,
};

/** Icono por palo de los arcanos menores. */
const SUIT_ICONS: Record<string, LucideIcon> = {
  copas: Droplet, espadas: Swords, oros: Coins, bastos: Flame,
};

/** Icono propio de la carta (acceso a mapa, no factory de componente). */
function CardGlyph({
  card,
  className,
  strokeWidth,
}: {
  card: TarotCard;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon =
    card.arcana === 'major'
      ? MAJOR_ICONS[Number(card.id.split('-')[1])] ?? Sparkles
      : SUIT_ICONS[card.suit ?? ''] ?? Sparkles;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}

const SPREAD_LABEL: Record<SpreadType, string> = {
  one_card: 'Una carta',
  three_cards: 'Tres cartas',
};

const dateFmt = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

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

function formatRemaining(untilMs: number): string {
  const diff = Math.max(0, untilMs - Date.now());
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  if (hours >= 1) return `${hours} h ${mins} min`;
  return `${mins} min`;
}

interface ReadingData {
  cards: TarotCard[];
  summary: string;
  question: string | null;
  premium_hook?: string;
}

/** Hero a sangre con identidad «tarot». */
function TarotHero() {
  return (
    <Section width="full" className="px-3 pt-4 sm:px-4 lg:px-6">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-fuchsia-600 via-purple-600 to-violet-900 px-6 py-14 text-center text-white shadow-lift sm:px-12 sm:py-20">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/25 via-black/10 to-black/50"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-16 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl animate-drift"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 bottom-0 h-72 w-72 rounded-full bg-fuchsia-300/25 blur-3xl animate-float-slow"
          />
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

          <div className="relative z-10 mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.14em] ring-1 ring-white/30 backdrop-blur">
              <Wand2 className="h-4 w-4" aria-hidden="true" />
              Tarot intuitivo
            </span>
            <h1 className="mt-6 font-display text-6xl font-extrabold leading-[0.9] tracking-[-0.035em] [text-shadow:0_2px_24px_rgba(0,0,0,0.35)] sm:text-7xl lg:text-8xl">
              Tira las cartas
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90">
              Una tirada gratuita al día. Respira, piensa en tu momento y deja
              que las cartas respondan a lo que llevas días rondando.
            </p>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/** Dorso ornamentado de carta (reutilizable: baraja y volteo). */
function TarotCardBack() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-fuchsia-600 via-purple-700 to-violet-900 shadow-lift ring-1 ring-white/20">
      <span
        aria-hidden="true"
        className="absolute inset-2 rounded-xl border border-gold-300/40"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/20 blur-2xl"
      />
      <Sparkles className="h-12 w-12 text-gold-200" aria-hidden="true" />
      <span className="absolute left-4 top-4 h-1.5 w-1.5 rounded-full bg-white/70 animate-twinkle" />
      <span className="absolute bottom-5 right-5 h-1.5 w-1.5 rounded-full bg-white/70 animate-twinkle [animation-delay:0.8s]" />
      <span className="absolute bottom-8 left-6 h-1 w-1 rounded-full bg-white/60 animate-twinkle [animation-delay:1.4s]" />
    </div>
  );
}

/** Cara revelada de la carta (icono propio + nombre + posición + invertida). */
function TarotCardFront({ card }: { card: TarotCard }) {
  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 bg-white p-4 text-center shadow-lift',
        card.reversed ? 'border-gold-300' : 'border-tarot-100',
      )}
    >
      <span
        className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-soft"
        style={{ backgroundColor: TAROT_ACCENT }}
      >
        <CardGlyph card={card} className="h-7 w-7" strokeWidth={2.1} />
      </span>
      <span className="font-display text-lg font-extrabold leading-tight tracking-tight text-ink sm:text-xl">
        {card.name}
      </span>
      {card.reversed && (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-gold-700">
          <RotateCcw className="h-3 w-3" aria-hidden="true" /> invertida
        </span>
      )}
    </div>
  );
}

/** Carta que se voltea (dorso → cara) al revelarse, con retardo por índice. */
function FlipCard({
  card,
  index,
  reduce,
}: {
  card: TarotCard;
  index: number;
  reduce: boolean | null;
}) {
  const [revealed, setRevealed] = useState<boolean>(Boolean(reduce));

  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setRevealed(true), 300 + index * 420);
    return () => clearTimeout(t);
  }, [index, reduce]);

  return (
    <div className="flex flex-col items-center">
      <div className="[perspective:1200px]">
        <motion.div
          className="relative h-64 w-44 [transform-style:preserve-3d] sm:h-80 sm:w-56"
          initial={false}
          animate={{ rotateY: revealed ? 180 : 0 }}
          transition={{ duration: reduce ? 0 : 0.75, ease: EASE }}
        >
          <div className="absolute inset-0 [backface-visibility:hidden]">
            <TarotCardBack />
          </div>
          <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]">
            <TarotCardFront card={card} />
          </div>
        </motion.div>
      </div>
      <p
        className="mt-4 text-base font-bold uppercase tracking-[0.1em]"
        style={{ color: TAROT_ACCENT }}
      >
        {card.position}
      </p>
    </div>
  );
}

/** Animación de barajado mientras se genera la tirada. */
function ShuffleDeck({ reduce }: { reduce: boolean | null }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-7 py-12 text-center"
    >
      <div className="relative h-64 w-44 sm:h-80 sm:w-56">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            animate={
              reduce
                ? {}
                : {
                    x: [0, (i - 1) * 52, 0],
                    y: [0, -14, 0],
                    rotate: [0, (i - 1) * 9, 0],
                  }
            }
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.12,
            }}
          >
            <TarotCardBack />
          </motion.div>
        ))}
      </div>
      <p className="font-display text-2xl font-extrabold tracking-tight text-ink">
        Barajando las cartas…
      </p>
    </div>
  );
}

function ReadingView({
  reading,
  reduce,
}: {
  reading: ReadingData;
  reduce: boolean | null;
}) {
  const multi = reading.cards.length > 1;
  return (
    <div className="space-y-10">
      {reading.question && (
        <p className="text-center text-lg italic text-graphite">
          Tu pregunta: «{reading.question}»
        </p>
      )}

      {/* Cartas que se voltean */}
      <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
        {reading.cards.map((c, i) => (
          <FlipCard key={`${c.id}-${i}`} card={c} index={i} reduce={reduce} />
        ))}
      </div>

      {/* Significados */}
      <div className={cn('grid gap-5', multi ? 'lg:grid-cols-3' : 'mx-auto max-w-2xl')}>
        {reading.cards.map((c, i) => {
          return (
            <Card key={`${c.id}-m-${i}`} padding="lg" className="relative h-full overflow-hidden">
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1.5"
                style={{ backgroundImage: `linear-gradient(90deg, ${TAROT_ACCENT}, transparent)` }}
              />
              <p
                className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.1em]"
                style={{ color: TAROT_ACCENT }}
              >
                <CardGlyph card={c} className="h-4 w-4" /> {c.position}
              </p>
              <h3 className="mt-1 flex flex-wrap items-center gap-2 font-display text-2xl font-extrabold tracking-tight text-ink">
                {c.name}
                {c.reversed && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-gold-700">
                    <RotateCcw className="h-3 w-3" aria-hidden="true" /> invertida
                  </span>
                )}
              </h3>
              <p className="mt-3 text-lg leading-relaxed text-graphite">{c.meaning}</p>
            </Card>
          );
        })}
      </div>

      {/* Síntesis */}
      <Card
        padding="lg"
        className="relative overflow-hidden border-tarot-100 sm:p-10"
        style={{ backgroundImage: `linear-gradient(135deg, ${TAROT_ACCENT}1f, #ffffff 58%)` }}
      >
        <p
          className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.12em]"
          style={{ color: TAROT_ACCENT }}
        >
          <Sparkles className="h-5 w-5" aria-hidden="true" /> La lectura, en conjunto
        </p>
        <p className="mt-3 text-lg leading-relaxed text-ink">{reading.summary}</p>
      </Card>
    </div>
  );
}

/** Una entrada del historial (colapsable). */
function HistoryItem({ reading }: { reading: StoredReading }) {
  return (
    <details className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition open:shadow-lift">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <span className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: TAROT_ACCENT }}
            aria-hidden="true"
          >
            <Wand2 className="h-4 w-4" />
          </span>
          <span>
            <span className="block font-display text-base font-bold text-ink">
              {SPREAD_LABEL[reading.spread_type]}
            </span>
            <span className="block text-sm capitalize text-silver">
              {dateFmt.format(new Date(reading.created_at))}
            </span>
          </span>
        </span>
        <RotateCcw
          className="h-4 w-4 flex-shrink-0 text-tarot-600 transition-transform duration-300 group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
        {reading.question && (
          <p className="text-sm italic text-graphite">«{reading.question}»</p>
        )}
        {reading.cards.map((c, i) => {
          return (
            <div key={`${c.id}-h-${i}`}>
              <p
                className="flex items-center gap-2 text-sm font-bold"
                style={{ color: TAROT_ACCENT }}
              >
                <CardGlyph card={c} className="h-4 w-4" />
                {c.position} · {c.name}
                {c.reversed && (
                  <span className="text-[11px] uppercase text-gold-700">invertida</span>
                )}
              </p>
              <p className="mt-1 leading-relaxed text-graphite">{c.meaning}</p>
            </div>
          );
        })}
        <div className="rounded-xl bg-tarot-50 p-4">
          <p className="text-graphite">{reading.summary}</p>
        </div>
      </div>
    </details>
  );
}

export function TarotPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const lastReading = useLastReading();
  const draw = useDrawTarot();
  const history = useTarotHistory();
  const creditsQuery = useTarotCredits();
  const buyCredit = useBuySimpleTarotCredit();

  const [spread, setSpread] = useState<SpreadType>('one_card');
  const [question, setQuestion] = useState('');

  const credits = creditsQuery.data ?? 0;
  const justPaid = searchParams.get('status') === 'paid';

  // Tras volver del pago, refrescamos los créditos para que aparezca el nuevo.
  useEffect(() => {
    if (justPaid && session) {
      queryClient.invalidateQueries({ queryKey: ['tarot-credits'] });
    }
  }, [justPaid, session, queryClient]);

  const fresh = draw.data?.status === 'ok' ? draw.data : null;
  const stored = lastReading.data;
  const until = cooldownUntil(stored?.created_at);
  const inCooldown = until !== null && !fresh;

  const reading: ReadingData | null = fresh
    ? {
        cards: fresh.content.cards,
        summary: fresh.content.summary,
        question: fresh.question,
        premium_hook: fresh.content.premium_hook,
      }
    : stored
      ? { cards: stored.cards, summary: stored.summary, question: stored.question }
      : null;

  const cooldownFromDraw =
    draw.data?.status === 'cooldown' ? draw.data.next_available_at : null;
  const effectiveUntil = cooldownFromDraw
    ? new Date(cooldownFromDraw).getTime()
    : until;

  // Puede tirar si no está en cooldown, o si tiene un crédito comprado.
  const usingCredit = inCooldown && credits > 0;
  const canDraw = !inCooldown || credits > 0;
  const freshId = fresh ? fresh.id : stored?.id;
  const olderHistory = (history.data ?? []).filter((r) => r.id !== freshId);

  function onDraw() {
    if (!session) {
      navigate('/login', { state: { from: '/tarot/simple' } });
      return;
    }
    draw.mutate({ spread, question });
  }

  return (
    <>
      <Seo
        title={`Tarot · ${company.brand}`}
        description="Tu tirada de tarot diaria gratuita: una o tres cartas interpretadas para tu momento presente."
        path="/tarot/simple"
      />

      <TarotHero />

      <Section width="xwide" className="py-10">
        {/* Aviso de pago confirmado */}
        {justPaid && credits > 0 && (
          <Card padding="lg" className="border-tarot-100 bg-tarot-50 sm:p-8">
            <p className="flex items-center gap-2 font-display text-xl font-extrabold text-ink">
              <Check className="h-5 w-5" style={{ color: TAROT_ACCENT }} aria-hidden="true" />
              Pago confirmado
            </p>
            <p className="mt-2 text-base text-graphite">
              Tienes <strong>{credits}</strong> tirada{credits === 1 ? '' : 's'} extra
              disponible{credits === 1 ? '' : 's'}. Elige tu tirada y dale a «Hacer mi tirada».
            </p>
          </Card>
        )}

        {/* Formulario de tirada (visible si puede tirar) */}
        {canDraw && (
          <Reveal>
            <Card padding="lg" className="sm:p-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-display text-2xl font-extrabold tracking-tight text-ink">
                  Elige tu tirada
                </p>
                {usingCredit && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-tarot-50 px-3 py-1 text-sm font-bold text-tarot-700 ring-1 ring-tarot-100">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    {credits} tirada{credits === 1 ? '' : 's'} extra
                  </span>
                )}
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {SPREADS.map((s) => {
                  const active = s.key === spread;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setSpread(s.key)}
                      className={cn(
                        'rounded-2xl border-2 p-5 text-left transition-all duration-200 ease-cosmic hover:-translate-y-0.5',
                        active
                          ? 'border-tarot-500 bg-tarot-50 ring-2 ring-fuchsia-200'
                          : 'border-slate-200 hover:border-fuchsia-300',
                      )}
                    >
                      <span className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                        <Wand2 className="h-5 w-5" style={{ color: TAROT_ACCENT }} aria-hidden="true" />
                        {s.label}
                      </span>
                      <span className="mt-1.5 block text-base text-graphite">
                        {s.description}
                      </span>
                    </button>
                  );
                })}
              </div>

              <label htmlFor="tarot-question" className="mt-6 block text-base font-semibold text-ink">
                ¿Hay algo que te ronda? (opcional)
              </label>
              <textarea
                id="tarot-question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                maxLength={300}
                rows={2}
                placeholder="Ej.: ¿Qué necesito soltar ahora mismo?"
                className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-base focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-200"
              />

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Button onClick={onDraw} disabled={draw.isPending} size="lg" leftIcon={<Wand2 className="h-5 w-5" />}>
                  {draw.isPending
                    ? 'Barajando…'
                    : usingCredit
                      ? 'Hacer mi tirada extra'
                      : 'Hacer mi tirada'}
                </Button>
                {!session && (
                  <span className="text-sm text-silver">
                    Necesitas una cuenta gratuita para tirar.
                  </span>
                )}
              </div>

              {draw.data?.status === 'unavailable' && (
                <p className="mt-3 text-sm text-graphite">{draw.data.message}</p>
              )}
              {draw.isError && (
                <p className="mt-3 text-sm text-red-600">
                  No se pudo hacer la tirada. Inténtalo de nuevo en un momento.
                </p>
              )}
            </Card>
          </Reveal>
        )}

        {/* Cooldown + opción de tirada extra de pago */}
        {inCooldown && credits === 0 && effectiveUntil && (
          <Card padding="lg" className="overflow-hidden border-tarot-100 sm:p-10" style={{ backgroundImage: `linear-gradient(135deg, ${TAROT_ACCENT}1a, #ffffff 60%)` }}>
            <p className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight text-ink">
              <Sparkles className="h-6 w-6" style={{ color: TAROT_ACCENT }} aria-hidden="true" />
              Ya has hecho tu tirada de hoy
            </p>
            <p className="mt-2 flex items-center gap-2 text-base text-graphite">
              <Clock className="h-4 w-4" aria-hidden="true" />
              Tu próxima tirada gratuita estará disponible en{' '}
              <strong>{formatRemaining(effectiveUntil)}</strong>.
            </p>
            <p className="mt-4 text-lg text-graphite">
              ¿No quieres esperar? Haz una <strong>tirada extra ahora</strong> por
              solo 1,99 €. Puedes comprar tantas como quieras.
            </p>
            <div className="mt-5">
              <Button
                onClick={() => buyCredit.mutate()}
                disabled={buyCredit.isPending}
                variant="premium"
                size="lg"
                leftIcon={<CreditCard className="h-5 w-5" />}
              >
                {buyCredit.isPending ? 'Abriendo el pago…' : 'Tirada extra · 1,99 €'}
              </Button>
            </div>
            {buyCredit.isError && (
              <p className="mt-3 text-sm text-red-600">
                No se pudo iniciar el pago. Inténtalo de nuevo en un momento.
              </p>
            )}
          </Card>
        )}

        {/* Resultado / última lectura */}
        {draw.isPending ? (
          <div className="mt-8">
            <ShuffleDeck reduce={reduce} />
          </div>
        ) : reading ? (
          <div className="mt-8">
            <ReadingView reading={reading} reduce={reduce} />
          </div>
        ) : null}

        <UpsellCard variant="tarot" premiumHook={reading?.premium_hook} to="/tarot/avanzado" />

        {/* Historial de tiradas (requiere sesión) */}
        {session && olderHistory.length > 0 && (
          <div className="mt-12">
            <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              <History className="h-6 w-6" style={{ color: TAROT_ACCENT }} aria-hidden="true" />
              Tus tiradas anteriores
            </h2>
            <p className="mt-2 text-graphite">
              Tu registro de lecturas. Despliega cualquiera para volver a verla.
            </p>
            <div className="mt-5 space-y-3">
              {olderHistory.map((r) => (
                <HistoryItem key={r.id} reading={r} />
              ))}
            </div>
          </div>
        )}

        <AdSlot className="mt-8" />
      </Section>
    </>
  );
}
