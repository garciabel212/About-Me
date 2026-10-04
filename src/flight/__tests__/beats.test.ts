import { describe, expect, it } from 'vitest';
import type { Segment } from '../manifest';
import { segmentRanges } from '../scrollMap';
import { M1_BEATS, beatFocusProgress, beatOpacity, resolveBeat } from '../beats';

const SEGMENTS: Segment[] = [
  { id: 'descent', kind: 'transit', frames: [0, 119], scrollVh: { desktop: 300, mobile: 180 } },
  { id: 'river-brickell', kind: 'transit', frames: [120, 209], scrollVh: { desktop: 150, mobile: 90 } },
  { id: 'towers', kind: 'stop', frames: [210, 234], scrollVh: { desktop: 120, mobile: 80 } },
];
const ranges = segmentRanges(SEGMENTS, 'desktop');
const intro = M1_BEATS.find((beat) => beat.id === 'intro')!;
const serviceMap = M1_BEATS.find((beat) => beat.id === 'service-map')!;

// Global progress at a local position inside a segment (desktop: 300 + 150 + 120 = 570vh).
const descentAt = (t: number) => (300 * t) / 570;
const riverAt = (t: number) => (300 + 150 * t) / 570;

describe('M1 beats', () => {
  it('shows the intro on first paint and holds it through most of the descent', () => {
    const w = resolveBeat(ranges, intro);
    expect(beatOpacity(0, w)).toBe(1);
    expect(beatOpacity(descentAt(0.75), w)).toBe(1);
    expect(beatOpacity(descentAt(0.9), w)).toBeCloseTo(0.5);
    expect(beatOpacity(descentAt(1), w)).toBe(0);
  });

  it('leaves the river flight and skyline reveal free of panels', () => {
    const a = resolveBeat(ranges, intro);
    const b = resolveBeat(ranges, serviceMap);
    for (const t of [0, 0.25, 0.5, 0.69]) {
      expect(beatOpacity(riverAt(t), a)).toBe(0);
      expect(beatOpacity(riverAt(t), b)).toBe(0);
    }
  });

  it('brings Service Map Planner in as the camera turns into the towers and holds it to the end', () => {
    const w = resolveBeat(ranges, serviceMap);
    expect(beatOpacity(riverAt(0.85), w)).toBeCloseTo(0.5);
    expect(beatOpacity(riverAt(1), w)).toBe(1);
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
