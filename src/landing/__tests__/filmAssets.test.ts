import { describe, expect, it } from 'vitest';
import { flight } from '@/flight/flightData';
import { frameUrl, matteUrl, pairFront, srcSize } from '../filmAssets';

describe('film asset urls', () => {
  it('streams each set from its own folder', () => {
    expect(frameUrl('/', 'hd', 40)).toBe('/flight/hd/f040.webp');
    expect(frameUrl('/', 'desktop', 412)).toBe('/flight/desktop/f412.webp');
    expect(frameUrl('/', 'phone', 7)).toBe('/flight/phone/f007.webp');
  });

  it('pairs HD and desktop with the wide mattes, phone with its own crops', () => {
    expect(matteUrl('/', 'hd', 40)).toBe('/flight/matte/wide/f040.webp');
    expect(matteUrl('/', 'desktop', 40)).toBe('/flight/matte/wide/f040.webp');
    expect(matteUrl('/', 'phone', 40)).toBe('/flight/matte/phone/f040.webp');
  });

  it('still mode draws the stop frame with its own matte', () => {
    const stop = flight.stops[0].frame;
    expect(matteUrl('/', 'desktop', stop)).toBe(`/flight/matte/wide/f${String(stop).padStart(3, '0')}.webp`);
  });

  it('knows each set’s frame size', () => {
    expect(srcSize('hd')).toEqual({ w: 1920, h: 1056 });
    expect(srcSize('desktop')).toEqual({ w: 1280, h: 704 });
    expect(srcSize('phone')).toEqual({ w: 420, h: 704 });
  });
});

describe('pairFront', () => {
  it('pairs matte by painted index, never a neighbour', () => {
    const loaded = new Map([[40, 'm40']]);
    const store = { get: (i: number) => loaded.get(i) };
    expect(pairFront(40, store)).toBe('m40');
    expect(pairFront(41, store)).toBeUndefined();
  });
});
