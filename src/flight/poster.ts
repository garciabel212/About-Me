import { flight } from './flightData';

/**
 * The frame the Cinematic backdrop paints first: the River stop itself (the
 * backdrop holds still at each stop, with no intro glide). index.html
 * preloads this frame; a test keeps the two in step.
 */
export const POSTER_FRAME = flight.stops[0].frame;
