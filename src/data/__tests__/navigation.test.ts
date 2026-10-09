/// <reference types="node" />
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { homeSectionLinks } from '../navigation';

const scenesDir = fileURLToPath(new URL('../../components/scenes/', import.meta.url));
const sectionIds = new Set(
  readdirSync(scenesDir).flatMap((file) =>
    [...readFileSync(scenesDir + file, 'utf8').matchAll(/\bid="([a-z-]+)"/g)].map((m) => m[1]),
  ),
);

describe('links to Home sections', () => {
  it.each(homeSectionLinks)('$label points at a section that exists on Home', ({ href }) => {
    expect(sectionIds).toContain(href.replace('/#', ''));
  });
});
