import { LegalPage } from '@/components/legal/LegalPage';
import { company } from '@/features/legal/company';

export function TermsPage() {
  return (
    <LegalPage
      title="Términos y condiciones"
      description="Condiciones de uso del servicio Zodiaq: cuenta, suscripción premium y derechos del usuario."
      path="/terminos-y-condiciones"
    >
      <p>
        Estos términos regulan el uso de la plataforma {company.brand}. Al
        registrarte y utilizar el servicio aceptas estas condiciones en su
        totalidad.
      </p>

      <h2>1. Prestador del servicio</h2>
      <p>
        El servicio lo presta {company.responsibleName} (NIF {company.nif}),
        cuyos datos completos figuran en el{' '}
        <a href="/aviso-legal">aviso legal</a>.
      </p>

      <h2>2. Objeto del servicio</h2>
      <p>
        {company.brand} ofrece horóscopos y contenidos de astrología generados
        con inteligencia artificial, con <strong>fines de entretenimiento</strong>.
        El contenido no constituye asesoramiento médico, psicológico, financiero
        ni jurídico.
      </p>

      <h2>3. Registro y cuenta</h2>
      <ul>
        <li>Debes ser mayor de 16 años para registrarte.</li>
        <li>
          Te comprometes a facilitar datos veraces y a custodiar tus
          credenciales. Las contraseñas las gestiona de forma segura el sistema
          de autenticación; nunca tenemos acceso a ellas en claro.
        </li>
        <li>Una cuenta es personal e intransferible.</li>
      </ul>

      <h2>4. Plan gratuito y plan premium</h2>
      <p>
        El plan gratuito incluye contenido por signo y se financia con
        publicidad (Google AdSense). El plan premium es una suscripción de pago
        que desbloquea funciones avanzadas y elimina la publicidad.
      </p>
      <ul>
        <li>
          <strong>Precio y periodicidad:</strong> se muestran claramente antes
          de contratar, con renovación automática al final de cada periodo.
        </li>
        <li>
          <strong>Forma de pago:</strong> a través de Stripe.
        </li>
        <li>
          <strong>Cancelación:</strong> puedes cancelar en cualquier momento;
          conservarás el acceso premium hasta el final del periodo ya pagado, sin
          nuevas renovaciones.
        </li>
      </ul>

      <h2>5. Derecho de desistimiento</h2>
      <p>
        Como consumidor, dispones de 14 días naturales para desistir de la
        contratación (art. 102 TRLGDCU). No obstante, al tratarse de contenido
        digital, en el momento de la compra podrás{' '}
        <strong>
          solicitar el acceso inmediato y renunciar expresamente al derecho de
          desistimiento
        </strong>{' '}
        (art. 103.m TRLGDCU) mediante una casilla específica no preseleccionada.
        Si no la marcas, conservas el derecho de desistimiento durante 14 días.
      </p>

      <h2>6. Propiedad intelectual del contenido generado</h2>
      <p>
        Los textos que el sistema genera para ti se destinan a tu{' '}
        <strong>uso personal y no comercial</strong>. El diseño, el software y
        las marcas de la plataforma son titularidad del prestador o de sus
        licenciantes.
      </p>

      <h2>7. Conducta del usuario</h2>
      <p>
        Queda prohibido el scraping, la ingeniería inversa, el acceso no
        autorizado, el abuso del servicio y cualquier uso que perjudique a la
        plataforma o a terceros.
      </p>

      <h2>8. Limitación de responsabilidad</h2>
      <p>
        El contenido es orientativo y de entretenimiento. El prestador no
        responde de las decisiones que tomes basándote en él ni de
        interrupciones del servicio ajenas a su control.
      </p>

      <h2>9. Modificaciones</h2>
      <p>
        Podremos modificar estos términos notificándolo con una antelación de 30
        días para los cambios sustanciales. El uso continuado tras la entrada en
        vigor implica su aceptación.
      </p>

      <h2>10. Ley aplicable y resolución de conflictos</h2>
      <p>
        Estos términos se rigen por la legislación española. Como consumidor,
        podrás acudir a los tribunales de tu domicilio. Asimismo, la Comisión
        Europea ofrece una plataforma de resolución de litigios en línea:{' '}
        <a
          href="https://ec.europa.eu/consumers/odr"
          target="_blank"
          rel="noopener noreferrer"
        >
          ec.europa.eu/consumers/odr
        </a>
        .
      </p>
    </LegalPage>
  );
}
