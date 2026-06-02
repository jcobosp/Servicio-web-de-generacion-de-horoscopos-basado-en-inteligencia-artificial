import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Crown, ShieldCheck, LogOut, User, Clock, ArrowRight } from 'lucide-react';
import { Seo } from '@/lib/seo';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Section } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { toast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import { signOut } from '@/features/auth/api';
import { useProfile, useUpdateProfile } from '@/features/profile/hooks';
import type { Profile } from '@/features/profile/hooks';
import { useSubscription } from '@/features/billing/hooks';
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
    <Card padding="lg" className="sm:p-8">
      <p className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight text-ink">
        <User className="h-6 w-6 text-cosmos-600" aria-hidden="true" /> Datos de la cuenta
      </p>
      <form onSubmit={onSave} className="mt-5 space-y-4">
        <Input label="Nombre" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        <Input label="Email" value={email} disabled hint="El email no se puede cambiar desde aquí." />
        <Input
          label="Fecha de nacimiento"
          value={profile.birth_date}
          disabled
          hint="Tu signo se calcula a partir de esta fecha."
        />
        <Input
          label="Zona horaria (opcional)"
          placeholder="Europe/Madrid"
          leftAddon={<Clock className="h-4 w-4" />}
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
  const { data: subscription } = useSubscription();
  const isPremium = Boolean(
    subscription && ['active', 'trialing'].includes(subscription.status),
  );

  async function onLogout() {
    await signOut();
    navigate('/', { replace: true });
  }

  const sign =
    profile?.sun_sign && profile.sun_sign in ZODIAC
      ? ZODIAC[profile.sun_sign as ZodiacSign]
      : null;

  const fromColor = sign?.colors.from ?? '#6366f1';
  const toColor = sign?.colors.to ?? '#a855f7';

  return (
    <>
      <Seo
        title="Mi perfil · Zodiaq"
        description="Tu perfil de Zodiaq: signo, racha, datos de la cuenta y preferencias."
        noindex
      />

      {/* Banner del perfil con el color del signo */}
      <Section width="full" className="px-3 pt-4 sm:px-4 lg:px-6">
        <div
          className="relative isolate overflow-hidden rounded-[2.5rem] px-6 py-10 text-white shadow-lift sm:px-12 sm:py-12"
          style={{ backgroundImage: `linear-gradient(135deg, ${fromColor}, ${toColor})` }}
        >
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/30 via-black/10 to-black/45" />
          <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl animate-float-slow" />
          {isLoading || !profile ? (
            <div className="relative z-10">
              <Skeleton className="h-20 w-72 bg-white/20" />
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div className="flex items-center gap-5">
                <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 ring-1 ring-white/30 backdrop-blur">
                  <Sparkles className="h-10 w-10 text-white" aria-hidden="true" />
                </span>
                <div>
                  <p className="flex flex-wrap items-center gap-3">
                    <span className="font-display text-4xl font-black tracking-tight [text-shadow:0_2px_16px_rgba(0,0,0,0.3)] sm:text-5xl">
                      {profile.display_name}
                    </span>
                    {sign && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-bold ring-1 ring-white/30 backdrop-blur">
                        {sign.name}
                      </span>
                    )}
                    {isPremium && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-300 px-3 py-1 text-sm font-black text-[#3b1d0a]">
                        <Crown className="h-3.5 w-3.5" aria-hidden="true" /> Premium
                      </span>
                    )}
                  </p>
                  <p className="mt-1.5 text-white/85">{user?.email}</p>
                </div>
              </div>
              <Button variant="ghost" onClick={onLogout} className="!text-white hover:!bg-white/15" leftIcon={<LogOut className="h-4 w-4" />}>
                Cerrar sesión
              </Button>
            </div>
          )}
        </div>
      </Section>

      <Section width="default" className="py-8">
        {!emailConfirmed && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            Tu email aún no está confirmado. Revisa tu bandeja de entrada para activar
            todas las funciones.
          </div>
        )}

        {isLoading || !profile ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <Reveal>
              <AccountForm profile={profile} email={user?.email ?? ''} />
            </Reveal>

            <Reveal>
              <Card
                tone={isPremium ? 'premium' : 'default'}
                padding="lg"
                className="relative overflow-hidden sm:p-8"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight text-ink">
                    <Crown className={isPremium ? 'h-6 w-6 text-gold-600' : 'h-6 w-6 text-silver'} aria-hidden="true" />
                    Suscripción
                  </p>
                  {isPremium ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 px-3 py-1 text-sm font-black text-white">
                      <Crown className="h-3.5 w-3.5" aria-hidden="true" /> Premium activo
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-graphite">Plan gratuito</span>
                  )}
                </div>
                <p className="mt-3 text-base text-graphite">
                  {isPremium
                    ? 'Gestiona tu plan, cambia entre mensual y anual o consulta tus facturas.'
                    : 'Suscríbete para desbloquear la carta natal completa, compatibilidad avanzada, reportes personalizados y la experiencia sin anuncios.'}
                </p>
                <div className="mt-5">
                  <Link
                    to={isPremium ? '/perfil/suscripcion' : '/premium'}
                    className="inline-flex items-center gap-1.5 font-bold text-cosmos-700 transition hover:gap-2.5"
                  >
                    {isPremium ? 'Gestionar mi suscripción' : 'Ver planes premium'}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </Card>
            </Reveal>

            <Reveal>
              <Card padding="lg" className="sm:p-8">
                <p className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight text-ink">
                  <ShieldCheck className="h-6 w-6 text-emerald-600" aria-hidden="true" /> Privacidad y datos
                </p>
                <p className="mt-3 text-base text-graphite">
                  Puedes descargar una copia de tus datos o eliminar tu cuenta de forma permanente.
                </p>
                <div className="mt-5">
                  <Link
                    to="/perfil/datos"
                    className="inline-flex items-center gap-1.5 font-bold text-cosmos-700 transition hover:gap-2.5"
                  >
                    Gestionar mis datos
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </Card>
            </Reveal>
          </div>
        )}
      </Section>
    </>
  );
}
