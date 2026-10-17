import { describe, expect, it } from 'vitest';
import { flight } from '../flightData';

describe('generated flight data', () => {
  it('has six stops in flight order', () => {
    expect(flight.stops.map((s) => s.id)).toEqual(['river', 'brickell', 'downtown', 'bay', 'beach', 'sunset']);
  });
  it('places every stop inside the film, in ascending order', () => {
    const frames = flight.stops.map((s) => s.frame);
    expect([...frames].sort((a, b) => a - b)).toEqual(frames);
    for (const f of frames) expect(f).toBeGreaterThanOrEqual(0);
    expect(frames[frames.length - 1]).toBeLessThan(flight.frames);
  });
  it('keeps landmarks inside the frame on desktop and phone crops', () => {
    for (const s of flight.stops) {
      for (const v of [s.x, s.y, s.phoneX]) {
        expect(v).toBeGreaterThan(0);
        expect(v).toBeLessThan(1);
      }
    }
  });
  it('keeps the six stop frames the landing is built around', () => {
    expect(flight.frames).toBe(413);
    expect(flight.stops.map((s) => s.frame)).toEqual([40, 114, 189, 264, 338, 412]);
  });
  it('describes the HD set and the occlusion mattes', () => {
    expect(flight.hdWidth).toBe(1920);
    expect(flight.hdHeight).toBe(1056);
    expect(flight.matteWidth).toBe(960);
    expect(flight.matteHeight).toBe(528);
    expect(flight.phoneMatteWidth).toBe(315);
  });
});
