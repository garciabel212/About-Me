import { describe, expect, it } from 'vitest';
import { buildTimeline, UNITS } from '../timeline';

const frames = [40, 114, 189, 264, 338, 412];

describe('buildTimeline', () => {
  const t = buildTimeline(frames);
  it('lays segments end to end from 0 to total', () => {
    let cursor = 0;
    for (const s of t.segments) {
      expect(s.start).toBeCloseTo(cursor);
      expect(s.end).toBeGreaterThan(s.start);
      cursor = s.end;
    }
    expect(cursor).toBeCloseTo(t.total);
  });
  it('opens on stop 1 already revealed, then hops through every stop in order', () => {
    expect(t.segments[0]).toMatchObject({ kind: 'open', stop: 0, start: 0 });
    const hops = t.segments.filter((s) => s.kind === 'hop');
    expect(hops.map((h) => [h.fromFrame, h.toFrame])).toEqual([[40, 114], [114, 189], [189, 264], [264, 338], [338, 412]]);
    expect(hops[0].end - hops[0].start).toBeCloseTo((114 - 40) * UNITS.perFrame);
  });
  it('reveals every later stop and folds every stop except the last', () => {
    expect(t.segments.filter((s) => s.kind === 'reveal').map((s) => s.stop)).toEqual([1, 2, 3, 4, 5]);
    expect(t.segments.filter((s) => s.kind === 'fold').map((s) => s.stop)).toEqual([0, 1, 2, 3, 4]);
  });
  it('puts each reading position where that stop is fully open', () => {
    expect(t.readingAt[0]).toBe(0);
    for (let i = 1; i < frames.length; i++) {
      const reveal = t.segments.find((s) => s.kind === 'reveal' && s.stop === i)!;
      expect(t.readingAt[i]).toBeCloseTo(reveal.end);
    }
  });
});
