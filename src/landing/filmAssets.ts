import { flight } from '@/flight/flightData';
import { matteDir, type FrameSet } from '@/flight/frameSet';

const pad = (n: number) => String(n).padStart(3, '0');

export function frameUrl(base: string, set: FrameSet, i: number): string {
  return `${base}flight/${set}/f${pad(i)}.webp`;
}

/** The occlusion matte for frame `i`: HD and desktop share the wide mattes, phone has its own crops. */
export function matteUrl(base: string, set: FrameSet, i: number): string {
  return `${base}flight/matte/${matteDir(set)}/f${pad(i)}.webp`;
}

/** Pixel size of one frame of a set (the cover rectangle is computed from it; mattes are drawn into the same rectangle). */
export function srcSize(set: FrameSet): { w: number; h: number } {
  if (set === 'hd') return { w: flight.hdWidth, h: flight.hdHeight };
  return { w: set === 'phone' ? flight.phoneWidth : flight.width, h: flight.height };
}

/** The matte that goes with the frame actually painted: its own, or none. Never a neighbour (that would ghost). */
export function pairFront<T>(paintedIndex: number, mattes: { get(i: number): T | undefined }): T | undefined {
  return mattes.get(paintedIndex);
}
