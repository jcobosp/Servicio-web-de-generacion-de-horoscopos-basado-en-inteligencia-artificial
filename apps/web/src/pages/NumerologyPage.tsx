import { useState } from 'react';
import {
  Hash, Heart, Briefcase, Lightbulb, Sparkles, Sigma, Calendar,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Seo } from '@/lib/seo';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { LinkButton } from '@/components/ui/Button';
import { Section } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { GeneratingLoader } from '@/components/feedback/GeneratingLoader';
import { AdSlot } from '@/components/ads/AdSlot';
import { useAuth } from '@/features/auth/AuthProvider';
import { useProfile } from '@/features/profile/hooks';
import { useFreeNumerology } from '@/features/numerology/hooks';
import type { NumerologyMeaning } from '@/features/numerology/types';
import { company } from '@/features/legal/company';

function isValidDate(v: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(new Date(v).getTime());
}

/** Vértices de un polígono regular de `sides` lados, radio `r`, en viewBox 100. */
function polyPoints(sides: number, r: number, rotDeg = 0): string {
  const pts: string[] = [];
  for (let k = 0; k < sides; k++) {
    const a = ((k / sides) * 360 + rotDeg - 90) * (Math.PI / 180);
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}

/** Flor de la vida girando, de fondo (geometría sagrada). */
function SacredGeometryBg() {
  const centers: [number, number][] = [[50, 50]];
  for (let k = 0; k < 6; k++) {
    const a = (k * 60) * (Math.PI / 180);
    centers.push([50 + 14 * Math.cos(a), 50 + 14 * Math.sin(a)]);
  }
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 opacity-20"
    >
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full animate-spin-slow"
        style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
      >
        {centers.map(([cx, cy], idx) => (
          <circle key={idx} cx={cx} cy={cy} r={14} fill="none" stroke="#ffffff" strokeWidth={0.4} />
        ))}
        <circle cx={50} cy={50} r={28} fill="none" stroke="#ffffff" strokeWidth={0.4} />
        <polygon points={polyPoints(12, 40)} fill="none" stroke="#ffffff" strokeWidth={0.3} />
        <polygon points={polyPoints(6, 40)} fill="none" stroke="#ffffff" strokeWidth={0.3} />
      </svg>
    </span>
  );
}

/** Número gigante en un emblema de geometría sagrada (dodecágono + estrella). */
function SacredNumber({ n }: { n: number }) {
  const big = String(n).length > 1;
  const gid = `num-grad-${n}`;
  return (
    <div className="relative mx-auto aspect-square w-44 sm:w-52">
      <span aria-hidden="true" className="absolute inset-[16%] rounded-full bg-emerald-300/30 blur-2xl" />
      <svg viewBox="0 0 100 100" className="relative h-full w-full">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        <g className="animate-spin-slow" style={{ transformOrigin: 'center', transformBox: 'fill-box' }}>
          <polygon points={polyPoints(12, 46)} fill="none" stroke="#fcd34d" strokeOpacity={0.4} strokeWidth={0.5} />
          <polygon points={polyPoints(6, 40)} fill="none" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={0.5} />
          <polygon points={polyPoints(6, 40, 30)} fill="none" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={0.5} />
          {Array.from({ length: 12 }, (_, k) => {
            const a = ((k / 12) * 360 - 90) * (Math.PI / 180);
            return (
              <circle
                key={k}
                cx={50 + 46 * Math.cos(a)}
                cy={50 + 46 * Math.sin(a)}
                r={0.9}
                fill="#fcd34d"
                fillOpacity={0.7}
              />
            );
          })}
        </g>
        <circle cx={50} cy={50} r={30} fill="none" stroke="#ffffff" strokeOpacity={0.2} strokeWidth={0.4} />
        <text
          x={50}
          y={50}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={big ? 32 : 44}
          fontWeight={800}
          fill={`url(#${gid})`}
          className="font-display"
          style={{ filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.45))' }}
        >
          {n}
        </text>
      </svg>
    </div>
  );
}

/** Subbloque (amor / trabajo) del lado claro. */
function SubBlock({
  Icon,
  title,
  text,
  color,
}: {
  Icon: LucideIcon;
  title: string;
  text: string;
  color: string;
}) {
  return (
    <div>
      <p
        className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.08em]"
        style={{ color }}
      >
        <Icon className="h-4 w-4" aria-hidden="true" /> {title}
      </p>
      <p className="mt-1.5 leading-relaxed text-graphite">{text}</p>
    </div>
  );
}

