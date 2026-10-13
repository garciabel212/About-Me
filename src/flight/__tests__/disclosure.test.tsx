import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import TitleBlock from '@/survey/TitleBlock';
import { sites } from '@/survey/sites';
import { AI_DISCLOSURE } from '../disclosure';
import { POSTER_FRAME } from '../poster';

describe('AI footage disclosure (LTX-2 license)', () => {
  it('is shown in the survey title block, with the film', () => {
    const out = renderToStaticMarkup(
      <MemoryRouter>
        <TitleBlock sites={sites} current={0} />
      </MemoryRouter>,
    );
    expect(out).toContain(`<p class="tb-disclosure">${AI_DISCLOSURE}</p>`);
  });

  it('preloads the poster frame the film paints first', () => {
    const html = readFileSync('index.html', 'utf8');
    const name = `f${String(POSTER_FRAME).padStart(3, '0')}.webp`;
    expect(html).toContain(`flight/desktop/${name}`);
    expect(html).toContain(`flight/phone/${name}`);
  });
});
