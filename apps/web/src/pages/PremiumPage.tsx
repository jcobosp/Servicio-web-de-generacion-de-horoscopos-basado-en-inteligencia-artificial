import { useEffect, useMemo } from 'react';
import { Seo, JsonLd, productSchema } from '@/lib/seo';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Crown, Sparkles, Check, X, Compass, HeartHandshake, ScrollText, Wand2, Hash,
  ShieldCheck, Star, Quote, Lock,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { Section } from '@/components/layout/Section';
import { Reveal, RevealStagger, RevealItem } from '@/components/motion/Reveal';
import { Shine } from '@/components/visual/Shine';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import { useAuth } from '@/features/auth/AuthProvider';
import { useStartCheckout, useSubscription } from '@/features/billing/hooks';
import type { BillingPlan } from '@/features/billing/api';

const PANEL_BG =
  'bg-[radial-gradient(125%_125%_at_50%_0%,#3b0764_0%,#1e1b4b_46%,#0a0418_100%)]';

interface BenefitItem {
  Icon: LucideIcon;
  title: string;
  body: string;
  gradient: string;
}

const BENEFITS: BenefitItem[] = [
  { Icon: Compass, title: 'Carta natal completa', body: '10 planetas, 12 casas y los aspectos entre ellos. El mapa que explica por qué eres tú.', gradient: 'from-blue-600 via-indigo-600 to-blue-900' },
  { Icon: HeartHandshake, title: 'Compatibilidad avanzada', body: 'Sinastría detallada entre dos personas: qué conecta, qué fricciona y qué hay que cuidar.', gradient: 'from-rose-500 via-pink-600 to-fuchsia-800' },
  { Icon: ScrollText, title: 'Reportes mensuales y anuales', body: 'Tránsitos personalizados sobre tu carta. Cuándo mover ficha y cuándo esperar.', gradient: 'from-indigo-500 via-violet-600 to-indigo-800' },
  { Icon: Wand2, title: 'Tarot avanzado', body: 'Cruz Celta y Herradura en sus posiciones, con una lectura profunda carta a carta.', gradient: 'from-fuchsia-600 via-purple-600 to-violet-900' },
  { Icon: Hash, title: 'Numerología personal', body: 'Tu camino de vida, tu año y tu mes, tejidos en un retrato único orientado a ti.', gradient: 'from-emerald-500 via-teal-600 to-emerald-900' },
  { Icon: ShieldCheck, title: 'Sin anuncios', body: 'Toda la plataforma limpia y enfocada. Sin banners ni distracciones.', gradient: 'from-amber-400 via-amber-500 to-orange-700' },
];

/** Tabla comparativa: qué entra en cada plan. */
const COMPARISON: { label: string; free: boolean }[] = [
  { label: 'Horóscopo diario, semanal y mensual', free: true },
  { label: 'Energía del día y eventos astrológicos', free: true },
  { label: 'Tarot diario · carta natal básica · numerología básica', free: true },
  { label: 'Compatibilidad entre signos', free: true },
  { label: 'Carta natal completa (10 planetas y 12 casas)', free: false },
  { label: 'Compatibilidad avanzada (sinastría real)', free: false },
  { label: 'Reportes mensuales y anuales personalizados', free: false },
  { label: 'Tarot avanzado: Cruz Celta y Herradura', free: false },
  { label: 'Numerología personal narrada', free: false },
  { label: 'Experiencia sin anuncios', free: false },
];

const TESTIMONIALS: { quote: string; name: string; tag: string }[] = [
  { quote: 'La carta natal completa me dejó sin palabras. Por fin entiendo cosas de mí que arrastraba años.', name: 'Lucía', tag: 'Premium anual' },
  { quote: 'El informe mensual se ha vuelto mi ritual de cada mes. Acierta de un modo que asusta.', name: 'Daniel', tag: 'Premium mensual' },
  { quote: 'La compatibilidad avanzada con mi pareja fue clarísima. Y sin anuncios da gusto navegar.', name: 'Marta', tag: 'Premium anual' },
];

const FAQS: { q: string; a: string }[] = [
  { q: '¿Puedo cancelar cuando quiera?', a: 'Sí. Lo gestionas desde tu perfil con un clic y mantienes el acceso hasta el final del periodo ya pagado.' },
  { q: '¿El pago es seguro?', a: 'El cobro lo procesa Stripe (PCI DSS nivel 1). Zodiaq no almacena tus datos de tarjeta en ningún momento.' },
  { q: '¿Qué pasa con las funciones gratuitas?', a: 'Siguen funcionando exactamente igual. Premium añade funcionalidades y elimina los anuncios.' },
  { q: '¿Mi cuenta es la misma?', a: 'Sí. Tu carta natal, rachas, historial de tarot y consentimientos se conservan. Solo añades nuevas funcionalidades.' },
];

