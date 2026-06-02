import { useEffect } from 'react';
import { Seo } from '@/lib/seo';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Crown, ArrowLeft, Compass, HeartHandshake, Moon, CalendarRange, Wand2, Hash,
  CreditCard, ChevronRight, ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Section } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { toast } from '@/components/ui/Toast';
import { useOpenPortal, useSubscription } from '@/features/billing/hooks';
import type { Subscription } from '@/features/billing/hooks';

const PANEL_BG =
  'bg-[radial-gradient(125%_125%_at_50%_0%,#3b0764_0%,#1e1b4b_46%,#0a0418_100%)]';

interface StatusInfo {
  label: string;
  tone: string;
  description: string;
}

/** Color del chip de estado (sobre el banner oscuro). */
const TONE_CLASS: Record<string, string> = {
  success: 'bg-emerald-400 text-emerald-950',
  warning: 'bg-amber-300 text-amber-950',
  cosmos: 'bg-violet-300 text-violet-950',
  neutral: 'bg-white/20 text-white ring-1 ring-white/30',
};

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
      return { label: 'Periodo de prueba', tone: 'cosmos', description: 'Estás en el periodo de prueba. El cobro empezará al finalizarlo.' };
    case 'past_due':
      return { label: 'Pago pendiente', tone: 'warning', description: 'No pudimos cobrar el último recibo. Actualiza tu método de pago para no perder el acceso premium.' };
    case 'canceled':
      return { label: 'Cancelada', tone: 'neutral', description: 'Tu suscripción está cancelada. Puedes volver a suscribirte cuando quieras.' };
    case 'incomplete':
      return { label: 'Pendiente de completar', tone: 'warning', description: 'El pago no se completó. Vuelve a intentarlo o usa otro método de pago.' };
    default:
      return { label: 'Sin suscripción', tone: 'neutral', description: 'No tienes una suscripción activa todavía.' };
  }
}

const PLAN_LABEL: Record<string, string> = {
  monthly: 'Premium mensual · 4,99 €/mes',
  annual: 'Premium anual · 49,99 €/año',
};

