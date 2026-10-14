import { describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import PointSection from '../Point';
import { points } from '../points';

const render = (node: ReactNode) => renderToStaticMarkup(<MemoryRouter>{node}</MemoryRouter>);
const all = points.map((p) => render(<PointSection point={p} />));

describe('PointSection', () => {
  it('renders every point as a focusable, labelled section with its anchors and one light node', () => {
    points.forEach((p, i) => {
      const out = all[i];
      expect(out).toMatch(new RegExp(`<section class="point point--${p.placement}" data-point="${p.id}" tabindex="-1" aria-labelledby="point-${p.id}-title">`));
      for (const a of p.anchors) expect(out).toContain(`<span class="point__anchor" id="${a}"></span>`);
      expect(out.match(/data-node="true"/g)).toHaveLength(1);
    });
  });

  it('makes the intro name the only h1, with contact actions on the first screen', () => {
    expect(all.join('').match(/<h1/g)).toHaveLength(1);
    expect(all[0]).toMatch(/<h1 id="point-river-title" class="point__name">Jose Garcia<\/h1>/);
    expect(all[0]).toContain('>Email me<');
    expect(all[0]).toContain('>Résumé<');
    expect(all[0]).not.toContain('point__label');
  });

  it('labels numbered points like the reference', () => {
    expect(all[1]).toContain('<p class="point__label"><span>01 /</span> Experience</p>');
    expect(all[1]).toContain('Technology. People. Results.');
  });

  it('shows each role in full, with the résumé details on demand', () => {
    expect(all[1]).toContain('Digital Library Systems Group / Image Access');
    expect(all[1]).toContain('October 2022 to Present');
    expect(all[1].match(/<details/g)).toHaveLength(2);
    expect(all[1]).toContain('Full responsibilities from my résumé');
  });

  it('shows the five method steps with proof, and the tool groups', () => {
    expect(all[2].match(/class="method__step"/g)).toHaveLength(5);
    expect(all[2].match(/class="tools__group"/g)).toHaveLength(4);
  });

  it('shows real screenshots with alt text and fixed dimensions, lazily loaded', () => {
    const imgs = [...all[3].matchAll(/<img [^>]*>/g), ...all[4].matchAll(/<img [^>]*>/g)].map((m) => m[0]);
    expect(imgs).toHaveLength(2);
    for (const img of imgs) {
      expect(img).toMatch(/alt="[^"]{20,}"/);
      expect(img).toContain('width="800"');
      expect(img).toContain('height="500"');
      expect(img).toContain('loading="lazy"');
    }
  });

  it('links every project to its case study', () => {
    expect(all[3]).toContain('href="/projects/service-map-planner"');
    expect(all[3]).toContain('href="/projects/aac-communication-app"');
    expect(all[4]).toContain('href="/projects/scale-garage-studio"');
    expect(all[4]).toContain('href="/lab"');
  });

  it('closes with the bio, portrait, and every contact route', () => {
    expect(all[5]).toContain('jose-portrait-320.webp');
    for (const s of ['>Email me<', 'linkedin.com', 'github.com', '>Résumé<']) expect(all[5]).toContain(s);
  });
});
