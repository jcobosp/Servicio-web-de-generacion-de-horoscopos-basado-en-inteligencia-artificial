import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useZodForm } from '@/hooks/useZodForm';
import { resetPasswordSchema } from '@/features/auth/validation';
import { updatePassword, authErrorMessage } from '@/features/auth/api';
import { AuthShell } from '@/features/auth/AuthShell';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState<boolean | null>(
    null,
  );

  const { values, errors, setField, validate, setFormError } = useZodForm(
    resetPasswordSchema,
    { password: '', confirm: '' },
  );

  // El enlace del email abre la app con una sesión de recuperación que
  // detectSessionInUrl procesa. Comprobamos que existe antes de permitir el cambio.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasRecoverySession(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setHasRecoverySession(true);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = validate();
    if (!valid) return;
    setSubmitting(true);
    try {
      await updatePassword(valid.password);
      toast.success('Contraseña actualizada. Ya puedes usarla.');
      navigate('/perfil', { replace: true });
    } catch (err) {
      setFormError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Nueva contraseña"
      metaTitle="Restablecer contraseña · Zodiaq"
      subtitle="Elige una contraseña nueva para tu cuenta."
    >
      {hasRecoverySession === false ? (
        <p className="text-sm text-graphite">
          Este enlace no es válido o ha caducado. Solicita uno nuevo desde{' '}
          <a href="/recuperar-contrasena" className="text-cosmos-700 hover:underline">
            recuperar contraseña
          </a>
          .
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input
            label="Nueva contraseña"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(e) => setField('password', e.target.value)}
            error={errors.password}
            hint="Mínimo 8 caracteres, con mayúscula, minúscula y número."
          />
          <Input
            label="Repite la contraseña"
            type="password"
            autoComplete="new-password"
            value={values.confirm}
            onChange={(e) => setField('confirm', e.target.value)}
            error={errors.confirm}
          />
          {errors._form && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {errors._form}
            </p>
          )}
          <Button type="submit" fullWidth size="lg" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar contraseña'}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
