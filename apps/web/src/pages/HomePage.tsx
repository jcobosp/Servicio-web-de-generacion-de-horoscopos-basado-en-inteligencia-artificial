import { Link } from 'react-router-dom';
import {
  Sun,
  Zap,
  Telescope,
  Wand2,
  Orbit,
  Heart,
  Hash,
  Compass,
  HeartHandshake,
  FileText,
  Layers,
  Sigma,
  ArrowRight,
  ArrowUpRight,
  Check,
  Quote,
  Sparkles,
  UserPlus,
  Star,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Seo, JsonLd, websiteSchema, organizationSchema } from '@/lib/seo';
import { ZODIAC_SIGNS, ZODIAC } from '@/lib/zodiac';
import { Card } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { AdSlot } from '@/components/ads/AdSlot';
import { Section } from '@/components/layout/Section';
import { HeroBanner } from '@/components/visual/HeroBanner';
import { StarfieldBackground } from '@/components/visual/StarfieldBackground';
import { FeatureBentoCard } from '@/components/visual/FeatureBentoCard';
import { Shine } from '@/components/visual/Shine';
import { Reveal, RevealStagger, RevealItem } from '@/components/motion/Reveal';
import type { ThemeKey } from '@/lib/feature-theme';
import { cn } from '@/lib/cn';
import { useAuth } from '@/features/auth/AuthProvider';
import { useIsPremium } from '@/features/billing/hooks';

interface BentoFeature {
  icon: LucideIcon;
  theme: ThemeKey;
  title: string;
  phrase: ReactNode;
  /** Etiqueta corta que distingue la card. */
  tag?: string;
  path: string;
  premium?: boolean;
  featured?: boolean;
  /** Clases de span del grid: define el tamaño/espacio de la card. */
  span: string;
}

const freeFeatures: BentoFeature[] = [
  {
    icon: Sun,
    theme: 'cosmos',
    title: 'Horóscopo diario',
    phrase: (
      <>
        Lo que hoy te tienen preparado los astros, <Shine gold>por tu signo</Shine>{' '}
        y por cada área de tu vida.
      </>
    ),
    tag: 'Cada día',
    path: '/horoscopo/diario',
    featured: true,
    span: 'sm:col-span-2 lg:col-span-3 lg:row-span-2',
  },
  {
    icon: Wand2,
    theme: 'tarot',
    title: 'Tarot intuitivo',
    phrase: (
      <>
        Tira las cartas y deja que respondan{' '}
        <Shine gold>lo que llevas días rondando</Shine>.
      </>
    ),
    tag: '78 cartas',
    path: '/tarot/simple',
    span: 'lg:col-span-3',
  },
  {
    icon: Zap,
    theme: 'energy',
    title: 'Energía del día',
    phrase: (
      <>
        Tu nivel <Shine gold>del 1 al 10</Shine> y dónde poner el foco hoy.
      </>
    ),
    tag: 'Hoy',
    path: '/energia-del-dia',
    span: 'lg:col-span-3',
  },
  {
    icon: Orbit,
    theme: 'astral',
    title: 'Carta natal',
    phrase: (
      <>
        Sol, Luna y Ascendente: los tres pilares de{' '}
        <Shine gold>por qué eres como eres</Shine>.
      </>
    ),
    tag: 'Sol · Luna · Asc',
    path: '/carta-natal/basica',
    featured: true,
    span: 'sm:col-span-2 lg:col-span-2 lg:row-span-2',
  },
  {
    icon: Telescope,
    theme: 'celeste',
    title: 'Eventos astrológicos',
    phrase: (
      <>
        Las lunas e ingresos del mes y <Shine gold>qué remueven en ti</Shine>.
      </>
    ),
    tag: 'Este mes',
    path: '/eventos-astrologicos',
    span: 'lg:col-span-2',
  },
  {
    icon: Heart,
    theme: 'amor',
    title: 'Compatibilidad',
    phrase: (
      <>
        Vuestros dos signos, cara a cara: <Shine gold>chispa</Shine>, roces y futuro.
      </>
    ),
    tag: '2 signos',
    path: '/compatibilidad',
    span: 'lg:col-span-2',
  },
  {
    icon: Hash,
    theme: 'numen',
    title: 'Numerología',
    phrase: (
      <>
        Tu <Shine gold>número del camino de vida</Shine> y tu año personal, a
        partir de tu fecha de nacimiento.
      </>
    ),
    tag: 'Tu número',
    path: '/numerologia',
    span: 'sm:col-span-2 lg:col-span-4',
  },
];

