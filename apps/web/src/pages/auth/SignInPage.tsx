import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useZodForm } from '@/hooks/useZodForm';
import { signInSchema } from '@/features/auth/validation';
import { signIn, authErrorMessage } from '@/features/auth/api';
import { AuthShell } from '@/features/auth/AuthShell';
import { useAuth } from '@/features/auth/AuthProvider';

interface LocationState {
  from?: string;
}

export function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const { values, errors, setField, validate, setFormError } = useZodForm(
    signInSchema,
    { email: '', password: '' },
  );

  const from = (location.state as LocationState | null)?.from ?? '/perfil';

  if (session) return <Navigate to={from} replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = validate();
    if (!valid) return;
    setSubmitting(true);
    try {
      await signIn(valid.email, valid.password);
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Inicia sesión"
      metaTitle="Iniciar sesión · Zodiaq"
      subtitle="Tu horóscopo te está esperando."
      footer={
        <>
          ¿Aún no tienes cuenta?{' '}
          <Link to="/registro" className="font-medium text-cosmos-700 hover:underline">
            Regístrate gratis
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => setField('email', e.target.value)}
          error={errors.email}
        />
        <div>
          <Input
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={(e) => setField('password', e.target.value)}
            error={errors.password}
          />
          <div className="mt-1.5 text-right">
            <Link
              to="/recuperar-contrasena"
              className="text-sm text-cosmos-700 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        {errors._form && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {errors._form}
          </p>
        )}

        <Button type="submit" fullWidth size="lg" disabled={submitting}>
          {submitting ? 'Entrando...' : 'Iniciar sesión'}
        </Button>
      </form>
    </AuthShell>
  );
}
