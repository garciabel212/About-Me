import type { FrameSize, Segment } from './manifest';

export interface SegmentRange {
  id: string;
  /** Overall scroll progress (0–1) where this segment begins. */
  start: number;
  /** Overall scroll progress (0–1) where this segment ends. */
  end: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function segmentRanges(segments: readonly Segment[], size: FrameSize): SegmentRange[] {
  const total = segments.reduce((sum, segment) => sum + segment.scrollVh[size], 0);
  let cursor = 0;
  return segments.map((segment, index) => {
    const start = cursor;
    cursor += total > 0 ? segment.scrollVh[size] / total : 0;
    return { id: segment.id, start, end: index === segments.length - 1 ? 1 : cursor };
  });
}

/**
 * Overall scroll progress → fractional frame index. Each segment interpolates from
 * its first frame to the next segment's first frame, so boundaries are continuous.
 */
export function progressToFrame(segments: readonly Segment[], size: FrameSize, progress: number): number {
  if (segments.length === 0) return 0;
  const p = clamp(progress, 0, 1);
  const ranges = segmentRanges(segments, size);
  let index = ranges.findIndex((range) => p <= range.end);
  if (index === -1) index = ranges.length - 1;

  const range = ranges[index];
  const segment = segments[index];
  const next = segments[index + 1];
  const from = segment.frames[0];
  const to = next ? next.frames[0] : segment.frames[1];
  const span = range.end - range.start;
  const t = span > 0 ? (p - range.start) / span : 1;
  return from + (to - from) * t;
}

export function localToGlobal(ranges: readonly SegmentRange[], segmentId: string, local: number): number {
  const range = ranges.find((candidate) => candidate.id === segmentId);
  if (!range) throw new Error(`Unknown flight segment: ${segmentId}`);
  return range.start + (range.end - range.start) * clamp(local, 0, 1);
}
