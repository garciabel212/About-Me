import { describe, it, expect } from 'vitest';
import {
  site, overview, glance, experience, expertise, method, projects, about, education, languages, toolGroups, contact,
} from '@/data/content';

const STATUSES = ['Personal project', 'Working prototype', 'Demo with sample data', 'Deployed tool'];
const words = (s: string) => s.trim().split(/\s+/).length;
const sentences = (s: string) => s.split(/(?<=[.!?])\s+/).filter(Boolean).length;

describe('content', () => {
  it('opens with the agreed overview copy', () => {
    expect(site.name).toBe('Jose Garcia');
    expect(overview.title).toBe('Customer Solutions & Implementation');
    expect(overview.statement).toBe('I help customers understand technical solutions, get systems running, and use them confidently.');
    expect(overview.evidence.join(' · ')).toBe('Customer delivery since 2022 · English & Spanish · South Florida');
    expect([overview.workCta, overview.resumeCta]).toEqual(['View My Work', 'Download Resume']);
  });

  it('gives recruiters four quick facts', () => {
    expect(glance.map((g) => g.label)).toEqual(['Current role', 'Open to', 'Work setup', 'Travel']);
  });

  it('leads with DLSG / Image Access and keeps the official title and dates', () => {
    expect(experience.map((e) => e.id)).toEqual(['dlsg', 'globenet']);
    expect(experience[0]).toMatchObject({ title: 'Service Engineer', period: 'October 2022 – Present', weight: 'primary' });
    expect(experience[0].contributions.map((c) => c.label)).toEqual(['Implementation', 'Customer communication', 'Technical support']);
    expect(experience[1]).toMatchObject({
      title: 'Network Operations Center Engineer', period: 'November 2021 – September 2022', weight: 'supporting',
    });
  });

  it('keeps summaries to two or three short sentences', () => {
    for (const e of experience) expect(sentences(e.summary)).toBeLessThanOrEqual(3);
    for (const p of about.bio) expect(sentences(p)).toBeLessThanOrEqual(3);
  });

  it('has four expertise cards of 20–35 words, each with an evidence link', () => {
    expect(expertise.map((x) => x.title)).toEqual([
      'Understand and demonstrate', 'Implement and configure', 'Train and onboard', 'Troubleshoot and support',
    ]);
    for (const x of expertise) {
      expect(words(x.body), x.id).toBeGreaterThanOrEqual(20);
      expect(words(x.body), x.id).toBeLessThanOrEqual(35);
      expect(x.href).toMatch(/^\/(#|projects\/)/);
    }
  });

  it('shows the working method once, in order', () => {
    expect(method.map((m) => m.step)).toEqual(['Understand', 'Explain', 'Configure', 'Train', 'Follow up']);
    for (const m of method) {
      expect(m.work.length, m.step).toBeGreaterThan(0);
      expect(m.projects.length, m.step).toBeGreaterThan(0);
      for (const p of [...m.work, ...m.projects]) expect(p.href).toMatch(/^\/(#exp-|projects\/)/);
    }
  });

  it('features Service Map Planner first, then AAC and the garage configurator', () => {
    expect(projects.map((p) => p.slug)).toEqual(['service-map-planner', 'aac-communication-app', 'scale-garage-studio']);
    for (const p of projects) {
      expect(STATUSES).toContain(p.status);
      expect(p.href).toBe(`/projects/${p.slug}`);
      expect(p.contribution).toMatch(/AI-assisted/);
      if (p.image?.kind === 'concept') expect(p.image.caption).toMatch(/concept/i);
    }
  });

  it('lists only verified education and the languages', () => {
    expect(education.map((e) => e.name)).toEqual(['B.S. Computer Science & Engineering', 'Certificate in Data Science & Analytics']);
    expect(languages).toBe('English and Spanish, fluent');
    expect(toolGroups.length).toBeGreaterThanOrEqual(3);
  });

  it('has the agreed contact copy and verified details', () => {
    expect(contact.heading).toBe('Let’s talk about your team.');
    expect(contact.email).toBe('garciabel212@gmail.com');
    expect(contact.linkedin).toBe('https://www.linkedin.com/in/jose-abel-garcia/');
  });
});
