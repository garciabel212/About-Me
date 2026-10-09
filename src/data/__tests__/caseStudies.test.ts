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

  it('answers all eight questions for every study', () => {
    for (const c of caseStudies) {
      for (const key of ['problem', 'who', 'role', 'constraints', 'approach', 'result'] as const) {
        expect(c[key].length, `${c.slug}.${key}`).toBeGreaterThan(30);
      }
      expect(c.inspect.length, `${c.slug}.inspect`).toBeGreaterThan(0);
      expect(c.remaining.length, `${c.slug}.remaining`).toBeGreaterThan(0);
    }
  });

  it('links related studies that exist', () => {
    for (const c of caseStudies) expect(getCaseStudy(c.related)).toBeDefined();
  });

  it('gives every asset alt text, a kind, and a sample-data flag', () => {
    for (const c of caseStudies) {
      for (const a of c.assets) {
        expect(a.alt.length).toBeGreaterThan(10);
        expect(['employer', 'personal', 'demonstration']).toContain(a.kind);
        expect(typeof a.sampleData).toBe('boolean');
      }
    }
  });

  it('never calls a placeholder a real screenshot', () => {
    for (const c of caseStudies) for (const a of c.assets) if (!a.src) expect(a.caption).toMatch(/pending|render|concept/i);
  });
});
