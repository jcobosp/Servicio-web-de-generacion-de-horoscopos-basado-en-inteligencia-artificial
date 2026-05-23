import { Helmet } from 'react-helmet-async';
import { ZODIAC_SIGNS, ZODIAC } from '@/lib/zodiac';

export function HomePage() {
  return (
    <>
      <Helmet>
        <title>Zodiaq · Tu horóscopo, como nunca te lo han contado</title>
        <meta
          name="description"
          content="Horóscopos diarios, semanales y mensuales escritos por inteligencia artificial. Carta natal, tarot y compatibilidad personalizados."
        />
        <html lang="es" />
      </Helmet>

      <main className="min-h-screen bg-white">
        <section className="mx-auto max-w-6xl px-4 pb-12 pt-20 sm:px-6 lg:px-8 lg:pt-28">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-cosmos-600">
              ✨ Zodiaq
            </p>
            <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl lg:text-7xl">
              Tu horóscopo,
              <br />
              <span className="bg-gradient-to-r from-cosmos-600 via-aurora-500 to-gold-500 bg-clip-text text-transparent">
                como nunca te lo han contado.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-graphite">
              Lecturas diarias generadas por inteligencia artificial, personalizadas por tu
              signo y escritas para que te sientas visto. Cada día, algo distinto. Cada
              lectura, algo que te suena de algo.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {ZODIAC_SIGNS.map((slug) => {
              const sign = ZODIAC[slug];
              return (
                <div
                  key={slug}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl p-5 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${sign.colors.from}, ${sign.colors.to})`,
                  }}
                >
                  <div className="text-4xl">{sign.glyph}</div>
                  <div className="mt-3 font-display text-xl">{sign.name}</div>
                  <div className="mt-1 text-xs opacity-90">{sign.dates}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-20 rounded-3xl border border-slate-200 bg-cloud p-8 text-center">
            <p className="text-sm uppercase tracking-widest text-silver">
              Trabajo Fin de Máster · Jesús Cobos Pozo
            </p>
            <h2 className="mt-3 font-display text-2xl text-ink">
              Hola Zodiaq · setup completado
            </h2>
            <p className="mt-2 text-graphite">
              React + TypeScript + Vite + Tailwind v4 + React Router + TanStack Query
              listos. Siguiente fase: sistema de diseño y layout global.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
