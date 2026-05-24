import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import { signOut } from '@/features/auth/api';
import { useProfile, useUpdateProfile } from '@/features/profile/hooks';
import type { Profile } from '@/features/profile/hooks';
import { ZODIAC } from '@/lib/zodiac';
import type { ZodiacSign } from '@/lib/zodiac';

function AccountForm({ profile, email }: { profile: Profile; email: string }) {
  const updateProfile = useUpdateProfile();
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [timezone, setTimezone] = useState(profile.timezone ?? '');

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        display_name: displayName.trim(),
        timezone: timezone.trim() || null,
      });
      toast.success('Perfil actualizado.');
    } catch {
      toast.error('No se pudo guardar. Inténtalo de nuevo.');
    }
  }

  return (
    <Card padding="lg">
      <CardTitle>Datos de la cuenta</CardTitle>
      <form onSubmit={onSave} className="mt-4 space-y-4">
        <Input
          label="Nombre"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <Input
          label="Email"
          value={email}
          disabled
          hint="El email no se puede cambiar desde aquí."
        />
        <Input
          label="Fecha de nacimiento"
          value={profile.birth_date}
          disabled
          hint="Tu signo se calcula a partir de esta fecha."
        />
        <Input
          label="Zona horaria (opcional)"
          placeholder="Europe/Madrid"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          hint="Útil para personalizar tu carta natal."
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, emailConfirmed } = useAuth();
  const { data: profile, isLoading } = useProfile();

  async function onLogout() {
    await signOut();
    navigate('/', { replace: true });
  }

  const sign =
    profile?.sun_sign && profile.sun_sign in ZODIAC
      ? ZODIAC[profile.sun_sign as ZodiacSign]
      : null;

  return (
    <>
      <Helmet>
        <title>Mi perfil · Zodiaq</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="font-display text-3xl text-ink">Mi perfil</h1>
          <Button variant="ghost" onClick={onLogout}>
            Cerrar sesión
          </Button>
        </div>

        {!emailConfirmed && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Tu email aún no está confirmado. Revisa tu bandeja de entrada para
            activar todas las funciones.
          </div>
        )}

        {isLoading || !profile ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <Card padding="lg">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl text-white"
                  style={
                    sign
                      ? {
                          backgroundImage: `linear-gradient(135deg, ${sign.colors.from}, ${sign.colors.to})`,
                        }
                      : { backgroundColor: 'var(--color-cosmos-500)' }
                  }
                  aria-hidden="true"
                >
                  {sign?.glyph ?? '✦'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle>{profile.display_name}</CardTitle>
                    {sign && <Badge tone="cosmos">{sign.name}</Badge>}
                  </div>
                  <p className="mt-0.5 text-sm text-graphite">{user?.email}</p>
                </div>
              </div>
            </Card>

            <AccountForm profile={profile} email={user?.email ?? ''} />

            <Card padding="lg">
              <CardTitle>Privacidad y datos</CardTitle>
              <p className="mt-2 text-sm text-graphite">
                Puedes descargar una copia de tus datos o eliminar tu cuenta de
                forma permanente.
              </p>
              <div className="mt-4">
                <Link
                  to="/perfil/datos"
                  className="text-sm font-medium text-cosmos-700 hover:underline"
                >
                  Gestionar mis datos →
                </Link>
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
