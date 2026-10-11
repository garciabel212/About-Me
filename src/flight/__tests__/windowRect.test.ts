import { describe, expect, it } from 'vitest';
import { coverSource, lerpRect } from '../windowRect';

describe('coverSource', () => {
  it('uses the whole frame when the box has the same shape', () => {
    expect(coverSource(1280, 704, 640, 352, 0.5)).toEqual({ x: 0, y: 0, w: 1280, h: 704 });
  });

  it('crops a tall window around the landmark', () => {
    const s = coverSource(1280, 704, 600, 800, 0.64);
    expect(s.h).toBeCloseTo(704);
    expect(s.w).toBeCloseTo(528);
    expect(s.x + s.w / 2).toBeCloseTo(0.64 * 1280);
  });

  it('never reads past the frame edge', () => {
    const s = coverSource(1280, 704, 600, 800, 0.98);
    expect(s.x + s.w).toBeCloseTo(1280);
    expect(coverSource(1280, 704, 600, 800, 0).x).toBe(0);
  });
});

describe('lerpRect', () => {
  it('moves from one rect to the other', () => {
    const a = { x: 0, y: 0, w: 100, h: 100 };
    const b = { x: 50, y: 20, w: 40, h: 60 };
    expect(lerpRect(a, b, 0)).toEqual(a);
    expect(lerpRect(a, b, 1)).toEqual(b);
    expect(lerpRect(a, b, 0.5)).toEqual({ x: 25, y: 10, w: 70, h: 80 });
  });
});
