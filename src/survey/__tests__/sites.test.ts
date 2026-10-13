import { describe, expect, it } from 'vitest';
import { flight } from '@/flight/flightData';
import { contact, overview, projects } from '@/data/content';
import { plain, sites, type Site } from '../sites';

/** Every visible string a site carries. */
function strings(s: Site): string[] {
  const out = [s.label, s.job, s.status, s.heading];
  const b = s.body;
  if (b.kind === 'intro') out.push(b.name, b.role, b.statement, b.next);
  if (b.kind === 'jobs') b.jobs.forEach((j) => out.push(j.title, j.outcome, j.method, j.status));
  if (b.kind === 'punch') b.items.forEach((i) => out.push(i.step, i.line));
  if (b.kind === 'log') b.entries.forEach((e) => out.push(e.name, e.line, e.period));
  if (b.kind === 'handover') out.push(b.heading, b.body);
  return out;
}

describe('sites', () => {
  it('follows the flight stops in order', () => {
    expect(sites.map((s) => s.id)).toEqual(flight.stops.map((s) => s.id));
  });

  it('keeps every existing deep link, each exactly once', () => {
    const ids = sites.flatMap((s) => s.anchors);
    for (const id of ['overview', 'about', 'projects', 'more-projects', 'expertise', 'experience', 'exp-dlsg', 'exp-globenet', 'contact']) {
      expect(ids.filter((x) => x === id)).toHaveLength(1);
    }
  });

  it('puts every mark inside the frame', () => {
    const marks = sites.flatMap((s) => (s.body.kind === 'jobs' ? s.body.jobs.map((j) => j.mark) : [s.mark]));
    for (const m of marks) {
      expect(m.x).toBeGreaterThan(0);
      expect(m.x).toBeLessThan(1);
      expect(m.y).toBeGreaterThan(0);
      expect(m.y).toBeLessThan(1);
      expect(m.r).toBeGreaterThan(0);
      expect(m.r).toBeLessThan(0.2);
    }
  });

  it('fills every title block field', () => {
    for (const s of sites) {
      expect(s.label.length).toBeGreaterThan(0);
      expect(s.job.length).toBeGreaterThan(0);
      expect(s.status.length).toBeGreaterThan(0);
    }
  });

  it('takes its copy from content.ts', () => {
    const river = sites[0].body;
    expect(river.kind === 'intro' && river.statement).toBe(overview.statement);
    const handover = sites[5].body;
    expect(handover.kind === 'handover' && handover.body).toBe(contact.body);
    const featured = sites[1].body;
    expect(featured.kind === 'jobs' && featured.jobs[0].method).toBe(projects[0].contribution);
  });

  it('shows the three Downtown jobs left to right as they stand in the frame', () => {
    const b = sites[2].body;
    if (b.kind !== 'jobs') throw new Error('Downtown must list jobs');
    expect(b.jobs.map((j) => j.title)).toEqual(['AAC communication app', 'Miniature Garage Configurator', 'Agent Trading OS']);
    const xs = b.jobs.map((j) => j.mark.x);
    expect([...xs].sort((a, c) => a - c)).toEqual(xs);
  });

  it('uses no em or en dashes anywhere', () => {
    for (const s of sites) for (const text of strings(s)) expect(text).not.toMatch(/[—–]/);
  });

  it('turns dash ranges into words', () => {
    expect(plain('October 2022 – Present')).toBe('October 2022 to Present');
    expect(plain('A — B')).toBe('A to B');
  });
});
