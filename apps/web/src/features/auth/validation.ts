import { z } from 'zod';

/** Versión vigente de los documentos legales aceptados en el registro. */
export const LEGAL_VERSION = '1.0';

/** Edad mínima para registrarse (ver docs/LEGAL_COMPLIANCE.md). */
export const MIN_AGE = 16;

const passwordSchema = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Incluye al menos una mayúscula')
  .regex(/[a-z]/, 'Incluye al menos una minúscula')
  .regex(/[0-9]/, 'Incluye al menos un número');

function ageFromIso(iso: string): number {
  const birth = new Date(iso);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const birthDateSchema = z
  .string()
  .min(1, 'Indica tu fecha de nacimiento')
  .refine((v) => !Number.isNaN(Date.parse(v)), 'Fecha no válida')
  .refine((v) => new Date(v) <= new Date(), 'La fecha no puede ser futura')
  .refine((v) => ageFromIso(v) >= MIN_AGE, `Debes tener al menos ${MIN_AGE} años`);

export const signInSchema = z.object({
  email: z.string().min(1, 'Indica tu email').email('Email no válido'),
  password: z.string().min(1, 'Indica tu contraseña'),
});

export const signUpSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(60, 'Máximo 60 caracteres'),
  email: z.string().min(1, 'Indica tu email').email('Email no válido'),
  password: passwordSchema,
  birthDate: birthDateSchema,
  acceptTerms: z.literal(true, {
    message: 'Debes aceptar los términos y la política de privacidad',
  }),
  marketingOptIn: z.boolean(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Indica tu email').email('Email no válido'),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirm: z.string().min(1, 'Repite la contraseña'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  });

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
