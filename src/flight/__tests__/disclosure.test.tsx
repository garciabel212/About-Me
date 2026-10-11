import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AI_DISCLOSURE } from '../disclosure';
import { POSTER_FRAME } from '../poster';

// FlightBackdrop reads media queries on first render; give it a desktop window.
const desktopWindow = { innerHeight: 900, innerWidth: 1440, matchMedia: () => ({ matches: false }) };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AI footage disclosure (LTX-2 license)', () => {
  it('is drawn on the Cinematic film, beside the footage it labels', async () => {
    vi.stubGlobal('window', desktopWindow);
    const { default: FlightBackdrop } = await import('../FlightBackdrop');
    const out = renderToStaticMarkup(<FlightBackdrop motion />);
    expect(out).toContain('cine-canvas');
    expect(out).toContain(`<p class="cine-disclosure">${AI_DISCLOSURE}</p>`);
  });

  it('preloads the poster frame the film paints first', () => {
    const html = readFileSync('index.html', 'utf8');
    const name = `f${String(POSTER_FRAME).padStart(3, '0')}.webp`;
    expect(html).toContain(`flight/desktop/${name}`);
    expect(html).toContain(`flight/phone/${name}`);
  });
});
