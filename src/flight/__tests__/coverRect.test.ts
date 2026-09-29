import { describe, expect, it } from 'vitest';
import { coverRect } from '../coverRect';

describe('coverRect', () => {
  it('uses the whole source when aspects match', () => {
    expect(coverRect(1920, 1080, 960, 540)).toEqual({ sx: 0, sy: 0, sw: 1920, sh: 1080 });
  });

  it('crops sky from the top on wider viewports, keeping the bottom attribution strip', () => {
    const rect = coverRect(1920, 1080, 2520, 1080); // 21:9
    expect(rect.sx).toBe(0);
    expect(rect.sw).toBe(1920);
    expect(rect.sh).toBeCloseTo(822.857, 2);
    expect(rect.sy + rect.sh).toBeCloseTo(1080); // bottom edge preserved
  });

  it('crops the sides evenly on narrower viewports', () => {
    const rect = coverRect(1920, 1080, 1080, 1920); // 9:16
    expect(rect.sy).toBe(0);
    expect(rect.sh).toBe(1080);
    expect(rect.sw).toBeCloseTo(607.5);
    expect(rect.sx).toBeCloseTo(656.25);
  });

  it('keeps the top when anchorY is 0', () => {
    expect(coverRect(1920, 1080, 2520, 1080, 0).sy).toBe(0);
  });
});
