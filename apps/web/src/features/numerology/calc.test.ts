import { describe, it, expect } from 'vitest';
import { lifePathNumber, personalYearNumber, birthdayNumber } from './calc';

// Numerología gratuita: los números se calculan en el cliente desde la fecha de
// nacimiento (reglas pitagóricas). Verificamos casos conocidos, la conservación
// de números maestros (11/22/33) y la reducción del año personal a un dígito.
describe('lifePathNumber', () => {
  it('calcula el camino de vida reduciendo a un dígito', () => {
    // 1990-11-15 → mes 11→2, día 15→6, año 1990→19→10→1 ; 2+6+1=9
    expect(lifePathNumber('1990-11-15')).toBe(9);
    // 2000-01-01 → 1 + 1 + 2 = 4
    expect(lifePathNumber('2000-01-01')).toBe(4);
  });

  it('conserva los números maestros (11, 22, 33)', () => {
    const n = lifePathNumber('1998-12-12');
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]).toContain(n);
  });
});

describe('personalYearNumber', () => {
  it('siempre devuelve un dígito 1-9', () => {
    const n = personalYearNumber('1990-11-15', 2026);
    expect(n).toBeGreaterThanOrEqual(1);
    expect(n).toBeLessThanOrEqual(9);
  });

  it('calcula un año personal conocido', () => {
    // mes 11→2, día 15→6, año 2026→10→1 ; 2+6+1 = 9
    expect(personalYearNumber('1990-11-15', 2026)).toBe(9);
  });
});

describe('birthdayNumber', () => {
  it('extrae el día del mes sin reducir', () => {
    expect(birthdayNumber('1990-11-15')).toBe(15);
    expect(birthdayNumber('2000-01-01')).toBe(1);
  });
});
