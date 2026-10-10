export interface PinRange {
  start: number;
  end: number;
}

/**
 * Where to scroll after the flight's pin is rebuilt with a new length (e.g. a
 * phone rotates across the mobile breakpoint): same progress inside the flight,
 * same distance past its end below it, unchanged above it.
 */
export function resumeScroll(previous: PinRange & { y: number }, next: PinRange): number {
  const { y, start, end } = previous;
  if (y <= start) return y;
  if (y >= end) return next.end + (y - end);
  const progress = end > start ? (y - start) / (end - start) : 0;
  return next.start + (next.end - next.start) * progress;
}
