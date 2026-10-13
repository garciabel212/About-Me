import { describe, expect, it } from 'vitest';
import { flight } from '@/flight/flightData';
import { AT_STOP, stopAt } from '../filmState';

describe('stopAt', () => {
  it('names the stop the film is showing, within a couple of frames', () => {
    flight.stops.forEach((s, i) => {
      expect(stopAt(s.frame)).toBe(i);
      expect(stopAt(s.frame + AT_STOP)).toBe(i);
    });
  });

  it('is -1 while flying between stops or before anything is drawn', () => {
    expect(stopAt((flight.stops[0].frame + flight.stops[1].frame) / 2)).toBe(-1);
    expect(stopAt(-1)).toBe(-1);
  });
});
