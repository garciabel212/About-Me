import { flight } from './flightData';

/** The intro glides over the last SETTLE frames into the River stop; the poster is its first frame.
 *  index.html preloads this frame (the test checks it), so recompute it there if the River frame moves. */
export const SETTLE = 12;
export const POSTER_FRAME = Math.max(0, flight.stops[0].frame - SETTLE);
