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
  Check,
  Quote,
  Sparkles,
  UserPlus,
  Star,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Seo, JsonLd, websiteSchema, organizationSchema } from '@/lib/seo';
import { ZODIAC_SIGNS, ZODIAC } from '@/lib/zodiac';
import { Card } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { AdSlot } from '@/components/ads/AdSlot';
import { Section } from '@/components/layout/Section';
import { Hero } from '@/components/visual/Hero';
import { CosmicBackground } from '@/components/visual/CosmicBackground';
import { Reveal, RevealStagger, RevealItem } from '@/components/motion/Reveal';
import { featureTheme } from '@/lib/feature-theme';
import type { ThemeKey } from '@/lib/feature-theme';
import { cn } from '@/lib/cn';
import { useAuth } from '@/features/auth/AuthProvider';
import { useIsPremium } from '@/features/billing/hooks';

interface Feature {
  icon: LucideIcon;
  theme: ThemeKey;
  title: string;
  description: string;
  path: string;
  premium?: boolean;
}

const freeFeatures: Feature[] = [
  {
    icon: Sun,
    theme: 'cosmos',
    title: 'Horóscopo diario',
    description:
      'Tu lectura de hoy por signo y por área —amor, salud, dinero y trabajo—, escrita para que te suene de verdad.',
    path: '/horoscopo/diario',
  },
  {
    icon: Zap,
    theme: 'energy',
    title: 'Energía del día',
    description:
      'Tu nivel energético de hoy del 1 al 10, en qué poner el foco y qué conviene cuidar antes de salir por la puerta.',
    path: '/energia-del-dia',
  },
  {
    icon: Telescope,
    theme: 'celeste',
    title: 'Eventos astrológicos',
    description:
      'Lunas nuevas, llenas e ingresos planetarios del mes, con su significado emocional para que no te pillen por sorpresa.',
    path: '/eventos-astrologicos',
  },
  {
    icon: Wand2,
    theme: 'tarot',
    title: 'Tarot intuitivo',
    description:
      'Una tirada diaria de una o tres cartas, interpretada para tu momento presente. La respuesta que buscabas, hoy.',
    path: '/tarot/simple',
  },
  {
    icon: Orbit,
    theme: 'astral',
    title: 'Carta natal',
    description:
      'Tu Sol, tu Luna y tu Ascendente interpretados juntos. Los tres pilares que explican por qué eres como eres.',
    path: '/carta-natal/basica',
  },
  {
    icon: Heart,
    theme: 'amor',
    title: 'Compatibilidad',
    description:
      'Elige dos signos y descubre qué os une, qué enciende la chispa y qué tendréis que aprender a cuidar.',
    path: '/compatibilidad',
  },
  {
    icon: Hash,
    theme: 'numen',
    title: 'Numerología',
    description:
      'Tu número del camino de vida y tu año personal a partir de tu fecha de nacimiento. Lo que los números dicen de ti.',
    path: '/numerologia',
  },
];

