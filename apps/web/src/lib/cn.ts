export type ClassValue =
  | string
  | number
  | false
  | null
  | undefined
  | Record<string, boolean | null | undefined>;

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === 'string' || typeof input === 'number') {
      out.push(String(input));
    } else if (typeof input === 'object') {
      for (const key in input) {
        if (input[key]) out.push(key);
      }
    }
  }
  return out.join(' ');
}
