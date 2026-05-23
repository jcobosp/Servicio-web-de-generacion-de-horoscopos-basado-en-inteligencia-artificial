# LEGAL_COMPLIANCE.md — Cumplimiento legal (España / UE)

> Este documento es una guía operativa para que la plataforma cumpla la normativa aplicable a un servicio web español con tratamiento de datos personales y monetización. **No sustituye asesoramiento jurídico profesional;** si la plataforma se publica realmente, el responsable debe revisar los textos con un abogado.

## 1. Normativa aplicable

| Normativa | Qué obliga |
|---|---|
| **RGPD** (Reglamento UE 2016/679) | Tratamiento de datos personales: base legal, transparencia, derechos del interesado, brechas, etc. |
| **LOPDGDD** (LO 3/2018) | Adaptación nacional del RGPD + derechos digitales. |
| **LSSI-CE** (Ley 34/2002) | Información obligatoria del prestador de servicios + cookies + comercio electrónico. |
| **Ley de Cookies** (art. 22.2 LSSI) | Consentimiento previo informado para cookies no estrictamente necesarias. |
| **Directiva ePrivacy** | Comunicaciones electrónicas (emails marketing). |
| **TRLGDCU** (RDL 1/2007) | Derechos del consumidor en contratos a distancia (suscripción premium): información precontractual, desistimiento. |
| **Ley de Servicios Digitales (DSA)** | Aplica si la plataforma es muy grande — en TFM mencionar como conocido. |
| **Ley Crea y Crece** (factura electrónica) | Solo aplica a B2B; el TFM es B2C → no aplica directamente. |

## 2. Información obligatoria del prestador (LSSI art. 10)

Aviso legal debe contener:
- Nombre completo / denominación social.
- NIF / DNI.
- Domicilio (puede ser apartado de correos si el responsable es persona física).
- Email de contacto.
- Si fuera empresa: datos registrales.
- Códigos de conducta a los que se adhiera (si los hay).

⚠️ **USUARIO** debe rellenar estos datos en la página `/aviso-legal` antes de publicar.

## 3. Política de Privacidad — contenidos obligatorios (RGPD art. 13)

1. **Responsable del tratamiento:** datos del prestador.
2. **DPO:** si aplica (en TFM no, salvo que se traten datos a gran escala).
3. **Datos tratados:** email, nombre, fecha de nacimiento, hora y lugar de nacimiento (opcional), datos de pago (gestionados por Stripe, no se almacenan tarjetas), datos técnicos (IP, navegador).
4. **Finalidades:**
   - Prestación del servicio (base: ejecución de contrato).
   - Comunicaciones comerciales (base: consentimiento — opt-in expreso).
   - Cookies analíticas/publicitarias (base: consentimiento).
   - Cumplimiento de obligaciones legales (facturación, conservación).
5. **Plazos de conservación:**
   - Datos de cuenta: mientras la cuenta esté activa + 1 año tras baja.
   - Datos de facturación: 6 años (Código de Comercio).
   - Consentimientos: 6 años para acreditarlos.
6. **Destinatarios:** Supabase (alojamiento), Stripe (pagos), Google (Gemini API, AdSense). Indicar transferencias internacionales y garantías (cláusulas tipo).
7. **Derechos del interesado:** acceso, rectificación, supresión ("olvido"), oposición, limitación, portabilidad, retirar consentimiento, reclamar a AEPD.
8. **Cómo ejercer derechos:** email + plantilla.
9. **Información sobre decisiones automatizadas:** indicar que los contenidos se generan con IA (Gemini) y que no producen efectos jurídicos sobre el usuario (es solo entretenimiento).

## 4. Términos y Condiciones — secciones imprescindibles

1. Identificación del prestador.
2. Objeto del servicio (plataforma de horóscopo y astrología por IA, fines de entretenimiento, no asesoramiento médico/financiero/legal).
3. Registro y cuenta de usuario (mayor de edad / 14 años con permiso parental según LOPDGDD art. 7 — recomendación: **exigir 16+** o mayor de edad para simplificar).
4. Suscripción premium:
   - Precio, periodicidad, renovación automática.
   - Forma de pago (Stripe).
   - **Derecho de desistimiento de 14 días** en compras a distancia (TRLGDCU). Excepción art. 103(m): el usuario puede renunciar al desistimiento si acepta empezar a consumir contenido digital inmediatamente — debe ser una casilla clara en el checkout. Conviene ofrecer 14 días de "garantía de devolución" voluntaria como buena práctica.
   - Cancelación: se puede cancelar en cualquier momento; mantiene acceso hasta fin del periodo pagado.
5. Propiedad intelectual: los textos generados por IA pertenecen al usuario para uso personal, no comercial.
6. Conducta del usuario: prohibición de scraping, abuso, ingeniería inversa.
7. Limitación de responsabilidad: contenido es entretenimiento. No responde de decisiones tomadas por el usuario en base al contenido.
8. Modificaciones de los términos: notificación con 30 días.
9. Ley aplicable y jurisdicción: legislación española, tribunales del domicilio del consumidor.
10. Resolución alternativa: enlace a la **plataforma ODR de la UE** (`https://ec.europa.eu/consumers/odr`).

## 5. Política de Cookies y consentimiento

Cookies usadas en el proyecto:

| Cookie | Tipo | Finalidad | Requiere consentimiento |
|---|---|---|---|
| `sb-access-token` / `sb-refresh-token` | Técnica | Sesión Supabase | No (estrictamente necesaria) |
| `cookie-consent` | Técnica | Recordar la elección de cookies | No |
| AdSense | Publicidad | Anuncios personalizados | **Sí** |
| Google Analytics (si se usa) | Analítica | Métricas de uso | **Sí** |
| Stripe | Técnica (pago en sesión) | Procesar pago | No (cuando se inicia el checkout) |

