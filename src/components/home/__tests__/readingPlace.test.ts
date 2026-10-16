import { describe, expect, it } from 'vitest';
import { placeTarget, readingPlaceFrom } from '../readingPlace';

describe('readingPlaceFrom', () => {
  it('reads sections in page order even when listed out of order', () => {
    const rects = [
      { id: 'contact', top: 2000, bottom: 2600 },
      { id: 'overview', top: -400, bottom: 300 },
      { id: 'projects', top: 300, bottom: 1200 },
    ];
    expect(readingPlaceFrom(500, rects)).toEqual({ id: 'projects', ratio: 200 / 900 });
  });

  it('returns the next section at ratio 0 when the line sits in a gap', () => {
    const rects = [
      { id: 'a', top: -900, bottom: 100 },
      { id: 'b', top: 600, bottom: 1600 },
    ];
    expect(readingPlaceFrom(300, rects)).toEqual({ id: 'b', ratio: 0 });
  });
});

describe('placeTarget', () => {
  it('finds the landing point that owns a Read section id', () => {
    expect(placeTarget('projects', 'cinematic')).toBe('[data-point="bay"]');
    expect(placeTarget('about', 'cinematic')).toBe('[data-point="sunset"]');
    expect(placeTarget('experience', 'cinematic')).toBe('[data-point="brickell"]');
  });

  it('sends Cinematic-only places to their nearest Read section', () => {
    expect(placeTarget('more-projects', 'read')).toBe('#projects');
    expect(placeTarget('contact', 'read')).toBe('#contact');
  });
});
