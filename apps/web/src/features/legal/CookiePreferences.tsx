import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, BarChart3, Megaphone, Crown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button, LinkButton } from '@/components/ui/Button';
import { useIsPremium } from '@/features/billing/hooks';
import { useConsent } from './ConsentProvider';
import type { ConsentChoice } from './ConsentProvider';

interface CategoryProps {
  title: string;
  description: string;
  Icon: LucideIcon;
  color: string;
  checked: boolean;
  onChange?: (value: boolean) => void;
  /** Categoría obligatoria (técnicas): siempre activa, no editable. */
  locked?: boolean;
}

function Category({
  title,
  description,
  Icon,
  color,
  checked,
  onChange,
  locked,
}: CategoryProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
      <div className="flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-soft"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display font-bold text-ink">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-graphite">{description}</p>
        </div>
      </div>
      <label className="mt-0.5 inline-flex shrink-0 cursor-pointer items-center">
        <span className="sr-only">{title}</span>
        <input
          type="checkbox"
          checked={checked}
          disabled={locked}
          onChange={(e) => onChange?.(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="relative h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-cosmos-600 peer-disabled:bg-cosmos-300 peer-focus-visible:ring-2 peer-focus-visible:ring-cosmos-400 peer-focus-visible:ring-offset-2 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5"
        />
      </label>
    </div>
  );
}

interface PreferencesFormProps {
  initial: ConsentChoice;
  isPremium: boolean;
  onSave: (choice: ConsentChoice) => void;
  onCloseLink: () => void;
}

/**
 * Cuerpo interactivo del panel. Se monta de nuevo cada vez que el modal se abre
 * (el Modal devuelve null al cerrarse), de modo que los toggles parten siempre
 * de la elección guardada sin necesidad de un efecto de sincronización.
 *
 * Modelo "consentir o suscribirse": la publicidad no es un interruptor libre en
 * el plan gratuito (financia el servicio); la alternativa para no verla es
 * Premium. La analítica sí es una elección libre. Al guardar, la publicidad
 * queda activa para usuarios gratuitos y desactivada para premium.
 */
function PreferencesForm({ initial, isPremium, onSave, onCloseLink }: PreferencesFormProps) {
  const [analytics, setAnalytics] = useState(initial.analytics);

  return (
    <>
      <p className="text-sm leading-relaxed text-graphite">
        Usamos cookies para que la plataforma funcione y, con tu permiso, para
        medir su uso. En el plan gratuito, la <strong>publicidad</strong> financia
        el servicio; si prefieres no verla, puedes{' '}
        <Link
          to="/premium"
          className="text-cosmos-700 underline"
          onClick={onCloseLink}
        >
          suscribirte a Premium
        </Link>
        . Consulta la{' '}
        <Link
          to="/politica-de-cookies"
          className="text-cosmos-700 underline"
          onClick={onCloseLink}
        >
          política de cookies
        </Link>
        .
      </p>

      <div className="mt-5 space-y-3">
        <Category
          title="Técnicas (necesarias)"
          description="Imprescindibles para iniciar sesión, mantener la sesión y recordar tu elección de cookies. No se pueden desactivar."
          Icon={ShieldCheck}
          color="#059669"
          checked
          locked
        />
        <Category
          title="Analíticas"
          description="Nos ayudan a entender cómo se usa la plataforma para mejorarla. Solo se activan con tu permiso."
          Icon={BarChart3}
          color="#4f46e5"
          checked={analytics}
          onChange={setAnalytics}
        />
        {isPremium ? (
          <Category
            title="Publicidad"
            description="Tu plan Premium no muestra anuncios: las cookies de publicidad están desactivadas."
            Icon={Megaphone}
            color="#94a3b8"
            checked={false}
            locked
          />
        ) : (
          <Category
            title="Publicidad"
            description="En el plan gratuito la publicidad (Google AdSense) financia el servicio y va incluida al usarlo gratis. ¿No quieres anuncios? Hazte Premium y se desactivan."
            Icon={Megaphone}
            color="#d97706"
            checked
            locked
          />
        )}
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        {!isPremium && (
          <LinkButton
            to="/premium"
            variant="secondary"
            className="sm:mr-auto"
            onClick={onCloseLink}
            leftIcon={<Crown className="h-4 w-4" />}
          >
            Suscribirme sin anuncios
          </LinkButton>
        )}
        <Button onClick={() => onSave({ analytics, marketing: !isPremium })}>
          Guardar preferencias
        </Button>
      </div>
    </>
  );
}

export function CookiePreferences() {
  const { preferencesOpen, closePreferences, save, consent } = useConsent();
  const isPremium = useIsPremium();

  return (
    <Modal
      open={preferencesOpen}
      onClose={closePreferences}
      title="Preferencias de cookies"
      size="lg"
    >
      <PreferencesForm
        initial={{
          analytics: consent?.analytics ?? false,
          marketing: consent?.marketing ?? false,
        }}
        isPremium={isPremium}
        onSave={save}
        onCloseLink={closePreferences}
      />
    </Modal>
  );
}