const FEATURES: { to: string; label: string; Icon: LucideIcon; color: string }[] = [
  { to: '/carta-natal/completa', label: 'Carta natal completa', Icon: Compass, color: '#4f46e5' },
  { to: '/compatibilidad/avanzada', label: 'Compatibilidad avanzada', Icon: HeartHandshake, color: '#e11d48' },
  { to: '/reportes/mensual', label: 'Informe mensual', Icon: Moon, color: '#7c3aed' },
  { to: '/reportes/anual', label: 'Informe anual', Icon: CalendarRange, color: '#0891b2' },
  { to: '/tarot/avanzado', label: 'Tarot avanzado', Icon: Wand2, color: '#a21caf' },
  { to: '/numerologia/avanzada', label: 'Numerología personal', Icon: Hash, color: '#0d9488' },
];

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(iso));
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
        const message = err instanceof Error ? err.message : 'No se pudo abrir el portal.';
        toast.error(message);
      },
    });
  }

  const status = getStatusInfo(subscription ?? null);
  const isActiveOrTrial = subscription && ['active', 'trialing'].includes(subscription.status);
  const hasCustomer = Boolean(subscription?.stripe_customer_id);

  return (
    <>
      <Seo
        title="Mi suscripción · Zodiaq"
        description="Consulta y gestiona tu suscripción a Zodiaq Premium: estado del plan, renovación y portal de pago."
        noindex
      />

      {/* Banner premium */}
      <Section width="full" className="px-3 pt-4 sm:px-4 lg:px-6">
        <div className={`relative isolate overflow-hidden rounded-[2.5rem] ${PANEL_BG} px-6 py-10 text-white shadow-lift ring-1 ring-white/10 sm:px-12 sm:py-12`}>
          <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-violet-500/30 blur-3xl animate-float-slow" />
          <span aria-hidden="true" className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-gold-500/15 blur-3xl animate-drift" />
          <div className="relative z-10">
            <Link to="/perfil" className="inline-flex items-center gap-1.5 text-sm text-white/70 transition hover:text-white">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Mi perfil
            </Link>
            <p className="mt-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-gold-300">
              <Crown className="h-4 w-4" aria-hidden="true" /> Tu plan
            </p>
            <h1 className="mt-2 font-display text-4xl font-black tracking-tight [text-shadow:0_2px_24px_rgba(0,0,0,0.4)] sm:text-5xl">
              Mi suscripción
            </h1>
            {!isLoading && (
              <span className={`mt-4 inline-flex rounded-full px-4 py-1.5 text-sm font-bold ${TONE_CLASS[status.tone] ?? TONE_CLASS.neutral}`}>
                {status.label}
              </span>
            )}
          </div>
        </div>
      </Section>

      <Section width="default" className="py-8">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <Reveal>
              <Card padding="lg" className="sm:p-8">
                <p className="font-display text-2xl font-extrabold tracking-tight text-ink">Estado actual</p>
                <p className="mt-3 leading-relaxed text-graphite">{status.description}</p>

                {subscription && (
                  <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-mist/50 p-4">
                      <dt className="text-sm font-semibold uppercase tracking-wide text-silver">Plan</dt>
                      <dd className="mt-1 font-display text-lg font-bold text-ink">
                        {subscription.plan ? PLAN_LABEL[subscription.plan] : '—'}
                      </dd>
                    </div>
                    <div className="rounded-2xl bg-mist/50 p-4">
                      <dt className="text-sm font-semibold uppercase tracking-wide text-silver">
                        {subscription.cancel_at_period_end ? 'Acceso hasta' : 'Próxima renovación'}
                      </dt>
                      <dd className="mt-1 font-display text-lg font-bold text-ink">
                        {formatDate(subscription.current_period_end)}
                      </dd>
                    </div>
                  </dl>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  {isActiveOrTrial ? (
                    <Button variant="secondary" onClick={onPortal} disabled={openPortal.isPending} leftIcon={<CreditCard className="h-5 w-5" />}>
                      {openPortal.isPending ? 'Abriendo portal…' : 'Gestionar suscripción'}
                    </Button>
                  ) : (
                    <LinkButton to="/premium" variant="premium" size="lg">
                      Ver planes premium →
                    </LinkButton>
                  )}
                  {hasCustomer && !isActiveOrTrial && (
                    <Button variant="ghost" onClick={onPortal} disabled={openPortal.isPending}>
                      {openPortal.isPending ? 'Abriendo…' : 'Ver facturas anteriores'}
                    </Button>
                  )}
                </div>
              </Card>
            </Reveal>

            {isActiveOrTrial && (
              <Reveal>
                <Card padding="lg" className="sm:p-8">
                  <p className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight text-ink">
                    <Crown className="h-6 w-6 text-gold-600" aria-hidden="true" /> Tus funciones premium
                  </p>
                  <p className="mt-2 text-graphite">Todo esto está desbloqueado en tu cuenta:</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {FEATURES.map((f) => (
                      <Link
                        key={f.to}
                        to={f.to}
                        className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 ease-cosmic hover:-translate-y-0.5 hover:border-cosmos-100 hover:shadow-soft"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-soft" style={{ backgroundColor: f.color, boxShadow: `0 0 14px 1px ${f.color}55` }}>
                          <f.Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="flex-1 font-bold text-ink">{f.label}</span>
                        <ChevronRight className="h-5 w-5 text-silver transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                </Card>
              </Reveal>
            )}

            <Reveal>
              <Card padding="lg" className="sm:p-8">
                <p className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight text-ink">
                  <ShieldCheck className="h-6 w-6 text-emerald-600" aria-hidden="true" /> Pagos y facturas
                </p>
                <p className="mt-2 leading-relaxed text-graphite">
                  El cobro lo procesa Stripe (PCI DSS nivel 1). Zodiaq no almacena tus
                  datos de tarjeta. Desde «Gestionar suscripción» puedes descargar tus
                  facturas, cambiar de plan o actualizar el método de pago.
                </p>
              </Card>
            </Reveal>
          </div>
        )}
      </Section>
    </>
  );
}
