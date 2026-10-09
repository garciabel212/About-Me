/** Times are seconds in the approved master. Null keeps the honest static fallback. */
export const journeyMedia: { video: string | null; poster: string; mobilePoster: string } = {
  video: null,
  poster: 'images/brickell_skyline_hero.webp',
  mobilePoster: 'images/brickell_skyline_hero-768.webp',
};

// Each chapter spends most of its reading time moving slowly; the last 28%
// travels to the next location. Geometry is measured from real content height.
export const journeyChapters = [
  { id: 'intro', place: 'Miami River', time: 0, readingEnd: 2 },
  { id: 'work', place: 'Brickell & Downtown', time: 6, readingEnd: 10 },
  { id: 'process', place: 'Waterfront', time: 15, readingEnd: 17 },
  { id: 'experience', place: 'Biscayne Bay', time: 23, readingEnd: 25 },
  { id: 'about', place: 'The coast', time: 30, readingEnd: 32 },
  { id: 'contact', place: 'The beach', time: 38, readingEnd: 38 },
] as const;

export function chapterTime(index: number, progress: number) {
  const chapter = journeyChapters[index];
  const next = journeyChapters[index + 1];
  if (!next) return chapter.time;
  const p = Math.max(0, Math.min(1, progress));
  if (p <= .72) return chapter.time + (chapter.readingEnd - chapter.time) * p / .72;
  const travel = (p - .72) / .28;
  const eased = travel * travel * (3 - 2 * travel);
  return chapter.readingEnd + (next.time - chapter.readingEnd) * eased;
}
