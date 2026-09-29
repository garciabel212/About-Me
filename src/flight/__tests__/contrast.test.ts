/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrastRatio, hexToRgb, worstVeilContrast } from '../contrast';
import { VEIL_ALPHA } from '../veil';

const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

function token(theme: 'light' | 'dark', name: string): string {
  const start = css.indexOf(`[data-theme="${theme}"] {`);
  const block = css.slice(start, css.indexOf('}', start));
  const match = block.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`));
  if (start === -1 || !match) throw new Error(`token --${name} not found for ${theme}`);
  return match[1];
}

describe('contrast math', () => {
  it('matches known WCAG values', () => {
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21);
    expect(contrastRatio(hexToRgb('#777777'), [255, 255, 255])).toBeCloseTo(4.48, 1);
  });
});

describe.each(['light', 'dark'] as const)('flight veil in %s theme', (theme) => {
  const bg = hexToRgb(token(theme, 'bg'));
  it.each(['text-primary', 'text-secondary'])('%s meets WCAG AA over any footage', (name) => {
    expect(worstVeilContrast(hexToRgb(token(theme, name)), bg, VEIL_ALPHA)).toBeGreaterThanOrEqual(4.5);
  });
});
