import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AI_DISCLOSURE } from '../disclosure';
import { POSTER_FRAME } from '../poster';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AI footage disclosure (LTX-2 license)', () => {
  it('is shown on the landing, with the film', async () => {
    vi.stubGlobal('window', { innerHeight: 900, innerWidth: 1440, matchMedia: () => ({ matches: false }) });
    const { default: FlightLanding } = await import('@/landing/FlightLanding');
    const out = renderToStaticMarkup(
      <MemoryRouter>
        <FlightLanding motion />
      </MemoryRouter>,
    );
    expect(out).toContain(`<p class="landing__disclosure">${AI_DISCLOSURE}</p>`);
  });

  it('preloads the poster frame the film paints first', () => {
    const html = readFileSync('index.html', 'utf8');
    const name = `f${String(POSTER_FRAME).padStart(3, '0')}.webp`;
    expect(html).toContain(`flight/desktop/${name}`);
    expect(html).toContain(`flight/phone/${name}`);
  });
});
