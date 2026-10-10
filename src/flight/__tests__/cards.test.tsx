import { describe, expect, it } from 'vitest';
import type { JSX } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { availableResumes, contact, featuredWork, hero, site } from '@/data/content';
import { CARD_BODY } from '../cards';
import ApproachCard from '../cards/ApproachCard';

const html = (el: JSX.Element) => renderToStaticMarkup(<MemoryRouter>{el}</MemoryRouter>);
const card = (id: keyof typeof CARD_BODY) => {
  const Body = CARD_BODY[id];
  return html(<Body />);
};

describe('flight cards', () => {
  it('hero shows name, headline, heading and the résumé link', () => {
    const out = card('river');
    expect(out).toContain(site.name);
    expect(out).toContain(site.headline.split(' | ')[0]);
    expect(out).toContain(hero.heading);
    expect(out).toContain('Jose-Garcia-Resume.pdf');
  });
  it('work shows three items and a labeled placeholder where there is no screenshot', () => {
    const out = card('downtown');
    for (const w of featuredWork) expect(out).toContain(w.title);
    const noImage = featuredWork.filter((w) => w.image === '');
    expect((out.match(/data-placeholder="true"/g) ?? []).length).toBe(noImage.length);
    expect(out).not.toMatch(/src=""/);
  });
  it('contact links only résumés that exist', () => {
    const out = card('sunset');
    expect(out).toContain(contact.email);
    expect((out.match(/data-resume=/g) ?? []).length).toBe(availableResumes().length);
  });
  it('the beach card opens on the requested tab', () => {
    expect(html(<ApproachCard initialTab="about" />)).toMatch(/aria-selected="true"[^>]*>About/);
  });
});
