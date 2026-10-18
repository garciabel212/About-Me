import { coverDraw } from '@/flight/crop';

/**
 * Paints the buildings of one frame onto the front layer (above the light, below the text): the frame
 * cut to its own matte, then the same dusk haze as `.film::after` in landing.css, so the buildings in
 * front match the hazed film behind them. Without the frame's own matte it paints nothing, since
 * another frame's matte would ghost. Returns whether anything was drawn.
 */
export function drawFront(
  ctx: CanvasRenderingContext2D,
  frame: CanvasImageSource,
  matte: CanvasImageSource | undefined,
  src: { w: number; h: number },
  view: { w: number; h: number },
): boolean {
  ctx.clearRect(0, 0, view.w, view.h);
  if (!matte) return false;
  const r = coverDraw(src.w, src.h, view.w, view.h);
  ctx.drawImage(frame, r.dx, r.dy, r.dw, r.dh);
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(matte, r.dx, r.dy, r.dw, r.dh);
  ctx.globalCompositeOperation = 'source-atop';

  // radial-gradient(ellipse 120% 95% at 50% 42%, clear 58%, rgba(11,13,24,0.42) 100%): a circle squashed to the ellipse.
  const rx = view.w * 1.2;
  const squash = (view.h * 0.95) / rx;
  ctx.save();
  ctx.scale(1, squash);
  const edge = ctx.createRadialGradient(view.w * 0.5, (view.h * 0.42) / squash, 0, view.w * 0.5, (view.h * 0.42) / squash, rx);
  edge.addColorStop(0.58, 'rgba(11, 13, 24, 0)');
  edge.addColorStop(1, 'rgba(11, 13, 24, 0.42)');
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, view.w, view.h / squash);
  ctx.restore();

  // linear-gradient(0deg, rgba(128,108,168,0.2), clear 36%): haze lifting off the bottom.
  const lift = ctx.createLinearGradient(0, view.h, 0, 0);
  lift.addColorStop(0, 'rgba(128, 108, 168, 0.2)');
  lift.addColorStop(0.36, 'rgba(128, 108, 168, 0)');
  ctx.fillStyle = lift;
  ctx.fillRect(0, 0, view.w, view.h);

  ctx.globalCompositeOperation = 'source-over';
  return true;
}
