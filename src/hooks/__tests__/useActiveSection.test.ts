import { describe, expect, it } from 'vitest';
import { activeFrom } from '../useActiveSection';

describe('activeFrom', () => {
  it('picks the section that most recently passed the probe line, whatever order ids are listed in', () => {
    // Order on the page: overview/about (River) at the top, projects (Brickell) below.
    const tops = [
      { id: 'overview', top: -2400 },
      { id: 'projects', top: 120 },
      { id: 'about', top: -2400 },
      { id: 'contact', top: 9000 },
    ] as const;
    expect(activeFrom(tops, 300)).toBe('projects');
  });

  it('prefers the later id when two share a position, so Contact is marked at the closing point', () => {
    // Cinematic: the about and contact anchors sit together at the top of the last point.
    expect(activeFrom([{ id: 'about', top: 40 }, { id: 'contact', top: 40 }], 300)).toBe('contact');
  });

  it('falls back to the first id before anything has passed the line', () => {
    expect(activeFrom([{ id: 'overview', top: 500 }, { id: 'projects', top: 900 }], 300)).toBe('overview');
  });
});
