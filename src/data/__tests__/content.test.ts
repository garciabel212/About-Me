import { describe, it, expect } from 'vitest';
import {
  site, hero, evidenceStrip, capabilities, experience, approach, tools,
  education, languages, bio, resumeVersions, availableResumes, contact, featuredWork,
} from '@/data/content';

const STATUSES = ['Personal project', 'Working prototype', 'Demo with sample data', 'Deployed tool'];

describe('content', () => {
  it('uses the brief headline and page title', () => {
    expect(site.headline).toBe('Customer Solutions | Implementation | Technical Consulting');
    expect(site.title).toBe('Jose Garcia | Customer Solutions and Implementation');
  });

  it('has an intro and four detail items', () => {
    expect(hero.heading).toBe('Helping customers understand, implement, and use technology.');
    expect(hero.details).toEqual([
      'South Florida',
      'English and Spanish',
      'Open to remote and South Florida opportunities',
      'Available for up to 40% travel',
    ]);
    expect(evidenceStrip).toHaveLength(3);
  });

  it('has five capabilities that each link somewhere', () => {
    expect(capabilities).toHaveLength(5);
    for (const c of capabilities) {
      expect(c.body.length).toBeGreaterThan(40);
      expect(c.href).toMatch(/^(#|\/)/);
    }
  });

  it('keeps the official title and two roles', () => {
    expect(experience.map((e) => e.id)).toEqual(['dlsg', 'globenet']);
    expect(experience[0].title).toBe('Service Engineer');
    expect(experience[0].bullets).toHaveLength(5);
  });

  it('has five approach steps, at least one tied to an example', () => {
    expect(approach).toHaveLength(5);
    expect(approach.some((s) => s.example.length > 0)).toBe(true);
  });

  it('gives every tool a plain example', () => {
    for (const t of [...tools.professional, ...tools.project]) {
      expect(t.name.length).toBeGreaterThan(0);
      expect(t.example.length).toBeGreaterThan(10);
    }
  });

  it('keeps the verified credentials and languages', () => {
    const names = education.map((e) => e.name);
    expect(names).toContain('B.S. Computer Science & Engineering');
    expect(names).toContain('AWS Certified Cloud Practitioner');
    expect(languages).toBe('English and Spanish, fluent');
  });

  it('has a two-paragraph bio', () => {
    expect(bio).toHaveLength(2);
  });

  it('lists only resumes that have a file', () => {
    const list = availableResumes();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].id).toBe('master');
    for (const r of list) expect(r.file).toMatch(/^[\w-]+\.pdf$/);
    expect(resumeVersions.length).toBe(4);
  });

  it('has the contact details from the brief', () => {
    expect(contact.heading).toBe('Let us talk about your team');
    expect(contact.email).toBe('garciabel212@gmail.com');
    expect(contact.linkedin).toBe('https://www.linkedin.com/in/jose-abel-garcia/');
  });

  it('features exactly three work items with valid statuses', () => {
    expect(featuredWork.map((w) => w.slug)).toEqual([
      'service-map-planner',
      'aac-communication-app',
      'scale-garage-studio',
    ]);
    for (const w of featuredWork) {
      expect(STATUSES).toContain(w.status);
      expect(w.updated).toMatch(/^[A-Z][a-z]+ 20\d\d$/);
      expect(w.href).toBe(`/projects/${w.slug}`);
      expect(typeof w.imageIsConcept).toBe('boolean');
      if (!w.imageIsConcept) expect(w.image).not.toBe('');
    }
  });
});
