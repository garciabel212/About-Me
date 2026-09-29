import { localToGlobal, type SegmentRange } from './scrollMap';

export type BeatId = 'intro' | 'service-map';

export interface BeatSpec {
  id: BeatId;
  /** Segment this beat lives in; fade ranges are 0–1 within that segment. */
  segment: string;
  fadeIn: readonly [number, number] | null;
  fadeOut: readonly [number, number] | null;
}

export interface BeatWindow {
  /** Global progress range over which the beat fades in (null = visible from the start). */
  fadeIn: readonly [number, number] | null;
  /** Global progress range over which the beat fades out (null = holds to the end). */
  fadeOut: readonly [number, number] | null;
}

export const M1_BEATS: readonly BeatSpec[] = [
  { id: 'intro', segment: 'river', fadeIn: null, fadeOut: [0.55, 0.75] },
  { id: 'service-map', segment: 'brickell', fadeIn: [0.05, 0.25], fadeOut: null },
];

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function ramp(value: number, from: number, to: number): number {
  if (to <= from) return value >= to ? 1 : 0;
  return clamp01((value - from) / (to - from));
}

export function resolveBeat(ranges: readonly SegmentRange[], spec: BeatSpec): BeatWindow {
  const toGlobal = (pair: readonly [number, number] | null) =>
    pair ? ([localToGlobal(ranges, spec.segment, pair[0]), localToGlobal(ranges, spec.segment, pair[1])] as const) : null;
  return { fadeIn: toGlobal(spec.fadeIn), fadeOut: toGlobal(spec.fadeOut) };
}

export function beatOpacity(progress: number, beatWindow: BeatWindow): number {
  const { fadeIn, fadeOut } = beatWindow;
  let opacity = 1;
  if (fadeIn) opacity = Math.min(opacity, ramp(progress, fadeIn[0], fadeIn[1]));
  if (fadeOut) opacity = Math.min(opacity, 1 - ramp(progress, fadeOut[0], fadeOut[1]));
  return opacity;
}

export function beatFocusProgress(ranges: readonly SegmentRange[], spec: BeatSpec): number {
  return localToGlobal(ranges, spec.segment, spec.fadeIn ? spec.fadeIn[1] : 0);
}
