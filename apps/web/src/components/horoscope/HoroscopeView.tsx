import { useEffect, useRef, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AreaTabs } from './AreaTabs';
import { HoroscopeCard } from './HoroscopeCard';
import { SignPicker } from './SignPicker';
import { UpsellCard } from './UpsellCard';
import { AdSlot } from '@/components/ads/AdSlot';
import { SCOPE_META } from '@/features/horoscope/types';
import type { Area, Scope } from '@/features/horoscope/types';
import { useHoroscope } from '@/features/horoscope/hooks';
import { ZODIAC, ZODIAC_SIGNS } from '@/lib/zodiac';
import type { ZodiacSign } from '@/lib/zodiac';
import { useAuth } from '@/features/auth/AuthProvider';
import { useProfile } from '@/features/profile/hooks';
import { useRegisterVisit } from '@/features/streaks/hooks';
import { company } from '@/features/legal/company';

interface HoroscopeViewProps {
  scope: Scope;
}

function isZodiacSign(value: string | undefined): value is ZodiacSign {
  return Boolean(value && (ZODIAC_SIGNS as readonly string[]).includes(value));
}

export function HoroscopeView({ scope }: HoroscopeViewProps) {
  const { sign: signParam } = useParams();
  const { session } = useAuth();
  const { data: profile } = useProfile();
  const registerVisit = useRegisterVisit();
  const visitRegistered = useRef(false);

  const [area, setArea] = useState<Area>('general');

  // Resolución del signo: parámetro de URL → signo del perfil → ninguno.
  const paramSign = isZodiacSign(signParam) ? signParam : null;
  const profileSign = (profile?.sun_sign as ZodiacSign | undefined) ?? null;
  const sign = paramSign ?? profileSign;

  const meta = SCOPE_META[scope];
  const info = sign ? ZODIAC[sign] : null;

  const query = useHoroscope(sign, scope, area);

  // Registrar la visita diaria (racha) una vez, si hay sesión y es el scope
  // diario. La RPC es idempotente por día.
  useEffect(() => {
    if (scope !== 'daily' || !session || visitRegistered.current) return;
    visitRegistered.current = true;
    registerVisit.mutate();
  }, [scope, session, registerVisit]);

  const premiumHook =
    query.data?.status === 'ok' ? query.data.content.premium_hook : undefined;

  // Sin signo resuelto: invitar a elegir uno.
  if (!sign || !info) {
    return (
      <>
        <Helmet>
          <title>{`${meta.title} · ${company.brand}`}</title>
          <meta
            name="description"
            content={`Consulta tu horóscopo ${meta.label} gratis, por signo y por área: amor, salud, dinero y trabajo.`}
          />
        </Helmet>
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <header className="text-center">
            <h1 className="font-display text-3xl text-ink sm:text-4xl">
              {meta.title}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-graphite">
              Elige tu signo para leer tu horóscopo {meta.label}.{' '}
              {!session && (
                <>
                  Si te registras, lo verás siempre sin elegirlo.
                </>
              )}
            </p>
          </header>
          <div className="mt-8">
            <SignPicker scope={scope} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${meta.title} de ${info.name} · ${company.brand}`}</title>
        <meta
          name="description"
          content={`Horóscopo ${meta.label} de ${info.name} para ${meta.periodHint}: amor, salud, dinero y trabajo. Escrito a diario con IA.`}
        />
        <link
          rel="canonical"
          href={`${company.siteUrl}/horoscopo/${meta.path}/${info.slug}`}
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
              {meta.title} de {info.name}
            </h1>
            <p className="text-sm text-silver">{info.dates}</p>
          </div>
        </header>

        <nav
          aria-label="Periodo"
          className="mt-6 flex gap-1 rounded-xl bg-mist p-1"
        >
          {(['daily', 'weekly', 'monthly'] as const).map((s) => (
            <NavLink
              key={s}
              to={`/horoscopo/${SCOPE_META[s].path}/${info.slug}`}
              end
              className={({ isActive }) =>
                [
                  'flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium capitalize transition',
                  isActive
                    ? 'bg-white text-cosmos-700 shadow-sm'
                    : 'text-graphite hover:text-ink',
                ].join(' ')
              }
            >
              {SCOPE_META[s].label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6">
          <AreaTabs value={area} onChange={setArea} />
        </div>

        <div className="mt-6">
          <HoroscopeCard
            isLoading={query.isPending}
            isError={query.isError}
            data={query.data}
            accent={info.colors.primary}
          />
        </div>

        <UpsellCard scope={scope} premiumHook={premiumHook} />

        <AdSlot className="mt-8" />

        <div className="mt-12 border-t border-slate-200 pt-8">
          <SignPicker scope={scope} title="Consulta otro signo" />
        </div>
      </div>
    </>
  );
}
