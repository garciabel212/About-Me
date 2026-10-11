import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { POSTER_FRAME } from '../poster';
import { AI_DISCLOSURE } from '../stops';

// FlightHome reads the viewport on first render; give it a desktop window so it renders the flight, not the page.
const desktopWindow = { innerHeight: 900, matchMedia: () => ({ matches: false }) };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AI footage disclosure (LTX-2 license)', () => {
  it('is in the flight HUD, beside "Read as a page"', async () => {
    vi.stubGlobal('window', desktopWindow);
    const { default: FlightHome } = await import('../FlightHome');
    const out = renderToStaticMarkup(<MemoryRouter><FlightHome /></MemoryRouter>);
    expect(out).toContain('fl-canvas');
    const hud = out.slice(out.indexOf('<footer class="fl-hud-bottom">'));
    expect(hud).toMatch(new RegExp(`^<footer class="fl-hud-bottom"><p class="fl-disclosure">${AI_DISCLOSURE}</p><a [^>]*>Read as a page</a>`));
  });

  it('is a visible caption on the static page, with or without the flight', async () => {
    const { default: StaticFlight } = await import('../StaticFlight');
    for (const canFly of [true, false]) {
      const out = renderToStaticMarkup(<MemoryRouter><StaticFlight canFly={canFly} /></MemoryRouter>);
      expect(out).toContain(`<p class="fl-disclosure">${AI_DISCLOSURE}</p>`);
    }
  });

  it('preloads the poster frame the flight paints first', () => {
    const html = readFileSync('index.html', 'utf8');
    const name = `f${String(POSTER_FRAME).padStart(3, '0')}.webp`;
    expect(html).toContain(`flight/desktop/${name}`);
    expect(html).toContain(`flight/phone/${name}`);
  });
});
