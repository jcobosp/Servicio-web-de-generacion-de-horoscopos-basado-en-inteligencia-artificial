import { supabase } from '@/lib/supabase';
import { LEGAL_VERSION } from './validation';

export interface SignUpInput {
  email: string;
  password: string;
  displayName: string;
  birthDate: string; // 'YYYY-MM-DD'
  marketingOptIn: boolean;
}

/**
 * Registra al usuario. Los metadatos (nombre, fecha, consentimientos) los lee
 * el trigger handle_new_user para crear el profile, la racha y los registros
 * de consentimiento. El signo se calcula en el servidor.
 */
export async function signUp(input: SignUpInput) {
  const redirectTo = `${import.meta.env.VITE_SITE_URL ?? window.location.origin}/login`;
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        display_name: input.displayName,
        birth_date: input.birthDate,
        marketing_opt_in: input.marketingOptIn,
        legal_version: LEGAL_VERSION,
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function requestPasswordReset(email: string) {
  const redirectTo = `${import.meta.env.VITE_SITE_URL ?? window.location.origin}/restablecer-contrasena`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

/**
 * Traduce los errores de Supabase Auth a mensajes en español para el usuario.
 */
export function authErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  const map: Record<string, string> = {
    'Invalid login credentials': 'Email o contraseña incorrectos.',
    'Email not confirmed':
      'Aún no has confirmado tu email. Revisa tu bandeja de entrada.',
    'User already registered': 'Ya existe una cuenta con este email.',
    'Password should be at least 6 characters':
      'La contraseña es demasiado corta.',
    'Email rate limit exceeded':
      'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  };
  return map[msg] ?? 'Ha ocurrido un error. Inténtalo de nuevo en un momento.';
}
