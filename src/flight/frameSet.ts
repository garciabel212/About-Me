export type FrameSet = 'hd' | 'desktop' | 'phone';

/** The breakpoints that change the set; the film re-picks when any of them flips. */
export const SET_QUERIES = ['(max-width: 767px)', '(min-width: 1440px)', '(min-width: 960px) and (min-resolution: 1.5dppx)'];

/**
 * Which frames to stream: phone crops below 768px, HD (1920 wide) on wide or dense screens,
 * desktop (1280) otherwise. Data saver never gets HD.
 */
export function pickSet(width: number, dpr: number, saveData: boolean): FrameSet {
  if (width < 768) return 'phone';
  if (!saveData && (width >= 1440 || (width >= 960 && dpr >= 1.5))) return 'hd';
  return 'desktop';
}

/** HD and desktop share the wide mattes (the browser scales them); phone has its own crops. */
export function matteDir(set: FrameSet): 'wide' | 'phone' {
  return set === 'phone' ? 'phone' : 'wide';
}
