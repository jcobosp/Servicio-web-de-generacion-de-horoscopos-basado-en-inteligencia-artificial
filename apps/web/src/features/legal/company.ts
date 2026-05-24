/**
 * Datos del responsable del tratamiento y metadatos legales.
 *
 * ⚠️ ACCIÓN MANUAL (antes de publicar): sustituir los placeholders entre
 * corchetes por los datos reales del responsable (LSSI art. 10 + RGPD art. 13).
 * Este es el ÚNICO archivo que hay que editar: todas las páginas legales leen
 * de aquí.
 */
export const company = {
  brand: 'Zodiaq',
  /** Nombre completo o denominación social del responsable. */
  responsibleName: '[NOMBRE_RESPONSABLE]',
  /** NIF / DNI del responsable. */
  nif: '[NIF]',
  /** Domicilio o apartado de correos (persona física puede usar apartado). */
  address: '[DIRECCIÓN_O_APARTADO_DE_CORREOS]',
  /** Email de contacto general. */
  contactEmail: '[EMAIL_CONTACTO]',
  /** Email para el ejercicio de derechos RGPD. */
  privacyEmail: 'privacidad@[DOMINIO]',
  /** Dominio del sitio (sin protocolo). */
  domain: '[DOMINIO]',
  /** URL pública del sitio (en local apunta a localhost). */
  siteUrl: import.meta.env.VITE_SITE_URL ?? 'http://localhost:5173',
} as const;

/**
 * Versión de los textos legales y del modelo de consentimiento. Al cambiarla,
 * el banner de cookies se vuelve a mostrar a todos los usuarios para recabar el
 * consentimiento sobre la nueva versión. Debe coincidir con la versión que el
 * trigger de alta guarda en `legal_consents` (ver migración 0007).
 */
export const LEGAL_VERSION = '1.0';

/** Fecha de última actualización mostrada en las páginas legales. */
export const LEGAL_LAST_UPDATED = '24 de mayo de 2026';
