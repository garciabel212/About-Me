import { describe, expect, it } from 'vitest';
import type { Segment } from '../manifest';
import { segmentRanges } from '../scrollMap';
import { M1_BEATS, beatFocusProgress, beatOpacity, resolveBeat } from '../beats';

const SEGMENTS: Segment[] = [
  { id: 'river', kind: 'transit', frames: [0, 143], scrollVh: { desktop: 250, mobile: 150 } },
  { id: 'brickell', kind: 'stop', frames: [144, 167], scrollVh: { desktop: 150, mobile: 100 } },
];
const ranges = segmentRanges(SEGMENTS, 'desktop');
const intro = M1_BEATS.find((beat) => beat.id === 'intro')!;
const serviceMap = M1_BEATS.find((beat) => beat.id === 'service-map')!;

describe('M1 beats', () => {
  it('shows the intro on first paint and clears it before the skyline reveal', () => {
    const w = resolveBeat(ranges, intro);
    expect(beatOpacity(0, w)).toBe(1);
    expect(beatOpacity(0.625 * 0.65, w)).toBeCloseTo(0.5);
    expect(beatOpacity(0.625 * 0.8, w)).toBe(0);
  });

  it('brings Service Map Planner in during the Brickell stop and holds it to the end', () => {
    const w = resolveBeat(ranges, serviceMap);
    expect(beatOpacity(0.625, w)).toBe(0);
    expect(beatOpacity(0.625 + 0.375 * 0.15, w)).toBeCloseTo(0.5);
    expect(beatOpacity(1, w)).toBe(1);
  });

  it('never has both beats fully visible at once', () => {
    const a = resolveBeat(ranges, intro);
    const b = resolveBeat(ranges, serviceMap);
    for (let i = 0; i <= 200; i += 1) {
      const p = i / 200;
      expect(Math.min(beatOpacity(p, a), beatOpacity(p, b))).toBeLessThan(1);
    }
  });

  it('focus progress lands where each beat is fully visible', () => {
    expect(beatOpacity(beatFocusProgress(ranges, intro), resolveBeat(ranges, intro))).toBe(1);
    expect(beatOpacity(beatFocusProgress(ranges, serviceMap), resolveBeat(ranges, serviceMap))).toBe(1);
  });
});
