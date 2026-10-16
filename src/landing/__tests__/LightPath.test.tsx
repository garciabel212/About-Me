import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import LightPath, { landingSize, measureNodes } from '../LightPath';

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

describe('measureNodes exits', () => {
  it('marks the bottom node of each point as an exit, so it shapes the path without a dot', () => {
    const root = {
      getBoundingClientRect: () => rect({ top: 0, left: 0, width: 1440, height: 8000 }),
      querySelectorAll: () => [
        { getAttribute: () => 'true', getBoundingClientRect: () => rect({ top: 100, left: 600, width: 12, height: 12 }) },
        { getAttribute: () => 'exit', getBoundingClientRect: () => rect({ top: 900, left: 600, width: 12, height: 12 }) },
      ],
    } as unknown as Element;
    expect(measureNodes(root)).toEqual([
      { x: 606, y: 106 },
      { x: 606, y: 906, exit: true },
    ]);
  });
});

describe('landingSize', () => {
  it('sizes the light from the landing box, never from its own overflow (which once left blank page below the footer)', () => {
    const root = { clientWidth: 1440, offsetHeight: 10332, scrollHeight: 15282 } as unknown as HTMLElement;
    expect(landingSize(root)).toEqual({ w: 1440, h: 10332 });
  });
});

describe('LightPath', () => {
  it('is decorative to assistive tech and renders nothing to draw before nodes are measured', () => {
    const out = renderToStaticMarkup(<LightPath motion />);
    expect(out).toMatch(/^<svg class="light-path" aria-hidden="true"/);
    expect(out).not.toContain('<path');
  });
});

describe('measureNodes origin', () => {
  it('measures nodes against the light layer itself, so a camera sway that moves both cancels out', () => {
    const root = {
      getBoundingClientRect: () => rect({ top: 0, left: 0, width: 1440, height: 8000 }),
      querySelectorAll: () => [{ getBoundingClientRect: () => rect({ top: 105, left: 607, width: 12, height: 12 }) }],
    } as unknown as Element;
    // The text and the light layer are both shifted by the same sway (7px, 5px).
    const origin = { getBoundingClientRect: () => rect({ top: 5, left: 7, width: 1440, height: 8000 }) } as unknown as Element;
    expect(measureNodes(root, origin)).toEqual([{ x: 606, y: 106 }]);
  });
});