const premiumFeatures: Feature[] = [
  {
    icon: Compass,
    theme: 'astral',
    title: 'Carta natal completa',
    description:
      'Los 10 planetas, las 12 casas y sus aspectos, interpretados a fondo. El mapa completo de quién eres.',
    path: '/carta-natal/completa',
    premium: true,
  },
  {
    icon: HeartHandshake,
    theme: 'amor',
    title: 'Compatibilidad avanzada',
    description:
      'Sinastría real entre dos cartas: afinidad, amor, comunicación, roces y potencial a largo plazo.',
    path: '/compatibilidad/avanzada',
    premium: true,
  },
  {
    icon: FileText,
    theme: 'cosmos',
    title: 'Reportes mensuales y anuales',
    description:
      'Informes largos y personalizados con tus tránsitos del periodo. Tu guion para el mes y para el año.',
    path: '/reportes/mensual',
    premium: true,
  },
  {
    icon: Layers,
    theme: 'tarot',
    title: 'Tarot avanzado',
    description:
      'Tiradas profundas como la Cruz Celta y la Herradura, interpretadas posición a posición para tus grandes decisiones.',
    path: '/tarot/avanzado',
    premium: true,
  },
  {
    icon: Sigma,
    theme: 'numen',
    title: 'Numerología personal',
    description:
      'Tu retrato numerológico completo narrado, entretejiendo tu camino de vida con tu año y mes personal.',
    path: '/numerologia/avanzada',
    premium: true,
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

function FeatureCard({ feature, premium }: { feature: Feature; premium: boolean }) {
  const theme = featureTheme(feature.theme);
  const Icon = feature.icon;
  const isPremiumCard = Boolean(feature.premium);
  const href = isPremiumCard && !premium ? '/premium' : feature.path;
  const cta = isPremiumCard
    ? premium
      ? 'Abrir'
      : 'Desbloquear'
    : 'Probar gratis';

  return (
    <Link to={href} className="group block h-full">
      <Card
        hoverable
        padding="lg"
        className="relative flex h-full flex-col overflow-hidden"
      >
        <div
          aria-hidden="true"
          className={cn(
            'absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-40',
            theme.gradient,
          )}
        />
        <div className="relative flex items-center justify-between">
          <span
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-soft',
              theme.gradient,
            )}
          >
            <Icon className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
          </span>
          {isPremiumCard && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gold-50 px-2.5 py-0.5 text-xs font-bold text-gold-600">
              <Sparkles className="h-3 w-3" aria-hidden="true" /> Premium
            </span>
          )}
        </div>
        <h3 className="relative mt-4 font-display text-xl font-bold text-ink">
          {feature.title}
        </h3>
        <p className="relative mt-2 flex-1 text-sm leading-relaxed text-graphite">
          {feature.description}
        </p>
        <span
          className={cn(
            'relative mt-5 inline-flex items-center gap-1.5 text-sm font-semibold',
            theme.text,
          )}
        >
          {cta}
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </span>
      </Card>
    </Link>
  );
}

