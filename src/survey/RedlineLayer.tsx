import type { CSSProperties } from 'react';
import { flight } from '@/flight/flightData';
import { arrowPath, checkPath, leaderPath, placeMark, ringPath, type Point, type Viewport } from './geometry';
import type { Mark, Site } from './sites';

export type Anchors = Record<string, Point>;

/**
 * The marks a site rings, each with the id of the note its leader starts from.
 * `label` is lettered in the ink itself: the River's next-site note, and on
 * phones the job an edge arrow points to.
 */
export function inkFor(site: Site): { id: string; mark: Mark; label?: string }[] {
  if (site.body.kind === 'jobs') return site.body.jobs.map((j) => ({ id: j.id, mark: j.mark, label: j.title }));
  if (site.body.kind === 'intro') return [{ id: site.id, mark: site.mark, label: site.body.next }];
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

  const placed = marks.map(({ mark }) => placeMark(mark, stop, vp));
  const onScreen = placed.filter((p) => !p.offscreen);

  return (
    <svg className={`redline${ready ? ' is-ready' : ''}`} aria-hidden="true" width={vp.w} height={vp.h} viewBox={`0 0 ${vp.w} ${vp.h}`}>
      {marks.map(({ id, label }, i) => {
        const ring = placed[i];
        const at = (a: number, b: number) => slice(i * share + a * share, i * share + b * share);
        if (ring.offscreen) {
          // Phones stack notes over the lower two thirds, so edge arrows stay in the sky above them.
          const y = vp.phone ? Math.min(vp.h * 0.34, Math.max(110, ring.cy)) : Math.min(vp.h - 140, Math.max(120, ring.cy));
          const right = ring.offscreen === 'right';
          return (
            <g key={id}>
              <path className="ink ink--arrow" pathLength={1} d={arrowPath(ring.offscreen, y, vp)} style={at(0, 1)} />
              {label && <text className="ink-label" x={right ? vp.w - 16 : 16} y={y - 14} textAnchor={right ? 'end' : 'start'} style={at(0.6, 1)}>{label}</text>}
            </g>
          );
        }
        // The River's note is lettered beside its ring (below it on phones); other leaders start at their notes.
        const lettered = site.body.kind === 'intro' && label
          ? vp.phone
            ? { x: ring.cx, y: ring.cy + ring.r + 44, anchor: 'middle' as const, from: { x: ring.cx, y: ring.cy + ring.r + 30 } }
            : { x: ring.cx - ring.r - 60, y: ring.cy + ring.r * 0.55, anchor: 'end' as const, from: { x: ring.cx - ring.r - 54, y: ring.cy + ring.r * 0.55 - 4 } }
          : null;
        const from = lettered ? lettered.from : anchors[id];
        return (
          <g key={id}>
            <circle className="ink-pulse" cx={ring.cx} cy={ring.cy} r={ring.r} style={at(0, 0.2)} />
            <path className="ink ink--ring" pathLength={1} d={ringPath(ring.cx, ring.cy, ring.r)} style={at(0.15, 0.7)} />
            {from && <path className="ink ink--leader" pathLength={1} d={leaderPath(from, ring, lettered ? (vp.phone ? 'up' : 'right') : dir, onScreen)} style={at(0.7, 1)} />}
            {lettered && <text className="ink-label" x={lettered.x} y={lettered.y} textAnchor={lettered.anchor} style={at(0.75, 1)}>{label}</text>}
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
