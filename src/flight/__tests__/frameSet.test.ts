import { describe, expect, it } from 'vitest';
import { matteDir, pickSet, SET_QUERIES } from '../frameSet';

describe('pickSet', () => {
  it('uses phone frames below 768px', () => {
    expect(pickSet(375, 3, false)).toBe('phone');
    expect(pickSet(767, 2, true)).toBe('phone');
  });

  it('uses HD on wide screens or dense mid-width screens', () => {
    expect(pickSet(1440, 1, false)).toBe('hd');
    expect(pickSet(1024, 2, false)).toBe('hd');
  });

  it('uses desktop otherwise, and whenever data saver is on', () => {
    expect(pickSet(1280, 1, false)).toBe('desktop');
    expect(pickSet(1024, 1.25, false)).toBe('desktop');
    expect(pickSet(1920, 2, true)).toBe('desktop');
  });

  it('re-picks when any breakpoint changes', () => {
    expect(SET_QUERIES).toEqual(['(max-width: 767px)', '(min-width: 1440px)', '(min-width: 960px) and (min-resolution: 1.5dppx)']);
  });
});

describe('matteDir', () => {
  it('shares the wide mattes between HD and desktop', () => {
    expect(matteDir('hd')).toBe('wide');
    expect(matteDir('desktop')).toBe('wide');
    expect(matteDir('phone')).toBe('phone');
  });
});
