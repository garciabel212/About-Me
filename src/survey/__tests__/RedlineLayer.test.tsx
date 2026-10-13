import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import RedlineLayer, { inkFor } from '../RedlineLayer';
import { sites } from '../sites';

const desktop = { w: 1440, h: 900, phone: false };
const phone = { w: 390, h: 844, phone: true };

describe('inkFor', () => {
  it('rings each job on job sites and the site landmark elsewhere', () => {
    expect(inkFor(sites[2]).map((m) => m.id)).toEqual(['job-miniature-garage', 'job-aac-communication-app', 'job-agent-trading-os']);
    expect(inkFor(sites[0]).map((m) => m.id)).toEqual(['river']);
  });
});

describe('RedlineLayer', () => {
  it('is decorative to assistive tech', () => {
    const out = renderToStaticMarkup(<RedlineLayer site={sites[0]} index={0} anchors={{}} vp={desktop} ready={false} />);
    expect(out).toMatch(/^<svg class="redline" aria-hidden="true"/);
  });

  it('draws a ring per mark and a leader only where a note anchor exists', () => {
    const out = renderToStaticMarkup(
      <RedlineLayer site={sites[2]} index={2} anchors={{ 'job-miniature-garage': { x: 500, y: 400 } }} vp={desktop} ready />,
    );
    expect(out).toContain('class="redline is-ready"');
    expect(out.match(/ink--ring/g)).toHaveLength(3);
    expect(out.match(/ink--leader/g)).toHaveLength(1);
  });

  it('gives each mark its own slice of the draw', () => {
    const out = renderToStaticMarkup(<RedlineLayer site={sites[2]} index={2} anchors={{}} vp={desktop} ready />);
    const froms = [...out.matchAll(/ink--ring"[^>]*--from:([\d.]+)/g)].map((m) => Number(m[1]));
    expect(froms).toHaveLength(3);
    expect(froms[0]).toBeLessThan(froms[1]);
    expect(froms[1]).toBeLessThan(froms[2]);
  });

  it('points an edge arrow at landmarks the phone crop hides', () => {
    const out = renderToStaticMarkup(<RedlineLayer site={sites[2]} index={2} anchors={{}} vp={phone} ready />);
    expect(out.match(/ink--arrow/g)).toHaveLength(2);
    expect(out.match(/ink--ring/g)).toHaveLength(1);
  });

  it('keeps phone edge arrows in the upper third, clear of the notes', () => {
    const out = renderToStaticMarkup(<RedlineLayer site={sites[2]} index={2} anchors={{}} vp={phone} ready />);
    const ys = [...out.matchAll(/class="ink ink--arrow"[^>]* d="M[\d.]+ ([\d.]+)/g)].map((m) => Number(m[1]));
    expect(ys).toHaveLength(2);
    for (const y of ys) expect(y).toBeLessThanOrEqual(phone.h * 0.34 + 0.1); // paths are written to 0.1px
  });

  it('checks off each punch item that has an anchor', () => {
    const out = renderToStaticMarkup(
      <RedlineLayer site={sites[3]} index={3} anchors={{ 'punch-1': { x: 60, y: 300 }, 'punch-2': { x: 60, y: 340 } }} vp={desktop} ready />,
    );
    expect(out.match(/ink--check/g)).toHaveLength(2);
  });
});
