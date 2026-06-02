import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useZodForm } from '@/hooks/useZodForm';
import { forgotPasswordSchema } from '@/features/auth/validation';
import { requestPasswordReset, authErrorMessage } from '@/features/auth/api';
import { AuthShell } from '@/features/auth/AuthShell';
import { Shine } from '@/components/visual/Shine';
import { MailCheck, KeyRound, ShieldCheck } from 'lucide-react';

export function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const { values, errors, setField, validate, setFormError } = useZodForm(
    forgotPasswordSchema,
    { email: '' },
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = validate();
    if (!valid) return;
    setSubmitting(true);
    try {
      await requestPasswordReset(valid.email);
      setSent(true);
    } catch (err) {
      setFormError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Recupera tu contraseña"
      metaTitle="Recuperar contraseña · Zodiaq"
      variant="astral"
      pitch={
        <>
          Volvamos a
          <br />
          <Shine gold>conectarte</Shine>.
        </>
      }
      highlights={[
        { icon: MailCheck, text: 'Te enviamos un enlace seguro a tu correo' },
        { icon: KeyRound, text: 'Eliges una contraseña nueva en segundos' },
        { icon: ShieldCheck, text: 'Tu cuenta, siempre protegida' },
      ]}
      subtitle={
        sent
          ? undefined
          : 'Te enviaremos un enlace para crear una nueva contraseña.'
      }
      footer={
        <Link to="/login" className="font-medium text-cosmos-700 hover:underline">
          Volver a iniciar sesión
        </Link>
      }
    >
      {sent ? (
        <p className="text-sm text-graphite">
          Si existe una cuenta con <strong>{values.email}</strong>, recibirás un
          email con instrucciones para restablecer tu contraseña.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setField('email', e.target.value)}
            error={errors.email}
          />
          {errors._form && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {errors._form}
            </p>
          )}
          <Button type="submit" fullWidth size="lg" disabled={submitting}>
            {submitting ? 'Enviando...' : 'Enviar enlace'}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
