import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { UpsellCard } from '@/components/horoscope/UpsellCard';
import { SignPicker } from '@/components/horoscope/SignPicker';
import { AdSlot } from '@/components/ads/AdSlot';
import { useDailyEnergy } from '@/features/daily-energy/hooks';
import { useAuth } from '@/features/auth/AuthProvider';
import { useProfile } from '@/features/profile/hooks';
import { ZODIAC, ZODIAC_SIGNS } from '@/lib/zodiac';
import type { ZodiacInfo, ZodiacSign } from '@/lib/zodiac';
import { company } from '@/features/legal/company';

const todayLabel = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
}).format(new Date());

function isZodiacSign(value: string | undefined): value is ZodiacSign {
  return Boolean(value && (ZODIAC_SIGNS as readonly string[]).includes(value));
}

function EnergyLevelBar({ level, info }: { level: number; info: ZodiacInfo }) {
  const pct = Math.max(0, Math.min(10, level)) * 10;
  return (
    <div>
      <div className="flex items-end justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-graphite">
          Nivel de energía
        </span>
        <span className="font-display text-2xl text-ink">{level}/10</span>
      </div>
      <div
        className="mt-2 h-3 w-full overflow-hidden rounded-full bg-mist"
        role="meter"
        aria-valuenow={level}
        aria-valuemin={1}
        aria-valuemax={10}
        aria-label={`Nivel de energía ${level} de 10`}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            backgroundImage: `linear-gradient(90deg, ${info.colors.from}, ${info.colors.to})`,
          }}
        />
      </div>
    </div>
  );
}

function EnergyBody({ sign, info }: { sign: ZodiacSign; info: ZodiacInfo }) {
  const { data, isPending, isError } = useDailyEnergy(sign);

  if (isPending) {
    return (
      <Card padding="lg">
        <Skeleton className="h-7 w-2/3" />
        <div className="mt-5 space-y-2.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </Card>
    );
  }

  if (isError || !data || data.status !== 'ok') {
    const message =
      data && 'message' in data
        ? data.message
        : 'La energía del día se está asentando. Vuelve en unos minutos.';
    return (
      <Card padding="lg" className="text-center">
        <div aria-hidden="true" className="text-4xl">
          🌙
        </div>
        <p className="mt-3 text-graphite">{message}</p>
      </Card>
    );
  }

  const c = data.content;

  return (
    <>
      <Card padding="lg">
        <div className="flex items-start gap-3">
          <span aria-hidden="true" className="text-3xl leading-none">
            {c.mood_emoji}
          </span>
          <div>
            <h2 className="font-display text-2xl text-ink sm:text-3xl">
              {c.headline}
            </h2>
            <Badge tone="cosmos" className="mt-2">
              {c.vibe}
            </Badge>
          </div>
        </div>

        <div className="mt-5">
          <EnergyLevelBar level={c.energy_level} info={info} />
        </div>

        <p className="mt-5 leading-relaxed text-graphite">{c.body}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-cosmos-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-cosmos-700">
              Pon el foco en
            </p>
            <p className="mt-1 text-sm text-graphite">{c.focus}</p>
          </div>
          <div className="rounded-xl bg-mist p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-graphite">
              Cuida hoy
            </p>
            <p className="mt-1 text-sm text-graphite">{c.caution}</p>
          </div>
        </div>
      </Card>

      <UpsellCard variant="energy" premiumHook={c.premium_hook} />
      <AdSlot className="mt-8" />
    </>
  );
}

export function EnergyOfDayPage() {
  const { sign: signParam } = useParams();
  const { session } = useAuth();
  const { data: profile } = useProfile();

  const paramSign = isZodiacSign(signParam) ? signParam : null;
  const profileSign = (profile?.sun_sign as ZodiacSign | undefined) ?? null;
  const sign = paramSign ?? profileSign;
  const info = sign ? ZODIAC[sign] : null;

  // Sin signo resuelto: elegir uno.
  if (!sign || !info) {
    return (
      <>
        <Helmet>
          <title>{`Energía del día · ${company.brand}`}</title>
          <meta
            name="description"
            content="La energía astrológica de hoy para tu signo: tu nivel del día, en qué poner el foco y qué cuidar."
          />
        </Helmet>
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <header className="text-center">
            <h1 className="font-display text-3xl text-ink sm:text-4xl">
              Energía del día
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-graphite">
              Elige tu signo para ver tu energía de hoy.{' '}
              {!session && 'Si te registras, la verás siempre sin elegirla.'}
            </p>
          </header>
          <div className="mt-8">
            <SignPicker hrefFor={(slug) => `/energia-del-dia/${slug}`} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Energía del día de ${info.name} · ${company.brand}`}</title>
        <meta
          name="description"
          content={`La energía astrológica de hoy para ${info.name}: tu nivel del día, en qué poner el foco y qué cuidar.`}
        />
        <link
          rel="canonical"
          href={`${company.siteUrl}/energia-del-dia/${info.slug}`}
        />
      </Helmet>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl text-white shadow-sm"
            style={{
              backgroundImage: `linear-gradient(135deg, ${info.colors.from}, ${info.colors.to})`,
            }}
          >
            {info.glyph}
          </span>
          <div>
            <h1 className="font-display text-2xl text-ink sm:text-3xl">
              Energía del día · {info.name}
            </h1>
            <p className="text-sm capitalize text-silver">{todayLabel}</p>
          </div>
        </header>

        <div className="mt-8">
          <EnergyBody sign={sign} info={info} />
        </div>

        <div className="mt-12 border-t border-slate-200 pt-8">
          <SignPicker
            hrefFor={(slug) => `/energia-del-dia/${slug}`}
            title="Ver la energía de otro signo"
          />
        </div>
      </div>
    </>
  );
}
