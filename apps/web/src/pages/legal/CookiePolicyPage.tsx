import { LegalPage } from '@/components/legal/LegalPage';
import { Button } from '@/components/ui/Button';
import { company } from '@/features/legal/company';
import { useConsent } from '@/features/legal/ConsentProvider';

export function CookiePolicyPage() {
  const { openPreferences } = useConsent();

  return (
    <LegalPage
      title="Política de cookies"
      description="Qué cookies usa Zodiaq, para qué sirven y cómo gestionar tu consentimiento."
    >
      <p>
        Una cookie es un pequeño archivo que un sitio web guarda en tu navegador.
        En {company.brand} usamos cookies técnicas necesarias y, solo con tu
        permiso, cookies analíticas y de publicidad, conforme al artículo 22.2 de
        la LSSI-CE.
      </p>

      <h2>1. Cookies que utilizamos</h2>
      <table>
        <thead>
          <tr>
            <th>Cookie</th>
            <th>Tipo</th>
            <th>Finalidad</th>
            <th>Consentimiento</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>sb-access-token / sb-refresh-token</td>
            <td>Técnica</td>
            <td>Mantener tu sesión iniciada</td>
            <td>No requiere</td>
          </tr>
          <tr>
            <td>cookie-consent</td>
            <td>Técnica</td>
            <td>Recordar tu elección de cookies</td>
            <td>No requiere</td>
          </tr>
          <tr>
            <td>Google Analytics</td>
            <td>Analítica</td>
            <td>Medir el uso de la plataforma</td>
            <td>Requiere</td>
          </tr>
          <tr>
            <td>Google AdSense</td>
            <td>Publicidad</td>
            <td>Mostrar anuncios (plan gratuito)</td>
            <td>Requiere</td>
          </tr>
          <tr>
            <td>Stripe</td>
            <td>Técnica</td>
            <td>Procesar el pago durante el checkout</td>
            <td>No requiere</td>
          </tr>
        </tbody>
      </table>

      <h2>2. Tu consentimiento: «aceptar o suscribirte»</h2>
      <p>
        En {company.brand} aplicamos el modelo de <strong>«consentir o
        suscribirse»</strong> admitido por la Guía sobre el uso de cookies de la
        AEPD (mayo de 2024): para usar la plataforma de forma <strong>gratuita</strong>{' '}
        te pedimos que aceptes las cookies analíticas y de publicidad que financian
        el servicio; como <strong>alternativa real</strong>, puedes{' '}
        <strong>suscribirte a Premium</strong> y navegar <strong>sin publicidad</strong>{' '}
        (a un precio razonable y proporcionado). No te ofrecemos un acceso gratuito
        sin anuncios, pero sí esta doble vía, claramente y sin casillas
        premarcadas.
      </p>
      <p>
        Las cookies técnicas funcionan siempre. Ninguna cookie de analítica o de
        publicidad se activa hasta que la consientes: hasta entonces,{' '}
        <strong>los scripts de analítica y de AdSense no se cargan</strong>. Si
        eres usuario Premium, la publicidad queda desactivada y no se carga AdSense.
      </p>
      <p>
        La analítica es siempre una elección libre que puedes activar o desactivar.
        Puedes cambiar tu decisión o revocar tu consentimiento cuando quieras (de
        forma tan sencilla como lo diste, art. 7.3 RGPD) desde aquí o desde el
        enlace «Configurar cookies» del pie de página:
      </p>
      <p>
        <Button onClick={openPreferences}>Configurar cookies</Button>
      </p>

      <h2>3. Vigencia y renovación</h2>
      <p>
        Tu elección se conserva durante un máximo de 24 meses; transcurrido ese
        plazo te volveremos a preguntar, siguiendo la recomendación de la AEPD.
        Si modificamos las categorías de cookies, también te pediremos un nuevo
        consentimiento.
      </p>

      <h2>4. Gestión desde el navegador</h2>
      <p>
        Además de nuestro panel, puedes bloquear o eliminar cookies desde la
        configuración de tu navegador. Ten en cuenta que desactivar las cookies
        técnicas puede impedir el funcionamiento correcto de la plataforma.
      </p>

      <h2>5. Más información</h2>
      <p>
        Sobre la publicidad de Google y el uso de cookies para personalizar
        anuncios puedes consultar{' '}
        <a
          href="https://policies.google.com/technologies/ads"
          target="_blank"
          rel="noopener noreferrer"
        >
          policies.google.com/technologies/ads
        </a>
        . Para más detalle sobre el tratamiento de tus datos, revisa la{' '}
        <a href="/politica-de-privacidad">política de privacidad</a>.
      </p>
    </LegalPage>
  );
}
