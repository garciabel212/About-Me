import { describe, expect, it } from 'vitest';
import { puffLayout } from '../mist';

describe('puffLayout', () => {
  it('is deterministic for a seed', () => {
    expect(puffLayout(9, 3)).toEqual(puffLayout(9, 3));
    expect(puffLayout(9, 3)).not.toEqual(puffLayout(9, 4));
  });
  it('keeps puffs around the card edges and sized to read as mist', () => {
    for (const p of puffLayout(9, 1)) {
      expect(p.x).toBeGreaterThanOrEqual(-0.15);
      expect(p.x).toBeLessThanOrEqual(1.15);
      expect(p.y).toBeGreaterThanOrEqual(-0.15);
      expect(p.y).toBeLessThanOrEqual(1.15);
      expect(p.r).toBeGreaterThanOrEqual(90);
      expect(p.r).toBeLessThanOrEqual(220);
      expect(p.delay).toBeGreaterThanOrEqual(0);
      expect(p.delay).toBeLessThan(1);
    }
  });
});
