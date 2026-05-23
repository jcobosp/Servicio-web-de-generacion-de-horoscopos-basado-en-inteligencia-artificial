import { Helmet } from 'react-helmet-async';
import { ZODIAC_SIGNS, ZODIAC } from '@/lib/zodiac';
import { SignCard } from '@/components/zodiac/SignCard';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Feature {
  icon: string;
  title: string;
  description: string;
  to: string;
  premium?: boolean;
}

const features: Feature[] = [
  {
    icon: '🌙',
    title: 'Horóscopo personalizado',
    description:
      'Lecturas diarias, semanales y mensuales por signo, divididas en amor, salud, dinero y trabajo.',
    to: '/horoscopo/diario',
  },
  {
    icon: '✨',
    title: 'Carta natal',
    description:
      'Descubre tu Sol, Luna y Ascendente. La versión completa interpreta todos los planetas y casas.',
    to: '/carta-natal/basica',
  },
  {
    icon: '🃏',
    title: 'Tarot intuitivo',
    description:
      'Tiradas sencillas a diario y lecturas profundas como la cruz celta para los momentos importantes.',
    to: '/tarot/simple',
  },
  {
    icon: '💞',
    title: 'Compatibilidad',
    description:
      'Sinastría avanzada entre dos personas: qué conecta, qué fricciona y qué hay que cuidar.',
    to: '/compatibilidad',
    premium: true,
  },
];

export function HomePage() {
  return (
    <>
      <Helmet>
        <title>Zodiaq · Tu horóscopo, como nunca te lo han contado</title>
        <meta
          name="description"
          content="Horóscopos diarios, semanales y mensuales personalizados por tu signo. Carta natal, tarot y compatibilidad escritos por inteligencia artificial."
        />
        <link rel="canonical" href="/" />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-b from-cosmos-50 via-white to-white"
        />
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pt-24">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cosmos-600 sm:text-sm">
              ✦ Zodiaq
            </p>
            <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl lg:text-7xl">
              Tu horóscopo,
              <br />
              <span className="bg-gradient-to-r from-cosmos-600 via-aurora-500 to-gold-500 bg-clip-text text-transparent">
                como nunca te lo han contado.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-graphite sm:text-lg">
              Lecturas escritas con inteligencia artificial, personalizadas por tu
              signo y pensadas para que te sientas visto. Cada día, algo distinto.
              Cada lectura, algo que te suena de algo.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <LinkButton to="/registro" size="lg" variant="primary">
                Empezar gratis
              </LinkButton>
              <LinkButton to="/premium" size="lg" variant="secondary">
                Ver plan Premium
              </LinkButton>
            </div>
            <p className="mt-4 text-sm text-silver">
              Sin tarjeta. Sin permanencia. Sin spam.
            </p>
          </div>
        </div>
      </section>

      {/* Grid 12 signos */}
      <section
        aria-labelledby="signs-heading"
        className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8"
      >
        <div className="mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2
              id="signs-heading"
              className="font-display text-2xl text-ink sm:text-3xl"
            >
              Elige tu signo
            </h2>
            <p className="mt-1 text-sm text-graphite">
              Cada uno con su energía, su ritmo y su forma de leer el mundo.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
          {ZODIAC_SIGNS.map((slug) => (
            <SignCard key={slug} sign={ZODIAC[slug]} />
          ))}
        </div>
      </section>

      {/* Funcionalidades */}
      <section
        aria-labelledby="features-heading"
        className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mb-10 max-w-2xl">
          <h2
            id="features-heading"
            className="font-display text-2xl text-ink sm:text-3xl"
          >
            Más allá del horóscopo diario
          </h2>
          <p className="mt-2 text-graphite">
            Funcionalidades pensadas para acompañarte cada día y darte profundidad
            cuando la necesitas.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card
              key={f.to}
              tone={f.premium ? 'premium' : 'default'}
              padding="lg"
              hoverable
              className="flex h-full flex-col"
            >
              <div className="mb-3 flex items-start justify-between">
                <div
                  aria-hidden="true"
                  className="text-3xl"
                  style={{ lineHeight: 1 }}
                >
                  {f.icon}
                </div>
                {f.premium && <Badge tone="premium">✨ Premium</Badge>}
              </div>
              <CardTitle>{f.title}</CardTitle>
              <CardDescription className="flex-1">
                {f.description}
              </CardDescription>
              <div className="mt-5">
                <LinkButton
                  to={f.to}
                  variant={f.premium ? 'premium' : 'secondary'}
                  size="sm"
                >
                  {f.premium ? 'Descubrir Premium' : 'Probar gratis'}
                </LinkButton>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA premium */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cosmos-700 via-cosmos-600 to-aurora-500 px-6 py-12 text-white sm:px-10 sm:py-16">
          <div
            aria-hidden="true"
            className="absolute -right-10 -top-10 text-[18rem] opacity-10 select-none"
            style={{ lineHeight: 1 }}
          >
            ✦
          </div>
          <div className="relative max-w-2xl">
            <Badge
              tone="premium"
              className="mb-4 bg-white/15 text-white backdrop-blur"
            >
              ✨ Plan Premium
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl">
              Llevas años leyendo el horóscopo.
              <br />
              Es hora de que el horóscopo te lea a ti.
            </h2>
            <p className="mt-4 text-base text-white/85 sm:text-lg">
              Carta natal completa, compatibilidad avanzada, tarot profesional,
              reportes mensuales y anuales personalizados. Y sin anuncios.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton
                to="/premium"
                size="lg"
                variant="premium"
                className="shadow-glow-gold"
              >
                Ver Premium
              </LinkButton>
              <LinkButton
                to="/registro"
                size="lg"
                variant="ghost"
                className="!text-white hover:!bg-white/10"
              >
                Probar gratis primero
              </LinkButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
