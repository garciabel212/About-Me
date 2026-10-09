export type SegmentKind = 'open' | 'reveal' | 'hold' | 'fold' | 'hop' | 'tail';

export interface Segment {
  kind: SegmentKind;
  stop: number;
  start: number;
  end: number;
  fromFrame?: number;
  toFrame?: number;
}

/** Scroll units per phase. One unit is turned into scroll distance by FlightHome. */
export const UNITS = { open: 10, reveal: 22, hold: 10, fold: 6, perFrame: 1 / 3, tail: 6 } as const;

/**
 * Lays out the whole flight as consecutive segments. Stop 1 starts open (the hero must be readable at
 * first paint); every later stop is revealed, held for reading, then folded before the next hop.
 */
export function buildTimeline(stopFrames: number[]): { segments: Segment[]; total: number; readingAt: number[] } {
  const segments: Segment[] = [];
  const readingAt: number[] = [];
  let t = 0;
  const push = (kind: SegmentKind, stop: number, length: number, extra: Partial<Segment> = {}) => {
    segments.push({ kind, stop, start: t, end: t + length, ...extra });
    t += length;
  };
  stopFrames.forEach((frame, i) => {
    if (i === 0) {
      readingAt.push(0);
      push('open', 0, UNITS.open);
    } else {
      push('reveal', i, UNITS.reveal);
      readingAt.push(t);
      push('hold', i, UNITS.hold);
    }
    if (i < stopFrames.length - 1) {
      push('fold', i, UNITS.fold);
      const next = stopFrames[i + 1];
      push('hop', i, (next - frame) * UNITS.perFrame, { fromFrame: frame, toFrame: next });
    }
  });
  push('tail', stopFrames.length - 1, UNITS.tail);
  return { segments, total: t, readingAt };
}

/** Scroll offset inside the track at which a reading position sits. */
export function anchorTop(readingAt: number, total: number, trackHeight: number, viewportHeight: number): number {
  return Math.max(0, (readingAt / total) * (trackHeight - viewportHeight));
}
