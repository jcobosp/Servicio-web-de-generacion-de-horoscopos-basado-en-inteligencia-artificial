import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import { Sparkles, Flame, Zap, ArrowUpRight } from 'lucide-react';
import { Seo, JsonLd, articleSchema } from '@/lib/seo';
import { AreaTabs } from './AreaTabs';
import { HoroscopeCard } from './HoroscopeCard';
import { SignPicker } from './SignPicker';
import { UpsellCard } from './UpsellCard';
import { AdSlot } from '@/components/ads/AdSlot';
import { Section } from '@/components/layout/Section';
import { StarfieldBackground } from '@/components/visual/StarfieldBackground';
import { Reveal } from '@/components/motion/Reveal';
import { GeneratingLoader } from '@/components/feedback/GeneratingLoader';
import { SCOPE_META } from '@/features/horoscope/types';
import type { Area, Scope } from '@/features/horoscope/types';
import { useHoroscope } from '@/features/horoscope/hooks';
import { ZODIAC, ZODIAC_SIGNS } from '@/lib/zodiac';
import type { ZodiacSign, ZodiacInfo } from '@/lib/zodiac';
import type { ThemeKey } from '@/lib/feature-theme';
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

/** Cada elemento del zodiaco hereda un tema de color para el loader. */
const ELEMENT_THEME: Record<ZodiacInfo['element'], ThemeKey> = {
  fuego: 'energy',
  tierra: 'numen',
  aire: 'celeste',
  agua: 'astral',
};

const ELEMENT_LABEL: Record<ZodiacInfo['element'], string> = {
  fuego: 'Fuego',
  tierra: 'Tierra',
  aire: 'Aire',
  agua: 'Agua',
};

/** Estrellas decorativas deterministas del hero (% y retardo). */
const STARS: { top: number; left: number; size: number; delay: number }[] = [
  { top: 18, left: 14, size: 3, delay: 0 },
  { top: 28, left: 86, size: 2, delay: 0.7 },
  { top: 62, left: 9, size: 2, delay: 1.3 },
  { top: 72, left: 90, size: 3, delay: 0.4 },
  { top: 40, left: 95, size: 2, delay: 1.1 },
  { top: 80, left: 28, size: 2, delay: 0.9 },
  { top: 14, left: 62, size: 2, delay: 1.6 },
  { top: 84, left: 68, size: 3, delay: 0.5 },
  { top: 48, left: 46, size: 2, delay: 2.0 },
];

