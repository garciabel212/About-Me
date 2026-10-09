import { describe, it, expect } from 'vitest';
import { sectionIds, navLinks, legacyRoutes } from '@/data/routes';

describe('routes', () => {
  it('nav links point at real section ids', () => {
    expect(navLinks.map((l) => l.label)).toEqual(['Work', 'Experience', 'About', 'Resume', 'Contact']);
    for (const l of navLinks) expect(sectionIds).toContain(l.hash.slice(1));
  });

  it('legacy routes redirect to real sections', () => {
    const paths = legacyRoutes.map((r) => r.from);
    for (const p of ['/about', '/projects', '/experience', '/contact', '/capabilities', '/who-i-am']) {
      expect(paths).toContain(p);
    }
    for (const r of legacyRoutes) expect(sectionIds).toContain(r.hash);
  });

  it('has no duplicate section ids', () => {
    expect(new Set(sectionIds).size).toBe(sectionIds.length);
  });
});
