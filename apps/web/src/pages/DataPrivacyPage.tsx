import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
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
      <Helmet>
        <title>Mis datos · Zodiaq</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl text-ink">Mis datos</h1>
        <p className="mt-2 text-graphite">
          Tus derechos sobre tus datos personales (RGPD).
        </p>

        <div className="mt-8 space-y-6">
          <Card padding="lg">
            <CardTitle>Descargar mis datos</CardTitle>
            <p className="mt-2 text-sm text-graphite">
              Obtén una copia en formato JSON de toda la información asociada a
              tu cuenta: perfil, racha, lecturas, suscripción y consentimientos.
            </p>
            <div className="mt-4">
              <Button variant="secondary" onClick={onExport} disabled={exporting}>
                {exporting ? 'Preparando...' : 'Descargar JSON'}
              </Button>
            </div>
          </Card>

          <Card padding="lg" className="border-red-200">
            <CardTitle>Eliminar mi cuenta</CardTitle>
            <p className="mt-2 text-sm text-graphite">
              Esta acción es permanente. Se borrarán tu perfil, lecturas y todos
              tus datos. No se puede deshacer.
            </p>
            <div className="mt-4">
              <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                Eliminar mi cuenta
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Eliminar cuenta permanentemente"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              disabled={confirmText !== 'ELIMINAR' || deleting}
              onClick={onDelete}
            >
              {deleting ? 'Eliminando...' : 'Eliminar definitivamente'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-graphite">
          Para confirmar, escribe <strong>ELIMINAR</strong> en el campo. Esta
          acción borrará tu cuenta y todos tus datos de forma irreversible.
        </p>
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
