import { describe, expect, it } from 'vitest';
import type { Segment } from '../manifest';
import { localToGlobal, progressToFrame, segmentRanges } from '../scrollMap';

const SEGMENTS: Segment[] = [
  { id: 'river', kind: 'transit', frames: [0, 143], scrollVh: { desktop: 250, mobile: 150 } },
  { id: 'brickell', kind: 'stop', frames: [144, 167], scrollVh: { desktop: 150, mobile: 100 } },
];

describe('segmentRanges', () => {
  it('splits progress by scroll weight and ends exactly at 1', () => {
    expect(segmentRanges(SEGMENTS, 'desktop')).toEqual([
      { id: 'river', start: 0, end: 0.625 },
      { id: 'brickell', start: 0.625, end: 1 },
    ]);
    const mobile = segmentRanges(SEGMENTS, 'mobile');
    expect(mobile[0].end).toBeCloseTo(0.6);
    expect(mobile[1].end).toBe(1);
  });
});

describe('progressToFrame', () => {
  it('maps the ends to the first and last frame', () => {
    expect(progressToFrame(SEGMENTS, 'desktop', 0)).toBe(0);
    expect(progressToFrame(SEGMENTS, 'desktop', 1)).toBe(167);
  });

  it('is continuous across a segment boundary (no one-frame pop)', () => {
    expect(progressToFrame(SEGMENTS, 'desktop', 0.625)).toBeCloseTo(144);
    expect(progressToFrame(SEGMENTS, 'desktop', 0.625 + 1e-9)).toBeCloseTo(144, 3);
    expect(progressToFrame(SEGMENTS, 'mobile', 0.6)).toBeCloseTo(144);
  });

  it('interpolates within a transit segment', () => {
    expect(progressToFrame(SEGMENTS, 'desktop', 0.3125)).toBeCloseTo(72);
  });

  it('clamps out-of-range progress', () => {
    expect(progressToFrame(SEGMENTS, 'desktop', -0.5)).toBe(0);
    expect(progressToFrame(SEGMENTS, 'desktop', 1.5)).toBe(167);
  });

  it('is monotonic non-decreasing', () => {
    let previous = -Infinity;
    for (let i = 0; i <= 1000; i += 1) {
      const frame = progressToFrame(SEGMENTS, 'desktop', i / 1000);
      expect(frame).toBeGreaterThanOrEqual(previous);
      previous = frame;
    }
  });

  it('advances far fewer frames per unit of scroll in a stop than in a transit', () => {
    const transitRate = (progressToFrame(SEGMENTS, 'desktop', 0.5) - progressToFrame(SEGMENTS, 'desktop', 0.1)) / 0.4;
    const stopRate = (progressToFrame(SEGMENTS, 'desktop', 0.95) - progressToFrame(SEGMENTS, 'desktop', 0.7)) / 0.25;
    expect(stopRate).toBeLessThan(transitRate / 3);
  });

  it('returns 0 for an empty flight', () => {
    expect(progressToFrame([], 'desktop', 0.5)).toBe(0);
  });
});

describe('localToGlobal', () => {
  it('converts a position inside a segment to overall progress', () => {
    const ranges = segmentRanges(SEGMENTS, 'desktop');
    expect(localToGlobal(ranges, 'river', 0)).toBe(0);
    expect(localToGlobal(ranges, 'brickell', 0.5)).toBeCloseTo(0.8125);
  });

  it('throws on an unknown segment id', () => {
    expect(() => localToGlobal(segmentRanges(SEGMENTS, 'desktop'), 'nope', 0)).toThrow(/nope/);
  });
});
