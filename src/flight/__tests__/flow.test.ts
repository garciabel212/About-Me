import { describe, expect, it } from 'vitest';
import { activeAt, glidePoint, panelHeight, threadPath } from '../flow';
import { buildTimeline } from '../timeline';

describe('panelHeight', () => {
  it('is the travel strip when closed and the content height when open', () => {
    expect(panelHeight(0, 400, 60, 700)).toBe(60);
    expect(panelHeight(1, 400, 60, 700)).toBe(400);
    expect(panelHeight(0.5, 400, 60, 700)).toBe(230);
  });
  it('never grows past the viewport limit', () => {
    expect(panelHeight(1, 1200, 60, 700)).toBe(700);
  });
});

describe('glidePoint', () => {
  const a = { x: 100, y: 300 };
  const b = { x: 500, y: 300 };
  it('starts on the first landmark and lands on the second', () => {
    expect(glidePoint(a, b, 0, 80)).toEqual(a);
    expect(glidePoint(a, b, 1, 80)).toEqual(b);
  });
  it('arcs upward between them', () => {
    const mid = glidePoint(a, b, 0.5, 80);
    expect(mid.x).toBeCloseTo(300);
    expect(mid.y).toBeCloseTo(260);
  });
});

describe('threadPath', () => {
  it('leaves the side card horizontally and lands on the pin', () => {
    expect(threadPath({ x: 400, y: 200 }, { x: 800, y: 300 }, 'side')).toBe('M400 200C600 200 600 300 800 300');
  });
  it('rises from the top of the phone sheet to the pin', () => {
    expect(threadPath({ x: 200, y: 500 }, { x: 240, y: 200 }, 'sheet')).toBe('M200 500C200 350 240 350 240 200');
  });
});

describe('activeAt', () => {
  const t = buildTimeline([40, 114, 189, 264, 338, 412]);
  it('shows stop 1 from the start', () => {
    expect(activeAt(t.segments, 0)).toBe(0);
  });
  it('shows nothing while flying, and the next stop once it starts to open', () => {
    const hop = t.segments.find((s) => s.kind === 'hop')!;
    expect(activeAt(t.segments, (hop.start + hop.end) / 2)).toBe(-1);
    const reveal = t.segments.find((s) => s.kind === 'reveal' && s.stop === 1)!;
    expect(activeAt(t.segments, reveal.start + 0.01)).toBe(1);
  });
  it('keeps the last stop at the very end', () => {
    expect(activeAt(t.segments, t.total)).toBe(5);
  });
});
