import { Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';

/** Estrellas doradas deterministas que parpadean sobre el fondo blanco. */
const GOLD_STARS = [
  { top: 16, left: 8, size: 4, delay: 0 },
  { top: 30, left: 90, size: 3, delay: 0.6 },
  { top: 70, left: 14, size: 3, delay: 1.2 },
  { top: 80, left: 84, size: 4, delay: 0.4 },
  { top: 22, left: 64, size: 2, delay: 1.6 },
  { top: 60, left: 50, size: 2, delay: 0.9 },
];

export type UpsellVariant =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'energy'
  | 'events'
  | 'natal'
  | 'tarot';

interface UpsellCopy {
  title: string;
  body: string;
  cta: string;
}

/** Copys de upsell por contexto (MARKETING_STRATEGY §3). */
const UPSELL: Record<UpsellVariant, UpsellCopy> = {
  daily: {
    title: 'Lo que las estrellas no te están contando aún',
    body: 'Tu lectura diaria es solo la superficie. Tu carta natal completa revela por qué tus relaciones, tu vocación y tus bloqueos siguen ese mismo patrón —y qué se mueve este año.',
    cta: 'Ver mi carta natal completa',
  },
  weekly: {
    title: 'Tu semana, ampliada al detalle que importa',
    body: 'Hay un movimiento astrológico esta semana que te toca de cerca y que tu lectura gratuita solo insinúa. Descúbrelo en el reporte mensual personalizado por tu carta natal.',
    cta: 'Desbloquear mi reporte mensual',
  },
  monthly: {
    title: 'Tu año, antes de que te sorprenda',
    body: 'En 30 días pasan cosas. En 365 cambia tu vida. El reporte anual premium analiza cada tránsito sobre tu carta natal y te dice cuándo mover ficha —y cuándo esperar.',
    cta: 'Quiero mi reporte anual',
  },
  energy: {
    title: 'Esta energía te afecta MÁS por tu carta',
    body: 'La energía de hoy cae distinta sobre cada carta natal —y eso cambia lo que significa para ti. Suscríbete y recibe lecturas personalizadas por tus tránsitos.',
    cta: 'Personalizar mis lecturas',
  },
  events: {
    title: 'Estos tránsitos, leídos sobre TU carta',
    body: 'Las lunas e ingresos de este mes caen sobre una casa distinta en tu carta natal. Los reportes premium analizan cada tránsito sobre tu carta y te dicen qué activan en tu amor, tu trabajo y tu economía —y cuándo mover ficha.',
    cta: 'Ver mi reporte mensual',
  },
  natal: {
    title: 'Acabas de ver la portada',
    body: 'Sol, Luna y Ascendente son el principio. Tu carta completa incluye 10 planetas, 12 casas y los aspectos entre ellos. Es el mapa que explica por qué eres tú.',
    cta: 'Ver mi carta natal completa',
  },
  tarot: {
    title: 'Una carta dice algo. Diez lo cuentan todo.',
    body: 'La cruz celta es la tirada que los profesionales usan para leer una situación a fondo: pasado, presente, obstáculo, deseo y salida.',
    cta: 'Tirada profesional de 10 cartas',
  },
};

interface UpsellCardProps {
  variant: UpsellVariant;
  /** Gancho generado por Gemini, alineado con lo que el lector acaba de leer. */
  premiumHook?: string | undefined;
  /** Destino del CTA (por defecto la página de planes premium). */
  to?: string;
}

export function UpsellCard({ variant, premiumHook, to = '/premium' }: UpsellCardProps) {
  const copy = UPSELL[variant];

  return (
    <Card tone="premium" padding="lg" className="relative mt-8 overflow-hidden sm:p-10">
      {/* Estrellas doradas que parpadean sobre el blanco */}
      {GOLD_STARS.map((s, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full bg-gold-400 shadow-[0_0_8px_2px_rgba(251,191,36,0.55)] animate-twinkle"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      {/* Aura dorada suave */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gold-300/25 blur-3xl"
      />

      <div className="relative">
        <p className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3.5 py-1.5 text-sm font-bold uppercase tracking-[0.14em] text-gold-700 ring-1 ring-amber-200">
          <Sparkles className="h-4 w-4" aria-hidden="true" /> Solo para ti
        </p>
        <h3 className="mt-4 font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]">
          {copy.title}
        </h3>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-graphite">
          {premiumHook ? premiumHook : copy.body}
        </p>
        <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <LinkButton to={to} variant="premium" size="lg">
            {copy.cta} →
          </LinkButton>
          <span className="text-sm text-silver">
            desde 4,99 €/mes · cancela cuando quieras
          </span>
        </div>
      </div>
    </Card>
  );
}
