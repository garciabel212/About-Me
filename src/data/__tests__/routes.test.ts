import { describe, it, expect } from 'vitest';
import { sectionIds, homeSections, hashAliases, legacyRoutes } from '@/data/routes';

describe('routes', () => {
  it('orders Home as Overview, Experience, Expertise, Projects, About, Contact', () => {
    expect(homeSections.map((s) => s.label)).toEqual(['Overview', 'Experience', 'Expertise', 'Projects', 'About', 'Contact']);
  });

  it('gives each section its own flight stop', () => {
    expect(new Set(homeSections.map((s) => s.stop)).size).toBe(homeSections.length);
  });

  it('legacy routes and old hashes lead to real sections', () => {
    const paths = legacyRoutes.map((r) => r.from);
    for (const p of ['/about', '/projects', '/experience', '/contact', '/capabilities', '/who-i-am']) {
      expect(paths).toContain(p);
    }
    for (const r of legacyRoutes) expect(sectionIds).toContain(r.hash);
    for (const id of Object.values(hashAliases)) expect(sectionIds).toContain(id);
    expect(Object.keys(hashAliases)).toEqual(expect.arrayContaining(['intro', 'capabilities', 'who-i-am', 'resume']));
  });

  it('has no duplicate section ids', () => {
    expect(new Set(sectionIds).size).toBe(sectionIds.length);
  });
});