function HeroArt() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto hidden h-[420px] w-full max-w-md md:block"
    >
      {/* Card principal: horóscopo de hoy */}
      <div className="absolute left-2 top-6 w-64 animate-float rounded-2xl border border-slate-200 bg-white p-5 shadow-lift">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cosmos-600 to-aurora-500 text-white">
            <Sun className="h-6 w-6" />
          </span>
          <div>
            <p className="font-display text-sm font-bold text-ink">Horóscopo de hoy</p>
            <p className="text-xs text-silver">Tu energía cósmica</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-2.5 w-full rounded-full bg-cosmos-100" />
          <div className="h-2.5 w-5/6 rounded-full bg-cosmos-100" />
          <div className="h-2.5 w-2/3 rounded-full bg-cosmos-100" />
        </div>
      </div>

      {/* Card energía */}
      <div className="absolute right-0 top-0 w-44 animate-float-slow rounded-2xl border border-slate-200 bg-white p-4 shadow-lift">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-energy-600 to-gold-500 text-white">
            <Zap className="h-5 w-5" />
          </span>
          <p className="text-xs font-semibold text-graphite">Energía</p>
        </div>
        <div className="mt-3 flex items-end gap-1">
          {[5, 8, 6, 9, 7].map((h, i) => (
            <span
              key={i}
              className="w-2 rounded-full bg-gradient-to-t from-energy-500 to-gold-400"
              style={{ height: `${h * 5}px` }}
            />
          ))}
          <span className="ml-1 font-display text-lg font-bold text-energy-600">8</span>
        </div>
      </div>

      {/* Card tarot */}
      <div className="absolute bottom-2 right-6 w-52 animate-float rounded-2xl border border-slate-200 bg-white p-4 shadow-lift [animation-delay:1.2s]">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-tarot-600 to-aurora-600 text-white">
            <Wand2 className="h-5 w-5" />
          </span>
          <p className="text-xs font-semibold text-graphite">Tu carta de hoy</p>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="flex h-20 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-tarot-500 to-aurora-600 text-white shadow-soft">
            <Star className="h-5 w-5" />
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="h-2 w-20 rounded-full bg-tarot-100" />
            <div className="h-2 w-16 rounded-full bg-tarot-100" />
            <div className="h-2 w-20 rounded-full bg-tarot-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  const { session } = useAuth();
  const isPremium = useIsPremium();

  const heroActions = !session ? (
    <>
      <LinkButton to="/registro" size="lg" variant="primary">
        Empezar gratis
      </LinkButton>
      <LinkButton to="/premium" size="lg" variant="secondary">
        Ver Premium
      </LinkButton>
    </>
  ) : (
    <>
      <LinkButton to="/horoscopo/diario" size="lg" variant="primary">
        Mi horóscopo de hoy
      </LinkButton>
      <LinkButton
        to={isPremium ? '/carta-natal/completa' : '/premium'}
        size="lg"
        variant={isPremium ? 'secondary' : 'premium'}
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

      {/* Hero */}
      <Hero
        variant="cosmos"
        kicker={
          <>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Astrología con inteligencia artificial
          </>
        }
        title={
          <>
            Tu horóscopo,{' '}
            <span className="bg-gradient-to-r from-cosmos-600 via-aurora-500 to-tarot-500 bg-clip-text text-transparent">
              como nunca
            </span>{' '}
            te lo han contado.
          </>
        }
        subtitle="Lecturas escritas con IA, personalizadas por tu signo y pensadas para que te sientas visto. Cada día algo distinto. Cada lectura, algo que te suena."
        actions={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-3">{heroActions}</div>
          </div>
        }
        art={<HeroArt />}
      />

      {/* Sub-CTA de confianza */}
      <Section width="wide" className="-mt-2 pb-2">
        <Reveal>
          <p className="text-sm text-silver">
            Sin tarjeta · Sin permanencia · Sin spam · En español
          </p>
        </Reveal>
      </Section>

      {/* Tira de stats */}
      <Section width="wide" className="py-10">
        <RevealStagger className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { big: '12', small: 'signos, todas las áreas' },
            { big: 'Cada día', small: 'contenido nuevo, nunca repetido' },
            { big: 'IA', small: 'Google Gemini 2.5' },
            { big: '100%', small: 'en español' },
          ].map((s) => (
            <RevealItem key={s.small}>
              <Card padding="md" className="h-full text-center">
                <p className="font-display text-2xl font-bold text-cosmos-700 sm:text-3xl">
                  {s.big}
                </p>
                <p className="mt-1 text-sm text-graphite">{s.small}</p>
              </Card>
            </RevealItem>
          ))}
        </RevealStagger>
      </Section>

      {/* Cómo funciona */}
      <Section width="wide" className="py-14" aria-labelledby="how-heading">
        <Reveal className="mb-10 max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-wider text-cosmos-600">
            Empezar es muy fácil
          </span>
          <h2
            id="how-heading"
            className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl"
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
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cosmos-600 to-aurora-500 text-white shadow-soft">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="font-display text-2xl font-bold text-cosmos-200">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-graphite">
                    {s.text}
                  </p>
                </Card>
              </RevealItem>
            );
          })}
        </RevealStagger>
      </Section>

      {/* Funcionalidades gratuitas */}
      <Section width="wide" className="py-14" aria-labelledby="free-heading">
        <Reveal className="mb-10 max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-wider text-cosmos-600">
            Gratis para siempre
          </span>
          <h2
            id="free-heading"
            className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl"
          >
            Todo lo que necesitas para empezar tu día
          </h2>
          <p className="mt-3 text-graphite">
            Siete formas de mirarte al espejo del cielo, sin pagar nada y con
            contenido nuevo constantemente.
          </p>
        </Reveal>
        <RevealStagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {freeFeatures.map((f) => (
            <RevealItem key={f.path} className="h-full">
              <FeatureCard feature={f} premium={isPremium} />
            </RevealItem>
          ))}
        </RevealStagger>
      </Section>

      {/* Anuncio 1 */}
      <Section width="wide" className="py-4">
        <AdSlot />
      </Section>

      {/* Horóscopo por signo (enlaces SEO) */}
      <Section width="wide" className="py-12" aria-labelledby="signs-heading">
        <Reveal className="mb-6 text-center">
          <h2
            id="signs-heading"
            className="font-display text-2xl font-bold text-ink sm:text-3xl"
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
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-graphite shadow-soft transition hover:-translate-y-0.5 hover:border-cosmos-300 hover:text-cosmos-700"
              >
                {ZODIAC[slug].name}
              </Link>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* Funcionalidades premium */}
      <Section width="wide" className="py-14" aria-labelledby="premium-heading">
        <Reveal className="mb-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-gold-600">
            <Sparkles className="h-4 w-4" aria-hidden="true" /> Plan Premium
          </span>
          <h2
            id="premium-heading"
            className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl"
          >
            Cuando quieras ir más profundo
          </h2>
          <p className="mt-3 text-graphite">
            Las herramientas que usan los astrólogos de verdad, narradas para ti y
            sin un solo anuncio.
          </p>
        </Reveal>
        <RevealStagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {premiumFeatures.map((f) => (
            <RevealItem key={f.path} className="h-full">
              <FeatureCard feature={f} premium={isPremium} />
            </RevealItem>
          ))}
        </RevealStagger>
      </Section>

      {/* Anuncio 2 */}
      <Section width="wide" className="py-4">
        <AdSlot />
      </Section>

      {/* Comparativa free vs premium */}
      <Section width="wide" className="py-14" aria-labelledby="compare-heading">
        <Reveal className="mb-10 text-center">
          <h2
            id="compare-heading"
            className="font-display text-3xl font-bold text-ink sm:text-4xl"
          >
            Gratis está genial. Premium es otra cosa.
          </h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal direction="right">
            <Card padding="lg" className="h-full">
              <h3 className="font-display text-xl font-bold text-ink">Gratis</h3>
              <p className="mt-1 text-sm text-graphite">Para tu día a día.</p>
              <ul className="mt-5 space-y-3">
                {[
                  'Horóscopo diario, semanal y mensual',
                  'Energía del día y eventos astrológicos',
                  'Tarot diario y carta natal básica',
                  'Compatibilidad y numerología',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-graphite">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cosmos-600" />
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <LinkButton to="/registro" variant="secondary" fullWidth>
                  Empezar gratis
                </LinkButton>
              </div>
            </Card>
          </Reveal>
          <Reveal direction="left">
            <Card
              tone="premium"
              padding="lg"
              className="h-full bg-gradient-to-br from-cosmos-700 via-cosmos-600 to-aurora-500 text-white"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" /> El favorito
              </span>
              <h3 className="mt-3 font-display text-xl font-bold">Premium</h3>
              <p className="mt-1 text-sm text-white/85">Para conocerte de verdad.</p>
              <ul className="mt-5 space-y-3">
                {[
                  'Todo lo gratuito, sin un solo anuncio',
                  'Carta natal completa y compatibilidad avanzada',
                  'Reportes mensuales y anuales personalizados',
                  'Tarot avanzado y numerología personal',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-white/95">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-300" />
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <LinkButton
                  to="/premium"
                  variant="premium"
                  fullWidth
                  className="shadow-glow-gold"
                >
                  Ver Premium · desde 4,99 €
                </LinkButton>
              </div>
            </Card>
          </Reveal>
        </div>
      </Section>

      {/* Testimonios */}
      <Section width="wide" className="py-14" aria-labelledby="testi-heading">
        <Reveal className="mb-10 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-cosmos-600">
            Lo que dicen
          </span>
          <h2
            id="testi-heading"
            className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl"
          >
            Gente que ya se mira distinto
          </h2>
        </Reveal>
        <RevealStagger className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <RevealItem key={t.name}>
              <Card padding="lg" className="h-full">
                <Quote className="h-7 w-7 text-cosmos-300" aria-hidden="true" />
                <p className="mt-3 text-graphite">“{t.quote}”</p>
                <p className="mt-5 text-sm font-semibold text-ink">
                  {t.name}{' '}
                  <span className="font-normal text-silver">· {t.sign}</span>
                </p>
              </Card>
            </RevealItem>
          ))}
        </RevealStagger>
      </Section>

      {/* Anuncio 3 */}
      <Section width="wide" className="py-4">
        <AdSlot />
      </Section>

      {/* FAQ */}
      <Section width="default" className="py-14" aria-labelledby="faq-heading">
        <Reveal className="mb-8 text-center">
          <h2
            id="faq-heading"
            className="font-display text-3xl font-bold text-ink sm:text-4xl"
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
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display font-semibold text-ink">
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
      <Section width="wide" className="pb-20 pt-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cosmos-700 via-cosmos-600 to-aurora-500 px-6 py-14 text-white sm:px-12 sm:py-20">
            <CosmicBackground variant="cosmos" intensity="bold" className="opacity-60" />
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
                Llevas años leyendo el horóscopo.
                <br />
                Es hora de que el horóscopo te lea a ti.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-white/85 sm:text-lg">
                Crea tu cuenta gratis en menos de un minuto y descubre qué tienen
                que contarte hoy las estrellas.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <LinkButton
                  to={session ? '/horoscopo/diario' : '/registro'}
                  size="lg"
                  variant="premium"
                  className="shadow-glow-gold"
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
