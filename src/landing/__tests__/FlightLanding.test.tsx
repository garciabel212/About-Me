import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AI_DISCLOSURE } from '@/flight/disclosure';

afterEach(() => {
  vi.unstubAllGlobals();
});

async function render(motion: boolean) {
  vi.stubGlobal('window', { innerHeight: 900, innerWidth: 1440, matchMedia: () => ({ matches: false }) });
  const { default: FlightLanding } = await import('../FlightLanding');
  return renderToStaticMarkup(
    <MemoryRouter>
      <FlightLanding motion={motion} />
    </MemoryRouter>,
  );
}

describe('FlightLanding', () => {
  it('lays out the film, the light, and six points with gaps where the camera flies', async () => {
    const out = await render(true);
    expect(out).toContain('<div class="landing">');
    expect(out).toContain('class="film"');
    expect(out).toContain('class="light-path"');
    expect(out.match(/data-point="/g)).toHaveLength(6);
    expect(out.match(/class="landing__gap"/g)).toHaveLength(5);
  });

  it('marks still mode when motion is off', async () => {
    expect(await render(false)).toContain('<div class="landing landing--still">');
  });

  it('always shows the AI disclosure with the film', async () => {
    expect(await render(true)).toContain(`<p class="landing__disclosure">${AI_DISCLOSURE}</p>`);
  });

  it('draws nothing on the film but the light: no rings, ink, or title block', async () => {
    const out = await render(true);
    for (const gone of ['redline', 'ink--', 'title-block', 'tb-']) expect(out).not.toContain(gone);
  });
});
