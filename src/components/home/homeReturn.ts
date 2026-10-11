import type { ViewMode } from '@/components/view/ViewMode';

const KEY = 'jg-home-return';

interface HomeReturn {
  y: number;
  mode: ViewMode;
}

/** Remembers where the visitor was on Home before opening a case study. */
export function saveHomeReturn(mode: ViewMode) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ y: Math.round(window.scrollY), mode } satisfies HomeReturn));
  } catch {
    // Without storage, "Back to Projects" falls back to the Projects section.
  }
}

/** The saved scroll position, if it was saved in the same viewing mode; used once. */
export function takeHomeReturn(mode: ViewMode): number | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as HomeReturn;
    return saved.mode === mode && Number.isFinite(saved.y) ? saved.y : null;
  } catch {
    return null;
  }
}
