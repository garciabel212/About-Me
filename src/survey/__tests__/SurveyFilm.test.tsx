import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { POSTER_FRAME } from '@/flight/poster';

const desktopWindow = { innerHeight: 900, innerWidth: 1440, matchMedia: () => ({ matches: false }) };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SurveyFilm', () => {
  it('renders a hidden full-bleed film that starts on the poster frame', async () => {
    vi.stubGlobal('window', desktopWindow);
    const { default: SurveyFilm } = await import('../SurveyFilm');
    const out = renderToStaticMarkup(<SurveyFilm motion siteIds={['river']} />);
    expect(out).toContain('class="survey-film" aria-hidden="true"');
    expect(out).toContain('survey-film__canvas');
    expect(out).toContain(`flight/desktop/f${String(POSTER_FRAME).padStart(3, '0')}.webp`);
  });
});