const premiumFeatures: BentoFeature[] = [
  {
    icon: FileText,
    theme: 'cosmos',
    title: 'Reportes mensuales y anuales',
    phrase: (
      <>
        Informes largos con tus tránsitos del periodo: <Shine gold>tu guion</Shine>{' '}
        para el mes y para el año.
      </>
    ),
    path: '/reportes/mensual',
    premium: true,
    featured: true,
    span: 'sm:col-span-2 lg:col-span-3 lg:row-span-2',
  },
  {
    icon: Compass,
    theme: 'astral',
    title: 'Carta natal completa',
    phrase: (
      <>
        10 planetas, 12 casas y sus aspectos. <Shine gold>El mapa entero</Shine>{' '}
        de quién eres.
      </>
    ),
    path: '/carta-natal/completa',
    premium: true,
    span: 'lg:col-span-3',
  },
  {
    icon: HeartHandshake,
    theme: 'amor',
    title: 'Compatibilidad avanzada',
    phrase: (
      <>
        <Shine gold>Sinastría real</Shine> entre dos cartas, sin filtros ni atajos.
      </>
    ),
    path: '/compatibilidad/avanzada',
    premium: true,
    span: 'lg:col-span-3',
  },
  {
    icon: Layers,
    theme: 'tarot',
    title: 'Tarot avanzado',
    phrase: (
      <>
        Cruz Celta y Herradura, carta a carta, para tus{' '}
        <Shine gold>decisiones grandes</Shine>.
      </>
    ),
    path: '/tarot/avanzado',
    premium: true,
    span: 'lg:col-span-3',
  },
  {
    icon: Sigma,
    theme: 'numen',
    title: 'Numerología personal',
    phrase: (
      <>
        Tu <Shine gold>retrato numerológico completo</Shine>, narrado para ti.
      </>
    ),
    path: '/numerologia/avanzada',
    premium: true,
    span: 'lg:col-span-3',
  },
];

const steps = [
  {
    icon: UserPlus,
    title: 'Crea tu cuenta gratis',
    text: 'Solo tu email y tu fecha de nacimiento. Calculamos tu signo al instante, sin que tengas que elegirlo.',
  },
  {
    icon: Star,
    title: 'Cuéntanos lo justo',
    text: 'Tu hora y lugar de nacimiento (opcional) desbloquean tu Ascendente y tu carta natal completa.',
  },
  {
    icon: Sparkles,
    title: 'Recibe tu lectura',
    text: 'Contenido escrito con IA, distinto cada día y pensado para ti. Vuelve mañana: nunca se repite.',
  },
];

const testimonials = [
  {
    quote:
      'Daba un poco de respeto lo mucho que acertaba con mi carta natal. Me sentí leída de verdad.',
    name: 'Lucía',
    sign: 'Escorpio',
  },
  {
    quote:
      'Lo abro cada mañana con el café. Es mi pequeño ritual antes de empezar el día.',
    name: 'Marcos',
    sign: 'Tauro',
  },
  {
    quote:
      'La compatibilidad avanzada nos dio temas de conversación para una semana. Brutal.',
    name: 'Elena',
    sign: 'Géminis',
  },
];

const faqs = [
  {
    q: '¿De verdad es gratis?',
    a: 'Sí. El horóscopo diario, el tarot, la carta natal básica, la compatibilidad y la numerología son gratuitas. El plan Premium añade las versiones avanzadas y quita los anuncios.',
  },
  {
    q: '¿Quién escribe las lecturas?',
    a: 'Las genera inteligencia artificial (Google Gemini) a partir de tu signo, tu carta y la fecha, con un estilo cuidado para que te resulte cercano y útil.',
  },
  {
    q: '¿Necesito saber mi hora de nacimiento?',
    a: 'No para empezar. Con tu fecha ya calculamos tu signo y tu horóscopo. La hora y el lugar son opcionales y desbloquean tu Ascendente y la carta natal completa.',
  },
  {
    q: '¿Qué incluye el plan Premium?',
    a: 'Carta natal completa, compatibilidad avanzada, reportes mensuales y anuales, tarot complejo, numerología personal y una experiencia totalmente sin anuncios.',
  },
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Cuando quieras, desde tu perfil, sin permanencia ni preguntas. Seguirás teniendo Premium hasta el final del periodo que ya pagaste.',
  },
];

