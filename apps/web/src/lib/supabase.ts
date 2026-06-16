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
//
// Nota: en supabase-js, `client.functions` es un GETTER que crea un
// `FunctionsClient` NUEVO en cada acceso (para inyectar el token de sesión
// vigente). Por eso no basta con reasignar `supabase.functions.invoke`: hay que
// sustituir el propio getter para envolver `invoke` en cada cliente devuelto.
if (isDemoMode) {
  let originalGetter: (() => unknown) | undefined;
  for (let o: object | null = supabase; o; o = Object.getPrototypeOf(o)) {
    const desc = Object.getOwnPropertyDescriptor(o, 'functions');
    if (desc?.get) {
      originalGetter = desc.get;
      break;
    }
  }

  if (originalGetter) {
    Object.defineProperty(supabase, 'functions', {
      configurable: true,
      get() {
        const client = originalGetter!.call(this) as {
          invoke: (name: string, options?: { body?: unknown }) => Promise<unknown>;
        };
        const realInvoke = client.invoke.bind(client);
        client.invoke = ((name: string, options?: { body?: unknown }) =>
          demoInvoke(name, options, realInvoke as never)) as typeof client.invoke;
        return client;
      },
    });
  }
}
