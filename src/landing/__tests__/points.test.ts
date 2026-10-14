import { describe, expect, it } from 'vitest';
import { flight } from '@/flight/flightData';
import { about, contact, experience, overview } from '@/data/content';
import { plain, points, type Point } from '../points';

function strings(p: Point): string[] {
  const out = [p.label, p.headline];
  const b = p.body;
  if (b.kind === 'intro') out.push(b.name, b.role, b.statement, ...b.facts.flatMap((f) => [f.label, f.value]));
  if (b.kind === 'experience') b.roles.forEach((r) => out.push(r.organization, r.title, r.period, r.location, r.summary, ...r.details, ...r.contributions.flatMap((c) => [c.label, c.text])));
  if (b.kind === 'expertise') {
    b.steps.forEach((s) => out.push(s.step, ...[...s.work, ...s.projects].flatMap((p) => [p.source, p.text])));
    b.groups.forEach((g) => out.push(g.name, ...g.items));
  }
  if (b.kind === 'work') b.items.forEach((w) => out.push(w.title, w.focus, w.problem, w.contribution, w.status, w.statusNote, w.linkLabel, ...(w.steps ?? []), ...(w.image ? [w.image.alt, w.image.caption] : [])));
  if (b.kind === 'connect') out.push(...b.bio, b.portrait.alt, b.languages, b.body, ...b.details, ...b.education.flatMap((e) => [e.name, e.issuer]));
  return out;
}

describe('points', () => {
  it('follows the flight stops in order', () => {
    expect(points.map((p) => p.id)).toEqual(flight.stops.map((s) => s.id));
  });

  it('zig-zags like the reference: name top right, then left, center, right, left, bottom left', () => {
    expect(points.map((p) => p.placement)).toEqual(['top-right', 'left', 'center', 'right', 'left', 'bottom-left']);
  });

  it('numbers every point after the intro', () => {
    expect(points.map((p) => p.number)).toEqual([null, '01', '02', '03', '04', '05']);
  });

  it('keeps every existing deep link, each exactly once', () => {
    const ids = points.flatMap((p) => p.anchors);
    for (const id of ['overview', 'about', 'projects', 'more-projects', 'expertise', 'experience', 'exp-dlsg', 'exp-globenet', 'contact']) {
      expect(ids.filter((x) => x === id)).toHaveLength(1);
    }
  });

  it('carries the full detail from content.ts', () => {
    const intro = points[0].body;
    expect(intro.kind === 'intro' && intro.statement).toBe(overview.statement);
    const exp = points[1].body;
    if (exp.kind !== 'experience') throw new Error('01 must be experience');
    expect(exp.roles.map((r) => r.organization)).toEqual(experience.map((e) => e.organization));
    expect(exp.roles[0].contributions).toHaveLength(3);
    expect(exp.roles[0].details.length).toBeGreaterThan(3);
    const connect = points[5].body;
    if (connect.kind !== 'connect') throw new Error('05 must be connect');
    expect(connect.bio).toEqual(about.bio);
    expect(connect.body).toBe(contact.body);
  });

  it('shows the work with real screenshots only where they exist', () => {
    const work = points.flatMap((p) => (p.body.kind === 'work' ? p.body.items : []));
    expect(work.map((w) => w.title)).toEqual(['Service Map Planner', 'AAC communication app', 'Miniature Garage Configurator', 'Agent Trading OS']);
    expect(work.map((w) => w.image?.src ?? null)).toEqual([null, 'images/projects/aac-yes-no-800.webp', 'images/projects/garage-configurator-800.webp', null]);
    for (const w of work) if (w.image) expect(w.image).toMatchObject({ width: 800, height: 500 });
    expect(work[0].steps).toEqual(['Customer site', 'Installed systems', 'Maintenance status', 'Visit plan']);
  });

  it('uses the reference headlines', () => {
    expect(points.slice(1).map((p) => p.headline)).toEqual([
      'Technology. People. Results.',
      'Understand. Implement. Support.',
      'Built for real needs.',
      'Built to learn by doing.',
      'Let’s make technology work for people.',
    ]);
  });

  it('uses no em or en dashes anywhere', () => {
    for (const p of points) for (const text of strings(p)) expect(text).not.toMatch(/[—–]/);
  });

  it('turns dash ranges into words', () => {
    expect(plain('October 2022 – Present')).toBe('October 2022 to Present');
  });
});
