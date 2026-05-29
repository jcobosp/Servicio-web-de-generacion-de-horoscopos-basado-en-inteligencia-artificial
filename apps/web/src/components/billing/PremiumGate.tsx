import type { ReactNode } from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/features/auth/AuthProvider';
import { useSubscription } from '@/features/billing/hooks';

interface PremiumGateProps {
  /** Contenido protegido. Se renderiza solo si el usuario es premium. */
  children: ReactNode;
  /** Texto principal del bloqueo (qué desbloquea esta funcionalidad). */
  title?: string;
  description?: string;
}

const ACTIVE_STATUSES = ['active', 'trialing'];

/**
 * Envuelve funcionalidades premium. Si el usuario no está suscrito muestra una
 * card "Premium" con CTA al checkout. Si no hay sesión, manda a registrarse
 * conservando la ruta de origen.
 */
export function PremiumGate({
  children,
  title = 'Esto forma parte de Zodiaq Premium',
  description = 'Suscríbete y desbloquea tu carta natal completa, compatibilidad avanzada, reportes personalizados y todo sin anuncios.',
}: PremiumGateProps) {
  const { session, loading } = useAuth();
  const { data: subscription, isLoading } = useSubscription();

  if (loading || (session && isLoading)) {
    return <Skeleton className="h-48 w-full" />;
  }

  const isPremium = Boolean(
    subscription && ACTIVE_STATUSES.includes(subscription.status),
  );
  if (isPremium) return <>{children}</>;

  return (
    <Card tone="premium" padding="lg">
      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gold-600">
        <span aria-hidden="true">✨</span> Premium
      </p>
      <CardTitle className="mt-2 text-2xl">{title}</CardTitle>
      <p className="mt-3 max-w-2xl leading-relaxed text-graphite">{description}</p>
      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        {session ? (
          <LinkButton to="/premium" variant="premium" size="lg">
            Ver planes premium →
          </LinkButton>
        ) : (
          <LinkButton
            to={`/registro?next=${encodeURIComponent('/premium')}`}
            variant="premium"
            size="lg"
          >
            Crear cuenta y suscribirme →
          </LinkButton>
        )}
        <span className="text-sm text-silver">
          desde 4,99 €/mes · cancela cuando quieras
        </span>
      </div>
    </Card>
  );
}
