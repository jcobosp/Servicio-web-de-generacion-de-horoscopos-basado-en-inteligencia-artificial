import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import { PremiumGate } from '@/components/billing/PremiumGate';
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Carta boca arriba con su glifo, nombre y posición. */
function CardFace({ card, index }: { card: TarotCard; index: number }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={[
          'relative flex h-36 w-24 flex-col items-center justify-center rounded-xl p-2 text-center text-white shadow-md',
          'bg-gradient-to-br from-cosmos-700 via-aurora-600 to-cosmos-900',
          card.reversed ? 'ring-2 ring-gold-400' : '',
        ].join(' ')}
      >
        <span
          aria-hidden="true"
          className="absolute left-1.5 top-1 text-[10px] font-semibold text-white/70"
        >
          {index + 1}
        </span>
        <span aria-hidden="true" className="text-2xl opacity-90">
          ✦
        </span>
        <span className="mt-1 font-display text-xs leading-tight">{card.name}</span>
        {card.reversed && (
          <span className="absolute bottom-1 text-[9px] uppercase tracking-wider text-gold-200">
            invertida
          </span>
        )}
      </div>
      <p className="mt-1.5 max-w-[6.5rem] text-center text-[10px] font-semibold uppercase leading-tight tracking-wider text-cosmos-700">
        {card.position}
      </p>
    </div>
  );
}

function Section({ title, symbol, text }: { title: string; symbol: string; text: string }) {
  if (!text) return null;
  return (
    <section>
      <h3 className="flex items-center gap-2 font-display text-lg text-ink">
        <span aria-hidden="true">{symbol}</span> {title}
      </h3>
      <p className="mt-1.5 whitespace-pre-line leading-relaxed text-graphite">{text}</p>
    </section>
  );
}

