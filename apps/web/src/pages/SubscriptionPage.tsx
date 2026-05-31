import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { BadgeTone } from '@/components/ui/Badge';
import { Button, LinkButton } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/Toast';
import { useOpenPortal, useSubscription } from '@/features/billing/hooks';
import type { Subscription } from '@/features/billing/hooks';

interface StatusInfo {
  label: string;
  tone: BadgeTone;
  description: string;
}

function getStatusInfo(sub: Subscription | null): StatusInfo {
  if (!sub) {
    return {
      label: 'Sin suscripción',
      tone: 'neutral',
      description: 'Aún no tienes una suscripción activa. Suscríbete para acceder a las funcionalidades premium.',
    };
  }
  switch (sub.status) {
    case 'active':
      return {
        label: sub.cancel_at_period_end ? 'Activa (cancelará al final del periodo)' : 'Activa',
        tone: sub.cancel_at_period_end ? 'warning' : 'success',
        description: sub.cancel_at_period_end
          ? 'Tu suscripción seguirá activa hasta el final del periodo actual y no se renovará.'
          : 'Disfrutas de todas las funcionalidades premium y de la experiencia sin anuncios.',
      };
    case 'trialing':
      return {
        label: 'Periodo de prueba',
        tone: 'cosmos',
        description: 'Estás en el periodo de prueba. El cobro empezará al finalizarlo.',
      };
    case 'past_due':
      return {
        label: 'Pago pendiente',
        tone: 'warning',
        description: 'No pudimos cobrar el último recibo. Actualiza tu método de pago para no perder el acceso premium.',
      };
    case 'canceled':
      return {
        label: 'Cancelada',
        tone: 'neutral',
        description: 'Tu suscripción está cancelada. Puedes volver a suscribirte cuando quieras.',
      };
    case 'incomplete':
      return {
        label: 'Pendiente de completar',
        tone: 'warning',
        description: 'El pago no se completó. Vuelve a intentarlo o usa otro método de pago.',
      };
    default:
      return {
        label: 'Sin suscripción',
        tone: 'neutral',
        description: 'No tienes una suscripción activa todavía.',
      };
  }
}

const PLAN_LABEL: Record<string, string> = {
  monthly: 'Premium mensual · 4,99 €/mes',
  annual: 'Premium anual · 49,99 €/año',
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function SubscriptionPage() {
  const { data: subscription, isLoading, refetch } = useSubscription();
  const openPortal = useOpenPortal();
  const [params, setParams] = useSearchParams();

  useEffect(() => {
    if (params.get('status') !== 'success') return;
    toast.success('¡Bienvenida/o a Premium! Tu acceso ya está activo.');
    params.delete('status');
    params.delete('session_id');
    setParams(params, { replace: true });
    // El webhook puede tardar 1-2 s en escribir. Refrescamos un par de veces.
    const t1 = setTimeout(() => refetch(), 1500);
    const t2 = setTimeout(() => refetch(), 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [params, setParams, refetch]);

  function onPortal() {
    openPortal.mutate(undefined, {
      onError: (err) => {
        const message =
          err instanceof Error ? err.message : 'No se pudo abrir el portal.';
        toast.error(message);
      },
    });
  }

  const status = getStatusInfo(subscription ?? null);
  const isActiveOrTrial =
    subscription && ['active', 'trialing'].includes(subscription.status);
  const hasCustomer = Boolean(subscription?.stripe_customer_id);

  return (
    <>
      <Helmet>
        <title>Mi suscripción · Zodiaq</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-2 text-sm text-graphite">
          <Link to="/perfil" className="hover:underline">
            ← Mi perfil
          </Link>
        </div>
        <h1 className="font-display text-3xl text-ink">Mi suscripción</h1>
        <p className="mt-1 text-graphite">
          Consulta el estado de tu plan premium, fechas de renovación y
          facturas.
        </p>

        {isLoading ? (
          <div className="mt-8 space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <Card padding="lg">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Estado actual</CardTitle>
                <Badge tone={status.tone}>{status.label}</Badge>
              </div>
              <p className="mt-3 leading-relaxed text-graphite">
                {status.description}
              </p>

              {subscription && (
                <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-silver">Plan</dt>
                    <dd className="mt-0.5 text-ink">
                      {subscription.plan ? PLAN_LABEL[subscription.plan] : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-silver">
                      {subscription.cancel_at_period_end
                        ? 'Acceso hasta'
                        : 'Próxima renovación'}
                    </dt>
                    <dd className="mt-0.5 text-ink">
                      {formatDate(subscription.current_period_end)}
                    </dd>
                  </div>
                </dl>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                {isActiveOrTrial ? (
                  <Button
                    variant="secondary"
                    onClick={onPortal}
                    disabled={openPortal.isPending}
                  >
                    {openPortal.isPending ? 'Abriendo portal…' : 'Gestionar suscripción'}
                  </Button>
                ) : (
                  <LinkButton to="/premium" variant="premium">
                    Ver planes premium →
                  </LinkButton>
                )}
                {hasCustomer && !isActiveOrTrial && (
                  <Button
                    variant="ghost"
                    onClick={onPortal}
                    disabled={openPortal.isPending}
                  >
                    {openPortal.isPending ? 'Abriendo…' : 'Ver facturas anteriores'}
                  </Button>
                )}
              </div>
            </Card>

            {isActiveOrTrial && (
              <Card padding="lg">
                <CardTitle>Tus funciones premium</CardTitle>
                <p className="mt-2 text-sm text-graphite">
                  Estas son las funcionalidades que tu plan desbloquea:
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <Link
                      to="/carta-natal/completa"
                      className="font-medium text-cosmos-700 hover:underline"
                    >
                      🪐 Carta natal completa →
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/compatibilidad/avanzada"
                      className="font-medium text-cosmos-700 hover:underline"
                    >
                      💞 Compatibilidad avanzada →
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/reportes/mensual"
                      className="font-medium text-cosmos-700 hover:underline"
                    >
                      🌙 Informe mensual →
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/reportes/anual"
                      className="font-medium text-cosmos-700 hover:underline"
                    >
                      🗓️ Informe anual →
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/tarot/avanzado"
                      className="font-medium text-cosmos-700 hover:underline"
                    >
                      🔮 Tarot avanzado →
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/numerologia/avanzada"
                      className="font-medium text-cosmos-700 hover:underline"
                    >
                      🔢 Numerología personal →
                    </Link>
                  </li>
                </ul>
              </Card>
            )}

            <Card padding="lg">
              <CardTitle>Pagos y facturas</CardTitle>
              <p className="mt-2 text-sm leading-relaxed text-graphite">
                El cobro lo procesa Stripe (PCI DSS nivel 1). Zodiaq no almacena
                tus datos de tarjeta. Desde "Gestionar suscripción" puedes
                descargar tus facturas, cambiar de plan o actualizar el método
                de pago.
              </p>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
