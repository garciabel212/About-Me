import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { flight } from '@/flight/flightData';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('building cut-outs', () => {
  it('shows a stop cut-out only while the painted frame is that stop (within a frame)', async () => {
    vi.stubGlobal('window', { innerHeight: 900, innerWidth: 1440, matchMedia: () => ({ matches: false }) });
    const { heldStop } = await import('../Film');
    expect(heldStop(40, [40, 114])).toBe(0);
    expect(heldStop(115, [40, 114])).toBe(1);
    expect(heldStop(113, [40, 114])).toBe(1);
    expect(heldStop(42, [40, 114])).toBe(-1);
    expect(heldStop(-1, [40, 114])).toBe(-1);
  });

  it('renders one hidden cut-out per stop in its own layer, above the light and below the text', async () => {
    vi.stubGlobal('window', { innerHeight: 900, innerWidth: 1440, matchMedia: () => ({ matches: false }) });
    const { default: Film } = await import('../Film');
    const out = renderToStaticMarkup(<Film motion pointIds={['river']} />);
    expect(out).toContain('<div class="film-occluders" aria-hidden="true">');
    for (const s of flight.stops) expect(out).toContain(`flight/occluders/desktop/${s.id}.webp`);
    expect(out.match(/class="film__occluder"/g)).toHaveLength(flight.stops.length);
    expect(out).not.toContain('data-on');
  });
});

describe('cut-out layering', () => {
  it('stacks film < light < cut-outs < points', async () => {
    const { readFileSync } = await import('node:fs');
    const css = readFileSync('src/landing/landing.css', 'utf8');
    const z = (sel: string) => {
      const rule = css.split(/\r?\n/).find((l) => l.startsWith(`${sel} {`)) ?? '';
      return Number(/z-index: (\d+)/.exec(rule)?.[1]);
    };
    expect(z('.film')).toBeLessThan(z('.light-path'));
    expect(z('.light-path')).toBeLessThan(z('.film-occluders'));
    expect(z('.film-occluders')).toBeLessThan(3); // .point sits at z-index 3
  });
});