const STARS = [
  { top: 14, left: 10, size: 3, delay: 0 }, { top: 24, left: 84, size: 2, delay: 0.7 },
  { top: 62, left: 6, size: 2, delay: 1.3 }, { top: 72, left: 92, size: 3, delay: 0.4 },
  { top: 40, left: 96, size: 2, delay: 1.1 }, { top: 84, left: 26, size: 2, delay: 0.9 },
  { top: 10, left: 58, size: 2, delay: 1.6 }, { top: 86, left: 66, size: 3, delay: 0.5 },
  { top: 8, left: 32, size: 2, delay: 1.9 }, { top: 20, left: 46, size: 1, delay: 0.3 },
  { top: 34, left: 20, size: 2, delay: 1.4 }, { top: 60, left: 94, size: 2, delay: 1.7 },
];

function StarField() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white shadow-[0_0_6px_2px_rgba(255,255,255,0.7)] animate-twinkle"
          style={{ top: `${s.top}%`, left: `${s.left}%`, width: `${s.size}px`, height: `${s.size}px`, animationDelay: `${s.delay}s` }}
        />
      ))}
    </span>
  );
}

function Nebulae() {
  return (
    <>
      <span aria-hidden="true" className="pointer-events-none absolute -left-24 -top-28 h-96 w-96 rounded-full bg-violet-500/30 blur-3xl animate-drift" />
      <span aria-hidden="true" className="pointer-events-none absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl animate-float-slow" />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-gold-500/20 blur-3xl animate-float" />
    </>
  );
}

interface PlanCardProps {
  plan: BillingPlan;
  highlighted?: boolean;
  onStart: (plan: BillingPlan) => void;
  loading: boolean;
}

const PLAN_FEATURES = [
  'Acceso completo a todo lo premium',
  'Sin anuncios en toda la plataforma',
  'Cancela en un clic desde tu perfil',
];

