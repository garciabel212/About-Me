import { useEffect, useState } from 'react';
import type { Span } from '@/flight/flightTarget';
import type { Anchors } from './RedlineLayer';

/** Viewport rects of the site sections, in the order of `ids` (null when a section is missing). */
export function siteSpans(ids: string[]): (Span | null)[] {
  return ids.map((id) => {
    const r = document.querySelector(`[data-site="${id}"]`)?.getBoundingClientRect();
    return r ? { top: r.top, bottom: r.bottom } : null;
  });
}

export function useMatches(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = () => setMatches(list.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

/**
 * Leader start points for the notes in a site's frame, in viewport px. The
 * frame is sticky at the top-left of the viewport while the site holds, so
 * positions relative to it are screen positions. Desktop leaders leave a note's
 * right edge; phone leaders leave its top; punch checks sit at an item's left.
 */
export function measureAnchors(section: Element, phone: boolean): Anchors {
  const frame = section.querySelector('.site__frame');
  if (!frame) return {};
  const f = frame.getBoundingClientRect();
  const out: Anchors = {};
  section.querySelectorAll<HTMLElement>('[data-anchor]').forEach((el) => {
    const r = el.getBoundingClientRect();
    const id = el.dataset.anchor!;
    const midY = r.top - f.top + r.height / 2;
    if (el.dataset.anchorSide === 'left') out[id] = { x: r.left - f.left, y: midY };
    else if (phone) out[id] = { x: r.left - f.left + Math.min(r.width / 2, 120), y: r.top - f.top };
    else out[id] = { x: r.left - f.left + Math.min(r.width, el.scrollWidth) + 12, y: midY };
  });
  return out;
}
