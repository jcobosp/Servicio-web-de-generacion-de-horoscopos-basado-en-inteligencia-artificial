// Siembra directa de sign_compatibility usando la anon key local.
// Requiere una política de insert temporal en la tabla (se borra después).
// Lee URL + anon key de apps/web/.env.local.
//
// Uso: node supabase/seed/seed-direct.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createClient } from '../../apps/web/node_modules/@supabase/supabase-js/dist/index.mjs';
import { buildRows } from './gen-sign-compatibility.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(here, '../../apps/web/.env.local');
const env = readFileSync(envPath, 'utf8');
const get = (k) => {
  const m = env.match(new RegExp('^' + k + '=(.*)$', 'm'));
  return m ? m[1].trim() : null;
};

const url = get('VITE_SUPABASE_URL');
const anon = get('VITE_SUPABASE_ANON_KEY');
if (!url || !anon) {
  console.error('No se encontraron VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(url, anon);
const rows = buildRows().map((r) => ({
  sign_a: r.a,
  sign_b: r.b,
  score: r.score,
  content: r.content,
}));

const { error, count } = await supabase
  .from('sign_compatibility')
  .upsert(rows, { onConflict: 'sign_a,sign_b', count: 'exact' });

if (error) {
  console.error('Error al sembrar:', error.message);
  process.exit(1);
}
console.log('Filas sembradas (upsert):', count ?? rows.length);
