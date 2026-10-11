export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A rect `t` of the way from `a` to `b`. */
export function lerpRect(a: Rect, b: Rect, t: number): Rect {
  const mix = (p: number, q: number) => p + (q - p) * t;
  return { x: mix(a.x, b.x), y: mix(a.y, b.y), w: mix(a.w, b.w), h: mix(a.h, b.h) };
}

/**
 * The part of a srcW×srcH frame that covers a destW×destH box, centred
 * vertically and horizontally on `focusX` (0–1 of the frame width), so the
 * stop's landmark stays in a narrow window. Never reads outside the frame.
 */
export function coverSource(srcW: number, srcH: number, destW: number, destH: number, focusX: number): Rect {
  const scale = Math.max(destW / srcW, destH / srcH);
  const w = Math.min(srcW, destW / scale);
  const h = Math.min(srcH, destH / scale);
  const x = Math.min(srcW - w, Math.max(0, focusX * srcW - w / 2));
  return { x, y: (srcH - h) / 2, w, h };
}
