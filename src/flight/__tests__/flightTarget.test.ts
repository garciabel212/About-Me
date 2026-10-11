import { describe, expect, it } from 'vitest';
import { flightTarget } from '../flightTarget';

const FRAMES = [40, 114, 189];
const VH = 800; // probe at 400

// Three sections with 500 px gaps between them, scrolled by `y`.
const at = (y: number) => [
  { top: 0 - y, bottom: 800 - y },
  { top: 1300 - y, bottom: 2300 - y },
  { top: 2800 - y, bottom: 3400 - y },
];

describe('flightTarget', () => {
  it('holds at a stop while the probe is inside its section', () => {
    expect(flightTarget(at(0), VH, FRAMES)).toEqual({ frame: 40, stop: 0 });
    expect(flightTarget(at(1500), VH, FRAMES)).toEqual({ frame: 114, stop: 1 });
    expect(flightTarget(at(1800), VH, FRAMES)).toEqual({ frame: 114, stop: 1 });
  });

  it('flies only across the gap, easing between the two stops', () => {
    const start = flightTarget(at(400), VH, FRAMES); // probe at the gap's start
    const middle = flightTarget(at(650), VH, FRAMES);
    const end = flightTarget(at(900), VH, FRAMES);
    expect(start.frame).toBe(40);
    expect(middle.frame).toBeCloseTo(77);
    expect(end).toEqual({ frame: 114, stop: 1 });
    expect(middle.stop).toBe(1);
  });

  it('stays at the first stop above the page and the last one below it', () => {
    expect(flightTarget(at(-500), VH, FRAMES)).toEqual({ frame: 40, stop: 0 });
    expect(flightTarget(at(5000), VH, FRAMES)).toEqual({ frame: 189, stop: 2 });
  });

  it('skips sections that are not on the page', () => {
    const spans = [null, { top: 0, bottom: 900 }, null];
    expect(flightTarget(spans, VH, FRAMES)).toEqual({ frame: 114, stop: 1 });
  });
});
