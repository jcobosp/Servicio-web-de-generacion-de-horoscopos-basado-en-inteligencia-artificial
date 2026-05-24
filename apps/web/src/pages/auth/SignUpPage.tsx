import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { useZodForm } from '@/hooks/useZodForm';
import { signUpSchema } from '@/features/auth/validation';
import { signUp, authErrorMessage } from '@/features/auth/api';
import { AuthShell } from '@/features/auth/AuthShell';
import { useAuth } from '@/features/auth/AuthProvider';
import { getZodiacSign, ZODIAC } from '@/lib/zodiac';

export function SignUpPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const { values, errors, setField, validate, setFormError } = useZodForm(
    signUpSchema,
    {
      displayName: '',
      email: '',
      password: '',
      birthDate: '',
      acceptTerms: false,
      marketingOptIn: false,
    },
  );

  if (session) return <Navigate to="/perfil" replace />;

  const computedSign =
    values.birthDate && !Number.isNaN(Date.parse(values.birthDate))
      ? ZODIAC[getZodiacSign(new Date(values.birthDate))]
      : null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = validate();
    if (!valid) return;
    setSubmitting(true);
    try {
      await signUp({
        email: valid.email,
        password: valid.password,
        displayName: valid.displayName,
        birthDate: valid.birthDate,
        marketingOptIn: valid.marketingOptIn,
      });
      setDone(true);
    } catch (err) {
      setFormError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <AuthShell
        title="Revisa tu correo"
        metaTitle="Confirma tu cuenta · Zodiaq"
        subtitle="Te hemos enviado un enlace de confirmación."
      >
        <div className="space-y-4 text-sm text-graphite">
          <p>
            Hemos enviado un email a <strong>{values.email}</strong>. Haz clic
            en el enlace para activar tu cuenta y empezar a leer tu horóscopo.
          </p>
          <p className="text-silver">
            ¿No lo ves? Revisa la carpeta de spam o promociones.
          </p>
          <Button variant="secondary" fullWidth onClick={() => navigate('/login')}>
            Ir a iniciar sesión
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Crea tu cuenta"
      metaTitle="Registro · Zodiaq"
      subtitle="Solo te pedimos lo imprescindible para calcular tu signo."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-cosmos-700 hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Nombre"
          autoComplete="given-name"
          value={values.displayName}
          onChange={(e) => setField('displayName', e.target.value)}
          error={errors.displayName}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => setField('email', e.target.value)}
          error={errors.email}
        />
        <Input
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(e) => setField('password', e.target.value)}
          error={errors.password}
          hint="Mínimo 8 caracteres, con mayúscula, minúscula y número."
        />
        <div>
          <Input
            label="Fecha de nacimiento"
            type="date"
            autoComplete="bday"
            value={values.birthDate}
            onChange={(e) => setField('birthDate', e.target.value)}
            error={errors.birthDate}
          />
          {computedSign && !errors.birthDate && (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-cosmos-700">
              <span aria-hidden="true" className="text-lg">
                {computedSign.glyph}
              </span>
              Tu signo es <strong>{computedSign.name}</strong>
            </p>
          )}
        </div>

        <Checkbox
          checked={values.acceptTerms}
          onChange={(e) => setField('acceptTerms', e.target.checked)}
          error={errors.acceptTerms}
          label={
            <>
              He leído y acepto los{' '}
              <Link
                to="/terminos-y-condiciones"
                target="_blank"
                className="text-cosmos-700 hover:underline"
              >
                términos y condiciones
              </Link>{' '}
              y la{' '}
              <Link
                to="/politica-de-privacidad"
                target="_blank"
                className="text-cosmos-700 hover:underline"
              >
                política de privacidad
              </Link>
              .
            </>
          }
        />
        <Checkbox
          checked={values.marketingOptIn}
          onChange={(e) => setField('marketingOptIn', e.target.checked)}
          label="Quiero recibir mi horóscopo y novedades por email (opcional)."
        />

        {errors._form && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {errors._form}
          </p>
        )}

        <Button type="submit" fullWidth size="lg" disabled={submitting}>
          {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>
      </form>
    </AuthShell>
  );
}
