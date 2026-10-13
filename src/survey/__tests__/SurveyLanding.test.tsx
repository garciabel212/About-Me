import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AI_DISCLOSURE } from '@/flight/disclosure';

const desktopWindow = { innerHeight: 900, innerWidth: 1440, matchMedia: () => ({ matches: false }) };

afterEach(() => {
  vi.unstubAllGlobals();
});

async function render(motion: boolean) {
  vi.stubGlobal('window', desktopWindow);
  const { default: SurveyLanding } = await import('../SurveyLanding');
  return renderToStaticMarkup(
    <MemoryRouter>
      <SurveyLanding motion={motion} />
    </MemoryRouter>,
  );
}

describe('SurveyLanding', () => {
  it('lays out film, ink, title block, and six sites with gaps between them', async () => {
    const out = await render(true);
    expect(out).toContain('class="survey"');
    expect(out).toContain('survey-film');
    expect(out).toContain('class="redline"');
    expect(out).toContain('class="title-block"');
    expect(out.match(/data-site="/g)).toHaveLength(6);
    expect(out.match(/class="survey__gap"/g)).toHaveLength(5);
  });

  it('marks still mode for motion off', async () => {
    expect(await render(false)).toContain('class="survey survey--still"');
  });

  it('shows the AI disclosure with the film', async () => {
    expect(await render(true)).toContain(AI_DISCLOSURE);
  });

  it('has exactly one h1', async () => {
    expect((await render(true)).match(/<h1/g)).toHaveLength(1);
  });
});
