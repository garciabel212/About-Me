import { describe, expect, it } from 'vitest';
import { coverDraw } from '@/flight/crop';
import { drawFront } from '../front';

/** A 2D context that records what was drawn, in order. */
function recorder() {
  const log: unknown[][] = [];
  const gradient = { addColorStop: () => {} };
  const ctx = {
    log,
    set globalCompositeOperation(v: string) {
      log.push(['op', v]);
    },
    get fillStyle() {
      return '';
    },
    set fillStyle(_: unknown) {},
    clearRect: (...a: unknown[]) => log.push(['clearRect', ...a]),
    drawImage: (...a: unknown[]) => log.push(['drawImage', ...a]),
    fillRect: (...a: unknown[]) => log.push(['fillRect', ...a]),
    createRadialGradient: () => gradient,
    createLinearGradient: () => gradient,
    save: () => {},
    restore: () => {},
    setTransform: () => {},
    scale: () => {},
    translate: () => {},
  };
  return ctx;
}

const frame = { id: 'frame' } as unknown as CanvasImageSource;
const matte = { id: 'matte' } as unknown as CanvasImageSource;
const src = { w: 1920, h: 1056 };
const view = { w: 1440, h: 900 };

describe('drawFront', () => {
  it('draws nothing without a matte', () => {
    const ctx = recorder();
    expect(drawFront(ctx as unknown as CanvasRenderingContext2D, frame, undefined, src, view)).toBe(false);
    expect(ctx.log).toEqual([['clearRect', 0, 0, 1440, 900]]);
  });

  it('cuts the frame to its matte, then hazes only what is left', () => {
    const ctx = recorder();
    expect(drawFront(ctx as unknown as CanvasRenderingContext2D, frame, matte, src, view)).toBe(true);
    const r = coverDraw(1920, 1056, 1440, 900);
    const rect = [r.dx, r.dy, r.dw, r.dh];
    const kinds = ctx.log.map((e) => (e[0] === 'op' ? `op:${e[1]}` : e[0]));
    expect(kinds).toEqual(['clearRect', 'drawImage', 'op:destination-in', 'drawImage', 'op:source-atop', 'fillRect', 'fillRect', 'op:source-over']);
    expect(ctx.log[1]).toEqual(['drawImage', frame, ...rect]);
    expect(ctx.log[3]).toEqual(['drawImage', matte, ...rect]);
  });
});
