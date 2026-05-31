import { Seo } from '@/lib/seo';
import { LinkButton } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <>
      <Seo
        title="Página no encontrada · Zodiaq"
        description="La página que buscas no existe o se ha movido. Vuelve al inicio para seguir explorando tu horóscopo."
        noindex
      />
      <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <div className="text-7xl" aria-hidden="true">
          ✦
        </div>
        <h1 className="mt-4 font-display text-4xl text-ink sm:text-5xl">
          Las estrellas no encuentran esta página.
        </h1>
        <p className="mt-3 max-w-md text-graphite">
          Puede que la ruta haya cambiado o que aún no exista. Volvamos a un
          camino conocido.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <LinkButton to="/" size="lg" variant="primary">
            Ir al inicio
          </LinkButton>
          <LinkButton to="/horoscopo/diario" size="lg" variant="secondary">
            Ver el horóscopo de hoy
          </LinkButton>
        </div>
      </section>
    </>
  );
}
