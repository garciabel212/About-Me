import { describe, expect, it } from 'vitest';
import { resumeScroll } from '../resumeScroll';

// Mobile flight: pinned 0–2110px. Desktop flight: pinned 0–3600px.
const mobile = { start: 0, end: 2110 };
const desktop = { start: 0, end: 3600 };

describe('resumeScroll', () => {
  it('keeps a reader below the flight the same distance past its end', () => {
    expect(resumeScroll({ y: 2700, ...mobile }, desktop)).toBe(4190);
    expect(resumeScroll({ y: 4200, ...desktop }, mobile)).toBe(2710);
  });

  it('keeps a reader inside the flight at the same progress', () => {
    expect(resumeScroll({ y: 1055, ...mobile }, desktop)).toBe(1800);
  });

  it('leaves a reader above the flight where they are', () => {
    expect(resumeScroll({ y: 40, start: 100, end: 2210 }, { start: 100, end: 3700 })).toBe(40);
  });

  it('handles a zero-length previous range', () => {
    expect(resumeScroll({ y: 0, start: 0, end: 0 }, desktop)).toBe(0);
  });
});
