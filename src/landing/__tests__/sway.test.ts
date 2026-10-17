import { describe, expect, it } from 'vitest';
import { FILM_SELECTOR, SWAY, swayStep, swayTarget } from '../sway';

describe('swayTarget', () => {
  it('maps the pointer to -1..1 around the screen centre', () => {
    expect(swayTarget(720, 450, 1440, 900)).toEqual({ x: 0, y: 0 });
    expect(swayTarget(1440, 0, 1440, 900)).toEqual({ x: 1, y: -1 });
  });
});

describe('swayStep', () => {
  it('eases toward the target instead of jumping (no jitter)', () => {
    const next = swayStep({ x: 0, y: 0 }, { x: 1, y: 0 });
    expect(next.x).toBeGreaterThan(0);
    expect(next.x).toBeLessThan(0.2);
  });

  it('keeps the film moving opposite the text, by a few pixels at most', () => {
    expect(SWAY.film.x).toBeLessThan(0);
    expect(SWAY.text.x).toBeGreaterThan(0);
    expect(Math.abs(SWAY.film.x)).toBeLessThanOrEqual(16);
  });
});

describe('sway layers', () => {
  it('moves the building layer with the film, so buildings never slide off the light', () => {
    expect(FILM_SELECTOR).toBe('.film__canvas, .film__poster, .film__front');
  });
});
