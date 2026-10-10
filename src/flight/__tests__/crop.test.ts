import { describe, expect, it } from 'vitest';
import { coverDraw, toScreen } from '../crop';

describe('coverDraw', () => {
  it('fills a wide viewport, cropping top and bottom equally', () => {
    const r = coverDraw(1280, 704, 1920, 900);
    expect(r.dw).toBeCloseTo(1920);
    expect(r.dh).toBeCloseTo(1056);
    expect(r.dy).toBeCloseTo(-78);
    expect(r.dx).toBeCloseTo(0);
  });
  it('fills a tall viewport, cropping the sides equally', () => {
    const r = coverDraw(420, 704, 390, 844);
    expect(r.dh).toBeCloseTo(844);
    expect(r.dw).toBeCloseTo(503.5, 0);
    expect(r.dx).toBeCloseTo(-56.75, 0);
  });
});

describe('toScreen', () => {
  it('maps frame fractions through the draw rectangle', () => {
    const r = { dx: -50, dy: -20, dw: 1000, dh: 500 };
    expect(toScreen(r, 0.5, 0.5)).toEqual({ x: 450, y: 230 });
  });
});
