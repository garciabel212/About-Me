import { useEffect, type RefObject } from 'react';

export interface Vec {
  x: number;
  y: number;
}

/** How far each plane moves at full sway (px): the film goes one way, the text the other, so the scene reads as depth. */
export const SWAY = {
  film: { x: -14, y: -9 },
  text: { x: 7, y: 5 },
} as const;

/** Everything that moves as the film: the frame canvas, its poster, and the building layer drawn over the light. */
export const FILM_SELECTOR = '.film__canvas, .film__poster, .film__front';

/** The pointer as -1..1 around the screen centre. */
export function swayTarget(px: number, py: number, w: number, h: number): Vec {
  return { x: (px / w) * 2 - 1, y: (py / h) * 2 - 1 };
}

/** One frame of easing toward the target (no jitter, no snapping). */
export function swayStep(current: Vec, target: Vec, k = 0.08): Vec {
  return { x: current.x + (target.x - current.x) * k, y: current.y + (target.y - current.y) * k };
}

/**
 * Camera sway on desktop: moving the mouse turns the "camera" a little. The
 * film (and its building layer) shift one way, the text and light the
 * other. Transforms are written straight to the few elements that move.
 */
export function useCameraSway(root: RefObject<HTMLElement | null>, enabled: boolean): void {
  useEffect(() => {
    const el = root.current;
    if (!el || !enabled || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let current: Vec = { x: 0, y: 0 };
    let target: Vec = { x: 0, y: 0 };
    let raf = 0;
    const film = () => el.querySelectorAll<HTMLElement>(FILM_SELECTOR);
    const text = () => el.querySelectorAll<HTMLElement | SVGElement>('.point__body, .light-path');
    const write = () => {
      const f = `${(current.x * SWAY.film.x).toFixed(2)}px ${(current.y * SWAY.film.y).toFixed(2)}px`;
      const t = `${(current.x * SWAY.text.x).toFixed(2)}px ${(current.y * SWAY.text.y).toFixed(2)}px`;
      film().forEach((n) => { n.style.translate = f; n.style.scale = '1.04'; });
      text().forEach((n) => { n.style.translate = t; });
    };
    const tick = () => {
      current = swayStep(current, target);
      write();
      raf = Math.abs(current.x - target.x) + Math.abs(current.y - target.y) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e: PointerEvent) => {
      target = swayTarget(e.clientX, e.clientY, window.innerWidth, window.innerHeight);
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
      film().forEach((n) => { n.style.translate = ''; n.style.scale = ''; });
      text().forEach((n) => { n.style.translate = ''; });
    };
  }, [root, enabled]);
}
