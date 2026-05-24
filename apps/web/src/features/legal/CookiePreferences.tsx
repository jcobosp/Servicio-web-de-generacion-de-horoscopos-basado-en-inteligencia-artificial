import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useConsent } from './ConsentProvider';
import type { ConsentChoice } from './ConsentProvider';

interface CategoryProps {
  title: string;
  description: string;
  checked: boolean;
  onChange?: (value: boolean) => void;
  /** Categoría obligatoria (técnicas): siempre activa, no editable. */
  locked?: boolean;
}

function Category({
  title,
  description,
  checked,
  onChange,
  locked,
}: CategoryProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4">
      <div>
        <p className="font-medium text-ink">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-graphite">
          {description}
        </p>
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
  onSave: (choice: ConsentChoice) => void;
  onCloseLink: () => void;
}

/**
 * Cuerpo interactivo del panel. Se monta de nuevo cada vez que el modal se abre
 * (el Modal devuelve null al cerrarse), de modo que los toggles parten siempre
 * de la elección guardada sin necesidad de un efecto de sincronización.
 */
function PreferencesForm({ initial, onSave, onCloseLink }: PreferencesFormProps) {
  const [analytics, setAnalytics] = useState(initial.analytics);
  const [marketing, setMarketing] = useState(initial.marketing);

  return (
    <>
      <p className="text-sm leading-relaxed text-graphite">
        Usamos cookies para que la plataforma funcione y, con tu permiso, para
        medir su uso y mostrar publicidad. Puedes elegir por categoría. Consulta
        más detalles en nuestra{' '}
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
          checked
          locked
        />
        <Category
          title="Analíticas"
          description="Nos ayudan a entender cómo se usa la plataforma para mejorarla. Solo se activan con tu permiso."
          checked={analytics}
          onChange={setAnalytics}
        />
        <Category
          title="Publicidad"
          description="Permiten mostrar anuncios (Google AdSense) en el plan gratuito. Solo se activan con tu permiso."
          checked={marketing}
          onChange={setMarketing}
        />
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="ghost"
          onClick={() => onSave({ analytics: false, marketing: false })}
        >
          Rechazar todas
        </Button>
        <Button onClick={() => onSave({ analytics, marketing })}>
          Guardar preferencias
        </Button>
      </div>
    </>
  );
}

export function CookiePreferences() {
  const { preferencesOpen, closePreferences, save, consent } = useConsent();

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
        onSave={save}
        onCloseLink={closePreferences}
      />
    </Modal>
  );
}
