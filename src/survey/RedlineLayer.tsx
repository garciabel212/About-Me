import type { CSSProperties } from 'react';
import { flight } from '@/flight/flightData';
import { arrowPath, checkPath, leaderPath, placeMark, ringPath, type Point, type Viewport } from './geometry';
import type { Mark, Site } from './sites';

export type Anchors = Record<string, Point>;

/** The marks a site rings, each with the id of the note its leader starts from. */
export function inkFor(site: Site): { id: string; mark: Mark }[] {
  if (site.body.kind === 'jobs') return site.body.jobs.map((j) => ({ id: j.id, mark: j.mark }));
  return [{ id: site.id, mark: site.mark }];
}

/** Inline custom properties: this stroke draws while --ink runs from `from` to `to`. */
const slice = (from: number, to: number) => ({ '--from': from.toFixed(3), '--to': to.toFixed(3) }) as unknown as CSSProperties;

/**
 * The redline markup over the film for one site. Strokes draw from the
 * --ink custom property set on the survey root by scroll; the layer only
 * shows once the film is actually on this site's stop frame (`ready`).
 */
export default function RedlineLayer({ site, index, anchors, vp, ready }: { site: Site; index: number; anchors: Anchors; vp: Viewport; ready: boolean }) {
  const stop = flight.stops[index];
  const marks = inkFor(site);
  const share = 1 / marks.length;
  const dir = vp.phone ? 'up' : 'right';

  return (
    <svg className={`redline${ready ? ' is-ready' : ''}`} aria-hidden="true" width={vp.w} height={vp.h} viewBox={`0 0 ${vp.w} ${vp.h}`}>
      {marks.map(({ id, mark }, i) => {
        const placed = placeMark(mark, stop, vp);
        const at = (a: number, b: number) => slice(i * share + a * share, i * share + b * share);
        if (placed.offscreen) {
          return <path key={id} className="ink ink--arrow" pathLength={1} d={arrowPath(placed.offscreen, Math.min(vp.h - 140, Math.max(120, placed.cy)), vp)} style={at(0, 1)} />;
        }
        const anchor = anchors[id];
        return (
          <g key={id}>
            <circle className="ink-pulse" cx={placed.cx} cy={placed.cy} r={placed.r} style={at(0, 0.2)} />
            <path className="ink ink--ring" pathLength={1} d={ringPath(placed.cx, placed.cy, placed.r)} style={at(0.15, 0.7)} />
            {anchor && <path className="ink ink--leader" pathLength={1} d={leaderPath(anchor, placed, dir)} style={at(0.7, 1)} />}
          </g>
        );
      })}
      {site.body.kind === 'punch' &&
        site.body.items.map((item, i) => {
          const a = anchors[item.id];
          if (!a) return null;
          const start = 0.35 + i * 0.12;
          return <path key={item.id} className="ink ink--check" pathLength={1} d={checkPath(a.x - 28, a.y - 9, 18)} style={slice(start, start + 0.1)} />;
        })}
    </svg>
  );
}
