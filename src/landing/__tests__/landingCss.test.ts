import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('landing.css', () => {
  it('never styles the theme classes on <html> (.light / .dark), which once shrank the whole page to 1200px', () => {
    const css = readFileSync('src/landing/landing.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css).not.toMatch(/(^|[\s,}>~+(])\.(light|dark)(?![\w-])/m);
  });
});

describe('landing class names', () => {
  it('are not also styled by the global stylesheets (Read mode once restyled .method and .facts here)', () => {
    const strip = (f: string) => readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const classes = (css: string) => new Set([...css.matchAll(/\.([a-z][\w-]*)/gi)].map((m) => m[1]));
    const landing = classes(strip('src/landing/landing.css'));
    const global = classes(['src/styles/site.css', 'src/styles/evidence.css', 'src/index.css'].map(strip).join('\n'));
    // Shared on purpose: the site-wide screen-reader helper.
    const shared = [...landing].filter((c) => global.has(c) && c !== 'sr-only');
    expect(shared).toEqual([]);
  });

  it('drifts a label with its headline, never toward it, by less than the gap below the headline', () => {
    const css = readFileSync('src/landing/landing.css', 'utf8');
    expect(css).not.toContain('depth-far');
    expect(css).toMatch(/:is\(\.point__headline, \.point__name, \.point__label\) \{ animation: depth-near/);
    const drift = Number(/@keyframes depth-near \{ from \{ translate: 0 (\d+)px/.exec(css)?.[1]);
    const gap = Number(/\.point \.point__headline \{ margin: 0 0 (\d+)px/.exec(css)?.[1]);
    expect(drift).toBeLessThan(gap);
  });
});
