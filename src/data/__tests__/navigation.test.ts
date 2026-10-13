import { describe, expect, it } from 'vitest';
import { cinematicSectionLinks, homeSectionLinks } from '@/data/navigation';
import { sectionIds } from '@/data/routes';

describe('site navigation', () => {
  it('links every Home section, in page order', () => {
    expect(homeSectionLinks.map((l) => l.href)).toEqual(sectionIds.map((id) => `/#${id}`));
  });

  it('keeps the Miami stop names as secondary labels', () => {
    expect(homeSectionLinks.map((l) => l.place)).toEqual(['River', 'Brickell', 'Downtown', 'The Bay', 'The Beach', 'Sunset Harbour']);
  });
});

describe('Cinematic navigation', () => {
  it('follows the survey sheets in route order, with About folded into the River', () => {
    expect(cinematicSectionLinks.map((l) => l.id)).toEqual(['overview', 'projects', 'expertise', 'experience', 'contact']);
    expect(cinematicSectionLinks.map((l) => l.href)).toEqual(['/#overview', '/#projects', '/#expertise', '/#experience', '/#contact']);
  });
});
