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

/** Leader from a note to the ring: a short shoulder out of the note, then straight to the ring's edge. */
export function leaderPath(from: Point, ring: PlacedMark, dir: 'right' | 'up'): string {
  const shoulder = dir === 'right' ? { x: from.x + 28, y: from.y } : { x: from.x, y: from.y - 24 };
  const a = Math.atan2(shoulder.y - ring.cy, shoulder.x - ring.cx);
  const ex = ring.cx + ring.r * Math.cos(a);
  const ey = ring.cy + ring.r * Math.sin(a);
  return `M${f(from.x)} ${f(from.y)}L${f(shoulder.x)} ${f(shoulder.y)}L${f(ex)} ${f(ey)}`;
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