/** Card partida: emblema geométrico (oscuro) + significado (claro). */
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
    <Card padding="none" className="relative overflow-hidden">
      <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
        {/* Emblema sobre fondo numen oscuro */}
        <div className="relative flex flex-col items-center justify-center gap-5 overflow-hidden bg-gradient-to-br from-emerald-700 via-teal-800 to-emerald-950 p-8 text-center text-white">
          <SacredGeometryBg />
          <p className="relative z-10 text-sm font-bold uppercase tracking-[0.16em] text-emerald-200/80">
            {label}
          </p>
          <div className="relative z-10">
            <SacredNumber n={number} />
          </div>
          <div className="relative z-10">
            <h2 className="font-display text-3xl font-extrabold tracking-tight [text-shadow:0_2px_14px_rgba(0,0,0,0.3)]">
              {meaning.headline}
            </h2>
            {meaning.tagline && (
              <p className="mt-1 text-emerald-100/80">{meaning.tagline}</p>
            )}
          </div>
        </div>

        {/* Significado en claro */}
        <div className="p-7 sm:p-9">
          <p className="text-lg leading-relaxed text-graphite">{meaning.essence}</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <SubBlock Icon={Heart} title="En el amor" text={meaning.love} color="#e11d48" />
            <SubBlock Icon={Briefcase} title="En el trabajo" text={meaning.work} color="#0d9488" />
          </div>
          <div className="mt-6 rounded-2xl border-2 border-emerald-100 bg-emerald-50 p-5">
            <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.1em] text-emerald-700">
              <Lightbulb className="h-5 w-5" aria-hidden="true" /> Tu consejo
            </p>
            <p className="mt-2 text-lg leading-relaxed text-ink">{meaning.advice}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function NumerologyPage() {
  const { session } = useAuth();
  const { data: profile } = useProfile();

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
      <Seo
        title={`Numerología: tu número del camino de vida · ${company.brand}`}
        description="Calcula gratis tu número del camino de vida y tu año personal a partir de tu fecha de nacimiento, y descubre qué dicen de tu carácter, tu amor y tu momento actual."
        path="/numerologia"
      />

      {/* Hero — geometría sagrada */}
      <Section width="full" className="px-3 pt-4 sm:px-4 lg:px-6">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-900 px-6 py-14 text-center text-white shadow-lift sm:px-12 sm:py-20">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/25 via-black/10 to-black/45"
            />
            <SacredGeometryBg />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 bottom-0 h-72 w-72 rounded-full bg-teal-200/25 blur-3xl animate-float-slow"
            />
            <div className="relative z-10 mx-auto max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.14em] ring-1 ring-white/30 backdrop-blur">
                <Hash className="h-4 w-4" aria-hidden="true" />
                Numerología
              </span>
              <h1 className="mt-6 font-display text-6xl font-extrabold leading-[0.9] tracking-[-0.035em] [text-shadow:0_2px_24px_rgba(0,0,0,0.35)] sm:text-7xl lg:text-8xl">
                Tus números de poder
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90">
                Tu fecha de nacimiento esconde dos claves: tu{' '}
                <strong className="font-bold">camino de vida</strong> —quién eres en
                esencia— y tu <strong className="font-bold">año personal</strong> —el
                ciclo que vives ahora—. Calcúlalos gratis.
              </p>
            </div>
          </div>
        </Reveal>
      </Section>

      <Section width="xwide" className="py-10">
        {/* Fecha */}
        <Reveal>
          <Card padding="lg" className="mx-auto max-w-xl">
            <Input
              type="date"
              label="Tu fecha de nacimiento"
              leftAddon={<Calendar className="h-4 w-4" />}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            {!enabled && (
              <p className="mt-2 text-sm text-silver">
                Introduce tu fecha de nacimiento para revelar tus números.
              </p>
            )}
          </Card>
        </Reveal>

        <div className="mt-8 space-y-6">
          {loading ? (
            <GeneratingLoader
              variant="numen"
              message="Calculando tus números…"
              hint="Reduciendo tu fecha a sus claves numerológicas."
            />
          ) : data ? (
            <>
              {data.lifePathMeaning && (
                <Reveal>
                  <MeaningCard
                    number={data.lifePath}
                    label="Tu número del camino de vida"
                    meaning={data.lifePathMeaning}
                  />
                </Reveal>
              )}
              {data.personalYearMeaning && (
                <Reveal>
                  <MeaningCard
                    number={data.personalYear}
                    label={`Tu año personal ${data.year}`}
                    meaning={data.personalYearMeaning}
                  />
                </Reveal>
              )}

              {/* Upsell hacia la numerología personal (premium) */}
              <Card tone="premium" padding="lg" className="relative overflow-hidden sm:p-10">
                <div className="grid items-center gap-8 lg:grid-cols-[1.25fr_1fr]">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-gold-700">
                      <Sparkles className="h-4 w-4" aria-hidden="true" /> Tu retrato numerológico
                    </p>
                    <h3 className="mt-3 font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-ink sm:text-5xl">
                      Dos números son solo el principio
                    </h3>
                    <p className="mt-4 text-xl leading-relaxed text-graphite">
                      Lo que acabas de leer es la base. Tu lectura numerológica
                      personal entreteje tu camino de vida con tu año y tu mes
                      personal en un retrato único, escrito solo para ti y para el
                      momento exacto que vives. Incluso puedes orientarla a esa
                      pregunta que te ronda.
                    </p>
                    <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                      <LinkButton to="/numerologia/avanzada" variant="premium" size="lg">
                        Descubrir mi lectura personal →
                      </LinkButton>
                      <span className="text-sm text-silver">
                        Una lectura al mes · incluida en Premium
                      </span>
                    </div>
                  </div>

                  {/* Arte: emblema geométrico que llena la derecha */}
                  <div className="relative flex min-h-[240px] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-800 to-emerald-950 p-6 text-white shadow-lift">
                    <SacredGeometryBg />
                    <Sparkles
                      aria-hidden="true"
                      className="pointer-events-none absolute right-7 top-7 h-6 w-6 text-gold-200 animate-twinkle"
                    />
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <Sigma
                        className="h-24 w-24 text-gold-300 drop-shadow-[0_0_22px_rgba(251,191,36,0.4)] sm:h-28 sm:w-28"
                        aria-hidden="true"
                      />
                      <p className="mt-4 font-display text-2xl font-extrabold">
                        Tu retrato completo
                      </p>
                      <p className="mt-1 text-sm font-medium text-emerald-100/80">
                        Camino · año · mes · día personal
                      </p>
                    </div>
                  </div>
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
            <p className="text-lg text-graphite">
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
      </Section>
    </>
  );
}
