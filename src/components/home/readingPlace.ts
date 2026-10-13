import { sites } from '@/survey/sites';

export interface PlaceRect {
  id: string;
  top: number;
  bottom: number;
}

/** Cinematic places with no Read section of their own: the Read section that covers them. */
const READ_FALLBACK: Record<string, string> = { 'more-projects': 'projects' };

/** Which section the reading line is in, and how far through it. Sections are taken in page order. */
export function readingPlaceFrom(line: number, rects: PlaceRect[]): { id: string; ratio: number } | null {
  const sorted = [...rects].sort((a, b) => a.top - b.top);
  for (const r of sorted) {
    if (line < r.top) return { id: r.id, ratio: 0 };
    if (line <= r.bottom) return { id: r.id, ratio: (line - r.top) / Math.max(1, r.bottom - r.top) };
  }
  return null;
}

/** Selector for the element that holds a place in the given mode. */
export function placeTarget(id: string, mode: 'cinematic' | 'read'): string {
  if (mode === 'read') return `#${READ_FALLBACK[id] ?? id}`;
  const owner = sites.find((s) => s.anchors.includes(id));
  return owner ? `[data-site="${owner.id}"]` : `#${id}`;
}
