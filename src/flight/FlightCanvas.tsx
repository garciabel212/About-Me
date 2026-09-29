import { useEffect, useRef } from 'react';
import type { FrameStore } from './FrameStore';
import { coverRect } from './coverRect';

interface FlightCanvasProps {
  store: FrameStore<HTMLImageElement> | null;
  /** Fractional frame index, written by the scroll driver, read every animation frame. */
  frameRef: { current: number };
  /** Blurred data-URI poster shown until the first frame is drawn. */
  poster: string;
}

export default function FlightCanvas({ store, frameRef, poster }: FlightCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !store) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let animationFrame = 0;
    let visible = true;
    let dirty = true;
    let drawnFrame = Number.NaN;
    let drawnVersion = -1;

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(canvas.clientWidth * pixelRatio));
      const height = Math.max(1, Math.round(canvas.clientHeight * pixelRatio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        dirty = true;
      }
    };

    const paint = (image: HTMLImageElement, alpha: number) => {
      const source = coverRect(image.naturalWidth, image.naturalHeight, canvas.width, canvas.height, 1);
      context.globalAlpha = alpha;
      context.drawImage(image, source.sx, source.sy, source.sw, source.sh, 0, 0, canvas.width, canvas.height);
    };

    const render = () => {
      animationFrame = 0;
      if (!visible) return;
      const frame = frameRef.current;
      if (dirty || frame !== drawnFrame || store.version !== drawnVersion) {
        const base = Math.floor(frame);
        const current = store.nearest(base);
        if (current) {
          paint(current.frame, 1);
          const blend = frame - base;
          const next = current.index === base && blend > 0.001 ? store.get(base + 1) : undefined;
          if (next) paint(next, blend);
          context.globalAlpha = 1;
          drawnFrame = frame;
          drawnVersion = store.version;
          dirty = false;
        }
      }
      animationFrame = window.requestAnimationFrame(render);
    };

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible && !animationFrame) {
        dirty = true;
        animationFrame = window.requestAnimationFrame(render);
      }
    });
    const resizeObserver = new ResizeObserver(resize);

    resize();
    intersection.observe(canvas);
    resizeObserver.observe(canvas);
    animationFrame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      intersection.disconnect();
      resizeObserver.disconnect();
    };
  }, [store, frameRef]);

  return (
    <div
      className="absolute inset-0 bg-cover bg-bottom"
      style={{ backgroundImage: `url("${poster}")` }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