function ReadingView({
  spread,
  question,
  content,
}: {
  spread: AdvancedSpreadType;
  question: string | null;
  content: AdvancedTarotContent;
}) {
  return (
    <Card padding="lg">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle>Tirada de {SPREAD_LABEL[spread]}</CardTitle>
        <Badge tone="cosmos">{content.cards.length} cartas</Badge>
      </div>
      {question && (
        <p className="mt-2 text-sm italic text-silver">Tu pregunta: «{question}»</p>
      )}

      <div className="mt-5 flex flex-wrap justify-center gap-4">
        {content.cards.map((c, i) => (
          <CardFace key={`${c.id}-${i}`} card={c} index={i} />
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-cosmos-50 p-4">
        <Section title="El tema de tu tirada" symbol="✦" text={content.overview} />
      </div>

      <div className="mt-6 space-y-4">
        {content.cards.map((c, i) => (
          <div key={`${c.id}-m-${i}`}>
            <p className="font-display text-ink">
              <span className="text-silver">{i + 1}.</span> {c.position} · {c.name}
              {c.reversed && (
                <span className="ml-2 text-xs uppercase text-gold-600">invertida</span>
              )}
            </p>
            <p className="mt-1 leading-relaxed text-graphite">{c.meaning}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-5 border-t border-slate-200 pt-6">
        <Section title="La lectura, en conjunto" symbol="☽" text={content.synthesis} />
        <Section title="Tu consejo para hoy" symbol="♥" text={content.advice} />
      </div>
    </Card>
  );
}

/** Cuerpo premium: formulario + resultado + historial. */
function AdvancedTarotBody() {
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
    // El crédito lo concede el webhook; refrescamos la cuota un par de veces.
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
  // ¿Necesita pagar para esta tirada? (incluida usada y sin créditos del tipo),
  // o el backend ya respondió payment_required para este tipo.
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
    <>
      <Card padding="lg">
        <CardTitle>Elige tu tirada</CardTitle>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {ADVANCED_SPREADS.map((s) => {
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
                <span className="flex items-center justify-between">
                  <span className="font-medium text-ink">{s.label}</span>
                  <span className="text-xs font-semibold text-cosmos-600">
                    {s.cards} cartas
                  </span>
                </span>
                <span className="mt-1 block text-sm text-graphite">
                  {s.description}
                </span>
              </button>
            );
          })}
        </div>

        <label
          htmlFor="adv-tarot-question"
          className="mt-5 block text-sm font-medium text-graphite"
        >
          ¿Sobre qué quieres preguntar? (opcional)
        </label>
        <textarea
          id="adv-tarot-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={300}
          rows={2}
          placeholder="Ej.: ¿Hacia dónde va esta etapa de mi vida?"
          className="mt-1.5 w-full resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-cosmos-400 focus:outline-none focus:ring-2 focus:ring-cosmos-200"
        />

        {sq && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-mist/60 px-3 py-2 text-sm text-graphite">
            <span aria-hidden="true">✨</span> {quotaLabel()}
          </div>
        )}

        <div className="mt-5">
          {needsPayment ? (
            <Button
              variant="premium"
              onClick={onBuy}
              disabled={buy.isPending}
              size="lg"
            >
              {buy.isPending
                ? 'Abriendo el pago…'
                : `Hacer otra ${spreadLabel} por ${EXTRA_PRICE}`}
            </Button>
          ) : (
            <Button onClick={onDraw} disabled={draw.isPending} size="lg">
              {draw.isPending
                ? 'Barajando y leyendo las cartas…'
                : 'Hacer mi tirada avanzada'}
            </Button>
          )}
        </div>

        {needsPayment && (
          <p className="mt-3 text-sm text-graphite">
            Ya has usado tu tirada de <strong>{spreadLabel}</strong> incluida de
            este mes. Puedes hacer todas las que quieras por{' '}
            <strong>{EXTRA_PRICE}</strong> cada una; el mes que viene tendrás otra
            incluida.
          </p>
        )}
        {draw.data?.status === 'unavailable' && (
          <p className="mt-3 text-sm text-graphite">{draw.data.message}</p>
        )}
        {draw.isError && (
          <p className="mt-3 text-sm text-red-600">
            No se pudo hacer la tirada. Inténtalo de nuevo en un momento.
          </p>
        )}
      </Card>

      {draw.isPending ? (
        <Card padding="lg" className="mt-6 text-center text-silver">
          Las cartas se están ordenando para ti…
        </Card>
      ) : fresh ? (
        <div className="mt-6">
          <ReadingView
            spread={fresh.spread}
            question={fresh.question}
            content={fresh.content}
          />
        </div>
      ) : null}

      {/* Historial de tiradas anteriores */}
      {history.data && history.data.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl text-ink">Tus tiradas anteriores</h2>
          <div className="mt-4 space-y-3">
            {history.data
              .filter((r) => r.id !== fresh?.id)
              .map((r) => (
                <details
                  key={r.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-ink">
                      {SPREAD_LABEL[r.spread_type]}
                      {r.question && (
                        <span className="ml-2 font-normal italic text-silver">
                          «{r.question}»
                        </span>
                      )}
                    </span>
                    <span className="text-silver">{formatDate(r.created_at)}</span>
                  </summary>
                  <div className="mt-4">
                    <ReadingView
                      spread={r.spread_type}
                      question={r.question}
                      content={r.content}
                    />
                  </div>
                </details>
              ))}
          </div>
        </div>
      )}
    </>
  );
}

export function AdvancedTarotPage() {
  return (
    <>
      <Helmet>
        <title>{`Tarot avanzado · ${company.brand}`}</title>
        <meta
          name="description"
          content="Tiradas de tarot avanzadas: Cruz Celta de 10 cartas y Herradura de 7, interpretadas a fondo para tu momento vital."
        />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href={`${company.siteUrl}/tarot/avanzado`} />
      </Helmet>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <header>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">
            Tarot avanzado
          </h1>
          <p className="mt-3 max-w-xl text-graphite">
            Las tiradas que de verdad despliegan tu historia: la Cruz Celta y la
            Herradura, leídas carta a carta y tejidas en un único relato. Tu plan
            incluye una tirada de cada una al mes; las extra, {EXTRA_PRICE} cada
            una.
          </p>
        </header>

        <div className="mt-8 space-y-6">
          <PremiumGate
            title="Las tiradas avanzadas te esperan"
            description="La tirada de una y tres cartas es solo el comienzo. Suscríbete y desbloquea la Cruz Celta (10 cartas) y la Herradura (7 cartas), con una lectura profunda y personal —además de todo Zodiaq sin anuncios."
          >
            <AdvancedTarotBody />
          </PremiumGate>
        </div>
      </div>
    </>
  );
}
