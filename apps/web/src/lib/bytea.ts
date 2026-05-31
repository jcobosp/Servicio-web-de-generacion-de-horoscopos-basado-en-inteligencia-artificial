// Decodifica el texto que PostgREST devuelve para columnas `bytea`.
//
// `profiles.birth_time` y `profiles.birth_place` son columnas `bytea` (pensadas
// para cifrado en reposo, migración 0002). PostgREST/supabase-js las entrega
// como una cadena hex con prefijo `\x` (p.ej. `\x4d6164726964` para "Madrid").
// Esta utilidad la convierte de vuelta a su texto UTF-8 original; si el valor no
// tiene ese formato, se devuelve tal cual (defensivo).
export function decodeByteaText(value: string | null | undefined): string | null {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || !value.startsWith('\\x')) return value;

  const hex = value.slice(2);
  if (hex.length === 0 || hex.length % 2 !== 0) return value;

  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const byte = Number.parseInt(hex.substr(i * 2, 2), 16);
    if (Number.isNaN(byte)) return value;
    bytes[i] = byte;
  }
  try {
    return new TextDecoder().decode(bytes);
  } catch {
    return value;
  }
}
