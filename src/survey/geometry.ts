import { coverDraw, toScreen, type DrawRect } from '@/flight/crop';
import { flight, type FlightStop } from '@/flight/flightData';
import type { Mark } from './sites';

export interface Viewport {
  w: number;
  h: number;
  phone: boolean;
}

export interface Point {
  x: number;
  y: number;
}

export interface PlacedMark {
  cx: number;
  cy: number;
  r: number;
  /** Set when the landmark lies outside the visible film (phone crops). */
  offscreen: 'left' | 'right' | null;
}

export const PHONE_QUERY = '(max-width: 767px)';

const f = (n: number) => n.toFixed(1);

/** Where the film is drawn for this viewport: the same cover rule the canvas uses. */
export function filmRect(vp: Viewport): DrawRect {
  return coverDraw(vp.phone ? flight.phoneWidth : flight.width, flight.height, vp.w, vp.h);
}

/**
 * A desktop-frame x fraction as a fraction of the phone frame. The phone set is
 * cropped per stop so the stop's landmark sits at `phoneX` (tools/flight/export_site.py).
 */
export function phoneX(x: number, stop: FlightStop): number {
  const left = stop.x * flight.width - stop.phoneX * flight.phoneWidth;
  return (x * flight.width - left) / flight.phoneWidth;
}

export function placeMark(mark: Mark, stop: FlightStop, vp: Viewport): PlacedMark {
  const rect = filmRect(vp);
  const p = toScreen(rect, vp.phone ? phoneX(mark.x, stop) : mark.x, mark.y);
  const offscreen = p.x < 0 ? 'left' : p.x > vp.w ? 'right' : null;
  return { cx: p.x, cy: p.y, r: mark.r * rect.dh, offscreen };
}

/**
 * A surveyor's ring: one continuous stroke that starts upper-left, goes once
 * around with a slight hand wobble, and overshoots its start.
 */
export function ringPath(cx: number, cy: number, r: number): string {
  const steps = 48;
  const start = (-110 * Math.PI) / 180;
  const sweep = (380 * Math.PI) / 180;
  let d = '';
  for (let i = 0; i <= steps; i += 1) {
    const a = start + (sweep * i) / steps;
    const rr = r * (1 + 0.035 * Math.sin(3 * a + 0.6)) * (1 + 0.04 * (i / steps));
    d += `${i === 0 ? 'M' : 'L'}${f(cx + rr * Math.cos(a))} ${f(cy + rr * Math.sin(a))}`;
  }
  return d;
}

/** Shortest distance from (px, py) to the segment a-b. */
function toSegment(px: number, py: number, a: Point, b: Point): number {
  const len2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2 || 1;
  const t = Math.max(0, Math.min(1, ((px - a.x) * (b.x - a.x) + (py - a.y) * (b.y - a.y)) / len2));
  return Math.hypot(px - (a.x + t * (b.x - a.x)), py - (a.y + t * (b.y - a.y)));
}

/** The point on a ring's edge facing `toward`. */
function edge(ring: PlacedMark, toward: Point): Point {
  const a = Math.atan2(toward.y - ring.cy, toward.x - ring.cx);
  return { x: ring.cx + ring.r * Math.cos(a), y: ring.cy + ring.r * Math.sin(a) };
}

/**
 * Leader from a note to the ring: a short shoulder out of the note, then a
 * straight line to the ring's edge. A leader never crosses another callout:
 * when the line would pass through a ring in `avoid`, it bends around that
 * ring's near side (below it when the note sits lower, above otherwise).
 */
export function leaderPath(from: Point, ring: PlacedMark, dir: 'right' | 'up', avoid: PlacedMark[] = []): string {
  const shoulder = dir === 'right' ? { x: from.x + 28, y: from.y } : { x: from.x, y: from.y - 24 };
  const pts: Point[] = [from, shoulder];
  const blocker = avoid.find((o) => o !== ring && toSegment(o.cx, o.cy, shoulder, edge(ring, shoulder)) < o.r + 10);
  if (blocker) {
    const clear = blocker.r + 18;
    pts.push({ x: blocker.cx, y: shoulder.y >= blocker.cy ? blocker.cy + clear : blocker.cy - clear });
  }
  pts.push(edge(ring, pts[pts.length - 1]));
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${f(p.x)} ${f(p.y)}`).join('');
}

/** A check mark in a size x size box whose top-left corner is (x, y). */
export function checkPath(x: number, y: number, size: number): string {
  return `M${f(x)} ${f(y + size * 0.55)}L${f(x + size * 0.38)} ${f(y + size)}L${f(x + size)} ${f(y)}`;
}

/** An arrow at the screen edge pointing toward a landmark the crop hides. */
export function arrowPath(side: 'left' | 'right', y: number, vp: Viewport): string {
  const tip = side === 'right' ? vp.w - 16 : 16;
  const tail = side === 'right' ? tip - 44 : tip + 44;
  const back = side === 'right' ? tip - 10 : tip + 10;
  return `M${f(tail)} ${f(y)}L${f(tip)} ${f(y)}M${f(back)} ${f(y - 8)}L${f(tip)} ${f(y)}L${f(back)} ${f(y + 8)}`;
}
