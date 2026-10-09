import { describe, expect, it } from 'vitest';
import { homeSectionLinks } from '@/data/navigation';
import { navLinks, sectionIds } from '@/data/routes';

describe('site navigation', () => {
  it('follows the brief nav: Work, Experience, About, Resume, Contact', () => {
    expect(homeSectionLinks.map((l) => l.href)).toEqual(navLinks.map((l) => `/${l.hash}`));
  });
  it('points every link at a Home section id', () => {
    for (const l of homeSectionLinks) expect(sectionIds).toContain(l.href.replace('/#', ''));
  });
});
