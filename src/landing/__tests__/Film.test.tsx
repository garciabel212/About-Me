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

  it('renders the building layer as one canvas above the light, with no per-stop cut-outs', async () => {
    vi.stubGlobal('window', { innerHeight: 900, innerWidth: 1440, matchMedia: () => ({ matches: false }) });
    const { default: Film } = await import('../Film');
    const out = renderToStaticMarkup(<Film motion pointIds={['river']} />);
    expect(out).toContain('<div class="film-front" aria-hidden="true"><canvas class="film__front"></canvas></div>');
    expect(out).not.toContain('film__occluder');
  });
});

describe('film layering', () => {
  it('stacks film < light < buildings < points', async () => {
    const { readFileSync } = await import('node:fs');
    const css = readFileSync('src/landing/landing.css', 'utf8');
    const z = (sel: string) => {
      const rule = css.split(/\r?\n/).find((l) => l.startsWith(`${sel} {`)) ?? '';
      return Number(/z-index: (\d+)/.exec(rule)?.[1]);
    };
    expect(z('.film')).toBeLessThan(z('.light-path'));
    expect(z('.light-path')).toBeLessThan(z('.film-front'));
    expect(z('.film-front')).toBeLessThan(3); // .point sits at z-index 3
  });
});
