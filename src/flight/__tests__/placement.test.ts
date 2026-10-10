import { describe, expect, it } from 'vitest';
import { anchorTop } from '../timeline';

describe('anchorTop', () => {
  it('maps a reading position to its share of the scrollable track', () => {
    expect(anchorTop(50, 100, 5900, 900)).toBe(2500);
  });
  it('keeps the same share when the track is rebuilt at a new size', () => {
    const before = anchorTop(30, 120, 10900, 900) / (10900 - 900);
    const after = anchorTop(30, 120, 8644, 844) / (8644 - 844);
    expect(after).toBeCloseTo(before);
  });
  it('never returns a negative offset', () => {
    expect(anchorTop(0, 100, 500, 900)).toBe(0);
  });
});
