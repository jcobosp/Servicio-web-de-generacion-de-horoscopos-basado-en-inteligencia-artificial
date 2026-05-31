import { LegalPage } from '@/components/legal/LegalPage';
import { company } from '@/features/legal/company';

export function LegalNoticePage() {
  return (
    <LegalPage
      title="Aviso legal"
      description="Información del prestador del servicio Zodiaq conforme al artículo 10 de la LSSI-CE."
      path="/aviso-legal"
    >
      <p>
        En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de
        Servicios de la Sociedad de la Información y de Comercio Electrónico
        (LSSI-CE), se facilita la siguiente información sobre el titular de este
        sitio web.
      </p>

      <h2>1. Datos del responsable</h2>
      <ul>
        <li>
          <strong>Titular:</strong> {company.responsibleName}
        </li>
        <li>
          <strong>NIF/DNI:</strong> {company.nif}
        </li>
        <li>
          <strong>Domicilio:</strong> {company.address}
        </li>
        <li>
          <strong>Correo de contacto:</strong>{' '}
          <a href={`mailto:${company.contactEmail}`}>{company.contactEmail}</a>
        </li>
        <li>
          <strong>Sitio web:</strong> {company.siteUrl}
        </li>
      </ul>

      <h2>2. Objeto</h2>
      <p>
        {company.brand} es una plataforma web de horóscopos y contenidos de
        astrología generados mediante inteligencia artificial, ofrecida con
        fines exclusivamente de entretenimiento. El contenido no constituye
        asesoramiento médico, psicológico, financiero ni jurídico, y no debe
        utilizarse como tal.
      </p>

      <h2>3. Condiciones de uso</h2>
      <p>
        El acceso y la navegación por este sitio implican la aceptación de las
        condiciones recogidas en este aviso legal, en los{' '}
        <a href="/terminos-y-condiciones">términos y condiciones</a>, en la{' '}
        <a href="/politica-de-privacidad">política de privacidad</a> y en la{' '}
        <a href="/politica-de-cookies">política de cookies</a>. El usuario se
        compromete a hacer un uso adecuado de los contenidos y a no emplearlos
        para actividades ilícitas o contrarias a la buena fe.
      </p>

      <h2>4. Propiedad intelectual e industrial</h2>
      <p>
        El diseño del sitio, su código, marcas, logotipos y demás elementos
        distintivos son titularidad del responsable o de terceros que han
        autorizado su uso. Queda prohibida su reproducción, distribución o
        transformación sin autorización expresa. El régimen de los textos
        generados por inteligencia artificial se detalla en los{' '}
        <a href="/terminos-y-condiciones">términos y condiciones</a>.
      </p>

      <h2>5. Responsabilidad</h2>
      <p>
        El responsable no se hace responsable de las decisiones que el usuario
        pueda tomar con base en los contenidos del sitio, que tienen carácter
        orientativo y de entretenimiento. Tampoco responde de las
        interrupciones del servicio ajenas a su control ni de los daños
        derivados del uso de sitios de terceros enlazados.
      </p>

      <h2>6. Legislación aplicable</h2>
      <p>
        Este aviso legal se rige por la legislación española. Para la resolución
        de controversias serán competentes los juzgados y tribunales que
        correspondan conforme a la normativa de consumidores y usuarios.
      </p>
    </LegalPage>
  );
}
