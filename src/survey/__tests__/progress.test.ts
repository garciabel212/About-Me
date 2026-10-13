import { describe, expect, it } from 'vitest';
import { DRAW, LIFT, inkStyle, sitePhase } from '../progress';

const VH = 1000;
/** Two 2200px sites with a 900px gap, scrolled by `y`. */
const layout = (y: number) => [
  { top: 0 - y, bottom: 2200 - y },
  { top: 3100 - y, bottom: 5300 - y },
];
const HOLD = 2200 - VH;

describe('sitePhase', () => {
  it('starts drawing as soon as the first site holds', () => {
    expect(sitePhase(layout(0), VH)).toMatchObject({ stop: 0, phase: 'drawing', ink: 0, lift: 0, inside: true });
  });

  it('draws in proportion to the hold, then settles', () => {
    expect(sitePhase(layout(HOLD * DRAW * 0.5), VH).ink).toBeCloseTo(0.5);
    expect(sitePhase(layout(HOLD * 0.5), VH)).toMatchObject({ phase: 'settled', ink: 1, lift: 0 });
  });

  it('lifts during the last part of the hold', () => {
    const p = sitePhase(layout(HOLD * (1 - LIFT * 0.5)), VH);
    expect(p.phase).toBe('lifting');
    expect(p.lift).toBeCloseTo(0.5);
    expect(p.ink).toBe(1);
  });

  it('is in transit in the gap, keeping the previous site until the next passes mid-screen', () => {
    expect(sitePhase(layout(2400), VH)).toMatchObject({ stop: 0, phase: 'transit', ink: 0 });
    expect(sitePhase(layout(2700), VH)).toMatchObject({ stop: 1, phase: 'transit' });
  });

  it('is reversible: the same scroll position gives the same phase', () => {
    const y = HOLD * 0.1;
    expect(sitePhase(layout(y), VH)).toEqual(sitePhase(layout(y), VH));
  });

  it('skips missing sections', () => {
    expect(sitePhase([null, { top: 0, bottom: 2200 }], VH)).toMatchObject({ stop: 1, phase: 'drawing' });
  });

  it('reports whether the reading line is inside the current site', () => {
    // At 1500 the first site has stopped holding (its bottom is at 700) but still covers mid-screen.
    expect(sitePhase(layout(1500), VH).inside).toBe(true);
    expect(sitePhase(layout(2400), VH).inside).toBe(false);
  });
});

describe('inkStyle', () => {
  it('racks focus with the ink and releases it with the lift', () => {
    expect(inkStyle(sitePhase(layout(HOLD * DRAW * 0.5), VH), true).focus).toBeCloseTo(0.5);
    expect(inkStyle(sitePhase(layout(HOLD * 0.5), VH), true).focus).toBe(1);
    expect(inkStyle(sitePhase(layout(HOLD * (1 - LIFT * 0.5)), VH), true).focus).toBeCloseTo(0.5);
  });

  it('with motion off shows the ink whole while the site is under the reading line, without blur', () => {
    // Still mode: sections are one viewport tall with no gaps.
    const still = [
      { top: -300, bottom: 700 },
      { top: 700, bottom: 1700 },
    ];
    expect(inkStyle(sitePhase(still, VH), false)).toEqual({ ink: 1, lift: 0, focus: 0 });
    expect(inkStyle(sitePhase(layout(2400), VH), false)).toEqual({ ink: 0, lift: 0, focus: 0 });
  });
});
