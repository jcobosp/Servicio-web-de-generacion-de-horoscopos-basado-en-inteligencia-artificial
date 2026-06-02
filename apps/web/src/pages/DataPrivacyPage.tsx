import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Download, Trash2, ArrowLeft, FileJson, AlertTriangle } from 'lucide-react';
import { Seo } from '@/lib/seo';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Section } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { toast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import { collectMyData, downloadJson, deleteMyAccount } from '@/features/privacy/api';

export function DataPrivacyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  async function onExport() {
    if (!user) return;
    setExporting(true);
    try {
      const data = await collectMyData(user.id, user.email ?? '');
      downloadJson(`zodiaq-mis-datos-${user.id.slice(0, 8)}.json`, data);
      toast.success('Descarga preparada.');
    } catch {
      toast.error('No se pudo exportar. Inténtalo de nuevo.');
    } finally {
      setExporting(false);
    }
  }

  async function onDelete() {
    setDeleting(true);
    try {
      await deleteMyAccount();
      toast.success('Tu cuenta ha sido eliminada.');
      navigate('/', { replace: true });
    } catch {
      toast.error('No se pudo eliminar la cuenta. Inténtalo más tarde.');
      setDeleting(false);
    }
  }

  return (
    <>
      <Seo
        title="Mis datos · Zodiaq"
        description="Gestiona tus datos personales en Zodiaq: exporta tu información o elimina tu cuenta conforme al RGPD."
        noindex
      />

      {/* Banner */}
      <Section width="full" className="px-3 pt-4 sm:px-4 lg:px-6">
        <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-950 px-6 py-10 text-white shadow-lift sm:px-12 sm:py-12">
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/25 via-black/5 to-black/40" />
          <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl animate-float-slow" />
          <div className="relative z-10">
            <Link to="/perfil" className="inline-flex items-center gap-1.5 text-sm text-white/70 transition hover:text-white">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Mi perfil
            </Link>
            <p className="mt-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-emerald-100">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Privacidad · RGPD
            </p>
            <h1 className="mt-2 font-display text-4xl font-black tracking-tight [text-shadow:0_2px_24px_rgba(0,0,0,0.35)] sm:text-5xl">
              Mis datos
            </h1>
            <p className="mt-3 max-w-xl text-white/85">
              Tú mandas sobre tu información. Exporta una copia o elimina tu cuenta
              cuando quieras.
            </p>
          </div>
        </div>
      </Section>

      <Section width="default" className="py-8">
        <div className="space-y-6">
          <Reveal>
            <Card padding="lg" className="relative overflow-hidden sm:p-8">
              <span aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl" />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-soft">
                  <FileJson className="h-7 w-7" aria-hidden="true" />
                </span>
                <div className="flex-1">
                  <p className="font-display text-2xl font-extrabold tracking-tight text-ink">Descargar mis datos</p>
                  <p className="mt-2 text-base leading-relaxed text-graphite">
                    Obtén una copia en formato JSON de toda la información asociada a tu
                    cuenta: perfil, racha, lecturas, suscripción y consentimientos.
                  </p>
                  <div className="mt-5">
                    <Button variant="secondary" onClick={onExport} disabled={exporting} leftIcon={<Download className="h-5 w-5" />}>
                      {exporting ? 'Preparando...' : 'Descargar JSON'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </Reveal>

          <Reveal>
            <Card padding="lg" className="relative overflow-hidden border-2 border-red-200 sm:p-8">
              <span aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-red-200/40 blur-3xl" />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 text-white shadow-soft">
                  <Trash2 className="h-7 w-7" aria-hidden="true" />
                </span>
                <div className="flex-1">
                  <p className="font-display text-2xl font-extrabold tracking-tight text-ink">Eliminar mi cuenta</p>
                  <p className="mt-2 text-base leading-relaxed text-graphite">
                    Esta acción es permanente. Se borrarán tu perfil, lecturas y todos tus
                    datos. No se puede deshacer.
                  </p>
                  <div className="mt-5">
                    <Button variant="danger" onClick={() => setConfirmOpen(true)} leftIcon={<Trash2 className="h-5 w-5" />}>
                      Eliminar mi cuenta
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </Reveal>
        </div>
      </Section>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Eliminar cuenta permanentemente"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" disabled={confirmText !== 'ELIMINAR' || deleting} onClick={onDelete}>
              {deleting ? 'Eliminando...' : 'Eliminar definitivamente'}
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
          <p className="text-sm text-graphite">
            Para confirmar, escribe <strong>ELIMINAR</strong> en el campo. Esta acción
            borrará tu cuenta y todos tus datos de forma irreversible.
          </p>
        </div>
        <div className="mt-4">
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="ELIMINAR"
            aria-label="Escribe ELIMINAR para confirmar"
          />
        </div>
      </Modal>
    </>
  );
}
