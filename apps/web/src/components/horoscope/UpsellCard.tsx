import { Card } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';

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
    title: 'Esta energía te afecta MÁS por tu carta',
    body: 'Los movimientos del cielo caen sobre una casa distinta en la carta de cada persona. Suscríbete y recibe alertas personalizadas por cada tránsito que te toca.',
    cta: 'Personalizar mis alertas',
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
}

export function UpsellCard({ variant, premiumHook }: UpsellCardProps) {
  const copy = UPSELL[variant];

  return (
    <Card tone="premium" padding="lg" className="mt-8">
      <div
        aria-hidden="true"
        className="absolute -right-6 -top-6 text-8xl opacity-10"
      >
        ✨
      </div>
      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gold-600">
        <span aria-hidden="true">✨</span> Solo para ti
      </p>
      <h3 className="mt-2 font-display text-2xl text-ink">{copy.title}</h3>
      <p className="mt-3 max-w-2xl leading-relaxed text-graphite">
        {premiumHook ? premiumHook : copy.body}
      </p>
      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <LinkButton to="/premium" variant="premium" size="lg">
          {copy.cta} →
        </LinkButton>
        <span className="text-sm text-silver">desde 4,99 €/mes · cancela cuando quieras</span>
      </div>
    </Card>
  );
}
