import type { Span } from '@/flight/flightTarget';

export type Phase = 'transit' | 'drawing' | 'settled' | 'lifting';

export interface SitePhase {
  /** The site the title block shows. */
  stop: number;
  phase: Phase;
  /** Ink drawn, 0 to 1. */
  ink: number;
  /** Ink lifted away, 0 to 1. */
  lift: number;
  /** The reading line (mid-viewport) is inside the current site's section. */
  inside: boolean;
}

export interface InkStyle {
  ink: number;
  lift: number;
  /** Film rack focus: 0 sharp, 1 softened behind the ink. */
  focus: number;
}

/** Share of a site's hold spent drawing its ink. */
export const DRAW = 0.3;
/** Share of a site's hold spent lifting its ink. */
export const LIFT = 0.18;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Where the survey is for the current layout. `spans` are the site sections'
 * viewport rects in page order (null if missing). A site holds while its
 * section covers the whole viewport; anywhere else the camera is in transit.
 */
export function sitePhase(spans: (Span | null)[], vh: number): SitePhase {
  const line = vh * 0.5;
  let stop = -1;
  for (let i = 0; i < spans.length; i += 1) {
    const s = spans[i];
    if (!s) continue;
    if (stop < 0 || s.top <= line) stop = i;
    if (s.top <= 0 && s.bottom >= vh) {
      const hold = Math.max(1, s.bottom - s.top - vh);
      const h = clamp01(-s.top / hold);
      if (h < DRAW) return { stop: i, phase: 'drawing', ink: h / DRAW, lift: 0, inside: true };
      if (h > 1 - LIFT) return { stop: i, phase: 'lifting', ink: 1, lift: (h - (1 - LIFT)) / LIFT, inside: true };
      return { stop: i, phase: 'settled', ink: 1, lift: 0, inside: true };
    }
  }
  const current = Math.max(0, stop);
  const span = spans[current];
  const inside = !!span && span.top <= line && span.bottom >= line;
  return { stop: current, phase: 'transit', ink: 0, lift: 0, inside };
}

/** CSS values for a phase. With motion off the ink is whole whenever its site is being read, and the film never blurs. */
export function inkStyle(p: SitePhase, motion: boolean): InkStyle {
  if (!motion) return { ink: p.inside ? 1 : 0, lift: 0, focus: 0 };
  const focus = p.phase === 'transit' ? 0 : p.phase === 'drawing' ? p.ink : 1 - p.lift;
  return { ink: p.ink, lift: p.lift, focus };
}
