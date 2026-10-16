import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { POSTER_FRAME } from '@/flight/poster';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Film', () => {
  it('renders a hidden full-bleed film that starts on the poster frame', async () => {
    vi.stubGlobal('window', { innerHeight: 900, innerWidth: 1440, matchMedia: () => ({ matches: false }) });
    const { default: Film } = await import('../Film');
    const out = renderToStaticMarkup(<Film motion pointIds={['river']} />);
    expect(out).toContain('<div class="film" aria-hidden="true">');
    expect(out).toContain('class="film__canvas"');
    expect(out).toContain(`flight/desktop/f${String(POSTER_FRAME).padStart(3, '0')}.webp`);
  });
});
