import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { isDemoMode, demoInvoke } from './demo';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Copia .env.example a .env.local y rellénalas.',
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// MODO DEMOSTRACIÓN: interceptamos la invocación de Edge Functions para que la
// app nunca llame a la IA (Gemini) y sirva resultados de ejemplo precargados.
// Ver `lib/demo.ts`. No afecta a la autenticación ni a la lectura de tablas.
if (isDemoMode) {
  const realInvoke = supabase.functions.invoke.bind(supabase.functions);
  supabase.functions.invoke = ((name: string, options?: { body?: unknown }) =>
    demoInvoke(name, options, realInvoke as never)) as typeof supabase.functions.invoke;
}
