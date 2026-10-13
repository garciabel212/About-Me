import { describe, expect, it } from 'vitest';
import { measureAnchors } from '../dom';

type Box = { top: number; left: number; width: number; height: number };
const rect = (b: Box) => ({ ...b, right: b.left + b.width, bottom: b.top + b.height });

/** A minimal stand-in for a site section: a frame, a scrolling notes column, and anchored notes. */
function section(notesBox: Box, anchors: { id: string; box: Box }[]) {
  const frame = { getBoundingClientRect: () => rect({ top: 0, left: 0, width: 1280, height: 600 }) };
  const notes = { getBoundingClientRect: () => rect(notesBox) };
  const els = anchors.map(({ id, box }) => ({ dataset: { anchor: id }, scrollWidth: box.width, getBoundingClientRect: () => rect(box) }));
  return {
    querySelector: (sel: string) => (sel === '.site__frame' ? frame : sel === '.site__notes' ? notes : null),
    querySelectorAll: () => els,
  } as unknown as Element;
}

describe('measureAnchors', () => {
  it('starts desktop leaders just right of the words', () => {
    const s = section({ top: 100, left: 50, width: 500, height: 300 }, [{ id: 'a', box: { top: 120, left: 50, width: 200, height: 30 } }]);
    expect(measureAnchors(s, false)).toEqual({ a: { x: 262, y: 135 } });
  });

  it('skips notes the column has scrolled out of view, so no leader points at hidden text', () => {
    const s = section({ top: 100, left: 50, width: 500, height: 300 }, [
      { id: 'shown', box: { top: 120, left: 50, width: 200, height: 30 } },
      { id: 'clipped', box: { top: 420, left: 50, width: 200, height: 30 } },
    ]);
    expect(Object.keys(measureAnchors(s, false))).toEqual(['shown']);
  });
});
