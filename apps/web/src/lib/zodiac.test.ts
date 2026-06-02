import { describe, it, expect } from 'vitest';
import { getZodiacSign, ZODIAC, ZODIAC_SIGNS } from './zodiac';

// El signo solar se calcula en el cliente al registrarse (regla #6 del proyecto).
// Es una función pura y crítica: si falla, todos los usuarios verían un signo
// equivocado. Verificamos los límites de cada signo (último día y primer día).
describe('getZodiacSign', () => {
  it('asigna el signo correcto en una fecha central de cada signo', () => {
    // mes 0-indexado en Date (0 = enero)
    expect(getZodiacSign(new Date(1995, 2, 25))).toBe('aries'); // 25 mar
    expect(getZodiacSign(new Date(1995, 4, 5))).toBe('tauro'); // 5 may
    expect(getZodiacSign(new Date(1995, 5, 10))).toBe('geminis'); // 10 jun
    expect(getZodiacSign(new Date(1995, 6, 5))).toBe('cancer'); // 5 jul
    expect(getZodiacSign(new Date(1995, 7, 5))).toBe('leo'); // 5 ago
    expect(getZodiacSign(new Date(1995, 8, 5))).toBe('virgo'); // 5 sep
    expect(getZodiacSign(new Date(1995, 9, 5))).toBe('libra'); // 5 oct
    expect(getZodiacSign(new Date(1995, 10, 5))).toBe('escorpio'); // 5 nov
    expect(getZodiacSign(new Date(1995, 11, 5))).toBe('sagitario'); // 5 dic
    expect(getZodiacSign(new Date(1995, 0, 5))).toBe('capricornio'); // 5 ene
    expect(getZodiacSign(new Date(1995, 1, 5))).toBe('acuario'); // 5 feb
    expect(getZodiacSign(new Date(1995, 2, 5))).toBe('piscis'); // 5 mar
  });

  it('respeta los límites exactos entre signos', () => {
    expect(getZodiacSign(new Date(1995, 2, 20))).toBe('piscis'); // 20 mar
    expect(getZodiacSign(new Date(1995, 2, 21))).toBe('aries'); // 21 mar
    expect(getZodiacSign(new Date(1995, 3, 19))).toBe('aries'); // 19 abr
    expect(getZodiacSign(new Date(1995, 3, 20))).toBe('tauro'); // 20 abr
    expect(getZodiacSign(new Date(1995, 11, 21))).toBe('sagitario'); // 21 dic
    expect(getZodiacSign(new Date(1995, 11, 22))).toBe('capricornio'); // 22 dic
  });

  it('cada signo del catálogo ZODIAC está bien formado', () => {
    expect(ZODIAC_SIGNS).toHaveLength(12);
    for (const sign of ZODIAC_SIGNS) {
      expect(ZODIAC[sign]).toBeDefined();
      expect(ZODIAC[sign].slug).toBe(sign);
      expect(ZODIAC[sign].name.length).toBeGreaterThan(0);
    }
  });
});
