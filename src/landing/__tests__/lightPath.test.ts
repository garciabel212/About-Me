import { describe, expect, it } from 'vitest';
import { HEAD_LINE, lightFor, pathD, samplePath } from '../lightPath';

const nodes = [
  { x: 1130, y: 120 },
  { x: 540, y: 1400 },
  { x: 700, y: 2700 },
  { x: 1160, y: 4000 },
];
const samples = samplePath(nodes);
const view = (scrollY: number, motion = true) => ({ scrollY, vh: 1000, maxScroll: 5000, top: 0, motion });

describe('pathD', () => {
  it('starts at the first node and ends exactly on each following node', () => {
    const d = pathD(nodes);
    expect(d.startsWith('M1130.0 120.0')).toBe(true);
    for (const n of nodes.slice(1)) expect(d).toContain(`${n.x.toFixed(1)} ${n.y.toFixed(1)}`);
    expect(d.match(/C/g)).toHaveLength(nodes.length - 1);
  });

  it('is empty with fewer than two nodes', () => {
    expect(pathD([{ x: 1, y: 1 }])).toBe('');
  });
});

describe('samplePath', () => {
  it('never leaves the horizontal range of each segment, so the S stays on the page', () => {
    for (let i = 0; i + 1 < nodes.length; i += 1) {
      const lo = Math.min(nodes[i].x, nodes[i + 1].x);
      const hi = Math.max(nodes[i].x, nodes[i + 1].x);
      for (const s of samples.filter((p) => p.y >= nodes[i].y && p.y <= nodes[i + 1].y)) {
        expect(s.x).toBeGreaterThanOrEqual(lo - 0.01);
        expect(s.x).toBeLessThanOrEqual(hi + 0.01);
      }
    }
  });

  it('only moves down the page, with growing length', () => {
    for (let i = 1; i < samples.length; i += 1) {
      expect(samples[i].y).toBeGreaterThanOrEqual(samples[i - 1].y);
      expect(samples[i].len).toBeGreaterThan(samples[i - 1].len);
    }
  });
});

describe('lightFor', () => {
  it('draws more of the light as the page scrolls', () => {
    const a = lightFor(samples, nodes, view(400));
    const b = lightFor(samples, nodes, view(1600));
    expect(b.fraction).toBeGreaterThan(a.fraction);
  });

  it('puts the head ahead of the reading line, so the light reaches the next point first', () => {
    const l = lightFor(samples, nodes, view(1000));
    expect(l.head.y).toBeCloseTo(1000 + 1000 * HEAD_LINE, 0);
  });

  it('lights every node the head has passed', () => {
    expect(lightFor(samples, nodes, view(0)).lit).toBe(1);
    expect(lightFor(samples, nodes, view(1400 - 1000 * HEAD_LINE)).lit).toBe(2);
  });

  it('is complete at the bottom of the page', () => {
    expect(lightFor(samples, nodes, view(5000))).toMatchObject({ fraction: 1, lit: 4 });
  });

  it('with motion off draws the whole light and lights every node', () => {
    expect(lightFor(samples, nodes, view(0, false))).toEqual({ fraction: 1, head: nodes[3], lit: 4 });
  });

  it('measures from the landing top, not the document top', () => {
    const shifted = lightFor(samples, nodes, { ...view(1068), top: 68 });
    expect(shifted.head.y).toBeCloseTo(lightFor(samples, nodes, view(1000)).head.y, 0);
  });
});
