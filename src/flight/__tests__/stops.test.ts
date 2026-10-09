import { describe, expect, it } from 'vitest';
import { sectionIds } from '@/data/routes';
import { STOP_SECTIONS, stopForSection } from '../stops';

describe('stops and Home sections', () => {
  it('gives every Home section id exactly one stop', () => {
    const all = Object.values(STOP_SECTIONS).flat();
    expect([...all].sort()).toEqual([...sectionIds].sort());
  });
  it('follows the brief order through the flight', () => {
    expect(Object.values(STOP_SECTIONS).flat()).toEqual([...sectionIds]);
  });
  it('finds the stop for a hash, and nothing for an unknown one', () => {
    expect(stopForSection('about')).toBe('beach');
    expect(stopForSection('who-i-am')).toBe('beach');
    expect(stopForSection('projects')).toBe('downtown');
    expect(stopForSection('nope')).toBeNull();
  });
});
