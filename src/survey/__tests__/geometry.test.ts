import { describe, expect, it } from 'vitest';
import { coverDraw, toScreen } from '@/flight/crop';
import { flight } from '@/flight/flightData';
import { sites } from '../sites';
import { arrowPath, checkPath, filmRect, leaderPath, phoneX, placeMark, ringPath, type Viewport } from '../geometry';

const points = (d: string) => [...d.matchAll(/-?\d+(\.\d+)?/g)].map((m) => Number(m[0]));
const pairs = (d: string) => {
  const n = points(d);
  const out: [number, number][] = [];
  for (let i = 0; i + 1 < n.length; i += 2) out.push([n[i], n[i + 1]]);
  return out;
};
const downtown = flight.stops[2];
const jobsAt = (i: number) => {
  const b = sites[i].body;
  if (b.kind !== 'jobs') throw new Error('not a job site');
  return b.jobs;
};

describe('filmRect', () => {
  it('matches the canvas cover rule on desktop and phone', () => {
    expect(filmRect({ w: 1920, h: 1080, phone: false })).toEqual(coverDraw(flight.width, flight.height, 1920, 1080));
    expect(filmRect({ w: 390, h: 844, phone: true })).toEqual(coverDraw(flight.phoneWidth, flight.height, 390, 844));
  });
});

describe('phoneX', () => {
  it('puts each stop landmark where the phone export put it', () => {
    for (const stop of flight.stops) expect(phoneX(stop.x, stop)).toBeCloseTo(stop.phoneX, 3);
  });
});

describe('placeMark', () => {
  it.each([
    [1280, 720],
    [1920, 1080],
    [2560, 1080],
  ])('keeps the ring on its landmark at %ix%i', (w, h) => {
    const vp: Viewport = { w, h, phone: false };
    for (const [i, stop] of flight.stops.entries()) {
      const placed = placeMark(sites[i].mark, stop, vp);
      const expected = toScreen(filmRect(vp), sites[i].mark.x, sites[i].mark.y);
      expect(placed.cx).toBeCloseTo(expected.x);
      expect(placed.cy).toBeCloseTo(expected.y);
      expect(placed.r).toBeCloseTo(sites[i].mark.r * filmRect(vp).dh);
      expect(placed.offscreen).toBeNull();
    }
  });

  it('flags Downtown landmarks that fall outside the phone crop', () => {
    const vp: Viewport = { w: 390, h: 844, phone: true };
    const at = (id: string) => placeMark(jobsAt(2).find((j) => j.id === id)!.mark, downtown, vp);
    const [aac, garage, lab] = ['job-aac-communication-app', 'job-miniature-garage', 'job-agent-trading-os'].map(at);
    expect(aac.offscreen).toBe('left');
    expect(garage.offscreen).toBeNull();
    expect(lab.offscreen).toBe('right');
  });
});

describe('ringPath', () => {
  it('draws one continuous loop that overshoots its start, close to the radius', () => {
    const d = ringPath(500, 300, 80);
    expect(d.startsWith('M')).toBe(true);
    expect(d.match(/M/g)).toHaveLength(1);
    const pts = pairs(d);
    expect(pts.length).toBeGreaterThan(40);
    for (const [x, y] of pts) {
      const dist = Math.hypot(x - 500, y - 300);
      expect(dist).toBeGreaterThan(80 * 0.9);
      expect(dist).toBeLessThan(80 * 1.1);
    }
  });
});

describe('leaderPath', () => {
  const ring = { cx: 900, cy: 300, r: 60, offscreen: null } as const;

  it('runs right from the note, then ends on the ring', () => {
    const pts = pairs(leaderPath({ x: 400, y: 500 }, ring, 'right'));
    expect(pts[0]).toEqual([400, 500]);
    const [ex, ey] = pts[pts.length - 1];
    expect(Math.hypot(ex - 900, ey - 300)).toBeCloseTo(60, 0);
  });

  it('runs up from the note on phones', () => {
    const pts = pairs(leaderPath({ x: 195, y: 600 }, ring, 'up'));
    expect(pts[1][0]).toBeCloseTo(195);
    expect(pts[1][1]).toBeLessThan(600);
  });
});

describe('checkPath and arrowPath', () => {
  it('draws a two-stroke check inside its box', () => {
    for (const [x, y] of pairs(checkPath(100, 200, 18))) {
      expect(x).toBeGreaterThanOrEqual(100);
      expect(x).toBeLessThanOrEqual(118);
      expect(y).toBeGreaterThanOrEqual(200);
      expect(y).toBeLessThanOrEqual(218);
    }
  });

  it('points the edge arrow off the side it names, inside the viewport', () => {
    const vp: Viewport = { w: 390, h: 844, phone: true };
    const right = pairs(arrowPath('right', 300, vp));
    const left = pairs(arrowPath('left', 300, vp));
    for (const [x] of [...right, ...left]) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(390);
    }
    expect(Math.max(...right.map(([x]) => x))).toBeGreaterThan(390 - 30);
    expect(Math.min(...left.map(([x]) => x))).toBeLessThan(30);
  });
});

describe('leaderPath around other rings', () => {
  /** Shortest distance from a point to a segment. */
  const toSegment = (px: number, py: number, [ax, ay]: [number, number], [bx, by]: [number, number]) => {
    const t = Math.max(0, Math.min(1, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2 || 1)));
    return Math.hypot(px - (ax + t * (bx - ax)), py - (ay + t * (by - ay)));
  };

  it.each([
    [1440, 900, 593],
    [1280, 600, 373],
  ])('keeps the Agent Trading OS leader off the AAC ring at %ix%i', (w, h, noteY) => {
    const vp: Viewport = { w, h, phone: false };
    const ring = (id: string) => placeMark(jobsAt(2).find((j) => j.id === id)!.mark, downtown, vp);
    const aac = ring('job-aac-communication-app');
    const lab = ring('job-agent-trading-os');
    const pts = pairs(leaderPath({ x: 300, y: noteY }, lab, 'right', [aac]));
    for (let i = 0; i + 1 < pts.length; i += 1) expect(toSegment(aac.cx, aac.cy, pts[i], pts[i + 1])).toBeGreaterThan(aac.r + 4);
    const [ex, ey] = pts[pts.length - 1];
    expect(Math.hypot(ex - lab.cx, ey - lab.cy)).toBeCloseTo(lab.r, 0);
  });

  it('stays a straight shoulder-and-line when nothing is in the way', () => {
    const ring = { cx: 900, cy: 300, r: 60, offscreen: null } as const;
    expect(pairs(leaderPath({ x: 400, y: 500 }, ring, 'right', []))).toHaveLength(3);
  });
});
