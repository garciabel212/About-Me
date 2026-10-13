import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AI_DISCLOSURE } from '@/flight/disclosure';
import { mailto } from '@/data/profile';
import TitleBlock from '../TitleBlock';
import { sites } from '../sites';

const render = (current: number) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <TitleBlock sites={sites} current={current} />
    </MemoryRouter>,
  );

describe('TitleBlock', () => {
  it('shows the current site in fixed fields', () => {
    const out = render(1);
    expect(out).toContain('Brickell');
    expect(out).toContain('Sheet 2 of 6');
    expect(out).toContain(sites[1].job);
    expect(out).toContain(sites[1].status);
  });

  it('always offers Email me and the résumé', () => {
    for (const i of [0, 5]) {
      const out = render(i);
      expect(out).toContain(`class="tb-email" href="${mailto}"`);
      expect(out).toContain('>Email me<');
      expect(out).toContain('class="tb-resume"');
    }
  });

  it('lists every site as a link to its primary anchor, marking the current one', () => {
    const out = render(3);
    for (const s of sites) expect(out).toContain(`href="/#${s.anchors[0]}"`);
    expect(out).toMatch(/aria-current="location"[^>]*>Biscayne Bay/);
  });

  it('keeps the site list collapsed until asked', () => {
    const out = render(0);
    expect(out).toContain('aria-expanded="false"');
    expect(out).toMatch(/<nav[^>]*id="tb-sites"[^>]*hidden/);
  });

  it('carries the AI footage disclosure', () => {
    expect(render(0)).toContain(`<p class="tb-disclosure">${AI_DISCLOSURE}</p>`);
  });
});
