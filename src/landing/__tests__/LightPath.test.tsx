import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import LightPath, { measureNodes } from '../LightPath';

type Box = { top: number; left: number; width: number; height: number };
const rect = (b: Box) => ({ ...b, right: b.left + b.width, bottom: b.top + b.height, x: b.left, y: b.top });

function landing(rootBox: Box, nodes: Box[]) {
  return {
    getBoundingClientRect: () => rect(rootBox),
    querySelectorAll: () => nodes.map((n) => ({ getBoundingClientRect: () => rect(n) })),
  } as unknown as Element;
}

describe('measureNodes', () => {
  it('returns node centers relative to the landing, so the path scrolls with the text', () => {
    const root = landing({ top: -500, left: 0, width: 1440, height: 8000 }, [
      { top: 100, left: 1120, width: 12, height: 12 },
      { top: 900, left: 540, width: 12, height: 12 },
    ]);
    expect(measureNodes(root)).toEqual([
      { x: 1126, y: 606 },
      { x: 546, y: 1406 },
    ]);
  });

  it('re-reads positions on every call, so late fonts and images move the nodes with the text', () => {
    let top = 100;
    const root = {
      getBoundingClientRect: () => rect({ top: 0, left: 0, width: 1440, height: 8000 }),
      querySelectorAll: () => [{ getBoundingClientRect: () => rect({ top, left: 0, width: 10, height: 10 }) }],
    } as unknown as Element;
    expect(measureNodes(root)[0].y).toBe(105);
    top = 160;
    expect(measureNodes(root)[0].y).toBe(165);
  });
});

describe('LightPath', () => {
  it('is decorative to assistive tech and renders nothing to draw before nodes are measured', () => {
    const out = renderToStaticMarkup(<LightPath motion />);
    expect(out).toMatch(/^<svg class="light-path" aria-hidden="true"/);
    expect(out).not.toContain('<path');
  });
});
