import { useSyncExternalStore } from 'react';
import { flight } from '@/flight/flightData';

const STOP_FRAMES = flight.stops.map((s) => s.frame);
/** Frames from a stop that still count as "at the stop" (coarse-to-fine loading may hold a neighbour). */
export const AT_STOP = 2;

let drawn = -1;
const subscribers = new Set<() => void>();

/** The film reports the frame it actually painted. */
export function setDrawnFrame(frame: number): void {
  if (frame === drawn) return;
  drawn = frame;
  subscribers.forEach((fn) => fn());
}

export function stopAt(frame: number): number {
  if (frame < 0) return -1;
  return STOP_FRAMES.findIndex((f) => Math.abs(frame - f) <= AT_STOP);
}

function subscribe(fn: () => void) {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

/** The stop the film is showing right now, or -1 while it flies. Changes only at stops, so it rarely re-renders. */
export function useFilmStop(): number {
  return useSyncExternalStore(subscribe, () => stopAt(drawn), () => -1);
}
