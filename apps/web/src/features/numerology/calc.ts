// Cálculos de numerología a partir de la fecha de nacimiento (ISO 'YYYY-MM-DD').
// Reglas pitagóricas clásicas; el camino de vida conserva los números maestros
// (11, 22, 33), el año/mes personal se reduce siempre a 1-9.

function sumDigits(n: number): number {
  return String(n)
    .split('')
    .reduce((acc, d) => acc + Number(d), 0);
}

/** Reduce a un dígito, conservando los números maestros 11/22/33. */
function reduceKeepMasters(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) n = sumDigits(n);
  return n;
}

/** Reduce siempre a un solo dígito (1-9). */
function reduceToDigit(n: number): number {
  while (n > 9) n = sumDigits(n);
  return n;
}

function parts(isoDate: string): { y: number; m: number; d: number } {
  const [y, m, d] = isoDate.split('-').map(Number);
  return { y: y ?? 0, m: m ?? 0, d: d ?? 0 };
}

/** Número del camino de vida (1-9, 11, 22, 33). */
export function lifePathNumber(isoDate: string): number {
  const { y, m, d } = parts(isoDate);
  return reduceKeepMasters(
    reduceKeepMasters(m) + reduceKeepMasters(d) + reduceKeepMasters(y),
  );
}

/** Año personal (1-9) para el año natural dado (por defecto, el actual). */
export function personalYearNumber(
  isoDate: string,
  year: number = new Date().getFullYear(),
): number {
  const { m, d } = parts(isoDate);
  return reduceToDigit(reduceToDigit(m) + reduceToDigit(d) + reduceToDigit(year));
}

/** Mes personal (1-9): año personal + mes natural en curso. */
export function personalMonthNumber(
  isoDate: string,
  year: number = new Date().getFullYear(),
  month: number = new Date().getMonth() + 1,
): number {
  return reduceToDigit(personalYearNumber(isoDate, year) + reduceToDigit(month));
}

/** Día de nacimiento (1-31), sin reducir. */
export function birthdayNumber(isoDate: string): number {
  return parts(isoDate).d;
}