function PlanCard({ plan, highlighted, onStart, loading }: PlanCardProps) {
  const isMonthly = plan === 'monthly';
  const priceLabel = isMonthly ? '4,99 €' : '49,99 €';
  const cadence = isMonthly ? '/mes' : '/año';
  const subtitle = isMonthly ? 'Sin compromiso. Cancela cuando quieras.' : 'El plan favorito: paga una vez al año.';
  const equivalent = isMonthly ? 'Renovación cada mes.' : 'Equivale a 4,17 €/mes.';

  if (highlighted) {
    return (
      <div className={`relative isolate flex flex-col overflow-hidden rounded-[2rem] ${PANEL_BG} p-8 text-white shadow-lift ring-1 ring-gold-300/30 sm:p-10`}>
        <StarField />
        <Nebulae />
        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 font-display text-2xl font-extrabold">
              <Crown className="h-6 w-6 text-gold-300" aria-hidden="true" /> Premium anual
            </p>
            <span className="rounded-full bg-gold-300 px-3 py-1 text-xs font-black uppercase tracking-wide text-[#1e1b4b]">
              Ahorra 17 %
            </span>
          </div>
          <p className="mt-1 text-sm text-white/70">{subtitle}</p>
          <div className="mt-6 flex items-baseline gap-1.5">
            <span className="font-display text-6xl font-black text-white">{priceLabel}</span>
            <span className="text-lg text-white/60">{cadence}</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-gold-200">{equivalent}</p>
          <ul className="mt-7 space-y-3 text-base">
            {PLAN_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-gold-300" aria-hidden="true" /> {f}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex-1" />
          <Button variant="premium" size="lg" fullWidth onClick={() => onStart(plan)} disabled={loading} leftIcon={<Crown className="h-5 w-5" />}>
            {loading ? 'Redirigiendo a Stripe…' : 'Suscribirme al año'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card padding="lg" className="relative flex flex-col sm:p-10">
      <p className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight text-ink">
        <Sparkles className="h-6 w-6 text-cosmos-600" aria-hidden="true" /> Premium mensual
      </p>
      <p className="mt-1 text-sm text-graphite">{subtitle}</p>
      <div className="mt-6 flex items-baseline gap-1.5">
        <span className="font-display text-6xl font-black text-ink">{priceLabel}</span>
        <span className="text-lg text-silver">{cadence}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-silver">{equivalent}</p>
      <ul className="mt-7 space-y-3 text-base text-graphite">
        {PLAN_FEATURES.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-cosmos-600" aria-hidden="true" /> {f}
          </li>
        ))}
      </ul>
      <div className="mt-8 flex-1" />
      <Button variant="primary" size="lg" fullWidth onClick={() => onStart(plan)} disabled={loading}>
        {loading ? 'Redirigiendo a Stripe…' : 'Suscribirme al mes'}
      </Button>
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
    return Boolean(subscription && ['active', 'trialing'].includes(subscription.status));
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
        const message = err instanceof Error ? err.message : 'No se pudo iniciar el pago.';
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
          description: 'Carta natal completa, compatibilidad avanzada, reportes mensuales y anuales, tarot complejo y experiencia sin anuncios.',
          path: '/premium',
          offers: [
            { price: '4.99', priceCurrency: 'EUR', description: 'Suscripción mensual' },
            { price: '49.99', priceCurrency: 'EUR', description: 'Suscripción anual' },
          ],
        })}
      />

      {/* Hero premium a sangre */}
      <Section width="full" className="px-3 pt-4 sm:px-4 lg:px-6">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-700 via-violet-800 to-[#160a2e] px-6 py-16 text-center text-white shadow-lift sm:px-12 sm:py-24">
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/30 via-black/10 to-black/50" />
            <Nebulae />
            <StarField />
            <div className="relative z-10 mx-auto max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.16em] text-gold-200 ring-1 ring-white/30 backdrop-blur">
                <Crown className="h-4 w-4" aria-hidden="true" /> Zodiaq Premium
              </span>
              <h1 className="mt-6 font-display text-5xl font-black leading-[0.9] tracking-[-0.035em] [text-shadow:0_2px_24px_rgba(0,0,0,0.4)] sm:text-7xl lg:text-[5.5rem]">
                Tu cielo, al <Shine gold>completo</Shine>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90 sm:text-xl">
                Tu horóscopo gratuito ya te orienta. Premium te enseña <em>por qué</em>
                las cosas te pasan a ti, en este momento, y qué hacer con ello.
              </p>
              <p className="mt-6 inline-flex items-center gap-2 text-sm text-white/70">
                <Star className="h-4 w-4 fill-gold-300 text-gold-300" aria-hidden="true" />
                Desde 4,99 €/mes · cancela cuando quieras
              </p>
            </div>
          </div>
        </Reveal>
      </Section>

      <Section width="xwide" className="py-10">
        {isActive ? (
          <Reveal>
            <div className={`relative isolate overflow-hidden rounded-[2.5rem] ${PANEL_BG} p-8 text-center text-white shadow-lift ring-1 ring-white/10 sm:p-14`}>
              <StarField />
              <Nebulae />
              <div className="relative z-10 mx-auto max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-extrabold uppercase tracking-[0.16em] text-gold-300 ring-1 ring-white/20 backdrop-blur">
                  <Crown className="h-4 w-4" aria-hidden="true" /> Ya eres premium
                </span>
                <h2 className="mt-5 font-display text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Disfruta de todo, sin anuncios
                </h2>
                <p className="mt-4 text-lg text-white/80">
                  Gestiona tu suscripción, cambia de plan o consulta tus facturas desde tu perfil.
                </p>
                <div className="mt-7">
                  <LinkButton to="/perfil/suscripcion" variant="premium" size="lg">
                    Gestionar mi suscripción →
                  </LinkButton>
                </div>
              </div>
            </div>
          </Reveal>
        ) : (
          <Reveal>
            <section aria-label="Planes premium" className="mx-auto grid max-w-5xl items-stretch gap-6 md:grid-cols-2">
              <PlanCard plan="monthly" onStart={onStart} loading={startCheckout.isPending} />
              <PlanCard plan="annual" highlighted onStart={onStart} loading={startCheckout.isPending} />
            </section>
          </Reveal>
        )}

        {/* Comparativa de planes */}
        <Reveal>
          <div className="mt-16">
            <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Gratis vs. <Shine>Premium</Shine>
            </h2>
            <Card padding="none" className="mx-auto mt-8 max-w-4xl overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-b border-slate-200 bg-mist/50 px-5 py-4 sm:gap-x-8 sm:px-8">
                <span className="text-sm font-bold uppercase tracking-wide text-graphite">Qué incluye</span>
                <span className="w-16 text-center text-sm font-bold uppercase tracking-wide text-silver sm:w-20">Gratis</span>
                <span className="flex w-16 items-center justify-center gap-1 text-sm font-black uppercase tracking-wide text-gold-700 sm:w-20">
                  <Crown className="h-4 w-4" aria-hidden="true" /> Premium
                </span>
              </div>
              {COMPARISON.map((row, idx) => (
                <div
                  key={row.label}
                  className={cn(
                    'grid grid-cols-[1fr_auto_auto] items-center gap-x-4 px-5 py-3.5 sm:gap-x-8 sm:px-8',
                    idx % 2 === 1 && 'bg-slate-50/60',
                  )}
                >
                  <span className="text-base text-ink">{row.label}</span>
                  <span className="flex w-16 justify-center sm:w-20">
                    {row.free ? (
                      <Check className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                    ) : (
                      <X className="h-5 w-5 text-slate-300" aria-hidden="true" />
                    )}
                  </span>
                  <span className="flex w-16 justify-center sm:w-20">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-soft">
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </span>
                </div>
              ))}
            </Card>
          </div>
        </Reveal>

        {/* Beneficios */}
        <div className="mt-16">
          <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Todo lo que <Shine>desbloqueas</Shine>
          </h2>
          <RevealStagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <RevealItem key={b.title}>
                <div className={cn('group relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br p-7 text-white shadow-lift transition-all duration-300 ease-cosmic hover:-translate-y-1 sm:p-8', b.gradient)}>
                  <b.Icon aria-hidden="true" strokeWidth={1.3} className="pointer-events-none absolute -bottom-6 -right-4 h-36 w-36 text-white/10 transition-transform duration-500 ease-cosmic group-hover:scale-110 group-hover:-rotate-6" />
                  <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur">
                    <b.Icon className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <h3 className="relative mt-5 font-display text-2xl font-extrabold tracking-tight">{b.title}</h3>
                  <p className="relative mt-2 text-base leading-relaxed text-white/90">{b.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>

        {/* Prueba social */}
        <div className="mt-16">
          <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Lo que dicen quienes ya <Shine>lo viven</Shine>
          </h2>
          <RevealStagger className="mt-8 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <RevealItem key={t.name}>
                <Card padding="lg" className="relative flex h-full flex-col">
                  <Quote className="h-8 w-8 text-gold-400" aria-hidden="true" />
                  <p className="mt-3 flex-1 text-lg leading-relaxed text-ink">{t.quote}</p>
                  <div className="mt-5 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 font-display text-lg font-black text-white">
                      {t.name[0]}
                    </span>
                    <div>
                      <p className="font-bold text-ink">{t.name}</p>
                      <p className="flex items-center gap-1 text-sm text-gold-700">
                        <Crown className="h-3.5 w-3.5" aria-hidden="true" /> {t.tag}
                      </p>
                    </div>
                  </div>
                </Card>
              </RevealItem>
            ))}
          </RevealStagger>
          <p className="mt-4 text-center text-xs text-silver">Testimonios ilustrativos.</p>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Preguntas frecuentes
          </h2>
          <div className="mx-auto mt-8 grid max-w-4xl gap-3 md:grid-cols-2">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition open:shadow-lift">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-display text-lg font-bold text-ink">
                  {f.q}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cosmos-50 text-cosmos-700 transition-transform duration-300 group-open:rotate-45">
                    <span aria-hidden="true" className="text-xl leading-none">+</span>
                  </span>
                </summary>
                <p className="mt-3 leading-relaxed text-graphite">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Cierre */}
        {!isActive && (
          <Reveal>
            <div className="mt-16 flex flex-col items-center gap-4 text-center">
              <Lock className="h-8 w-8 text-cosmos-600" aria-hidden="true" />
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                Tu carta entera te está esperando
              </h2>
              <Button variant="premium" size="lg" onClick={() => onStart('annual')} disabled={startCheckout.isPending} leftIcon={<Crown className="h-5 w-5" />}>
                {startCheckout.isPending ? 'Redirigiendo a Stripe…' : 'Hacerme premium'}
              </Button>
            </div>
          </Reveal>
        )}

        <p className="mt-12 text-center text-xs text-silver">
          Los pagos se realizan en euros y se cobran al confirmar la suscripción.
          Renovación automática hasta que canceles.
        </p>
      </Section>
    </>
  );
}
