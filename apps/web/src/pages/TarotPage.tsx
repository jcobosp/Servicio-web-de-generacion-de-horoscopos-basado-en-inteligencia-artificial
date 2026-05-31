import { useState } from 'react';
import { Seo } from '@/lib/seo';
import { Card } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { UpsellCard } from '@/components/horoscope/UpsellCard';
import { AdSlot } from '@/components/ads/AdSlot';
import { useAuth } from '@/features/auth/AuthProvider';
import { useDrawTarot, useLastReading, cooldownUntil } from '@/features/tarot/hooks';
import { SPREADS } from '@/features/tarot/types';
import type { SpreadType, TarotCard } from '@/features/tarot/types';
import { company } from '@/features/legal/company';

function formatRemaining(untilMs: number): string {
  const diff = Math.max(0, untilMs - Date.now());
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  if (hours >= 1) return `${hours} h ${mins} min`;
  return `${mins} min`;
}

function CardFace({ card }: { card: TarotCard }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={[
          'relative flex h-44 w-28 flex-col items-center justify-center rounded-xl p-3 text-center text-white shadow-md',
          'bg-gradient-to-br from-cosmos-700 via-aurora-600 to-cosmos-900',
          card.reversed ? 'ring-2 ring-gold-400' : '',
        ].join(' ')}
      >
        <span aria-hidden="true" className="text-3xl opacity-90">
          ✦
        </span>
        <span className="mt-2 font-display text-sm leading-tight">
          {card.name}
        </span>
        {card.reversed && (
          <span className="absolute bottom-1.5 text-[10px] uppercase tracking-wider text-gold-200">
            invertida
          </span>
        )}
      </div>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-cosmos-700">
        {card.position}
      </p>
    </div>
  );
}

interface ReadingData {
  cards: TarotCard[];
  summary: string;
  question: string | null;
  premium_hook?: string;
}

function ReadingView({ reading }: { reading: ReadingData }) {
  return (
    <Card padding="lg">
      {reading.question && (
        <p className="mb-4 text-sm italic text-silver">
          Tu pregunta: «{reading.question}»
        </p>
      )}
      <div
        className={[
          'flex flex-wrap justify-center gap-6',
          reading.cards.length === 1 ? '' : 'sm:justify-between',
        ].join(' ')}
      >
        {reading.cards.map((c, i) => (
          <CardFace key={`${c.id}-${i}`} card={c} />
        ))}
      </div>

      <div className="mt-8 space-y-5">
        {reading.cards.map((c, i) => (
          <div key={`${c.id}-m-${i}`}>
            <p className="font-display text-ink">
              {c.position} · {c.name}
              {c.reversed && (
                <span className="ml-2 text-xs uppercase text-gold-600">invertida</span>
              )}
            </p>
            <p className="mt-1 leading-relaxed text-graphite">{c.meaning}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-cosmos-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-cosmos-700">
          La lectura, en conjunto
        </p>
        <p className="mt-1 leading-relaxed text-graphite">{reading.summary}</p>
      </div>
    </Card>
  );
}

export function TarotPage() {
  const { session } = useAuth();
  const lastReading = useLastReading();
  const draw = useDrawTarot();

  const [spread, setSpread] = useState<SpreadType>('one_card');
  const [question, setQuestion] = useState('');

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
      ? {
          cards: stored.cards,
          summary: stored.summary,
          question: stored.question,
        }
      : null;

  const cooldownFromDraw =
    draw.data?.status === 'cooldown' ? draw.data.next_available_at : null;
  const effectiveUntil = cooldownFromDraw
    ? new Date(cooldownFromDraw).getTime()
    : until;

  function onDraw() {
    draw.mutate({ spread, question });
  }

  return (
    <>
      <Seo
        title={`Tarot · ${company.brand}`}
        description="Tu tirada de tarot diaria gratuita: una o tres cartas interpretadas para tu momento presente."
        path="/tarot/simple"
      />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <header>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">Tarot</h1>
          <p className="mt-3 max-w-xl text-graphite">
            Una tirada gratuita al día. Respira, piensa en tu momento y deja que
            las cartas te hablen.
          </p>
        </header>

        {!session ? (
          <Card padding="lg" className="mt-8 text-center">
            <div aria-hidden="true" className="text-4xl">
              🔮
            </div>
            <p className="mt-3 text-graphite">
              Inicia sesión para hacer tu tirada y guardar tus lecturas.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <LinkButton to="/login" variant="secondary">
                Iniciar sesión
              </LinkButton>
              <LinkButton to="/registro" variant="primary">
                Crear cuenta
              </LinkButton>
            </div>
          </Card>
        ) : (
          <>
            {/* Formulario (solo si no hay cooldown activo) */}
            {!inCooldown && (
              <Card padding="lg" className="mt-8">
                <p className="font-display text-lg text-ink">Elige tu tirada</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {SPREADS.map((s) => {
                    const active = s.key === spread;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setSpread(s.key)}
                        className={[
                          'rounded-xl border p-4 text-left transition',
                          active
                            ? 'border-cosmos-500 bg-cosmos-50 ring-2 ring-cosmos-200'
                            : 'border-slate-200 hover:border-cosmos-300',
                        ].join(' ')}
                      >
                        <span className="font-medium text-ink">{s.label}</span>
                        <span className="mt-1 block text-sm text-graphite">
                          {s.description}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <label
                  htmlFor="tarot-question"
                  className="mt-5 block text-sm font-medium text-graphite"
                >
                  ¿Hay algo que te ronda? (opcional)
                </label>
                <textarea
                  id="tarot-question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  maxLength={300}
                  rows={2}
                  placeholder="Ej.: ¿Qué necesito soltar ahora mismo?"
                  className="mt-1.5 w-full resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-cosmos-400 focus:outline-none focus:ring-2 focus:ring-cosmos-200"
                />

                <div className="mt-5">
                  <Button onClick={onDraw} disabled={draw.isPending} size="lg">
                    {draw.isPending ? 'Barajando las cartas…' : 'Hacer mi tirada'}
                  </Button>
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
            )}

            {/* Aviso de cooldown */}
            {inCooldown && effectiveUntil && (
              <Card padding="lg" className="mt-8 border-cosmos-200 bg-cosmos-50">
                <p className="font-display text-lg text-ink">
                  Ya has hecho tu tirada de hoy ✨
                </p>
                <p className="mt-1 text-sm text-graphite">
                  Tu próxima tirada gratuita estará disponible en{' '}
                  <strong>{formatRemaining(effectiveUntil)}</strong>. Mientras
                  tanto, aquí tienes tu última lectura.
                </p>
              </Card>
            )}

            {/* Resultado / última lectura */}
            {draw.isPending ? (
              <Card padding="lg" className="mt-6 text-center text-silver">
                Barajando las cartas…
              </Card>
            ) : reading ? (
              <div className="mt-6">
                <ReadingView reading={reading} />
              </div>
            ) : null}

            <UpsellCard
              variant="tarot"
              premiumHook={reading?.premium_hook}
              to="/tarot/avanzado"
            />
          </>
        )}

        <AdSlot className="mt-8" />
      </div>
    </>
  );
}
