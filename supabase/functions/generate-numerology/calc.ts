// Cálculos de numerología (servidor). Réplica de apps/web/src/features/numerology/calc.ts.

function sumDigits(n: number): number {
  return String(n)
    .split('')
    .reduce((acc, d) => acc + Number(d), 0);
}

function reduceKeepMasters(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) n = sumDigits(n);
  return n;
}

function reduceToDigit(n: number): number {
  while (n > 9) n = sumDigits(n);
  return n;
}

function parts(isoDate: string): { y: number; m: number; d: number } {
  const [y, m, d] = isoDate.split('-').map(Number);
  return { y: y ?? 0, m: m ?? 0, d: d ?? 0 };
}

export function lifePathNumber(isoDate: string): number {
  const { y, m, d } = parts(isoDate);
  return reduceKeepMasters(
    reduceKeepMasters(m) + reduceKeepMasters(d) + reduceKeepMasters(y),
  );
}

export function personalYearNumber(isoDate: string, year: number): number {
  const { m, d } = parts(isoDate);
  return reduceToDigit(reduceToDigit(m) + reduceToDigit(d) + reduceToDigit(year));
}

export function personalMonthNumber(
  isoDate: string,
  year: number,
  month: number,
): number {
  return reduceToDigit(personalYearNumber(isoDate, year) + reduceToDigit(month));
}

export function birthdayNumber(isoDate: string): number {
  return parts(isoDate).d;
}
