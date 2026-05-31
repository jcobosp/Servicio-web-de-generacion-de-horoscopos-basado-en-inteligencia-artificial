import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { LinkButton } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { AdSlot } from '@/components/ads/AdSlot';
import { useAuth } from '@/features/auth/AuthProvider';
import { useProfile } from '@/features/profile/hooks';
import { useFreeNumerology } from '@/features/numerology/hooks';
import type { NumerologyMeaning } from '@/features/numerology/types';
import { company } from '@/features/legal/company';

function isValidDate(v: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(new Date(v).getTime());
}

/** Disco con el número y su gradiente. */
function NumberDisc({ n }: { n: number }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cosmos-600 via-aurora-600 to-cosmos-900 font-display text-3xl text-white shadow-sm"
    >
      {n}
    </span>
  );
}

function MeaningCard({
  number,
  label,
  meaning,
}: {
  number: number;
  label: string;
  meaning: NumerologyMeaning;
}) {
  return (
    <Card padding="lg">
      <div className="flex items-center gap-4">
        <NumberDisc n={number} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-cosmos-700">
            {label}
          </p>
          <h2 className="font-display text-2xl text-ink">{meaning.headline}</h2>
          {meaning.tagline && (
            <p className="mt-0.5 text-sm text-silver">{meaning.tagline}</p>
          )}
        </div>
      </div>

      <p className="mt-5 leading-relaxed text-graphite">{meaning.essence}</p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-cosmos-700">
            En el amor
          </p>
          <p className="mt-1 leading-relaxed text-graphite">{meaning.love}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-cosmos-700">
            En el trabajo
          </p>
          <p className="mt-1 leading-relaxed text-graphite">{meaning.work}</p>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-cosmos-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-cosmos-700">
          Tu consejo
        </p>
        <p className="mt-1 leading-relaxed text-graphite">{meaning.advice}</p>
      </div>
    </Card>
  );
}

export function NumerologyPage() {
  const { session } = useAuth();
  const { data: profile } = useProfile();

  // Prefill con la fecha del perfil (si hay sesión); si no, vacío.
  const [date, setDate] = useState('');
  const [prefilledFor, setPrefilledFor] = useState<string | null>(null);
  if (profile && profile.id !== prefilledFor) {
    setPrefilledFor(profile.id);
    if (profile.birth_date) setDate(profile.birth_date);
  }

  const enabled = isValidDate(date);
  const { data, isPending, isFetching } = useFreeNumerology(enabled ? date : null);
  const loading = enabled && (isPending || isFetching);

  return (
    <>
      <Helmet>
        <title>{`Numerología: tu número del camino de vida · ${company.brand}`}</title>
        <meta
          name="description"
          content="Calcula gratis tu número del camino de vida y tu año personal a partir de tu fecha de nacimiento, y descubre qué dicen de tu carácter, tu amor y tu momento actual."
        />
        <link rel="canonical" href={`${company.siteUrl}/numerologia`} />
      </Helmet>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <header>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">Numerología</h1>
          <p className="mt-3 max-w-2xl text-graphite">
            Tu fecha de nacimiento esconde dos números que lo cuentan casi todo: tu{' '}
            <strong>camino de vida</strong> —quién eres en esencia— y tu{' '}
            <strong>año personal</strong> —el ciclo que estás viviendo ahora—.
            Calcúlalos gratis.
          </p>
        </header>

        <Card padding="lg" className="mt-8">
          <Input
            type="date"
            label="Tu fecha de nacimiento"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {!enabled && (
            <p className="mt-2 text-sm text-silver">
              Introduce tu fecha de nacimiento para ver tus números.
            </p>
          )}
        </Card>

        <div className="mt-8 space-y-6">
          {loading ? (
            <Card padding="lg">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-2xl" />
                <Skeleton className="h-8 w-56" />
              </div>
              <div className="mt-6 space-y-2.5">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </Card>
          ) : data ? (
            <>
              {data.lifePathMeaning && (
                <MeaningCard
                  number={data.lifePath}
                  label="Tu número del camino de vida"
                  meaning={data.lifePathMeaning}
                />
              )}
              {data.personalYearMeaning && (
                <MeaningCard
                  number={data.personalYear}
                  label={`Tu año personal ${data.year}`}
                  meaning={data.personalYearMeaning}
                />
              )}

              {/* Upsell hacia la numerología personal (premium) */}
              <Card tone="premium" padding="lg">
                <div aria-hidden="true" className="absolute -right-6 -top-6 text-8xl opacity-10">
                  🔢
                </div>
                <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gold-600">
                  <span aria-hidden="true">✨</span> Tu retrato numerológico
                </p>
                <h3 className="mt-2 font-display text-2xl text-ink">
                  Dos números son solo el principio
                </h3>
                <p className="mt-3 max-w-2xl leading-relaxed text-graphite">
                  Lo que acabas de leer es la base. Tu lectura numerológica personal
                  entreteje tu camino de vida con tu año y tu mes personal en un
                  retrato único, escrito solo para ti y para el momento exacto que
                  estás viviendo. Incluso puedes orientarla a esa pregunta que te
                  ronda.
                </p>
                <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                  <LinkButton to="/numerologia/avanzada" variant="premium" size="lg">
                    Descubrir mi lectura personal →
                  </LinkButton>
                  <span className="text-sm text-silver">
                    Una lectura al mes · incluida en Premium
                  </span>
                </div>
              </Card>

            </>
          ) : enabled ? (
            <Card padding="lg" className="text-center text-silver">
              No pudimos calcular tus números. Revisa tu fecha de nacimiento.
            </Card>
          ) : null}
        </div>

        {!session && enabled && (
          <Card padding="lg" className="mt-6 text-center">
            <p className="text-graphite">
              Crea tu cuenta para guardar tus números y desbloquear tu lectura
              numerológica personal.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <LinkButton to="/registro" variant="primary">
                Crear cuenta
              </LinkButton>
            </div>
          </Card>
        )}

        <AdSlot className="mt-8" />
      </div>
    </>
  );
}
