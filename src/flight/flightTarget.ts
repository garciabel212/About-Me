export interface Span {
  top: number;
  bottom: number;
}

/** Where on screen the flight reads the page: the middle of the viewport. */
export const PROBE = 0.5;

const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * Which film frame the backdrop shows for the current layout. While the probe
 * line is inside section i, the film holds at stop i. Only while it crosses the
 * gap between two sections does the camera fly from one stop to the next.
 * `spans` are the sections' viewport rects in page order (null if missing).
 */
export function flightTarget(spans: (Span | null)[], viewportHeight: number, stopFrames: number[]): { frame: number; stop: number } {
  const probe = viewportHeight * PROBE;
  let previous: { span: Span; index: number } | null = null;
  for (let i = 0; i < spans.length; i += 1) {
    const span = spans[i];
    if (!span) continue;
    if (probe < span.top) {
      if (!previous) return { frame: stopFrames[i], stop: i };
      const gap = span.top - previous.span.bottom;
      const t = gap > 0 ? Math.min(1, Math.max(0, (probe - previous.span.bottom) / gap)) : 1;
      const from = stopFrames[previous.index];
      const to = stopFrames[i];
      return { frame: from + (to - from) * smooth(t), stop: t < 0.5 ? previous.index : i };
    }
    if (probe <= span.bottom) return { frame: stopFrames[i], stop: i };
    previous = { span, index: i };
  }
  const end = previous?.index ?? 0;
  return { frame: stopFrames[end], stop: end };
}