/** Kicker de sección: chip pequeño en versales sobre el color indicado. */
function Kicker({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-[0.14em]',
        className,
      )}
    >
      {children}
    </span>
  );
}

function FeatureBento({
  features,
  isPremium,
}: {
  features: BentoFeature[];
  isPremium: boolean;
}) {
  return (
    <RevealStagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:auto-rows-[264px]">
      {features.map((f) => {
        const locked = Boolean(f.premium) && !isPremium;
        const to = locked ? '/premium' : f.path;
        const cta = f.premium
          ? isPremium
            ? 'Abrir'
            : 'Desbloquear'
          : 'Probar gratis';
        return (
          <RevealItem key={f.path} className={f.span}>
            <FeatureBentoCard
              to={to}
              theme={f.theme}
              icon={f.icon}
              title={f.title}
              phrase={f.phrase}
              cta={cta}
              premium={Boolean(f.premium)}
              featured={Boolean(f.featured)}
              className="h-full"
              {...(f.tag ? { tag: f.tag } : {})}
            />
          </RevealItem>
        );
      })}
    </RevealStagger>
  );
}

export function HomePage() {
  const { session } = useAuth();
  const isPremium = useIsPremium();

  // Botón principal blanco (máximo contraste sobre el gradiente) + secundario
  // fantasma blanco con aro. Pensados para ir sobre la card de color del hero.
  const heroSolid = '!border-transparent shadow-lift';
  const heroGhost = '!text-white ring-1 ring-white/45 hover:!bg-white/10';
  const heroActions = !session ? (
    <>
      <LinkButton to="/registro" size="xl" variant="secondary" className={heroSolid}>
        Empezar gratis
      </LinkButton>
      <LinkButton to="/premium" size="xl" variant="ghost" className={heroGhost}>
        Ver Premium
      </LinkButton>
    </>
  ) : (
    <>
      <LinkButton
        to="/horoscopo/diario"
        size="xl"
        variant="secondary"
        className={heroSolid}
      >
        Mi horóscopo de hoy
      </LinkButton>
      <LinkButton
        to={isPremium ? '/carta-natal/completa' : '/premium'}
        size="xl"
        variant="ghost"
        className={heroGhost}
      >
        {isPremium ? 'Mi carta natal' : 'Hazte Premium'}
      </LinkButton>
    </>
  );

  return (
    <>
      <Seo
        title="Zodiaq · Tu horóscopo, como nunca te lo han contado"
        description="Horóscopos diarios, semanales y mensuales personalizados por tu signo. Carta natal, tarot y compatibilidad escritos por inteligencia artificial."
        path="/"
      />
      <JsonLd data={websiteSchema()} />
      <JsonLd data={organizationSchema()} />

      {/* Hero — card gigante centrada */}
      <HeroBanner
        variant="cosmos"
        kicker={
          <>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Astrología con inteligencia artificial
          </>
        }
        title={
          <>
            Tu horóscopo, <Shine gold>como nunca</Shine> te lo han contado.
          </>
        }
        subtitle="Lecturas escritas con IA, personalizadas por tu signo y pensadas para que te sientas visto. Cada día algo distinto. Cada lectura, algo que te suena."
        actions={heroActions}
      />

      {/* Tira de stats */}
      <Section width="xwide" className="py-6">
        <RevealStagger className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { big: '12', small: 'signos, todas las áreas' },
            { big: 'Cada día', small: 'contenido nuevo, nunca repetido' },
            { big: 'IA', small: 'Google Gemini 2.5' },
            { big: 'Gratis', small: 'para empezar hoy' },
          ].map((s) => (
            <RevealItem key={s.small}>
              <Card padding="lg" className="h-full text-center">
                <p className="font-display text-4xl font-extrabold text-cosmos-700 sm:text-5xl lg:text-6xl">
                  {s.big}
                </p>
                <p className="mt-2 text-base font-medium text-graphite sm:text-lg">
                  {s.small}
                </p>
              </Card>
            </RevealItem>
          ))}
        </RevealStagger>
      </Section>

      {/* Cómo funciona */}
      <Section width="xwide" className="py-8" aria-labelledby="how-heading">
        <Reveal className="mb-7">
          <Kicker className="text-cosmos-600">Empezar es muy fácil</Kicker>
          <h2
            id="how-heading"
            className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl"
          >
            Tres pasos y las estrellas son tuyas
          </h2>
        </Reveal>
        <RevealStagger className="grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <RevealItem key={s.title}>
                <Card padding="lg" className="h-full">
                  <div className="flex items-center gap-3">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cosmos-600 via-aurora-500 to-tarot-500 text-white shadow-soft">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span className="font-display text-4xl font-extrabold text-cosmos-200">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-bold text-ink sm:text-3xl">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-graphite sm:text-lg">
                    {s.text}
                  </p>
                </Card>
              </RevealItem>
            );
          })}
        </RevealStagger>
      </Section>

      {/* Funcionalidades gratuitas — bento */}
      <Section width="xwide" className="py-8" aria-labelledby="free-heading">
        <Reveal className="mb-7">
          <Kicker className="text-cosmos-600">Gratis para siempre</Kicker>
          <h2
            id="free-heading"
            className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl"
          >
            Todo lo que necesitas para empezar tu día
          </h2>
          <p className="mt-3 text-lg text-graphite">
            Siete formas de mirarte al espejo del cielo, sin pagar nada y con{' '}
            <Shine>contenido nuevo constantemente</Shine>.
          </p>
        </Reveal>
        <FeatureBento features={freeFeatures} isPremium={isPremium} />
      </Section>

      {/* Anuncio 1 */}
      <Section width="xwide" className="py-3">
        <AdSlot />
      </Section>

      {/* Horóscopo por signo (enlaces SEO) */}
      <Section width="xwide" className="py-8" aria-labelledby="signs-heading">
        <Reveal className="mb-6 text-center">
          <h2
            id="signs-heading"
            className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl"
          >
            Tu horóscopo de hoy, por signo
          </h2>
          <p className="mt-2 text-graphite">
            Cada signo con su energía, su ritmo y su forma de leer el mundo.
          </p>
        </Reveal>
        <Reveal>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {ZODIAC_SIGNS.map((slug) => (
              <Link
                key={slug}
                to={`/horoscopo/diario/${slug}`}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-base font-semibold text-graphite shadow-soft transition-all duration-200 ease-cosmic hover:-translate-y-0.5 hover:border-cosmos-300 hover:text-cosmos-700 hover:shadow-lift"
              >
                {ZODIAC[slug].name}
              </Link>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* Funcionalidades premium — bento */}
      <Section width="xwide" className="py-8" aria-labelledby="premium-heading">
        <Reveal className="mb-7">
          <Kicker className="text-gold-700">
            <Sparkles className="h-4 w-4" aria-hidden="true" /> Plan Premium
          </Kicker>
          <h2
            id="premium-heading"
            className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl"
          >
            Cuando quieras ir más profundo
          </h2>
          <p className="mt-3 text-lg text-graphite">
            Las herramientas que usan los astrólogos de verdad, narradas para ti y{' '}
            <Shine>sin un solo anuncio</Shine>.
          </p>
        </Reveal>
        <FeatureBento features={premiumFeatures} isPremium={isPremium} />
      </Section>

      {/* Anuncio 2 */}
      <Section width="xwide" className="py-3">
        <AdSlot />
      </Section>

      {/* Comparativa free vs premium */}
      <Section width="xwide" className="py-8" aria-labelledby="compare-heading">
        <Reveal className="mb-7 text-center">
          <h2
            id="compare-heading"
            className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl"
          >
            Gratis está genial. Premium es otra cosa.
          </h2>
        </Reveal>
        <div className="grid items-stretch gap-6 md:grid-cols-2">
          <Reveal direction="right" className="h-full">
            <div className="flex h-full flex-col rounded-3xl border-2 border-cosmos-100 bg-white p-8 shadow-soft">
              <span className="inline-flex w-fit items-center rounded-full bg-cosmos-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cosmos-700">
                Plan gratuito
              </span>
              <h3 className="mt-3 font-display text-5xl font-extrabold tracking-tight text-cosmos-700 sm:text-6xl">
                Gratis
              </h3>
              <p className="mt-2 text-lg font-medium text-graphite">
                Para tu día a día.
              </p>
              <ul className="mt-6 space-y-3.5">
                {[
                  'Horóscopo diario, semanal y mensual',
                  'Energía del día y eventos astrológicos',
                  'Tarot diario y carta natal básica',
                  'Compatibilidad y numerología',
                ].map((t) => (
                  <li
                    key={t}
                    className="flex items-start gap-3 text-lg text-graphite"
                  >
                    <Check className="mt-0.5 h-6 w-6 flex-shrink-0 text-cosmos-600" />
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-8">
                <LinkButton to="/registro" variant="secondary" fullWidth>
                  Empezar gratis
                </LinkButton>
              </div>
            </div>
          </Reveal>
          <Reveal direction="left" className="h-full">
            <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-cosmos-900 via-violet-950 to-slate-950 p-8 text-white shadow-lift ring-1 ring-white/15">
              <StarfieldBackground variant="cosmos" intensity="bold" />
              <span className="relative inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white ring-1 ring-white/25 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" /> El favorito
              </span>
              <h3 className="relative mt-3 font-display text-5xl font-extrabold tracking-tight text-white [text-shadow:0_0_32px_rgba(255,255,255,0.32)] sm:text-6xl">
                Premium
              </h3>
              <p className="relative mt-2 text-lg text-white/85">
                Para conocerte de verdad.
              </p>
              <ul className="relative mt-6 space-y-3.5">
                {[
                  'Todo lo gratuito, sin un solo anuncio',
                  'Carta natal completa y compatibilidad avanzada',
                  'Reportes mensuales y anuales personalizados',
                  'Tarot avanzado y numerología personal',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-lg text-white/95">
                    <Check className="mt-0.5 h-6 w-6 flex-shrink-0 text-white" />
                    {t}
                  </li>
                ))}
              </ul>
              <div className="relative mt-auto pt-8">
                <LinkButton
                  to="/premium"
                  variant="premium"
                  fullWidth
                  className="shadow-glow-gold"
                >
                  Ver Premium · desde 4,99 €
                </LinkButton>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Testimonios */}
      <Section width="xwide" className="py-8" aria-labelledby="testi-heading">
        <Reveal className="mb-7 text-center">
          <Kicker className="text-cosmos-600">Lo que dicen</Kicker>
          <h2
            id="testi-heading"
            className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl"
          >
            Gente que ya se mira distinto
          </h2>
        </Reveal>
        <RevealStagger className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <RevealItem key={t.name}>
              <Card padding="lg" className="h-full">
                <Quote className="h-10 w-10 text-cosmos-300" aria-hidden="true" />
                <p className="mt-4 text-xl leading-relaxed text-graphite sm:text-2xl">
                  “{t.quote}”
                </p>
                <p className="mt-6 text-base font-bold text-ink">
                  {t.name}{' '}
                  <span className="font-medium text-silver">· {t.sign}</span>
                </p>
              </Card>
            </RevealItem>
          ))}
        </RevealStagger>
      </Section>

      {/* Anuncio 3 */}
      <Section width="xwide" className="py-3">
        <AdSlot />
      </Section>

      {/* FAQ */}
      <Section width="wide" className="py-8" aria-labelledby="faq-heading">
        <Reveal className="mb-8 text-center">
          <h2
            id="faq-heading"
            className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl"
          >
            Preguntas frecuentes
          </h2>
        </Reveal>
        <Reveal>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition open:shadow-lift"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold text-ink">
                  {f.q}
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-cosmos-600 transition-transform duration-300 group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-graphite">{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* CTA final */}
      <Section width="xwide" className="pb-16 pt-2">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cosmos-700 via-aurora-600 to-tarot-600 bg-animated px-6 py-16 text-white shadow-lift animate-gradient sm:px-12 sm:py-24">
            <StarfieldBackground variant="cosmos" intensity="bold" />
            <div className="relative mx-auto max-w-4xl text-center">
              <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                Llevas años leyendo el horóscopo.
                <br />
                Es hora de que el horóscopo{' '}
                <span className="text-glow">te lea a ti.</span>
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-white/85 sm:text-xl">
                Crea tu cuenta gratis en menos de un minuto y descubre qué tienen
                que contarte hoy las estrellas.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <LinkButton
                  to={session ? '/horoscopo/diario' : '/registro'}
                  size="lg"
                  variant="premium"
                  className="shadow-glow-gold"
                  rightIcon={<ArrowUpRight className="h-5 w-5" />}
                >
                  {session ? 'Ver mi horóscopo' : 'Empezar gratis'}
                </LinkButton>
                <LinkButton
                  to="/premium"
                  size="lg"
                  variant="ghost"
                  className="!text-white hover:!bg-white/10"
                >
                  Descubrir Premium
                </LinkButton>
              </div>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