/** Hero a sangre con el color del signo + selector de periodo (tema tiempo). */
function HoroscopeHero({
  info,
  scope,
}: {
  info: ZodiacInfo;
  scope: Scope;
}) {
  const meta = SCOPE_META[scope];

  return (
    <Section width="full" className="px-3 pt-4 sm:px-4 lg:px-6">
      <Reveal>
        <div
          className="relative isolate overflow-hidden rounded-[2.5rem] px-6 py-12 text-white shadow-lift sm:px-12 sm:py-16 lg:py-20"
          style={{
            backgroundImage: `linear-gradient(135deg, ${info.colors.primary}, ${info.colors.from} 55%, ${info.colors.to})`,
          }}
        >
          {/* Tinte oscuro para contraste AA del texto blanco sobre cualquier signo */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/35 via-black/20 to-black/55"
          />
          {/* Auras en movimiento */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-16 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl animate-drift"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 bottom-0 h-72 w-72 rounded-full bg-white/15 blur-3xl animate-float-slow"
          />
          {/* Estrellas */}
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

          <div className="relative z-10 flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.14em] ring-1 ring-white/30 backdrop-blur">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {meta.title}
            </span>
            <h1 className="mt-6 font-display text-7xl font-extrabold leading-[0.9] tracking-[-0.035em] [text-shadow:0_2px_24px_rgba(0,0,0,0.35)] sm:text-8xl lg:text-[9rem]">
              {info.name}
            </h1>
            <p className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xl font-medium text-white/90">
              <span>{info.dates}</span>
              <span aria-hidden="true" className="text-white/50">
                ·
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-base ring-1 ring-white/25">
                {ELEMENT_LABEL[info.element]}
              </span>
            </p>

            {/* Selector de periodo (tema tiempo), centrado */}
            <nav
              aria-label="Periodo"
              className="mt-9 inline-flex gap-1.5 rounded-2xl bg-white/15 p-1.5 ring-1 ring-white/25 backdrop-blur"
            >
              {(['daily', 'weekly', 'monthly'] as const).map((s) => (
                <NavLink
                  key={s}
                  to={`/horoscopo/${SCOPE_META[s].path}/${info.slug}`}
                  end
                  className={[
                    'rounded-xl px-5 py-2.5 text-center text-sm font-bold capitalize transition-all duration-200 ease-cosmic sm:px-7',
                    s === scope
                      ? 'bg-white text-ink shadow-lift'
                      : 'text-white/85 hover:bg-white/10 hover:text-white',
                  ].join(' ')}
                >
                  {SCOPE_META[s].label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/** Card llamativa que cruza hacia la energía del día (gratuita). */
function EnergyPromoCard({ to, signName }: { to: string; signName?: string }) {
  return (
    <Link
      to={to}
      className="group relative block overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-700 p-8 text-white shadow-lift transition-all duration-300 ease-cosmic hover:-translate-y-1 sm:p-10"
    >
      {/* Aura + icono fantasma */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-10 h-44 w-44 rounded-full bg-white/20 blur-3xl animate-drift"
      />
      <Zap
        aria-hidden="true"
        strokeWidth={1.3}
        className="pointer-events-none absolute -bottom-8 -right-4 h-48 w-48 text-white/10 transition-transform duration-500 ease-cosmic group-hover:scale-110 group-hover:-rotate-6"
      />
      {STARS.slice(0, 5).map((s, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full bg-white/80 animate-twinkle"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      <div className="relative max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-bold uppercase tracking-[0.14em] ring-1 ring-white/30 backdrop-blur">
          <Zap className="h-4 w-4" aria-hidden="true" /> Gratis · hoy
        </span>
        <h3 className="mt-4 font-display text-3xl font-extrabold leading-[1.05] tracking-tight [text-shadow:0_2px_18px_rgba(0,0,0,0.3)] sm:text-4xl">
          {signName
            ? `¿Cómo viene hoy la energía de ${signName}?`
            : '¿Cómo viene hoy tu energía?'}
        </h3>
        <p className="mt-3 text-lg text-white/90">
          Descubre tu nivel del 1 al 10, en qué poner el foco y qué cuidar.
        </p>
        <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-5 py-2.5 text-base font-bold ring-1 ring-white/30 backdrop-blur transition-colors duration-300 group-hover:bg-white/30">
          Ver la energía del día
          <ArrowUpRight
            className="h-4 w-4 transition-transform duration-300 ease-cosmic group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
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

  // Sin signo resuelto: hero de invitación + rejilla de signos.
  if (!sign || !info) {
    return (
      <>
        <Seo
          title={`${meta.title} · ${company.brand}`}
          description={`Consulta tu horóscopo ${meta.label} gratis, por signo y por área: amor, salud, dinero y trabajo.`}
          path={`/horoscopo/${meta.path}`}
        />
        <Section width="full" className="px-3 pt-4 sm:px-4 lg:px-6">
          <Reveal>
            <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-cosmos-900 via-violet-950 to-slate-950 px-6 py-16 text-center text-white shadow-lift sm:px-12 sm:py-24">
              <StarfieldBackground variant="cosmos" intensity="bold" />
              <span className="relative z-10 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.14em] ring-1 ring-white/30 backdrop-blur">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {meta.title}
              </span>
              <h1 className="relative z-10 mx-auto mt-6 max-w-3xl font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
                Elige tu signo
              </h1>
              <p className="relative z-10 mx-auto mt-5 max-w-xl text-lg text-white/90">
                Léelo {meta.label} y por cada área de tu vida.{' '}
                {!session && 'Si te registras, lo verás siempre sin elegirlo.'}
              </p>
            </div>
          </Reveal>
        </Section>

        <Section width="xwide" className="py-10">
          <Reveal>
            <SignPicker hrefFor={(slug) => `/horoscopo/${meta.path}/${slug}`} />
          </Reveal>
          <Reveal className="mt-10">
            <EnergyPromoCard to="/energia-del-dia" />
          </Reveal>
          <AdSlot className="mt-10" />
        </Section>
      </>
    );
  }

  return (
    <>
      <Seo
        title={`${meta.title} de ${info.name} · ${company.brand}`}
        description={`Horóscopo ${meta.label} de ${info.name} para ${meta.periodHint}: amor, salud, dinero y trabajo. Escrito a diario con IA.`}
        path={`/horoscopo/${meta.path}/${info.slug}`}
        type="article"
      />
      <JsonLd
        data={articleSchema({
          headline: `${meta.title} de ${info.name}`,
          description: `Horóscopo ${meta.label} de ${info.name} para ${meta.periodHint}: amor, salud, dinero y trabajo.`,
          path: `/horoscopo/${meta.path}/${info.slug}`,
          datePublished:
            (query.data?.status === 'ok' && query.data.period_start) ||
            new Date().toISOString().slice(0, 10),
        })}
      />

      <HoroscopeHero info={info} scope={scope} />

      <Section width="xwide" className="py-10">
        <Reveal>
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-graphite">
            <Flame className="h-4 w-4" style={{ color: info.colors.primary }} />
            Por área de tu vida
          </div>
          <div className="mt-4">
            <AreaTabs
              value={area}
              onChange={setArea}
              accentColor={info.colors.primary}
            />
          </div>
        </Reveal>

        <div className="mt-7">
          {query.isPending ? (
            <GeneratingLoader
              variant={ELEMENT_THEME[info.element]}
              colors={{ from: info.colors.primary, to: info.colors.to }}
              message="Leyendo los astros…"
              hint={`Preparando el horóscopo ${meta.label} de ${info.name}.`}
            />
          ) : (
            <Reveal>
              <HoroscopeCard
                isLoading={false}
                isError={query.isError}
                data={query.data}
                accent={info.colors.primary}
              />
            </Reveal>
          )}
        </div>

        <Reveal className="mt-8">
          <EnergyPromoCard
            to={`/energia-del-dia/${info.slug}`}
            signName={info.name}
          />
        </Reveal>

        <UpsellCard
          variant={scope}
          premiumHook={premiumHook}
          {...(scope === 'daily' ? { to: '/carta-natal/completa' } : {})}
        />

        <AdSlot className="mt-8" />

        <div className="mt-14 border-t border-slate-200 pt-10">
          <SignPicker
            hrefFor={(slug) => `/horoscopo/${meta.path}/${slug}`}
            title="Consulta otro signo"
          />
        </div>
      </Section>
    </>
  );
}
