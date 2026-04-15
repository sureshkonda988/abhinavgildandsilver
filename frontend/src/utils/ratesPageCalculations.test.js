import { describe, expect, it } from 'vitest';
import {
  computeGoldTableSell,
  computeNavarsu8gBase,
  computeNavarsu8gSell,
  computeSilver10gSell,
  normalizeRatesPageSettings,
} from './ratesPageCalculations';

describe('ratesPageCalculations', () => {
  it('normalizes legacy ratesPage settings', () => {
    const normalized = normalizeRatesPageSettings({
      gold: { mode: 'amount', value: 11 },
      silver: { mode: 'amount', value: 7 },
      showModified: true,
    });

    expect(normalized.goldTable.value).toBe(11);
    expect(normalized.navarsuTable.value).toBe(11);
    expect(normalized.silverTable.value).toBe(7);
    expect(normalized.showModified).toBe(true);
  });

  it('computes gold table sell with and without modifier', () => {
    expect(computeGoldTableSell(100000, 0.916, false, { value: 100 })).toBe(91600);
    expect(computeGoldTableSell(100000, 0.916, true, { value: 100 })).toBe(91700);
  });

  it('computes navarsu 8g base and modified sell', () => {
    const base = computeNavarsu8gBase(156797);
    expect(base).toBeGreaterThan(0);
    expect(computeNavarsu8gSell(156797, false, { value: 250 })).toBe(base);
    expect(computeNavarsu8gSell(156797, true, { value: 250 })).toBe(base + 250);
  });

  it('computes silver 10g sell with modifier', () => {
    expect(computeSilver10gSell(1200, false, { value: 50 })).toBe(1200);
    expect(computeSilver10gSell(1200, true, { value: 50 })).toBe(1250);
  });

  it('returns placeholder values when live rates are missing', () => {
    expect(computeGoldTableSell(0, 0.916, true, { value: 10 })).toBe('-');
    expect(computeSilver10gSell(0, true, { value: 10 })).toBe('-');
    expect(computeNavarsu8gSell(0, true, { value: 10 })).toBe('-');
  });
});