### Banner de cookies

- Aparece en la primera visita y mientras no haya respuesta.
- Tres opciones visibles: **Aceptar todas** · **Rechazar todas** · **Personalizar**.
- "Rechazar" tan accesible como "Aceptar" (exigencia AEPD 2024).
- Si el usuario no responde y cierra el banner → tratar como rechazo (no consentir cookies no técnicas).
- El consentimiento se guarda en `legal_consents` + cookie `cookie-consent` con la elección.
- **Hasta que no haya consentimiento de la categoría "publicidad", AdSense NO se carga.** Mismo con analíticas.

### Renovación del consentimiento
- Cada 24 meses el banner vuelve a aparecer (recomendación AEPD).
- Se puede revisar la elección desde el footer ("Configurar cookies").

## 6. Datos personales — minimización

- En el registro pedir SOLO: email, password, nombre, fecha de nacimiento (para calcular signo), y checkbox de T&C + Privacidad.
- Hora y lugar de nacimiento: OPCIONALES, se piden solo si el usuario quiere carta natal. Se almacenan cifrados.
- No pedir teléfono, DNI, dirección postal, etc.

## 7. Edad mínima

Decisión del proyecto: **edad mínima 16 años** (alineada con LOPDGDD art. 7, que fija 14 años pero con consentimiento parental). Para evitar complicaciones de gestión de consentimiento parental, fijamos 16+. Comprobación: durante el registro, calcular edad a partir de `birth_date`; si <16, rechazar y mostrar mensaje.

## 8. Comunicaciones electrónicas (emails)

- **Doble opt-in:** al marcar "quiero recibir emails", enviar email de confirmación con link. Solo añadir a la lista tras confirmación.
- Cada email tiene un link de baja claro.
- En el panel de perfil, toggle para activar/desactivar marketing emails.
- Guardar versión del consentimiento.

## 9. Pagos y facturación

- Stripe es el responsable del tratamiento de los datos de la tarjeta (PCI DSS nivel 1). El proyecto **NO almacena datos de tarjeta**.
- Generar factura automáticamente al cobrar; almacenarla 6 años. Stripe genera facturas que cumplen los requisitos.
- IVA: comprobar antes de publicar si aplica IVA general (21%) según el tipo de servicio digital y la residencia del consumidor (MOSS / OSS para UE). En el TFM se documenta la decisión pero no se factura realmente.

## 10. Derecho de desistimiento — implementación

- En el checkout: casilla **"Acepto empezar a consumir el contenido digital inmediatamente y renuncio al derecho de desistimiento"** (no preseleccionada). Si el usuario NO marca, no se le da acceso premium hasta pasados 14 días → **alternativa práctica**: marcar por defecto NO + explicar que si desea acceso inmediato debe renunciar.
- Si el usuario solicita desistimiento dentro de los 14 días Y no marcó la renuncia: reembolso completo. Si la marcó: explicar que no procede.

## 11. AdSense y publicidad

- Cuenta de AdSense propia (⚠️ USUARIO).
- En España, AdSense requiere también una página de privacidad accesible y banner de cookies funcional. Sin esto, se rechaza la aprobación.
- Aviso en la política de privacidad: *"Utilizamos Google AdSense, que puede usar cookies para personalizar anuncios. Más info: https://policies.google.com/technologies/ads"*.
- Anuncios solo en plan free.
- Etiquetar contenido patrocinado si alguna vez se hiciera (en el TFM no aplica).

## 12. Brechas de seguridad

- Procedimiento documentado (aunque sea breve): si se detecta brecha que afecta datos personales y supone riesgo para los usuarios → notificar a la AEPD en 72 horas (art. 33 RGPD) + a los afectados si hay alto riesgo.
- Mantener un mini-registro interno: fecha, naturaleza, datos afectados, medidas adoptadas.

## 13. Plantilla de ejercicio de derechos

En la política de privacidad incluir email tipo `privacidad@{dominio}` (placeholder hasta tener dominio). Modelo de solicitud:

> *Asunto: Ejercicio de derechos RGPD*  
> *Soy {nombre}, titular del email {email}. Solicito ejercer mi derecho de {acceso/rectificación/supresión/portabilidad/oposición/limitación}. Adjunto copia de mi DNI.*

Plazo de respuesta: **1 mes** (prorrogable 2 meses).

## 14. Checklist final pre-publicación

- [ ] Aviso legal con datos completos del responsable.
- [ ] Política de privacidad publicada y enlazada en footer + en registro.
- [ ] T&C publicados y enlazados en checkbox de registro y checkout.
- [ ] Política de cookies + banner funcional con rechazo accesible.
- [ ] Email de contacto operativo para derechos.
- [ ] Endpoint funcional de "exportar mis datos" y "eliminar mi cuenta".
- [ ] AdSense bloqueado hasta consentimiento.
- [ ] Edad mínima validada en registro.
- [ ] Doble opt-in para marketing.
- [ ] Verificación email obligatoria.
- [ ] HTTPS en todo el sitio.

## 15. Cómo se aborda en el TFM

- Las páginas legales se publican como **plantillas reales con datos placeholder** (`[NOMBRE_RESPONSABLE]`, `[NIF]`, `[EMAIL_CONTACTO]`).
- En la memoria del TFM se documenta el cumplimiento legal como apartado propio.
- Se aclara que para publicación real el autor rellenará sus datos y revisará con un profesional jurídico.
