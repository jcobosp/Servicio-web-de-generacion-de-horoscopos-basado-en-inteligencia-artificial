import { LegalPage } from '@/components/legal/LegalPage';
import { company } from '@/features/legal/company';

export function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Política de privacidad"
      description="Cómo trata Zodiaq tus datos personales conforme al RGPD y la LOPDGDD."
      path="/politica-de-privacidad"
    >
      <p>
        Esta política explica cómo {company.brand} trata los datos personales de
        los usuarios conforme al Reglamento (UE) 2016/679 (RGPD) y a la Ley
        Orgánica 3/2018 (LOPDGDD).
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li>
          <strong>Titular:</strong> {company.responsibleName} (NIF{' '}
          {company.nif})
        </li>
        <li>
          <strong>Domicilio:</strong> {company.address}
        </li>
        <li>
          <strong>Contacto de privacidad:</strong>{' '}
          <a href={`mailto:${company.privacyEmail}`}>{company.privacyEmail}</a>
        </li>
      </ul>
      <p>
        No se ha designado un Delegado de Protección de Datos (DPO), al no
        tratarse de datos a gran escala que lo exijan.
      </p>

      <h2>2. Datos que tratamos</h2>
      <ul>
        <li>
          <strong>Datos de registro:</strong> correo electrónico, nombre y fecha
          de nacimiento (necesaria para calcular tu signo solar).
        </li>
        <li>
          <strong>Datos opcionales de carta natal:</strong> hora y lugar de
          nacimiento, solo si decides usar esta función. Se almacenan cifrados.
        </li>
        <li>
          <strong>Datos de pago:</strong> gestionados íntegramente por Stripe.
          No almacenamos los datos de tu tarjeta.
        </li>
        <li>
          <strong>Datos técnicos:</strong> dirección IP, identificador de
          navegador y datos de uso, en su caso, mediante cookies (ver la{' '}
          <a href="/politica-de-cookies">política de cookies</a>).
        </li>
      </ul>

      <h2>3. Finalidades y base jurídica</h2>
      <ul>
        <li>
          <strong>Prestar el servicio</strong> (cuenta, generación de
          horóscopos, suscripción): ejecución del contrato (art. 6.1.b RGPD).
        </li>
        <li>
          <strong>Enviar comunicaciones comerciales</strong>: tu consentimiento
          expreso (art. 6.1.a), revocable en cualquier momento.
        </li>
        <li>
          <strong>Cookies analíticas y publicitarias</strong>: tu
          consentimiento (art. 6.1.a).
        </li>
        <li>
          <strong>Cumplir obligaciones legales</strong> (facturación,
          conservación): art. 6.1.c.
        </li>
      </ul>

      <h2>4. Plazos de conservación</h2>
      <ul>
        <li>
          <strong>Datos de cuenta:</strong> mientras la cuenta esté activa y
          hasta 1 año tras su baja.
        </li>
        <li>
          <strong>Datos de facturación:</strong> 6 años (Código de Comercio).
        </li>
        <li>
          <strong>Consentimientos:</strong> 6 años para poder acreditarlos.
        </li>
      </ul>

      <h2>5. Destinatarios y transferencias internacionales</h2>
      <p>
        Para prestar el servicio recurrimos a proveedores que actúan como
        encargados del tratamiento:
      </p>
      <ul>
        <li>
          <strong>Supabase</strong> (alojamiento y base de datos, región de la
          UE).
        </li>
        <li>
          <strong>Stripe</strong> (procesamiento de pagos).
        </li>
        <li>
          <strong>Google</strong> (Gemini API para generar contenido y, en el
          plan gratuito, Google AdSense).
        </li>
      </ul>
      <p>
        Cuando algún proveedor trate datos fuera del Espacio Económico Europeo,
        dichas transferencias se amparan en las garantías adecuadas previstas en
        el RGPD (por ejemplo, cláusulas contractuales tipo).
      </p>

      <h2>6. Decisiones automatizadas e inteligencia artificial</h2>
      <p>
        Los contenidos (horóscopos, interpretaciones, tarot) se generan con un
        modelo de inteligencia artificial (Google Gemini). Tienen carácter de
        entretenimiento y <strong>no producen efectos jurídicos</strong> ni
        decisiones que te afecten significativamente en el sentido del art. 22
        RGPD.
      </p>

      <h2>7. Tus derechos</h2>
      <p>
        Puedes ejercer los derechos de acceso, rectificación, supresión
        («olvido»), oposición, limitación del tratamiento, portabilidad y a
        retirar el consentimiento en cualquier momento, escribiendo a{' '}
        <a href={`mailto:${company.privacyEmail}`}>{company.privacyEmail}</a>.
        Modelo de solicitud:
      </p>
      <p>
        <em>
          «Soy [nombre], titular del email [email]. Solicito ejercer mi derecho
          de [acceso/rectificación/supresión/portabilidad/oposición/limitación].
          Adjunto copia de mi documento de identidad.»
        </em>
      </p>
      <p>
        Responderemos en el plazo máximo de 1 mes (prorrogable 2 meses en casos
        complejos). Para tu comodidad, desde{' '}
        <a href="/perfil/datos">Mis datos</a> puedes descargar toda tu
        información (portabilidad) y eliminar tu cuenta directamente.
      </p>
      <p>
        Si consideras que no hemos atendido correctamente tu solicitud, puedes
        reclamar ante la Agencia Española de Protección de Datos (AEPD,{' '}
        <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
          www.aepd.es
        </a>
        ).
      </p>

      <h2>8. Edad mínima</h2>
      <p>
        El uso de {company.brand} está reservado a personas mayores de 16 años.
        Verificamos la edad durante el registro a partir de la fecha de
        nacimiento.
      </p>

      <h2>9. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas apropiadas. Los datos viajan
        cifrados por HTTPS y se cifran en reposo. En caso de brecha de seguridad
        que suponga un riesgo para tus derechos, lo notificaremos a la AEPD en un
        plazo de 72 horas y, si procede, a los afectados.
      </p>

      <h2>10. Cambios en esta política</h2>
      <p>
        Podemos actualizar esta política para adaptarla a cambios normativos o
        del servicio. Te informaremos de los cambios sustanciales por los medios
        habituales.
      </p>
    </LegalPage>
  );
}
