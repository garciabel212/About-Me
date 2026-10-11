import { describe, it, expect } from 'vitest';
import { caseStudies, getCaseStudy } from '@/data/caseStudies';

describe('case studies', () => {
  it('covers the three featured projects and the Lab', () => {
    expect(caseStudies.map((c) => c.slug)).toEqual([
      'service-map-planner',
      'aac-communication-app',
      'scale-garage-studio',
      'agent-trading-os',
    ]);
  });

  it('fills every part of the shared structure', () => {
    for (const c of caseStudies) {
      for (const key of ['summary', 'role', 'users', 'problem', 'result'] as const) {
        expect(c[key].length, `${c.slug}.${key}`).toBeGreaterThan(20);
      }
      expect(c.decisions.length, `${c.slug}.decisions`).toBeGreaterThan(1);
      expect(c.next.length, `${c.slug}.next`).toBeGreaterThan(0);
    }
  });

  it('states AI-assisted development in every role', () => {
    for (const c of caseStudies) expect(c.role).toMatch(/AI-assisted/);
  });

  it('links related studies that exist', () => {
    for (const c of caseStudies) expect(getCaseStudy(c.related)).toBeDefined();
  });

  it('gives every image alt text and never passes a concept or placeholder off as a screenshot', () => {
    for (const c of caseStudies) {
      for (const a of [c.hero, ...c.evidence]) {
        expect(a.alt.length).toBeGreaterThan(10);
        if (a.kind === 'concept') expect(a.caption).toMatch(/concept/i);
        if (!a.src && a.kind !== 'diagram') expect(a.caption).toMatch(/pending/i);
      }
    }
  });
});
