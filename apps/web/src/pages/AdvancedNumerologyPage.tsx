import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/Toast';
import { PremiumGate } from '@/components/billing/PremiumGate';
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Chip con un número y su etiqueta. */
function NumberChip({ n, label }: { n: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-graphite">
      <span
        aria-hidden="true"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cosmos-600 to-cosmos-900 text-xs font-semibold text-white"
      >
        {n}
      </span>
      {label}
    </span>
  );
}

function NumbersRow({ numbers }: { numbers: NumerologyNumbers }) {
  return (
    <div className="flex flex-wrap gap-2">
      <NumberChip n={numbers.life_path} label="Camino de vida" />
      <NumberChip n={numbers.personal_year} label={`Año personal ${numbers.year}`} />
      <NumberChip n={numbers.personal_month} label="Mes personal" />
      <NumberChip n={numbers.birthday} label="Día de nacimiento" />
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
  numbers,
  focus,
  content,
}: {
  numbers: NumerologyNumbers;
  focus: string | null;
  content: NumerologyReadingContent;
}) {
  return (
    <Card padding="lg">
      <CardTitle>{content.headline}</CardTitle>
      {focus && (
        <p className="mt-2 text-sm italic text-silver">Tu enfoque: «{focus}»</p>
      )}
      <div className="mt-4">
        <NumbersRow numbers={numbers} />
      </div>

      <div className="mt-6 space-y-5">
        <Section title="Quién eres" symbol="✦" text={content.portrait} />
        <Section title="Tu propósito" symbol="🧭" text={content.purpose} />
        <Section title="Tus dones y tus sombras" symbol="☯" text={content.strengths} />
        <Section title="Tu momento actual" symbol="🌙" text={content.cycle} />
        <Section title="El amor y tus vínculos" symbol="♥" text={content.love} />
      </div>

      <div className="mt-6 rounded-xl bg-cosmos-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-cosmos-700">
          Tu consejo
        </p>
        <p className="mt-1 leading-relaxed text-graphite">{content.advice}</p>
      </div>
    </Card>
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
    <>
      <Card padding="lg">
        {previewNumbers && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wider text-cosmos-700">
              Tus números
            </p>
            <div className="mt-2">
              <NumbersRow numbers={previewNumbers} />
            </div>
          </>
        )}

        <label
          htmlFor="num-focus"
          className="mt-5 block text-sm font-medium text-graphite"
        >
          ¿Quieres orientar la lectura a algo? (opcional)
        </label>
        <textarea
          id="num-focus"
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          maxLength={300}
          rows={2}
          placeholder="Ej.: mi rumbo profesional, una decisión que tengo entre manos…"
          className="mt-1.5 w-full resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-cosmos-400 focus:outline-none focus:ring-2 focus:ring-cosmos-200"
        />

        {q && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-mist/60 px-3 py-2 text-sm text-graphite">
            <span aria-hidden="true">✨</span> {quotaLabel()}
          </div>
        )}

        <div className="mt-5">
          {needsPayment ? (
            <Button variant="premium" onClick={onBuy} disabled={buy.isPending} size="lg">
              {buy.isPending ? 'Abriendo el pago…' : `Otra lectura por ${EXTRA_PRICE}`}
            </Button>
          ) : (
            <Button onClick={onGenerate} disabled={gen.isPending} size="lg">
              {gen.isPending ? 'Leyendo tus números…' : 'Generar mi lectura personal'}
            </Button>
          )}
        </div>

        {needsPayment && (
          <p className="mt-3 text-sm text-graphite">
            Ya has usado tu lectura incluida de este mes. Puedes generar todas las que
            quieras por <strong>{EXTRA_PRICE}</strong> cada una; el mes que viene
            tendrás otra incluida.
          </p>
        )}
        {gen.data?.status === 'missing_data' && (
          <p className="mt-3 text-sm text-graphite">{gen.data.message}</p>
        )}
        {gen.data?.status === 'unavailable' && (
          <p className="mt-3 text-sm text-graphite">{gen.data.message}</p>
        )}
        {gen.isError && (
          <p className="mt-3 text-sm text-red-600">
            No se pudo generar la lectura. Inténtalo de nuevo en un momento.
          </p>
        )}
      </Card>

      {gen.isPending ? (
        <Card padding="lg" className="mt-6">
          <Skeleton className="h-7 w-64" />
          <div className="mt-6 space-y-2.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </Card>
      ) : fresh ? (
        <div className="mt-6">
          <ReadingView
            numbers={fresh.numbers}
            focus={fresh.focus}
            content={fresh.content}
          />
        </div>
      ) : null}

      {/* Historial */}
      {history.data && history.data.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl text-ink">Tus lecturas anteriores</h2>
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
                      {r.content.headline || 'Lectura numerológica'}
                      {r.focus && (
                        <span className="ml-2 font-normal italic text-silver">
                          «{r.focus}»
                        </span>
                      )}
                    </span>
                    <span className="text-silver">{formatDate(r.created_at)}</span>
                  </summary>
                  <div className="mt-4">
                    <ReadingView
                      numbers={r.numbers}
                      focus={r.focus}
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

export function AdvancedNumerologyPage() {
  return (
    <>
      <Helmet>
        <title>{`Numerología personal · ${company.brand}`}</title>
        <meta
          name="description"
          content="Tu lectura numerológica personal: un retrato único que entreteje tu camino de vida con tu año y mes personal, escrito para tu momento exacto."
        />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href={`${company.siteUrl}/numerologia/avanzada`} />
      </Helmet>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <header>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">
            Numerología personal
          </h1>
          <p className="mt-3 max-w-2xl text-graphite">
            Más allá de los números sueltos, esta lectura entreteje tu camino de vida
            con el ciclo que estás viviendo y lo narra solo para ti. Tu plan incluye
            una lectura al mes; las extra, {EXTRA_PRICE} cada una.
          </p>
        </header>

        <div className="mt-8 space-y-6">
          <PremiumGate
            title="La numerología personal es premium"
            description="Suscríbete y desbloquea tu retrato numerológico personal: un texto único que integra tu camino de vida con tu año y tu mes personal, orientado a lo que tú elijas. Incluye una lectura al mes —además de todo Zodiaq sin anuncios."
          >
            <AdvancedNumerologyBody />
          </PremiumGate>
        </div>
      </div>
    </>
  );
}
