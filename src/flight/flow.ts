import type { Segment } from './timeline';

export interface Point {
  x: number;
  y: number;
}

/** Height of the living card: the travel strip when closed, the stop's content when open, capped by the viewport. */
export function panelHeight(open: number, contentHeight: number, stripHeight: number, maxHeight: number): number {
  const full = Math.min(contentHeight, maxHeight);
  return stripHeight + open * (full - stripHeight);
}

/** Where the gliding pin is between two landmarks: a quadratic arc lifted `lift` px above their midpoint. */
export function glidePoint(a: Point, b: Point, t: number, lift: number): Point {
  const c = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - lift };
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
    y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
  };
}

/** The thread from the card to the pin: leaves a side card horizontally, or rises from a phone sheet. */
export function threadPath(from: Point, to: Point, kind: 'side' | 'sheet'): string {
  const r = (n: number) => Math.round(n * 10) / 10;
  if (kind === 'side') {
    const mx = r(from.x + (to.x - from.x) / 2);
    return `M${r(from.x)} ${r(from.y)}C${mx} ${r(from.y)} ${mx} ${r(to.y)} ${r(to.x)} ${r(to.y)}`;
  }
  const my = r(from.y + (to.y - from.y) / 2);
  return `M${r(from.x)} ${r(from.y)}C${r(from.x)} ${my} ${r(to.x)} ${my} ${r(to.x)} ${r(to.y)}`;
}

/** Which stop's content is on the card at a timeline time; -1 while flying between stops. */
export function activeAt(segments: Segment[], time: number): number {
  let current = segments[0];
  for (const s of segments) {
    if (s.start > time) break;
    current = s;
  }
  return current.kind === 'hop' ? -1 : current.stop;
}
