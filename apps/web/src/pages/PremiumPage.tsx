import { useEffect, useMemo } from 'react';
import { Seo, JsonLd, productSchema } from '@/lib/seo';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button, LinkButton } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import { useStartCheckout, useSubscription } from '@/features/billing/hooks';
import type { BillingPlan } from '@/features/billing/api';

interface BenefitItem {
  icon: string;
  title: string;
  body: string;
}

const BENEFITS: BenefitItem[] = [
  {
    icon: '🪐',
    title: 'Carta natal completa',
    body: '10 planetas, 12 casas y los aspectos entre ellos. El mapa que explica por qué eres tú.',
  },
  {
    icon: '💞',
    title: 'Compatibilidad avanzada',
    body: 'Sinastría detallada entre dos personas: qué conecta, qué fricciona y qué hay que cuidar.',
  },
  {
    icon: '📜',
    title: 'Reportes mensuales y anuales',
    body: 'Tránsitos personalizados sobre tu carta. Cuándo mover ficha y cuándo esperar.',
  },
  {
    icon: '🃏',
    title: 'Tirada profesional de tarot',
    body: 'Cruz celta y herradura, con interpretación profunda y guiones para reflexionar.',
  },
  {
    icon: '🔢',
    title: 'Numerología avanzada',
    body: 'Tu número de vida, destino y misión. Cómo aplicarlos a decisiones reales.',
  },
  {
    icon: '🚫',
    title: 'Sin anuncios',
    body: 'Toda la plataforma limpia y enfocada. Sin banners ni distracciones.',
  },
];

interface PlanCardProps {
  plan: BillingPlan;
  highlighted?: boolean;
  onStart: (plan: BillingPlan) => void;
  loading: boolean;
}

function PlanCard({ plan, highlighted, onStart, loading }: PlanCardProps) {
  const isMonthly = plan === 'monthly';
  const priceLabel = isMonthly ? '4,99 €' : '49,99 €';
  const cadence = isMonthly ? '/mes' : '/año';
  const subtitle = isMonthly
    ? 'Sin compromiso. Cancela cuando quieras.'
    : 'Ahorra ~17 % frente al plan mensual.';
  const equivalent = isMonthly
    ? 'Renovación cada mes.'
    : 'Equivale a 4,17 €/mes.';

  return (
    <Card
      tone={highlighted ? 'premium' : 'default'}
      padding="lg"
      className="relative flex flex-col"
    >
      {highlighted && (
        <Badge tone="premium" className="absolute -top-3 right-6">
          Más popular
        </Badge>
      )}
      <CardTitle className="text-2xl">
        {isMonthly ? 'Premium mensual' : 'Premium anual'}
      </CardTitle>
      <p className="mt-1 text-sm text-graphite">{subtitle}</p>

      <div className="mt-6 flex items-baseline gap-1">
        <span className="font-display text-5xl text-ink">{priceLabel}</span>
        <span className="text-base text-silver">{cadence}</span>
      </div>
      <p className="mt-2 text-sm text-silver">{equivalent}</p>

      <ul className="mt-6 space-y-2 text-sm text-graphite">
        <li>✓ Acceso completo a todas las funcionalidades premium</li>
        <li>✓ Sin anuncios en toda la plataforma</li>
        <li>✓ Cancela en un clic desde tu perfil</li>
      </ul>

      <div className="mt-8">
        <Button
          variant={highlighted ? 'premium' : 'primary'}
          size="lg"
          fullWidth
          onClick={() => onStart(plan)}
          disabled={loading}
        >
          {loading ? 'Redirigiendo a Stripe…' : `Suscribirme ${cadence.slice(1)}`}
        </Button>
      </div>
    </Card>
  );
}

