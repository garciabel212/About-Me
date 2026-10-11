import { describe, expect, it } from 'vitest';
import { homeSectionLinks } from '@/data/navigation';
import { sectionIds } from '@/data/routes';

describe('site navigation', () => {
  it('links every Home section, in page order', () => {
    expect(homeSectionLinks.map((l) => l.href)).toEqual(sectionIds.map((id) => `/#${id}`));
  });

  it('keeps the Miami stop names as secondary labels', () => {
    expect(homeSectionLinks.map((l) => l.place)).toEqual(['River', 'Brickell', 'Downtown', 'The Bay', 'The Beach', 'Sunset']);
  });
});
