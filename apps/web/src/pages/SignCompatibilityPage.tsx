import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import type { BadgeTone } from '@/components/ui/Badge';
import { LinkButton } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { AdSlot } from '@/components/ads/AdSlot';
import { useSignCompatibility } from '@/features/sign-compat/hooks';
import type { SignCompatReport } from '@/features/sign-compat/types';
import { ZODIAC, ZODIAC_SIGNS } from '@/lib/zodiac';
import type { ZodiacSign } from '@/lib/zodiac';
import { company } from '@/features/legal/company';

const SIGN_OPTIONS = ZODIAC_SIGNS.map((slug) => ({
  value: slug,
  label: `${ZODIAC[slug].glyph}  ${ZODIAC[slug].name}`,
}));

function scoreTone(score: number): BadgeTone {
  if (score >= 78) return 'success';
  if (score >= 55) return 'cosmos';
  return 'warning';
}

function scoreWord(score: number): string {
  if (score >= 85) return 'Conexión excepcional';
  if (score >= 70) return 'Muy buena sintonía';
  if (score >= 55) return 'Compatibilidad con matices';
  if (score >= 48) return 'Relación cuesta arriba';
  return 'Choque de energías';
}

/** Disco con el glifo del signo y su gradiente. */
function SignBubble({ sign }: { sign: ZodiacSign }) {
  const info = ZODIAC[sign];
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        aria-hidden="true"
        className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl text-white shadow-sm"
        style={{ backgroundImage: `linear-gradient(135deg, ${info.colors.from}, ${info.colors.to})` }}
      >
        {info.glyph}
      </span>
      <span className="text-sm font-medium text-ink">{info.name}</span>
    </div>
  );
}

function Section({ title, symbol, text }: { title: string; symbol: string; text: string }) {
  return (
    <section>
      <h3 className="flex items-center gap-2 font-display text-lg text-ink">
        <span aria-hidden="true">{symbol}</span> {title}
      </h3>
      <p className="mt-1 leading-relaxed text-graphite">{text}</p>
    </section>
  );
}

function Result({ report }: { report: SignCompatReport }) {
  const c = report.content;
  return (
    <>
      <Card padding="lg">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-4">
            <SignBubble sign={report.sign_a} />
            <span aria-hidden="true" className="text-2xl text-silver">
              ✦
            </span>
            <SignBubble sign={report.sign_b} />
          </div>
          <div className="mt-5 flex items-baseline gap-1">
            <span className="font-display text-5xl text-ink">{report.score}</span>
            <span className="text-xl text-silver">/100</span>
          </div>
          <Badge tone={scoreTone(report.score)} className="mt-2">
            {scoreWord(report.score)}
          </Badge>
          <h2 className="mt-4 font-display text-2xl text-ink">{c.headline}</h2>
          <p className="mt-2 max-w-2xl leading-relaxed text-graphite">{c.overview}</p>
        </div>

        <div className="mt-8 space-y-6">
          <Section title="Amor y romance" symbol="❤️" text={c.love} />
          <Section title="Pasión y química" symbol="🔥" text={c.passion} />
          <Section title="Comunicación" symbol="💬" text={c.communication} />
          <div className="grid gap-6 sm:grid-cols-2">
            <Section title="Lo que os une" symbol="✨" text={c.strengths} />
            <Section title="Vuestros retos" symbol="⚡" text={c.challenges} />
          </div>
          <div className="rounded-xl bg-cosmos-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-cosmos-700">
              El consejo de los astros
            </p>
            <p className="mt-1 leading-relaxed text-graphite">{c.advice}</p>
          </div>
        </div>
      </Card>

      {/* Upsell hacia la compatibilidad avanzada (premium) */}
      <Card tone="premium" padding="lg" className="mt-8">
        <div aria-hidden="true" className="absolute -right-6 -top-6 text-8xl opacity-10">
          💞
        </div>
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gold-600">
          <span aria-hidden="true">✨</span> Vuestra historia real
        </p>
        <h3 className="mt-2 font-display text-2xl text-ink">
          Dos signos no cuentan toda la verdad
        </h3>
        <p className="mt-3 max-w-2xl leading-relaxed text-graphite">
          Lo que acabas de leer es el mapa general entre {ZODIAC[report.sign_a].name} y{' '}
          {ZODIAC[report.sign_b].name}. Pero vuestra química real se esconde en algo
          más profundo: vuestras Lunas, vuestros Venus y Marte y los aspectos exactos
          entre vuestras dos cartas. Ahí está el "por qué" de lo que sentís. Descúbrelo
          con vuestros nombres, fechas y lugares reales.
        </p>
        <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <LinkButton to="/compatibilidad/avanzada" variant="premium" size="lg">
            Calcular nuestra compatibilidad real →
          </LinkButton>
          <span className="text-sm text-silver">
            Análisis personalizado · incluido en Premium
          </span>
        </div>
      </Card>
    </>
  );
}

export function SignCompatibilityPage() {
  const [signA, setSignA] = useState<ZodiacSign>('aries');
  const [signB, setSignB] = useState<ZodiacSign>('leo');
  const { data: report, isPending } = useSignCompatibility(signA, signB);

  return (
    <>
      <Helmet>
        <title>{`Compatibilidad de signos del zodiaco · ${company.brand}`}</title>
        <meta
          name="description"
          content="Descubre la compatibilidad entre dos signos del zodiaco: amor, pasión, comunicación y los retos de cada pareja, con su puntuación de afinidad."
        />
        <link rel="canonical" href={`${company.siteUrl}/compatibilidad`} />
      </Helmet>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <header>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">
            Compatibilidad de signos
          </h1>
          <p className="mt-3 max-w-2xl text-graphite">
            Elige dos signos y descubre cómo se llevan en el amor, la pasión y el
            día a día. Cada combinación tiene su propia historia… y su puntuación
            de afinidad.
          </p>
        </header>

        <Card padding="lg" className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Primer signo"
              options={SIGN_OPTIONS}
              value={signA}
              onChange={(e) => setSignA(e.target.value as ZodiacSign)}
            />
            <Select
              label="Segundo signo"
              options={SIGN_OPTIONS}
              value={signB}
              onChange={(e) => setSignB(e.target.value as ZodiacSign)}
            />
          </div>
        </Card>

        <div className="mt-8">
          {isPending ? (
            <Card padding="lg">
              <Skeleton className="mx-auto h-16 w-40" />
              <div className="mt-6 space-y-2.5">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </Card>
          ) : report ? (
            <Result report={report} />
          ) : (
            <Card padding="lg" className="text-center text-silver">
              No encontramos esta combinación. Prueba con otros dos signos.
            </Card>
          )}
        </div>

        <AdSlot className="mt-8" />
      </div>
    </>
  );
}