export function PremiumPage() {
  const { session, loading: authLoading } = useAuth();
  const { data: subscription } = useSubscription();
  const navigate = useNavigate();
  const startCheckout = useStartCheckout();
  const [params, setParams] = useSearchParams();

  const isActive = useMemo(() => {
    return Boolean(
      subscription && ['active', 'trialing'].includes(subscription.status),
    );
  }, [subscription]);

  useEffect(() => {
    if (params.get('status') === 'cancelled') {
      toast.show('Has cancelado el pago. Puedes volver a intentarlo cuando quieras.');
      params.delete('status');
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  function onStart(plan: BillingPlan) {
    if (authLoading) return;
    if (!session) {
      navigate(`/registro?next=${encodeURIComponent('/premium')}`);
      return;
    }
    startCheckout.mutate(plan, {
      onError: (err) => {
        const message =
          err instanceof Error ? err.message : 'No se pudo iniciar el pago.';
        toast.error(message);
      },
    });
  }

  return (
    <>
      <Seo
        title="Zodiaq Premium · Suscripción astrológica completa"
        description="Carta natal completa, compatibilidad avanzada, reportes mensuales y anuales, tarot complejo y experiencia sin anuncios. Desde 4,99 €/mes."
        path="/premium"
      />
      <JsonLd
        data={productSchema({
          name: 'Zodiaq Premium',
          description:
            'Carta natal completa, compatibilidad avanzada, reportes mensuales y anuales, tarot complejo y experiencia sin anuncios.',
          path: '/premium',
          offers: [
            {
              price: '4.99',
              priceCurrency: 'EUR',
              description: 'Suscripción mensual',
            },
            {
              price: '49.99',
              priceCurrency: 'EUR',
              description: 'Suscripción anual',
            },
          ],
        })}
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <p className="flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wider text-gold-600">
            <span aria-hidden="true">✨</span> Zodiaq Premium
          </p>
          <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
            Lleva tu lectura astrológica a otro nivel
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-graphite">
            Tu horóscopo gratuito ya te orienta. Premium te enseña <em>por qué</em>
            las cosas te pasan a ti, en este momento, y qué hacer con ello.
          </p>
        </header>

        {isActive && (
          <Card tone="premium" padding="lg" className="mx-auto mt-10 max-w-3xl">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gold-600">
              <span aria-hidden="true">✨</span> Ya eres premium
            </p>
            <CardTitle className="mt-2 text-2xl">
              Disfruta de todas las funciones sin anuncios
            </CardTitle>
            <p className="mt-3 leading-relaxed text-graphite">
              Gestiona tu suscripción, cambia de plan o consulta tus facturas
              desde tu perfil.
            </p>
            <div className="mt-6">
              <LinkButton to="/perfil/suscripcion" variant="premium" size="lg">
                Gestionar mi suscripción →
              </LinkButton>
            </div>
          </Card>
        )}

        {!isActive && (
          <section
            aria-label="Planes premium"
            className="mt-12 grid gap-6 md:grid-cols-2"
          >
            <PlanCard
              plan="monthly"
              onStart={onStart}
              loading={startCheckout.isPending}
            />
            <PlanCard
              plan="annual"
              highlighted
              onStart={onStart}
              loading={startCheckout.isPending}
            />
          </section>
        )}

        <section className="mt-16">
          <h2 className="text-center font-display text-3xl text-ink">
            Qué incluye Premium
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <Card key={b.title} padding="lg">
                <div className="text-3xl" aria-hidden="true">
                  {b.icon}
                </div>
                <CardTitle className="mt-3">{b.title}</CardTitle>
                <p className="mt-2 text-sm leading-relaxed text-graphite">
                  {b.body}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-center font-display text-3xl text-ink">
            Preguntas frecuentes
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Card padding="lg">
              <CardTitle className="text-lg">¿Puedo cancelar cuando quiera?</CardTitle>
              <p className="mt-2 text-sm leading-relaxed text-graphite">
                Sí. Lo gestionas desde tu perfil con un clic y mantienes el
                acceso hasta el final del periodo ya pagado.
              </p>
            </Card>
            <Card padding="lg">
              <CardTitle className="text-lg">¿El pago es seguro?</CardTitle>
              <p className="mt-2 text-sm leading-relaxed text-graphite">
                El cobro lo procesa Stripe (PCI DSS nivel 1). Zodiaq no
                almacena tus datos de tarjeta en ningún momento.
              </p>
            </Card>
            <Card padding="lg">
              <CardTitle className="text-lg">¿Qué pasa con las funciones gratuitas?</CardTitle>
              <p className="mt-2 text-sm leading-relaxed text-graphite">
                Siguen funcionando exactamente igual. Premium añade
                funcionalidades y elimina los anuncios.
              </p>
            </Card>
            <Card padding="lg">
              <CardTitle className="text-lg">¿Mi cuenta es la misma?</CardTitle>
              <p className="mt-2 text-sm leading-relaxed text-graphite">
                Sí. Tu carta natal, rachas, historial de tarot y consentimientos
                se conservan. Solo añades nuevas funcionalidades.
              </p>
            </Card>
          </div>
        </section>

        <p className="mt-12 text-center text-xs text-silver">
          Los pagos se realizan en euros y se cobran al confirmar la suscripción.
          Renovación automática hasta que canceles.
        </p>
      </div>
    </>
  );
}
