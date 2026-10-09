export interface DrawRect {
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}

/** Where to draw a srcW×srcH frame so it covers a viewW×viewH canvas, centred on both axes. */
export function coverDraw(srcW: number, srcH: number, viewW: number, viewH: number): DrawRect {
  const scale = Math.max(viewW / srcW, viewH / srcH);
  const dw = srcW * scale;
  const dh = srcH * scale;
  return { dx: (viewW - dw) / 2, dy: (viewH - dh) / 2, dw, dh };
}

/** Screen position of a point given as fractions of the frame. */
export function toScreen(rect: DrawRect, fx: number, fy: number): { x: number; y: number } {
  return { x: rect.dx + fx * rect.dw, y: rect.dy + fy * rect.dh };
}
