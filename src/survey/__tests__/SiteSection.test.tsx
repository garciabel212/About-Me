import { describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import SiteSection, { JobNote } from '../SiteSection';
import { sites, type Job } from '../sites';

const render = (node: ReactNode) => renderToStaticMarkup(<MemoryRouter>{node}</MemoryRouter>);
const job = (i: number, j = 0): Job => {
  const b = sites[i].body;
  if (b.kind !== 'jobs') throw new Error('not a job site');
  return b.jobs[j];
};

describe('SiteSection', () => {
  it('renders every site as a labelled section with its hash anchors', () => {
    for (const s of sites) {
      const out = render(<SiteSection site={s} />);
      expect(out).toContain(`data-site="${s.id}"`);
      expect(out).toContain(`aria-labelledby="site-${s.id}-title"`);
      for (const a of s.anchors) expect(out).toContain(`<span class="site__anchor" id="${a}"></span>`);
    }
  });

  it('opens the River with the name as the page heading', () => {
    const out = render(<SiteSection site={sites[0]} />);
    expect(out).toMatch(/<h1 id="site-river-title"[^>]*>Jose Garcia<\/h1>/);
    expect(out).toContain('data-anchor="river"');
  });

  it('marks every job note as a leader anchor', () => {
    const out = render(<SiteSection site={sites[2]} />);
    for (let j = 0; j < 3; j += 1) expect(out).toContain(`data-anchor="${job(2, j).id}"`);
  });

  it('anchors punch checks on the left of each step', () => {
    const out = render(<SiteSection site={sites[3]} />);
    expect(out.match(/data-anchor-side="left"/g)).toHaveLength(5);
  });

  it('signs off the handover with every contact route', () => {
    const out = render(<SiteSection site={sites[5]} />);
    expect(out).toContain('Signed off');
    expect(out).toContain('>Email me<');
    expect(out).toContain('linkedin.com');
    expect(out).toContain('github.com');
  });
});

describe('JobNote', () => {
  it('leads with the outcome and keeps the method behind the flip', () => {
    const out = render(<JobNote job={job(1)} />);
    expect(out).toContain('aria-expanded="false"');
    expect(out).toContain('How it was built');
    expect(out).toMatch(/<p class="note__method" hidden="">/);
  });

  it('shows the method when flipped', () => {
    const out = render(<JobNote job={job(1)} initiallyFlipped />);
    expect(out).toContain('aria-expanded="true"');
    expect(out).toContain('What it does');
    expect(out).toMatch(/<p class="note__outcome" hidden="">/);
  });

  it('links to the case study', () => {
    expect(render(<JobNote job={job(1)} />)).toContain('href="/projects/service-map-planner"');
  });
});
