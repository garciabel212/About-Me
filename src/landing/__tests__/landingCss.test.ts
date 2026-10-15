import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('landing.css', () => {
  it('never styles the theme classes on <html> (.light / .dark), which once shrank the whole page to 1200px', () => {
    const css = readFileSync('src/landing/landing.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css).not.toMatch(/(^|[\s,}>~+(])\.(light|dark)(?![\w-])/m);
  });
});
