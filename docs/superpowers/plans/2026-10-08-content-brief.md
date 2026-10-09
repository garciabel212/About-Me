# Content Brief → Portfolio Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition the About-Me portfolio to "Customer Solutions | Implementation | Technical Consulting" using the copy, structure, and evidence rules in `Jose_Garcia_Website_Content_Brief.docx`, with every public claim backed by the project repos.

**Architecture:** All prose moves into typed data in `src/data/content.ts` (+ `caseStudies.ts`, `routes.ts`). The existing 7-scene Home keeps its look; scenes become thin renderers of that data and are reordered to the brief's order. A vitest "claims guard" greps the source for retired claims, with a shrinking `PENDING` allowlist so each task proves its own cleanup. Case-study pages share one layout driven by `caseStudies.ts`.

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind 3, GSAP/ScrollTrigger + Lenis, framer-motion, react-router (HashRouter, base `/About-Me/`), oxlint, **vitest (added in Task 1)**.

**Spec:** `docs/superpowers/specs/2026-10-08-content-brief-design.md` (claims register + repo evidence live there; read it first).

## Global Constraints

- Base branch is `origin/main` (b91496e or newer). Never commit to `main`; one branch per PR; squash-merge. **Do not merge a PR without Jose's OK — merging to `main` deploys the live site via GitHub Actions.**
- Commit trailer: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Git identity: `-c user.name="Jose Abel Garcia" -c user.email="garciabel212@gmail.com"` if the local identity is not already that.
- Public headline exactly: `Customer Solutions | Implementation | Technical Consulting`. Employment title stays `Service Engineer`.
- Location copy is `South Florida` everywhere except the DLSG/GlobeNet employment lines (`Boca Raton, Florida`, copied from the brief).
- Degree wording exactly: `B.S. Computer Science & Engineering, Florida Atlantic University`.
- Page title exactly `Jose Garcia | Customer Solutions and Implementation`; meta description exactly the brief's sentence (Task 8).
- Contact: `garciabel212@gmail.com`, LinkedIn `https://www.linkedin.com/in/jose-abel-garcia/`, "up to 40% travel".
- Retired claims must not appear (enforced by the claims guard): 99.999, Offline PWA/Ready, AA Compliant, 200+, scales other than 1:18, STL/slicer export, route optimization, "daily operations", client retention, ticket rates, RFP scoring, "Computer Engineering", "Sales Engineer" as a title, and `100+` outside `content.ts`.
- Kept claims (Jose confirmed 2026-10-08): AWS Certified Cloud Practitioner is held and current; "100+ institutional accounts" is true but its **scope is unconfirmed** — it appears only once, in `content.ts` experience, worded as `Supported 100+ institutional accounts` (see Task 2).
- No fabricated screenshots. Missing assets render a labeled placeholder (`AssetFrame`). Service Map Planner images must use fictional data only.
- Essential text (name, headline, intro, resume link) must be visible with animation disabled. Reduced-motion must still work.
- No new runtime dependencies. Dev dependency allowed: `vitest` only.
- Verify with `npm run lint`, `npm test`, `npm run build` before every commit that touches `src/`.

## Review Focus

1. Old links keep working: `#/about`, `#/projects`, `#/experience`, `#/contact`, `#/projects/enterprise-deployment`, `#/projects/service-map-planner`, `#/projects/scale-garage-studio` must land somewhere sensible (Task 8 test `legacyRoutes` → real section ids; Task 15 redirects).
2. A role-resume entry with no PDF yet must not render a dead download link (Task 2 test `availableResumes`).
3. A retired claim re-entering via copy/paste (Task 4 claims guard).
4. Reordered pinned GSAP scenes mis-measure and overlap (Task 6: `ScrollTrigger.refresh` check at 1440×900 and 375×812).
5. Hash nav (`/#projects` etc.) points at ids that actually exist — the old nav used `#work`/`#about` ids that did not (Task 8 test).

---

## File Structure

| File | Responsibility |
|---|---|
| `src/data/content.ts` (new) | All brief copy: site meta, hero, evidence strip, capabilities, experience, approach, tools, education, bio, resume versions, contact, featured work |
| `src/data/caseStudies.ts` (new) | 8-question case-study content for 3 studies + Lab |
| `src/data/routes.ts` (new) | `sectionIds`, `navLinks`, `legacyRoutes` |
| `src/data/profile.ts` (modify) | Contact + resume file only |
| `src/data/__tests__/*.test.ts` (new) | content shape, routes, claims guard |
| `src/components/SectionLink.tsx` (new) | `#hash` → Lenis scroll, `/path` → router Link |
| `src/components/AssetFrame.tsx` (new) | Image with alt/caption/kind, or labeled placeholder |
| `src/components/CaseStudyPage.tsx` (new) | Shared layout for case studies |
| `src/components/scenes/Scene01Hero.tsx` … `Scene07Contact.tsx` (modify) | Render from data; `SceneAbout.tsx`, `SceneResume.tsx` new; `Scene06Philosophy.tsx` deleted |
| `src/pages/projects/*.tsx`, `src/pages/Lab.tsx` | Thin wrappers around `CaseStudyPage` |
| `scripts/make-og.mjs` (new) | Generates `public/images/og-preview.png` from the portrait |

---

## PR 1 — Spec (already committed locally)

### Task 0: Push the spec as a docs PR

**Files:** none (git only)

- [ ] **Step 1:** In `C:\Users\abel\Documents\Code\About-Me-content` on branch `docs/content-brief-spec`, add this plan to the same PR:

```bash
git add docs/superpowers/plans/2026-10-08-content-brief.md
git commit -m "docs: add implementation plan for the content brief

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
git push -u origin docs/content-brief-spec
gh pr create --base main --title "docs: content brief spec and plan" --body "Spec and implementation plan for applying the content brief. No code changes.

🤖 Generated with [Claude Code](https://claude.ai/claude-code)"
```

- [ ] **Step 2:** Ask Jose to merge (or approve merging) this PR. Later PRs branch from the updated `origin/main`: `git fetch origin && git switch -c <type>/<name> origin/main`.

---

## PR 2 — `refactor/content-data-layer`

Start: `git fetch origin && git switch -c refactor/content-data-layer origin/main`, then `npm ci`.

### Task 1: Test tooling

**Files:** Modify `package.json`, `vite.config.ts`; Create `src/data/__tests__/smoke.test.ts`

**Produces:** `npm test` runs vitest over `src/**/*.test.ts`.

- [ ] **Step 1:** Check vitest supports Vite 8, then install:

```bash
npm info vitest@latest peerDependencies
npm install -D vitest@latest
```
Expected: peer range includes `vite` 8. If it does not, install the newest vitest whose range does (`npm info vitest versions`), or stop and tell Jose.

- [ ] **Step 2:** Replace `vite.config.ts` with:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/About-Me/' : '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
```

- [ ] **Step 3:** Add `"test": "vitest run"` to `package.json` scripts.
- [ ] **Step 4:** Write `src/data/__tests__/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('tooling', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```
- [ ] **Step 5:** `npm test` → PASS. `npm run build` → success (confirms `tsc -b` accepts the test file; if it errors about `vitest`, add `"types": ["vite/client"]` is already there — fix by importing from `'vitest'` explicitly, as above).
- [ ] **Step 6:** Commit `chore: add vitest` (files: `package.json`, `package-lock.json`, `vite.config.ts`, the smoke test).

### Task 2: Content data (`content.ts`)

**Files:** Create `src/data/content.ts`, `src/data/__tests__/content.test.ts`

**Produces:** the exports below (names are used by every later task).

- [ ] **Step 1: Write the failing test** `src/data/__tests__/content.test.ts`:

```ts
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
```

- [ ] **Step 2:** `npm test` → FAIL (module not found).
- [ ] **Step 3:** Create `src/data/content.ts`:

```ts
// Single source of truth for public copy. Source: Jose_Garcia_Website_Content_Brief.docx
// (2026-10-08). Claims here must be ones Jose can back up; see docs/superpowers/specs.

export type WorkStatus =
  | 'Personal project'
  | 'Working prototype'
  | 'Demo with sample data'
  | 'Deployed tool';

export const site = {
  name: 'Jose Garcia',
  headline: 'Customer Solutions | Implementation | Technical Consulting',
  title: 'Jose Garcia | Customer Solutions and Implementation',
  description:
    'Jose Garcia helps customers implement, understand, and support technical systems. Explore his experience, project case studies, and resume.',
} as const;

export const hero = {
  heading: 'Helping customers understand, implement, and use technology.',
  intro:
    'I work with customers to understand their needs, explain technical options, and get software and integrated systems working in their environment. My experience includes product demonstrations, implementation, training, troubleshooting, and ongoing support.',
  details: [
    'South Florida',
    'English and Spanish',
    'Open to remote and South Florida opportunities',
    'Available for up to 40% travel',
  ],
  availability: 'Open to opportunities in implementation and customer solutions.',
  workCta: 'View My Work',
  resumeCta: 'Download Resume',
  emailCta: 'Email Me',
} as const;

export const evidenceStrip = [
  'Customer delivery since 2022',
  'Previous network operations experience',
  'Fluent in English and Spanish',
] as const;

export interface Capability {
  id: string;
  title: string;
  body: string;
  /** Experience section (`#experience`) or a case study route. */
  href: string;
  linkLabel: string;
}

export const capabilities: Capability[] = [
  {
    id: 'requirements',
    title: 'Understand the requirements',
    body: 'I work with customers and their IT teams to understand the workflow, environment, and requirements before recommending a configuration.',
    href: '#experience',
    linkLabel: 'See my experience',
  },
  {
    id: 'demonstrate',
    title: 'See how the solution works',
    body: 'I support product demonstrations and technical conversations that help customers understand what a solution can do and how it fits their work.',
    href: '#experience',
    linkLabel: 'See my experience',
  },
  {
    id: 'implement',
    title: 'Get the system running',
    body: 'I coordinate installation, application configuration, licensing, validation, and go-live support for software and integrated systems.',
    href: '#experience',
    linkLabel: 'See my experience',
  },
  {
    id: 'train',
    title: 'Use the product confidently',
    body: 'I guide users and administrators through the workflows they need, explain technical concepts clearly, and stay involved after deployment.',
    href: '/projects/aac-communication-app',
    linkLabel: 'See how I design for users',
  },
  {
    id: 'troubleshoot',
    title: 'Resolve technical problems',
    body: 'I investigate application, Windows, network, and hardware communication issues, document findings, and coordinate the next steps with the right teams.',
    href: '/projects/service-map-planner',
    linkLabel: 'See how I track service history',
  },
];

export interface ExperienceEntry {
  id: 'dlsg' | 'globenet';
  title: string;
  organization: string;
  period: string;
  location: string;
  summary: string;
  bullets: string[];
  context?: string;
}

export const experience: ExperienceEntry[] = [
  {
    id: 'dlsg',
    title: 'Service Engineer',
    organization: 'Digital Library Systems Group / Image Access',
    period: 'October 2022 to Present',
    location: 'Boca Raton, Florida',
    summary:
      'I help institutional customers implement and support workflow and document-management systems. My work includes understanding requirements, configuring software and connected equipment, training users, and resolving technical issues. I also support Account Executives with product demonstrations and technical presentations.',
    bullets: [
      'Lead onsite and remote implementations, including installation, configuration, validation, go-live, and continued support.',
      'Work with customer IT, procurement, and operations teams to assess workflows and technical requirements.',
      'Manage application versions, licensing, activation, customer settings, and software upgrades in Windows environments.',
      'Deliver onboarding and training, diagnose issues, and coordinate escalations with engineering, support, and customer IT.',
      'Support demonstrations and customer meetings; document activities, findings, and service history in Salesforce CRM.',
    ],
    context:
      'Product context: enterprise workflow and document-management applications, book scanning and self-service systems, and network-connected hardware. Supported 100+ institutional accounts.',
  },
  {
    id: 'globenet',
    title: 'Network Operations Center Engineer',
    organization: 'Globenet',
    period: 'November 2021 to September 2022',
    location: 'Boca Raton, Florida',
    summary:
      'I monitored enterprise networks, investigated connectivity incidents, and supported service restoration through troubleshooting, root-cause analysis, and technical escalation. The role strengthened how I document issues and coordinate work during service incidents.',
    bullets: [],
  },
];

export type ResponsibilityName =
  | 'Customer Communication'
  | 'Technical Problem Solving'
  | 'Software'
  | 'Networking'
  | 'Hardware'
  | 'Implementation'
  | 'Training'
  | 'Solution Demonstrations'
  | 'Post-Sale Support';

export interface ApproachStep {
  step: string;
  name: string;
  subtitle: string;
  description: string;
  responsibilities: ResponsibilityName[];
  covers: string[];
  /** Real example from the experience section. */
  example: string;
}

export const approach: ApproachStep[] = [
  {
    step: '01',
    name: 'UNDERSTAND',
    subtitle: 'Understand the workflow',
    description:
      'I start by understanding what the customer is trying to accomplish and the environment they are working in.',
    responsibilities: ['Customer Communication', 'Technical Problem Solving'],
    covers: ['What the customer needs to accomplish', 'Their IT environment and constraints', 'Requirements agreed before configuration'],
    example: 'At DLSG / Image Access: working with customer IT, procurement, and operations teams to assess workflows and technical requirements.',
  },
  {
    step: '02',
    name: 'EXPLAIN',
    subtitle: 'Explain the options',
    description: 'I explain the options, make the requirements clear, and help coordinate implementation.',
    responsibilities: ['Solution Demonstrations', 'Customer Communication'],
    covers: ['Plain-language options and trade-offs', 'Demonstrations that fit the customer’s work', 'A clear plan for who does what'],
    example: 'At DLSG / Image Access: supporting Account Executives with product demonstrations and technical presentations.',
  },
  {
    step: '03',
    name: 'CONFIGURE',
    subtitle: 'Configure and validate',
    description: 'I validate the setup so the system works in the customer’s environment before it goes live.',
    responsibilities: ['Implementation', 'Software', 'Hardware', 'Networking'],
    covers: ['Installation, configuration, and licensing', 'Validation in the customer’s environment', 'Go-live support'],
    example: 'At DLSG / Image Access: leading onsite and remote implementations in Windows environments, from installation to go-live.',
  },
  {
    step: '04',
    name: 'TRAIN',
    subtitle: 'Train and hand over',
    description: 'I train the people using it and hand over what they need to work confidently.',
    responsibilities: ['Training', 'Customer Communication'],
    covers: ['Onboarding for users and administrators', 'The workflows each person needs', 'Documentation of what was set up'],
    example: 'At DLSG / Image Access: onboarding and training for users and administrators.',
  },
  {
    step: '05',
    name: 'FOLLOW UP',
    subtitle: 'Follow up and support',
    description: 'I follow through when questions or issues come up after deployment.',
    responsibilities: ['Post-Sale Support', 'Technical Problem Solving'],
    covers: ['Troubleshooting and escalation', 'Service history kept in Salesforce CRM', 'Continued customer contact'],
    example: 'At DLSG / Image Access: diagnosing issues and coordinating escalations with engineering, support, and customer IT.',
  },
];

export interface ToolItem {
  name: string;
  example: string;
}

export const tools = {
  professional: [
    { name: 'Windows applications', example: 'Managing versions, licensing, activation, and upgrades at customer sites.' },
    { name: 'Networking and connectivity', example: 'Troubleshooting connections between applications and network-attached hardware.' },
    { name: 'Integrated hardware and software', example: 'Installing and validating scanners and the software that drives them.' },
    { name: 'Salesforce CRM', example: 'Recording customer activity, findings, and service history.' },
    { name: 'Onboarding, demonstrations, and training', example: 'Walking users and administrators through the workflows they need.' },
    { name: 'Remote diagnostics and escalation', example: 'Coordinating with customer IT, support, and engineering to resolve issues.' },
  ] satisfies ToolItem[],
  project: [
    { name: 'Next.js and Firebase', example: 'Service Map Planner: customer records, maintenance views, and visit planning.' },
    { name: 'React and TypeScript', example: 'The bilingual communication app and this portfolio.' },
    { name: 'React Three Fiber and Drei', example: 'The miniature garage configurator’s 3D preview.' },
    { name: 'AI-assisted prototyping', example: 'Experimental agent workflows in the Lab, with scope stated on the page.' },
  ] satisfies ToolItem[],
};

export interface EducationItem {
  name: string;
  issuer: string;
  detail?: string;
}

export const education: EducationItem[] = [
  { name: 'B.S. Computer Science & Engineering', issuer: 'Florida Atlantic University' },
  { name: 'Certificate in Data Science & Analytics', issuer: 'Florida Atlantic University', detail: '2022' },
  { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', detail: '2022' },
];

export const languages = 'English and Spanish, fluent';

export const bio = [
  'I am a customer-facing technical professional based in South Florida. My background combines a degree in Computer Science & Engineering, network operations experience, and hands-on work implementing and supporting customer systems. I enjoy understanding how people work, explaining technical options, and staying involved until the solution is working for them.',
  'Outside my day-to-day work, I build practical tools and explore 3D design and fabrication. Those projects give me another way to test ideas, learn new tools, and improve how people interact with technology. I am fluent in English and Spanish.',
] as const;

export interface ResumeVersion {
  id: 'master' | 'implementation' | 'solutions' | 'accounts';
  label: string;
  /** File under public/, or null until the PDF exists. */
  file: string | null;
  updated: string;
}

export const resumeVersions: ResumeVersion[] = [
  { id: 'master', label: 'Master resume', file: 'Jose-Garcia-Resume.pdf', updated: 'October 2026' },
  { id: 'implementation', label: 'Implementation and Professional Services', file: null, updated: 'October 2026' },
  { id: 'solutions', label: 'Solutions Engineering and Consulting', file: null, updated: 'October 2026' },
  { id: 'accounts', label: 'Technical Accounts and Customer Success', file: null, updated: 'October 2026' },
];

export function availableResumes(): (ResumeVersion & { file: string })[] {
  return resumeVersions.filter((r): r is ResumeVersion & { file: string } => r.file !== null);
}

export const contact = {
  heading: 'Let us talk about your team',
  body: 'I am interested in customer-facing roles where I can help people evaluate technology, implement it successfully, and get more value from the tools they use. My focus includes implementation, solutions consulting, solutions engineering, and technical account support.',
  email: 'garciabel212@gmail.com',
  linkedin: 'https://www.linkedin.com/in/jose-abel-garcia/',
  details: ['South Florida', 'English and Spanish', 'Available for up to 40% travel'],
} as const;

export interface FeaturedWork {
  slug: 'service-map-planner' | 'aac-communication-app' | 'scale-garage-studio';
  title: string;
  subtitle: string;
  status: WorkStatus;
  updated: string;
  summary: string;
  contribution: string;
  technologies: string[];
  href: string;
  /** Path under public/images; imageIsConcept=true means a render/concept, not a real screenshot. */
  image: string;
  imageIsConcept: boolean;
}

export const featuredWork: FeaturedWork[] = [
  {
    slug: 'service-map-planner',
    title: 'Service Map Planner',
    subtitle: 'Organizing customer records and service planning',
    status: 'Working prototype',
    updated: 'October 2026',
    summary:
      'I designed Service Map Planner to bring customer sites, equipment, software, maintenance status, and service history into one place. The project connects those records with map-based visit planning to support service preparation and customer follow-up.',
    contribution: 'Defined the records, relationships, interface, maintenance views, and visit-planning workflow.',
    technologies: ['Next.js', 'Firebase'],
    href: '/projects/service-map-planner',
    image: 'images/service-map-preview.webp',
    imageIsConcept: true, // existing preview; replace with fictional-data screenshots
  },
  {
    slug: 'aac-communication-app',
    title: 'AAC communication app',
    subtitle: 'Simple bilingual communication for a touch screen',
    status: 'Working prototype',
    updated: 'October 2026',
    summary:
      'I am developing a bilingual communication app focused on large touch targets and simple choices. It includes Yes/No and choice-based screens, with Spanish and English presentation options.',
    contribution: 'Turned a real user’s limits into interface decisions: fixed target positions, large buttons, fewer taps.',
    technologies: ['React', 'TypeScript', 'Android (Capacitor)'],
    href: '/projects/aac-communication-app',
    image: '',
    imageIsConcept: true, // no screenshot yet; consumers must render a labeled placeholder
  },
  {
    slug: 'scale-garage-studio',
    title: 'Miniature Garage Configurator',
    subtitle: 'Exploring custom designs before fabrication',
    status: 'Working prototype',
    updated: 'October 2026',
    summary:
      'I am developing a 3D configurator for miniature model-car garages. It brings layout and component choices into a visual workflow so a design can be discussed and refined before printing and assembly.',
    contribution: 'Designed the configuration model and the 3D preview, focused on the 1:18 scale.',
    technologies: ['React Three Fiber', 'Drei'],
    href: '/projects/scale-garage-studio',
    image: 'images/hero_garage_diorama.jpg',
    imageIsConcept: true, // render, not a screenshot
  },
];
```

- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit `refactor: add typed content data from the brief` (files: `content.ts`, `content.test.ts`).

> **Note for Jose's review (do not skip):** Task 2 encodes defaults you have not individually confirmed: SMP/AAC/garage status = "Working prototype", "Supported 100+ institutional accounts", certificate year 2022, "Updated October 2026". The PR description must list these for sign-off.

### Task 3: Profile + routes data

**Files:** Modify `src/data/profile.ts`; Create `src/data/routes.ts`, `src/data/__tests__/routes.test.ts`

**Produces:** `sectionIds`, `navLinks`, `legacyRoutes`; `profile` loses `focus` and `credentials`.

- [ ] **Step 1: Failing test** `src/data/__tests__/routes.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { sectionIds, navLinks, legacyRoutes } from '@/data/routes';

describe('routes', () => {
  it('nav links point at real section ids', () => {
    expect(navLinks.map((l) => l.label)).toEqual(['Work', 'Experience', 'About', 'Resume', 'Contact']);
    for (const l of navLinks) expect(sectionIds).toContain(l.hash.slice(1));
  });

  it('legacy routes redirect to real sections', () => {
    const paths = legacyRoutes.map((r) => r.from);
    for (const p of ['/about', '/projects', '/experience', '/contact', '/capabilities', '/who-i-am']) {
      expect(paths).toContain(p);
    }
    for (const r of legacyRoutes) expect(sectionIds).toContain(r.hash);
  });
});
```
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Create `src/data/routes.ts`:

```ts
/** Section ids on the Home page, in page order (brief order). */
export const sectionIds = [
  'intro',
  'capabilities',
  'projects',
  'experience',
  'who-i-am',
  'about',
  'resume',
  'contact',
] as const;

export const navLinks = [
  { label: 'Work', hash: '#projects' },
  { label: 'Experience', hash: '#experience' },
  { label: 'About', hash: '#about' },
  { label: 'Resume', hash: '#resume' },
  { label: 'Contact', hash: '#contact' },
] as const;

/** Old URLs that must keep working: path → Home section. */
export const legacyRoutes = [
  { from: '/intro', hash: 'intro' },
  { from: '/who-i-am', hash: 'who-i-am' },
  { from: '/work', hash: 'projects' },
  { from: '/workflow', hash: 'who-i-am' },
  { from: '/capabilities', hash: 'capabilities' },
  { from: '/about', hash: 'about' },
  { from: '/projects', hash: 'projects' },
  { from: '/experience', hash: 'experience' },
  { from: '/contact', hash: 'contact' },
] as const;
```
- [ ] **Step 4:** Replace `src/data/profile.ts` with:

```ts
/**
 * Contact details and the résumé file. Facts mirror the master résumé; change
 * them there first, then here. Public copy lives in content.ts.
 */
export const profile = {
  title: 'Service Engineer',
  headline: 'Customer Solutions | Implementation | Technical Consulting',
  email: 'garciabel212@gmail.com',
  linkedin: 'https://www.linkedin.com/in/jose-abel-garcia/',
  resumeFile: 'Jose-Garcia-Resume.pdf',
} as const;

export const mailto = `mailto:${profile.email}`;

/** Résumé URL that respects Vite's base path (GitHub Pages serves under /About-Me/). */
export const resumeUrl = `${import.meta.env.BASE_URL}${profile.resumeFile}`;
```
- [ ] **Step 5:** `npx tsc -b` — it will report every use of `profile.focus` and `credentials` (Scene01Hero, Scene07Contact, possibly CTA/Navbar). In this task only, make the minimal fix `profile.focus` → `profile.headline`, and in `Scene01Hero.tsx` delete the `credentials` import and render nothing for that `<ul>` (Task 5 rewrites it). Re-run until clean.
- [ ] **Step 6:** `npm test && npm run lint && npm run build` → all green. Commit `refactor: add routes data and trim profile`.

### Task 4: Claims guard + scrub shared strings

**Files:** Create `src/data/__tests__/claims.test.ts`; Modify `src/components/GarageVisual.tsx`, `src/components/Navbar.tsx`, `src/components/Footer.tsx`

**Interfaces:** `PENDING` is a list of paths still to be rewritten; each later task deletes its entries.

- [ ] **Step 1: Write the guard** `src/data/__tests__/claims.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

const sources = import.meta.glob('/src/**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const html = import.meta.glob('/index.html', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const all: Record<string, string> = { ...sources, ...html };

/** Files that still hold retired claims. Each task removes the files it rewrites. */
const PENDING: string[] = [
  '/index.html',
  '/src/data/experience.ts',
  '/src/data/projects.ts',
  '/src/components/scenes/Scene01Hero.tsx',
  '/src/components/scenes/Scene03Experience.tsx',
  '/src/components/scenes/Scene04ProjectUniverse.tsx',
  '/src/components/scenes/Scene05Capabilities.tsx',
  '/src/components/scenes/Scene06Philosophy.tsx',
  '/src/components/scenes/Scene07Contact.tsx',
  '/src/pages/Contact.tsx',
  '/src/pages/Experience.tsx',
  '/src/pages/Projects.tsx',
  '/src/pages/projects/EnterpriseDeployment.tsx',
  '/src/pages/projects/ScaleGarageStudio.tsx',
  '/src/pages/projects/ServiceMapPlanner.tsx',
];

interface Rule {
  name: string;
  pattern: RegExp;
  allowIn?: string[];
}

const CONTENT = '/src/data/content.ts';
const rules: Rule[] = [
  { name: '99.999% SLA', pattern: /99\.999/ },
  { name: 'offline claim', pattern: /offline (pwa|ready|-first)|sin conexi[oó]n|offline-first/i },
  { name: 'AA compliance claim', pattern: /AA[ -]?compliant|contraste accesible AA/i },
  { name: '200+ assets', pattern: /\b200\+/ },
  { name: 'scales other than 1:18', pattern: /1:(10|24|43|64)\b/ },
  { name: 'STL / slicer export', pattern: /STL (export|geometry)|direct STL|slicing export|slicer/i },
  { name: 'route optimization', pattern: /route optimi[sz]|optimi[sz]ed (dispatch|service routes)|GIS routing/i },
  { name: 'daily operations', pattern: /daily operations|active daily|daily use|in active/i },
  { name: 'retention / ticket / RFP claims', pattern: /client retention|ticket rates|rfp technical scoring|admin certification/i },
  { name: 'Computer Engineering degree', pattern: /computer engineering/i },
  { name: 'Sales Engineer title', pattern: /sales engineer(ing)?\b/i, allowIn: [CONTENT] },
  { name: '100+ accounts', pattern: /100\+/, allowIn: [CONTENT] },
  { name: 'Boca Raton', pattern: /boca raton/i, allowIn: [CONTENT] },
];

describe('claims guard', () => {
  for (const rule of rules) {
    it(`no "${rule.name}" outside allowed files`, () => {
      const hits: string[] = [];
      for (const [path, text] of Object.entries(all)) {
        if (path.includes('__tests__')) continue;
        if (PENDING.includes(path)) continue;
        if (rule.allowIn?.includes(path)) continue;
        if (rule.pattern.test(text)) hits.push(path);
      }
      expect(hits).toEqual([]);
    });
  }

  it('every pending file still exists (remove entries when you rewrite a file)', () => {
    for (const p of PENDING) expect(Object.keys(all)).toContain(p);
  });
});
```
- [ ] **Step 2:** `npm test` → expect FAIL listing files outside `PENDING` (known: `/src/components/GarageVisual.tsx` for 200+/1:10/1:24, `/src/components/Navbar.tsx` and `/src/components/Footer.tsx` for Boca Raton; plus any others it reveals — e.g. `ServiceMapArchitecture`, `ArchitectureDiagram`, `ExperienceTimeline`, `ProjectCard`, `ProjectPreview`, `CTA`).
- [ ] **Step 3:** Fix each reported file with these exact replacements (inspect each hit with Grep first):
  - `GarageVisual.tsx:71` `1:10 &amp; 1:24 DIORAMA STUDIO` → `1:18 GARAGE CONFIGURATOR`; `:255` `Modular Wall System &middot; 200+ Assets` → `Modular wall system &middot; Render`; `:263` `<strong…>SCALES:</strong> 1:10 &middot; 1:24` → `<strong…>SCALE:</strong> 1:18`. Add the visible text `Concept render` to the component's header so the visual is labeled as a render.
  - `Navbar.tsx` `BOCA RATON, FL` → `SOUTH FLORIDA`.
  - `Footer.tsx` `Solutions Engineer &middot; Enterprise Software Solutions` → `{profile.headline}` (import `profile` is already there); `Boca Raton, FL &middot; B.S. Computer Science &amp; Engineering, FAU` → `South Florida &middot; B.S. Computer Science &amp; Engineering, FAU`.
  - A component the guard flags that is only used by a page being deleted in Task 8 (`ExperienceTimeline`, `ProjectCard`, `ProjectPreview`, `ServiceMapArchitecture`, `ArchitectureDiagram`): add it to `PENDING` with a trailing comment `// deleted in Task 8/15`, do not scrub it.
  - Any other hit: replace the claim with the neutral wording from the spec's claims register, never a new claim.
- [ ] **Step 4:** `npm test && npm run lint && npm run build` → green.
- [ ] **Step 5:** Commit `refactor: add claims guard and scrub shared strings`.
- [ ] **Step 6:** `git push -u origin refactor/content-data-layer` and open the PR (title `refactor: content data layer and claims guard`; body lists the unconfirmed defaults from the Task 2 note). Ask Jose to review/merge.

---

> **HOLD (2026-10-09):** The flight session proposes replacing the Home scenes with the scroll-driven flight, which would render this same data (`content.ts`). PRs 3–4 (Scene rewrites) are **on hold until Jose decides**. If the flight wins, keep from PR 3 only Task 8 (nav labels, legacy redirects, SEO, OG image) and from PR 4 only Task 12's data/section-independent parts; the flight renders hero, capabilities, work, experience, approach, tools/education/bio, résumé, and contact from `content.ts`. PR 2 and PR 5 are needed either way.

## PR 3 — `feat/home-hero-work-nav`

Start from updated `origin/main`: `git fetch origin && git switch -c feat/home-hero-work-nav origin/main`.

### Task 5: Hero

**Files:** Modify `src/components/scenes/Scene01Hero.tsx` (hero content block, lines ~242-312); `src/data/__tests__/claims.test.ts`

- [ ] **Step 1:** Remove `'/src/components/scenes/Scene01Hero.tsx'` from `PENDING`. `npm test` → FAIL (Boca Raton / "Sales Engineer" strings in the hero) — this is the red.
- [ ] **Step 2:** In `Scene01Hero.tsx` change imports to:

```tsx
import { ChevronDown, FileDown, Mail, MapPin } from 'lucide-react';
import { DecryptedText } from '@/components/bits';
import { mailto, resumeUrl, profile } from '@/data/profile';
import { site, hero, evidenceStrip } from '@/data/content';
import SectionLink from '@/components/SectionLink';
```
(`SectionLink` is created in Task 6 Step 1 — do Task 6 Step 1 first if building in order; commit it with this task.)

- [ ] **Step 3:** Replace the eyebrow badges block (`<div ref={metaRef} …>` … `</div>`) with:

```tsx
<div ref={metaRef} className="flex items-center gap-3 mb-6">
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.07] border border-white/15 backdrop-blur-md text-[11px] font-mono tracking-wider text-cyan-300 uppercase">
    <MapPin size={12} className="text-cyan-400" />
    <span>{hero.details[0]}</span>
  </span>
  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/25 text-[11px] font-mono text-emerald-300">
    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
    <span>{hero.availability}</span>
  </span>
</div>
```

- [ ] **Step 4:** Replace the whole `<div ref={roleRef} …>` block with:

```tsx
<div ref={roleRef} className="max-w-2xl space-y-4">
  <p className="font-mono text-sm sm:text-base md:text-lg font-medium text-blue-200 tracking-wide">
    {site.headline}
  </p>

  <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
    {hero.heading}
  </h2>

  <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed max-w-xl [@media(max-height:700px)]:hidden">
    {hero.intro}
  </p>

  <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] sm:text-sm text-slate-200 font-sans" aria-label="Details">
    {hero.details.map((item) => (
      <li key={item} className="flex items-center gap-2">
        <span className="h-1 w-1 rounded-full bg-cyan-300/80" aria-hidden="true" />
        {item}
      </li>
    ))}
  </ul>

  <div className="flex flex-wrap items-center gap-3 pt-2">
    <SectionLink
      href="#projects"
      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#06080d] transition-colors hover:bg-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
    >
      {hero.workCta}
    </SectionLink>
    <a
      href={resumeUrl}
      download={profile.resumeFile}
      className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
    >
      <FileDown size={16} aria-hidden="true" />
      {hero.resumeCta}
    </a>
    <a
      href={mailto}
      className="inline-flex items-center gap-2 rounded-full px-3 py-2.5 text-sm font-semibold text-slate-200 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
    >
      <Mail size={16} aria-hidden="true" />
      {hero.emailCta}
    </a>
  </div>

  <ul className="flex flex-wrap gap-x-5 gap-y-1 pt-2 text-xs font-mono text-slate-400" aria-label="Evidence">
    {evidenceStrip.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
</div>
```
The existing `<h1>` JOSE / GARCIA stays (it is the page's name heading); the new heading is an `h2`. Delete the now-unused `ShinyText`, `Sparkles`, `Terminal` imports if lint flags them. Change the section `aria-label` to `Introduction`.

- [ ] **Step 5:** `npm test && npm run lint && npm run build` → green. Browser check (Playwright, headless): load `http://localhost:5173/`, confirm at 1440×900 and 375×812 that headline, heading, three buttons, and the details list are all visible without scrolling more than the first screen, and with `prefers-reduced-motion: reduce` emulated.
- [ ] **Step 6:** Commit `feat(home): hero from the content brief`.

### Task 6: Capabilities (five cards) + Home order

**Files:** Create `src/components/SectionLink.tsx`; Rewrite `src/components/scenes/Scene05Capabilities.tsx`; Modify `src/pages/Home.tsx`, claims `PENDING`

**Produces:** `SectionLink({ href, className, children })` — `#x` scrolls via Lenis (or `scrollIntoView`), `/x` renders `<Link>`.

- [ ] **Step 1:** Create `src/components/SectionLink.tsx`:

```tsx
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useLenis } from '@/components/motion/SmoothScroll';

interface Props {
  href: string;
  className?: string;
  children: ReactNode;
}

/** In-page `#section` links scroll smoothly; `/route` links use the router. */
export default function SectionLink({ href, className, children }: Props) {
  const lenis = useLenis();

  if (!href.startsWith('#')) {
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    );
  }

  const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (lenis) {
      lenis.scrollTo(href, { offset: -64 });
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  );
}
```
- [ ] **Step 2:** Remove `'/src/components/scenes/Scene05Capabilities.tsx'` from `PENDING`; `npm test` → FAIL (red).
- [ ] **Step 3:** Replace `Scene05Capabilities.tsx` entirely (no GSAP, no pinning):

```tsx
import { ArrowUpRight, ClipboardList, MonitorPlay, Wrench, GraduationCap, Search } from 'lucide-react';
import SectionLink from '@/components/SectionLink';
import { capabilities } from '@/data/content';

const icons = {
  requirements: ClipboardList,
  demonstrate: MonitorPlay,
  implement: Wrench,
  train: GraduationCap,
  troubleshoot: Search,
} as const;

export default function Scene05Capabilities() {
  return (
    <section
      id="capabilities"
      className="relative z-10 py-24 sm:py-32 bg-[var(--bg)] text-[var(--text-primary)] border-t border-[var(--border)]"
      aria-labelledby="capabilities-heading"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <p className="font-mono text-xs font-semibold tracking-widest text-[var(--accent)] uppercase mb-3">
          What I help customers do
        </p>
        <h2
          id="capabilities-heading"
          className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mb-12 max-w-3xl"
        >
          From first conversation to confident use.
        </h2>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c) => {
            const Icon = icons[c.id as keyof typeof icons];
            return (
              <li
                key={c.id}
                className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-low)]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <h3 className="font-serif text-xl font-bold">{c.title}</h3>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed flex-1">{c.body}</p>
                <SectionLink
                  href={c.href}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                >
                  {c.linkLabel}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </SectionLink>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
```
- [ ] **Step 4:** Edit `src/pages/Home.tsx` imports and order so the page renders: `Scene01Hero`, `Scene05Capabilities`, `Scene04ProjectUniverse`, `Scene03Experience`, `Scene02WhoIAm`, `Scene06Philosophy` (replaced in Task 11), `Scene07Contact` (a `SceneResume` slot is added in Task 12). Keep the existing wrappers/comments' structure; update the numbering comments to describe the new order.
- [ ] **Step 5:** `npm test && npm run lint && npm run build` → green. Playwright at 1440×900 and 375×812: scroll the full page; no overlapping sections, no horizontal scroll (`document.documentElement.scrollWidth <= innerWidth`); pinned scenes (Projects, How I work) still pin and release. If a pinned scene mis-measures after reorder, call `ScrollTrigger.refresh()` after `window.load` in `src/App.tsx` effect where `refresh` is already invoked, and re-test.
- [ ] **Step 6:** Commit `feat(home): five capability cards and brief page order`.

### Task 7: Selected work (three items)

**Files:** Modify `src/components/scenes/Scene04ProjectUniverse.tsx`; claims `PENDING`

**Consumes:** `featuredWork` from `content.ts`.

- [ ] **Step 1:** Remove the file from `PENDING`; `npm test` → FAIL (red).
- [ ] **Step 2:** In `Scene04ProjectUniverse.tsx`:
  - Delete `AgentSystemVisual` (the whole function) and any imports lint flags as unused afterwards (`Bot`, `Activity`, …). Agent Trading OS moves to the Lab page (Task 15).
  - In `ServiceMapVisual`: replace `<span>Accounts: <b className="text-white">100+</b></span>` with `<span>Fictional sample data</span>`; replace `Route Optimized` with `Route sequence`; replace `GIS Routing Active` with `Sample data`; replace `Stack: Next.js · TypeScript · Firebase · Google Maps` footer text with `Next.js · Firebase`.
  - In `AACVisual`: replace both `status` strings (`'Offline Ready · High Contrast AA Compliant'`, `'Listo sin conexión · Contraste accesible AA'`) with `'Large buttons · Yes/No first'` and `'Botones grandes · Sí/No primero'`; rename the header label to `AAC COMMUNICATION APP // INTERACTIVE SAMPLE`.
  - Replace the `exhibits` array (lines ~416-485) with:

```tsx
  const visuals = {
    'service-map-planner': ServiceMapVisual,
    'aac-communication-app': AACVisual,
    'scale-garage-studio': GarageExhibitVisual,
  } as const;
  const colors = {
    'service-map-planner': '#3B82F6',
    'aac-communication-app': '#10B981',
    'scale-garage-studio': '#06B6D4',
  } as const;

  const exhibits = featuredWork.map((w) => ({
    ...w,
    color: colors[w.slug],
    component: visuals[w.slug],
  }));
```
  with `import { featuredWork } from '@/data/content';`.
  - Replace the header copy: eyebrow `SELECTED WORK`, `h2` → `Selected work.{' '}<span className="italic font-normal text-[var(--accent)]">Built around real problems.</span>`, paragraph → `Three projects, each tied to a customer problem. Select one to see what I built and what it shows.`
  - Selector grid `lg:grid-cols-4` → `lg:grid-cols-3`; `EXHIBIT 0{idx + 1}` → `PROJECT 0{idx + 1}`; `EXHIBIT 0{activeExhibit + 1} OF 04` → `PROJECT 0{activeExhibit + 1} OF 0{exhibits.length}`.
  - Dossier card: top-right `{current.category}` → `{current.status}`; subtitle stays `{current.subtitle}`; `{current.description}` → `{current.summary}`; replace the two `Friction Point`/`Architecture` boxes with one full-width box titled `My contribution` showing `{current.contribution}`; the `OUTCOME` box becomes `STATUS` showing `{current.status} · Updated {current.updated}` as plain text (remove `DecryptedText` there); `current.technologies.slice(0, 5)` stays; button text `Explore Case Study` → `Read Case Study`.
- [ ] **Step 3:** `npm test && npm run lint && npm run build` → green.
- [ ] **Step 4:** Playwright: the three tabs switch; no text contains "Offline", "AA", "100+", "Route Optimized"; each "Read Case Study" link goes to `/#/projects/<slug>`.
- [ ] **Step 5:** Commit `feat(home): three featured projects with status labels`.

### Task 8: Navigation, redirects, SEO, social image

**Files:** Modify `src/components/editorial/EditorialNav.tsx`, `src/components/Navbar.tsx`, `src/App.tsx`, `index.html`; Create `scripts/make-og.mjs`; Delete `src/pages/Contact.tsx`, `src/pages/Experience.tsx`, `src/pages/Projects.tsx` and any component only they used (`ExperienceTimeline`, `ProjectCard`, `ProjectPreview`, `CTA` if unused — confirm each with `grep -rn "<Name>" src`)

- [ ] **Step 1:** Remove `/index.html` and the three deleted pages (and any `// deleted in Task 8` components) from `PENDING`.
- [ ] **Step 2:** `EditorialNav.tsx`: import `navLinks` from `@/data/routes`; in both the desktop list and the mobile menu replace the hard-coded `<a href="#…">` items (currently `#who-i-am`, `#experience`, `#projects`, `#capabilities`, `#philosophy`, `#contact`) with `{navLinks.map((l) => …)}` reusing the first anchor's existing className/onClick pattern (`handleNavClick(l.hash)`), keyed by `l.hash`. Keep the résumé button and the logo link (`/#intro`).
- [ ] **Step 3:** `Navbar.tsx` (non-home pages): set

```ts
const navLinks = [
  { label: 'WORK', href: '/#projects' },
  { label: 'EXPERIENCE', href: '/#experience' },
  { label: 'ABOUT', href: '/#about' },
  { label: 'RESUME', href: '/#resume' },
  { label: 'CONTACT', href: '/#contact' },
];
```
and change the default-active hash `'#work'` to `'#projects'`.
- [ ] **Step 4:** `App.tsx`: delete the `Projects`, `Experience`, `Contact` lazy imports and their `<Route>` blocks, and replace the five hard-coded `<Navigate>` legacy routes (`/intro`, `/who-i-am`, `/work`, `/workflow`, `/capabilities`, `/about`) with:

```tsx
import { legacyRoutes } from '@/data/routes';
// …inside <Routes>, in place of the hand-written Navigate routes:
{legacyRoutes.map((r) => (
  <Route
    key={r.from}
    path={r.from}
    element={<Navigate to={{ pathname: '/', hash: `#${r.hash}` }} replace />}
  />
))}
```
Keep `home` detection in `SiteLayout` as is, and add `'/projects'`, `'/experience'`, `'/contact'`, `'/about'`, `'/capabilities'` is unnecessary because they redirect immediately.
- [ ] **Step 5:** `index.html`: set `<title>Jose Garcia | Customer Solutions and Implementation</title>`; set `description`, `og:description`, `twitter:description` to the brief's sentence `Jose Garcia helps customers implement, understand, and support technical systems. Explore his experience, project case studies, and resume.`; set `og:title`/`twitter:title` to the title. Do not change `og:url`.
- [ ] **Step 6:** Create `scripts/make-og.mjs` (uses the existing `sharp` devDependency) and run `node scripts/make-og.mjs`:

```js
import sharp from 'sharp';

const W = 1200;
const H = 630;
const portrait = await sharp('public/images/jose_garcia_portrait.png')
  .resize(420, 420, { fit: 'cover', position: 'top' })
  .toBuffer();

const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#06080d"/>
  <text x="80" y="250" font-family="Georgia, serif" font-size="84" font-weight="700" fill="#ffffff">Jose Garcia</text>
  <text x="80" y="320" font-family="Arial, sans-serif" font-size="30" fill="#93c5fd">Customer Solutions</text>
  <text x="80" y="366" font-family="Arial, sans-serif" font-size="30" fill="#93c5fd">Implementation · Technical Consulting</text>
  <text x="80" y="520" font-family="Arial, sans-serif" font-size="24" fill="#94a3b8">garciabel212.github.io/About-Me</text>
</svg>`;

await sharp(Buffer.from(svg))
  .composite([{ input: portrait, left: 700, top: 105 }])
  .png()
  .toFile('public/images/og-preview.png');
console.log('wrote public/images/og-preview.png');
```
Open the PNG and confirm it looks right (text not clipped, portrait not distorted). If the portrait is not suitable, ask Jose rather than substituting a stock image.
- [ ] **Step 7: Test** — `routes.test.ts` already covers nav/legacy targets. Add to it:

```ts
it('has no duplicate section ids', () => {
  expect(new Set(sectionIds).size).toBe(sectionIds.length);
});
```
- [ ] **Step 8:** `npm test && npm run lint && npm run build` → green. Playwright: open `/#/about`, `/#/projects`, `/#/experience`, `/#/contact` → each lands on its Home section (Resume and About ids exist after PR 4; until then expect `#about` / `#resume` to be missing — **do this task's live check on the About/Resume links only after Task 12**, note it in the PR).
- [ ] **Step 9:** Commit `feat: brief navigation, legacy redirects, SEO, social image`; push; open PR `feat: hero, capabilities, work, nav, SEO` (body: list deleted pages and the redirect mapping). Ask Jose to review/merge.

---

## PR 4 — `feat/home-experience-about-resume-contact`

Start from updated `origin/main`: `git switch -c feat/home-experience-about-resume-contact origin/main`.

### Task 9: Experience

**Files:** Modify `src/components/scenes/Scene03Experience.tsx`; Delete `src/data/experience.ts`; claims `PENDING`

- [ ] **Step 1:** Remove `Scene03Experience.tsx` and `/src/data/experience.ts` from `PENDING`; `npm test` → FAIL (red).
- [ ] **Step 2:** Read lines 1-60 of the file (imports, `itemsRef`, the GSAP effect, the section header). Keep the GSAP effect and the section wrapper. Replace imports of `@/data/experience` with `import { experience } from '@/data/content';`. Change `id="experience"` stays.
- [ ] **Step 3:** Header copy: eyebrow `EXPERIENCE`; `h2` → `Customer delivery,{' '}<span className="italic font-normal text-[var(--accent)]">end to end.</span>`; paragraph → `Where I have implemented, supported, and troubleshot technical systems for customers.` Remove the `ShieldCheck` "100+ Institutional Accounts" line.
- [ ] **Step 4:** Replace the three hard-coded entries (lines ~79-303, i.e. everything inside `<div className="space-y-24 sm:space-y-32">`) with a data-driven list that keeps the existing left sticky column / right content layout and `itemsRef.current[i]` registration:

```tsx
<div className="space-y-24 sm:space-y-32">
  {experience.map((entry, i) => (
    <div
      key={entry.id}
      ref={(el) => { itemsRef.current[i] = el; }}
      className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start will-change-transform ${
        i > 0 ? 'pt-16 border-t border-[var(--border-subtle)]' : ''
      }`}
    >
      <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-3">
        <div className="font-serif text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
          {entry.period}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)]">
          <MapPin size={13} className="text-[var(--accent)]" aria-hidden="true" />
          <span>{entry.location}</span>
        </div>
      </div>

      <div className="lg:col-span-8 space-y-6">
        <div>
          <h3 className="text-2xl sm:text-4xl font-serif font-bold text-[var(--text-primary)] mb-2">
            {entry.title}
          </h3>
          <p className="font-mono text-base text-[var(--accent)] font-semibold tracking-wide">
            {entry.organization}
          </p>
        </div>

        <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed font-sans">
          {entry.summary}
        </p>

        {entry.bullets.length > 0 && (
          <ul className="space-y-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            {entry.bullets.map((b) => (
              <li key={b} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}

        {entry.context && (
          <p className="text-xs sm:text-sm font-mono text-[var(--text-muted)] leading-relaxed">{entry.context}</p>
        )}
      </div>
    </div>
  ))}
</div>
```
Remove unused imports (`ShieldCheck`, `Award`, …). The old third entry (education) is now shown in the About scene (Task 11).
- [ ] **Step 5:** `git rm src/data/experience.ts`; fix any remaining importer (the `Experience` page was deleted in Task 8).
- [ ] **Step 6:** `npm test && npm run lint && npm run build` → green. Playwright check at 375×812: the DLSG title, five bullets, and GlobeNet paragraph are all visible and nothing overflows.
- [ ] **Step 7:** Commit `feat(home): experience section from the brief`.

### Task 10: How I work

**Files:** Modify `src/components/scenes/Scene02WhoIAm.tsx`

- [ ] **Step 1:** Read lines 215-388 (the card JSX). Replace the `stages` array (lines 34-95) with a mapping from content so the existing JSX keeps working:

```tsx
import { approach } from '@/data/content';
import type { ResponsibilityName } from '@/data/content';

const stageVisuals = [
  { icon: Compass, accent: '#3B82F6' },
  { icon: Cpu, accent: '#06B6D4' },
  { icon: Wrench, accent: '#10B981' },
  { icon: Users, accent: '#8B5CF6' },
  { icon: Headset, accent: '#F59E0B' },
] as const;

const stages: StageData[] = approach.map((s, i) => ({
  step: s.step,
  name: s.name,
  subtitle: s.subtitle,
  icon: stageVisuals[i].icon,
  accent: stageVisuals[i].accent,
  description: s.description,
  activeResponsibilities: s.responsibilities satisfies ResponsibilityName[],
  deliverables: s.covers,
  impactMetric: s.example,
}));
```
Keep `allResponsibilities` (its names equal `ResponsibilityName`). Remove now-unused icon imports.
- [ ] **Step 2:** Header: eyebrow `HOW I WORK`; `h2` → `Five steps from first call{' '}<span className="italic font-normal text-[var(--accent)]">to confident use.</span>`; paragraph → `The same approach on every engagement: understand, explain, configure and validate, train and hand over, follow up.` In the card JSX relabel the `deliverables` heading to `What this covers` and the `impactMetric` label to `Example from my work`. Update `aria-label` to `How I work`. Keep `id="who-i-am"`.
- [ ] **Step 3:** `npm test && npm run lint && npm run build` → green; Playwright: all five steps reachable by click and keyboard.
- [ ] **Step 4:** Commit `feat(home): how I work from the brief`.

### Task 11: About (tools, education, languages, bio)

**Files:** Create `src/components/scenes/SceneAbout.tsx`; Delete `src/components/scenes/Scene06Philosophy.tsx`; Modify `src/pages/Home.tsx`, claims `PENDING`

- [ ] **Step 1:** Remove `Scene06Philosophy.tsx` from `PENDING` (it is deleted, so also drop the entry; the "pending exists" test would otherwise fail).
- [ ] **Step 2:** Create `SceneAbout.tsx`:

```tsx
import { bio, education, languages, tools, site } from '@/data/content';

const portrait = `${import.meta.env.BASE_URL}images/jose-portrait-320.webp`;

export default function SceneAbout() {
  return (
    <section
      id="about"
      className="relative z-10 py-24 sm:py-32 bg-[var(--surface-warm)] text-[var(--text-primary)] border-t border-[var(--border)]"
      aria-labelledby="about-heading"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-12 grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          <p className="font-mono text-xs font-semibold tracking-widest text-[var(--accent)] uppercase">About Jose</p>
          <h2 id="about-heading" className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">
            {site.name}
          </h2>
          {bio.map((p) => (
            <p key={p.slice(0, 24)} className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
              {p}
            </p>
          ))}
        </div>

        <div className="lg:col-span-5 space-y-8">
          <img
            src={portrait}
            alt="Portrait of Jose Garcia"
            width={160}
            height={160}
            className="h-40 w-40 rounded-2xl object-cover object-top border border-[var(--border)]"
          />
          <div>
            <h3 className="font-mono text-xs font-semibold tracking-widest text-[var(--accent)] uppercase mb-3">
              Education and languages
            </h3>
            <ul className="space-y-3">
              {education.map((e) => (
                <li key={e.name} className="text-sm sm:text-base">
                  <span className="font-semibold">{e.name}</span>
                  <span className="block text-[var(--text-muted)] text-sm">
                    {e.issuer}
                    {e.detail ? ` · ${e.detail}` : ''}
                  </span>
                </li>
              ))}
              <li className="text-sm sm:text-base font-semibold">{languages}</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-12 grid gap-10 md:grid-cols-2">
          {[
            { heading: 'Professional experience', items: tools.professional },
            { heading: 'Project experience', items: tools.project },
          ].map((group) => (
            <div key={group.heading}>
              <h3 className="font-mono text-xs font-semibold tracking-widest text-[var(--accent)] uppercase mb-4">
                {group.heading}
              </h3>
              <ul className="space-y-4">
                {group.items.map((t) => (
                  <li key={t.name}>
                    <span className="font-semibold">{t.name}</span>
                    <span className="block text-sm text-[var(--text-secondary)]">{t.example}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```
- [ ] **Step 3:** `git rm src/components/scenes/Scene06Philosophy.tsx`; in `Home.tsx` replace the `Scene06Philosophy` import/usage with `SceneAbout`.
- [ ] **Step 4:** Confirm `public/images/jose-portrait-320.webp` is the intended portrait (open it). Jose's brief calls for "a professional portrait" — if it is not, flag in the PR; do not swap images unasked.
- [ ] **Step 5:** `npm test && npm run lint && npm run build` → green; Playwright 375px: no horizontal overflow.
- [ ] **Step 6:** Commit `feat(home): about section with tools, education, and languages`.

### Task 12: Resume section

**Files:** Create `src/components/scenes/SceneResume.tsx`; Modify `src/pages/Home.tsx`

- [ ] **Step 1:** Create `SceneResume.tsx`:

```tsx
import { FileDown } from 'lucide-react';
import { availableResumes } from '@/data/content';

export default function SceneResume() {
  const base = import.meta.env.BASE_URL;
  const [master, ...others] = availableResumes();

  return (
    <section
      id="resume"
      className="relative z-10 py-20 sm:py-28 bg-[var(--bg)] text-[var(--text-primary)] border-t border-[var(--border)]"
      aria-labelledby="resume-heading"
    >
      <div className="max-w-5xl mx-auto px-6 sm:px-12">
        <p className="font-mono text-xs font-semibold tracking-widest text-[var(--accent)] uppercase mb-3">Resume</p>
        <h2 id="resume-heading" className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-8">
          Download my resume
        </h2>

        <ul className="space-y-3">
          {[master, ...others].map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <span className="font-serif font-bold text-base sm:text-lg">{r.label}</span>
                <span className="block text-xs font-mono text-[var(--text-muted)]">Updated {r.updated}</span>
              </div>
              <a
                href={`${base}${r.file}`}
                download={r.file}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                <FileDown size={16} aria-hidden="true" />
                Download PDF
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```
- [ ] **Step 2:** In `Home.tsx` render `<SceneResume />` between `SceneAbout` and `Scene07Contact`.
- [ ] **Step 3:** Verify the file exists: `ls public/Jose-Garcia-Resume.pdf`. Playwright: the Download PDF link returns 200 at `/About-Me/Jose-Garcia-Resume.pdf` in `npm run build && npm run preview`.
- [ ] **Step 4:** `npm test && npm run lint && npm run build` → green. Commit `feat(home): resume section`.
- [ ] **Step 5 (needs Jose):** when each role PDF arrives, drop it in `public/`, set its `file` in `resumeVersions` and its `updated` date — the test and section pick it up with no other change. Until then those three rows do not render.

### Task 13: Contact

**Files:** Rewrite `src/components/scenes/Scene07Contact.tsx`; claims `PENDING`

- [ ] **Step 1:** Remove `Scene07Contact.tsx` from `PENDING`; `npm test` → FAIL (red).
- [ ] **Step 2:** Replace the file:

```tsx
import { Mail, FileDown, ArrowUpRight } from 'lucide-react';
import { contact } from '@/data/content';
import { mailto, profile, resumeUrl } from '@/data/profile';

function LinkedInIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const actionClass =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]';

export default function Scene07Contact() {
  return (
    <section
      id="contact"
      className="relative z-10 py-24 sm:py-32 bg-[var(--bg)] text-[var(--text-primary)] border-t border-[var(--border)]"
      aria-labelledby="contact-heading"
    >
      <div className="max-w-4xl mx-auto px-6 sm:px-12">
        <p className="font-mono text-xs font-semibold tracking-widest text-[var(--accent)] uppercase mb-3">Contact</p>
        <h2 id="contact-heading" className="font-serif text-4xl sm:text-6xl font-bold tracking-tight mb-6">
          {contact.heading}
        </h2>
        <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed mb-8 max-w-3xl">{contact.body}</p>

        <div className="flex flex-wrap gap-3 mb-8">
          <a href={mailto} className={`${actionClass} bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]`}>
            <Mail size={18} aria-hidden="true" />
            Email Jose
          </a>
          <a
            href={contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={`${actionClass} border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]`}
          >
            <LinkedInIcon />
            LinkedIn
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <a
            href={resumeUrl}
            download={profile.resumeFile}
            className={`${actionClass} border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]`}
          >
            <FileDown size={18} aria-hidden="true" />
            Download Resume
          </a>
        </div>

        <p className="font-mono text-sm text-[var(--text-muted)]">
          {contact.email} &middot; {contact.details.join(' · ')}
        </p>
      </div>
    </section>
  );
}
```
- [ ] **Step 3:** `npm test && npm run lint && npm run build` → green; Playwright: Email link `href` is `mailto:garciabel212@gmail.com`; LinkedIn opens `https://www.linkedin.com/in/jose-abel-garcia/` with `rel="noopener noreferrer"`.
- [ ] **Step 4:** Commit `feat(home): contact from the brief`; push; open PR `feat: experience, how I work, about, resume, contact`. Now run Task 8 Step 8's deferred redirect checks for `/#/about` and `/#/resume`. Ask Jose to review/merge.

---

## PR 5 — `feat/case-studies`

Start from updated `origin/main`: `git switch -c feat/case-studies origin/main`.

### Task 14: Case-study data and layout

**Files:** Create `src/data/caseStudies.ts`, `src/data/__tests__/caseStudies.test.ts`, `src/components/AssetFrame.tsx`, `src/components/CaseStudyPage.tsx`

**Produces:** `caseStudies: CaseStudy[]`, `getCaseStudy(slug)`, `CaseStudyPage({ slug })`, `AssetFrame({ asset })`.

- [ ] **Step 1: Failing test** `src/data/__tests__/caseStudies.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { caseStudies, getCaseStudy } from '@/data/caseStudies';

describe('case studies', () => {
  it('covers the three featured projects and the Lab', () => {
    expect(caseStudies.map((c) => c.slug)).toEqual([
      'service-map-planner',
      'aac-communication-app',
      'scale-garage-studio',
      'agent-trading-os',
    ]);
  });

  it('answers all eight questions for every study', () => {
    for (const c of caseStudies) {
      for (const key of ['problem', 'who', 'role', 'constraints', 'approach', 'result'] as const) {
        expect(c[key].length, `${c.slug}.${key}`).toBeGreaterThan(30);
      }
      expect(c.inspect.length, `${c.slug}.inspect`).toBeGreaterThan(0);
      expect(c.remaining.length, `${c.slug}.remaining`).toBeGreaterThan(0);
    }
  });

  it('links related studies that exist', () => {
    for (const c of caseStudies) expect(getCaseStudy(c.related)).toBeDefined();
  });

  it('gives every asset alt text, a kind, and a sample-data flag', () => {
    for (const c of caseStudies) {
      for (const a of c.assets) {
        expect(a.alt.length).toBeGreaterThan(10);
        expect(['employer', 'personal', 'demonstration']).toContain(a.kind);
        expect(typeof a.sampleData).toBe('boolean');
      }
    }
  });

  it('never calls a placeholder a real screenshot', () => {
    for (const c of caseStudies) for (const a of c.assets) if (!a.src) expect(a.caption).toMatch(/pending|render|concept/i);
  });
});
```
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Create `src/data/caseStudies.ts`:

```ts
import type { WorkStatus } from '@/data/content';

export interface Asset {
  /** Path under public/, or undefined until the real asset exists. */
  src?: string;
  alt: string;
  caption: string;
  date: string;
  kind: 'employer' | 'personal' | 'demonstration';
  sampleData: boolean;
}

export interface CaseStudy {
  slug: 'service-map-planner' | 'aac-communication-app' | 'scale-garage-studio' | 'agent-trading-os';
  title: string;
  subtitle: string;
  status: WorkStatus | 'Experiment';
  updated: string;
  problem: string;
  who: string;
  role: string;
  constraints: string;
  approach: string;
  inspect: string[];
  result: string;
  remaining: string[];
  technologies: string[];
  assets: Asset[];
  related: CaseStudy['slug'];
  /** Rendered as a short "Note" under the result when present. */
  note?: string;
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'service-map-planner',
    title: 'Service Map Planner',
    subtitle: 'Organizing customer records and service planning',
    status: 'Working prototype',
    updated: 'October 2026',
    problem:
      'Preparing a service visit takes several connected pieces of information: the customer location, contacts, installed systems, software versions, previous work, and maintenance status. Those pieces were hard to see in one place.',
    who: 'Service engineers preparing customer visits and follow-up.',
    role:
      'I defined the records and relationships, the interface, the maintenance views, and the visit-planning workflow. I used AI-assisted development; the requirements, data model decisions, and checks are mine.',
    constraints:
      'Customer records are sensitive, so every screen shown here uses fictional institutions and locations. Access is restricted to approved, signed-in users.',
    approach:
      'I modelled sites, equipment, software, and service history as connected records, then built maintenance views that surface follow-up needs and incomplete information. The map view sequences nearby stops for a visit and shows driving distance and time.',
    inspect: [
      'A customer record connecting contacts, equipment, software, and service history.',
      'Maintenance views that show follow-up needs and incomplete information.',
      'A map view and visit-planning sequence using fictional institutions.',
    ],
    result:
      'The project demonstrates a connected view of customer and asset information with map-based visit planning.',
    remaining: [
      'Automated tests for the planning workflow.',
      'A read-only demo with sample data that anyone can open.',
    ],
    technologies: ['Next.js', 'Firebase'],
    assets: [
      { alt: 'Customer record showing contacts, equipment, software, and service history for a fictional institution', caption: 'Customer record (screenshot pending — fictional data)', date: 'October 2026', kind: 'personal', sampleData: true },
      { alt: 'Maintenance view listing follow-up needs and incomplete information for fictional institutions', caption: 'Maintenance view (screenshot pending — fictional data)', date: 'October 2026', kind: 'personal', sampleData: true },
      { alt: 'Map view with a sequenced visit plan between fictional institutions', caption: 'Visit planning on the map (screenshot pending — fictional data)', date: 'October 2026', kind: 'personal', sampleData: true },
    ],
    related: 'aac-communication-app',
  },
  {
    slug: 'aac-communication-app',
    title: 'AAC communication app',
    subtitle: 'Simple bilingual communication for a touch screen',
    status: 'Working prototype',
    updated: 'October 2026',
    problem:
      'Some adults can answer simple questions but find reading, coordination, and multi-step screens tiring. Communication needs few steps and targets that do not move.',
    who: 'An adult who communicates through yes/no answers and simple choices, and the people who support them.',
    role:
      'I listened to what the user and caregivers needed and turned those limits into interface decisions: fixed Sí/No positions, large buttons, adult-appropriate pictograms, and fewer taps. I used AI-assisted development; the requirements and the decisions to simplify are mine.',
    constraints:
      'Large touch targets, low reading effort, Spanish-first presentation with English, and no private family or medical information on this site.',
    approach:
      'The app opens on a Yes/No question screen and a two-choice screen, uses predefined Spanish and English phrases (not automatic translation), and speaks through the device’s text-to-speech. Caregiver settings control card size and accidental-touch filtering.',
    inspect: [
      'The Yes/No board with fixed positions.',
      'One choice screen and the language controls.',
    ],
    result:
      'A working Android app for large-target Yes/No and choice screens in Spanish and English.',
    remaining: [
      'A scoped accessibility assessment before making any compliance claim.',
      'Tested behavior with no network connection before making any offline claim.',
      'Exporting answer logs on the device.',
    ],
    technologies: ['React', 'TypeScript', 'Capacitor (Android)'],
    assets: [
      { alt: 'Yes and No answer screen with two large buttons', caption: 'Yes/No screen (screenshot pending)', date: 'October 2026', kind: 'personal', sampleData: true },
      { alt: 'Two-choice screen with large picture cards in Spanish', caption: 'Choice screen (screenshot pending)', date: 'October 2026', kind: 'personal', sampleData: true },
    ],
    related: 'scale-garage-studio',
    note: 'Pictograms are from ARASAAC (Government of Aragón, CC BY-NC-SA); attribution is shown in the app.',
  },
  {
    slug: 'scale-garage-studio',
    title: 'Miniature Garage Configurator',
    subtitle: 'Exploring custom designs before fabrication',
    status: 'Working prototype',
    updated: 'October 2026',
    problem:
      'Customers choosing a custom miniature garage have to picture how layout and component choices come together before anything is printed.',
    who: 'Collectors who want a custom 1:18 model-car garage, and the person fabricating it.',
    role:
      'I designed the configuration model and the 3D preview, and I am shaping the preview to look like the printed part. I used AI-assisted development; the product decisions and fit checks are mine.',
    constraints:
      'The preview must resemble the 3D-printed result, run smoothly in a browser, and stay within what a desktop printer can make.',
    approach:
      'A structured design (layout, parts, finishes) drives a real-time 3D preview with a display-car fit check. Pricing and printability checks run over seed data; checkout is a mock.',
    inspect: ['A real configurator screenshot and a short interaction recording.', 'A photo of a printed part, when available.'],
    result: 'A working 1:18 configurator preview with fit check, pricing estimates, and printability checks.',
    remaining: [
      'Photos of printed parts next to the preview.',
      'Export of print-ready files, once it is built and verified.',
      'Additional scales, once they are supported.',
    ],
    technologies: ['React Three Fiber', 'Drei', 'Next.js'],
    assets: [
      { alt: 'Configurator showing a 1:18 garage with a display car', caption: 'Configurator (concept render until a screenshot is added)', date: 'October 2026', kind: 'personal', sampleData: true },
    ],
    related: 'service-map-planner',
  },
  {
    slug: 'agent-trading-os',
    title: 'Agent Trading OS',
    subtitle: 'An experiment in making agent decisions inspectable',
    status: 'Experiment',
    updated: 'October 2026',
    problem:
      'Automated decision-making is easy to over-trust. I wanted every proposal, risk check, and skipped trade recorded so it can be replayed and questioned.',
    who: 'Me — a learning project, not a service for customers.',
    role: 'I designed the event history, replay, and controlled experiments. I used AI-assisted development.',
    constraints: 'Paper trading only. No real money. No performance claims without a reproducible evaluation.',
    approach:
      'Rule-based agents propose paper trades; each proposal, risk check, and skipped trade is logged. Today the agents are fixed rules, not language models; model-driven agents are planned.',
    inspect: ['The event timeline and replay (screenshot pending).'],
    result: 'A working paper-trading simulation with an inspectable event history.',
    remaining: [
      'Scoring computed from settled outcomes rather than fixed values.',
      'A reproducible evaluation against a simple baseline.',
    ],
    technologies: ['React', 'TypeScript', 'Python', 'FastAPI'],
    assets: [
      { alt: 'Event timeline listing agent proposals and skipped trades', caption: 'Event timeline (screenshot pending)', date: 'October 2026', kind: 'personal', sampleData: true },
    ],
    related: 'service-map-planner',
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
```
- [ ] **Step 4:** Create `src/components/AssetFrame.tsx`:

```tsx
import type { Asset } from '@/data/caseStudies';

export default function AssetFrame({ asset }: { asset: Asset }) {
  const label = `${asset.kind === 'demonstration' ? 'Demonstration' : asset.kind === 'employer' ? 'Employer work' : 'Personal work'}${asset.sampleData ? ' · sample data' : ''} · ${asset.date}`;
  return (
    <figure className="space-y-2">
      {asset.src ? (
        <img
          src={`${import.meta.env.BASE_URL}${asset.src}`}
          alt={asset.alt}
          loading="lazy"
          className="w-full rounded-xl border border-[var(--border)]"
        />
      ) : (
        <div
          role="img"
          aria-label={asset.alt}
          className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-warm)] p-4 text-center text-xs font-mono text-[var(--text-muted)]"
        >
          Screenshot pending
        </div>
      )}
      <figcaption className="text-xs text-[var(--text-muted)]">
        {asset.caption} <span className="font-mono">({label})</span>
      </figcaption>
    </figure>
  );
}
```
- [ ] **Step 5:** Create `src/components/CaseStudyPage.tsx`:

```tsx
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import AssetFrame from '@/components/AssetFrame';
import { getCaseStudy } from '@/data/caseStudies';
import { mailto } from '@/data/profile';

const questions = [
  ['What was the problem?', 'problem'],
  ['Who needed it?', 'who'],
  ['What was my role?', 'role'],
  ['What constraints mattered?', 'constraints'],
  ['What did I do and why?', 'approach'],
] as const;

export default function CaseStudyPage({ slug }: { slug: string }) {
  const study = getCaseStudy(slug);
  if (!study) return null;
  const related = getCaseStudy(study.related);

  return (
    <main className="relative z-10 pt-28 pb-24 text-[var(--text-primary)]">
      <article className="mx-auto max-w-4xl px-6 sm:px-12 space-y-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--accent)] hover:underline"
        >
          <ArrowLeft size={14} aria-hidden="true" /> Back to home
        </Link>

        <header className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">
            {study.status} · Updated {study.updated}
          </p>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight">{study.title}</h1>
          <p className="text-lg text-[var(--text-secondary)]">{study.subtitle}</p>
        </header>

        {questions.map(([heading, key]) => (
          <section key={key} className="space-y-2">
            <h2 className="font-serif text-2xl font-bold">{heading}</h2>
            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">{study[key]}</p>
          </section>
        ))}

        <section className="space-y-4">
          <h2 className="font-serif text-2xl font-bold">What can you inspect?</h2>
          <ul className="list-disc pl-5 space-y-1 text-[var(--text-secondary)]">
            {study.inspect.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
          <div className="grid gap-5 sm:grid-cols-2">
            {study.assets.map((a) => (
              <AssetFrame key={a.caption} asset={a} />
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-2xl font-bold">What is the current result?</h2>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">{study.result}</p>
          {study.note && <p className="text-sm text-[var(--text-muted)]">{study.note}</p>}
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-2xl font-bold">What remains to improve?</h2>
          <ul className="list-disc pl-5 space-y-1 text-[var(--text-secondary)]">
            {study.remaining.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>

        <p className="font-mono text-xs text-[var(--text-muted)]">Built with: {study.technologies.join(' · ')}</p>

        <footer className="flex flex-col gap-4 border-t border-[var(--border)] pt-8 sm:flex-row sm:items-center sm:justify-between">
          {related && (
            <Link
              to={related.slug === 'agent-trading-os' ? '/lab' : `/projects/${related.slug}`}
              className="font-semibold text-[var(--accent)] hover:underline"
            >
              Related: {related.title}
            </Link>
          )}
          <a
            href={mailto}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
          >
            <Mail size={16} aria-hidden="true" /> Email Jose
          </a>
        </footer>
      </article>
    </main>
  );
}
```
- [ ] **Step 6:** `npm test && npm run lint && npm run build` → green. Commit `feat: case study data and shared layout`.

> **Verify before publishing the Lab study:** compare `agent-trading-os` copy against current `garciabel212/Trading-app` `main` (the 2026-09 review found hard-coded leaderboard scores and no LLM in the loop). If either has changed, edit `approach`/`remaining` to match.

### Task 15: Pages, routes, Lab, deletions

**Files:** Rewrite `src/pages/projects/ServiceMapPlanner.tsx`, `src/pages/projects/ScaleGarageStudio.tsx`; Create `src/pages/projects/AacCommunicationApp.tsx`, `src/pages/Lab.tsx`; Modify `src/App.tsx`, claims `PENDING`; Delete `src/pages/projects/EnterpriseDeployment.tsx`, `src/data/projects.ts`, and components orphaned by this (`ServiceMapArchitecture`, `ArchitectureDiagram`, `ProductFrame`, `ScreenshotGallery`, … — delete only if `grep -rn "<Name>" src` shows no importer)

- [ ] **Step 1:** Replace each of the three page files with a wrapper (same shape; swap the slug):

```tsx
import CaseStudyPage from '@/components/CaseStudyPage';

export default function ServiceMapPlanner() {
  return <CaseStudyPage slug="service-map-planner" />;
}
```
`AacCommunicationApp.tsx` → slug `aac-communication-app`; `ScaleGarageStudio.tsx` → `scale-garage-studio`; `src/pages/Lab.tsx` → `export default function Lab() { return <CaseStudyPage slug="agent-trading-os" />; }`.
- [ ] **Step 2:** `App.tsx`: add lazy imports `AacCommunicationApp` and `Lab`; add routes `/projects/aac-communication-app` and `/lab` using the same `<PageTransition><Loadable>…` pattern as the others; delete the `EnterpriseDeployment` lazy import and route; add `{ from: '/projects/enterprise-deployment', hash: 'experience' }` to `legacyRoutes` in `src/data/routes.ts` (the routes test already requires the hash to be a real section id).
- [ ] **Step 3:** `git rm` the deleted page and `src/data/projects.ts`; delete orphans as listed. Remove all remaining entries from `PENDING` except none — it should now be `[]`; delete the "pending exists" test body's dependency by leaving `const PENDING: string[] = [];`.
- [ ] **Step 4:** `npm test && npm run lint && npm run build` → green. If the guard flags any file, apply the spec's claims-register wording or delete the orphan.
- [ ] **Step 5:** Playwright (against `npm run preview`): visit `/#/projects/service-map-planner`, `/#/projects/aac-communication-app`, `/#/projects/scale-garage-studio`, `/#/lab`, `/#/projects/enterprise-deployment` (redirects to experience); each case study shows all headings, no console errors, placeholders say "Screenshot pending".
- [ ] **Step 6:** Commit `feat: case study pages, Lab, and redirects`.

### Task 16: Final verification and PR

- [ ] **Step 1:** `npm run lint && npm test && npm run build` → all green; paste the final output in the PR.
- [ ] **Step 2:** Production preview checks (`npm run preview`, base `/About-Me/`): every internal link and each PDF returns 200; list them with a quick script or Playwright and record the result. Keyboard-only pass: Tab through nav, hero buttons, capability links, project tabs, resume, contact — focus ring visible, no traps. Reduced motion (`prefers-reduced-motion: reduce`): all text visible, no pinned-scene breakage. 375×812: `scrollWidth <= innerWidth` on every route.
- [ ] **Step 3:** `grep -rniE "99\.999|offline pwa|AA compliant|200\+|1:10|1:24|STL export|route optimi|boca raton" src index.html` → matches only `src/data/content.ts` (Boca Raton) and `__tests__`.
- [ ] **Step 4:** Push `feat/case-studies`; open the PR; in the body list: placeholders awaiting assets (3 SMP screenshots with fictional data, 2 AAC screens, 1 garage screenshot/photo), the three role PDFs, the unconfirmed copy defaults (statuses, "Supported 100+ institutional accounts", certificate year, "Updated October 2026", AI-assisted-development sentences), and the Lab-copy check. Ask Jose to review before merging, because merge deploys.
- [ ] **Step 5:** After merge, confirm the Pages deploy succeeded and re-run Step 2's link check against `https://garciabel212.github.io/About-Me/`.

---

## Self-review

- **Spec coverage:** scene mapping (T5-T13), data layer (T2-T3), claims register (T4 guard + T5-T15), case-study template (T14-T15), Lab (T15), redirects (T3, T8, T15), SEO + social image (T8), assets-as-placeholders (T14), resume section (T12), verification (T16). Not covered by design: verified customer case study, testimonials, demo video (out of scope per spec).
- **Placeholders:** none in code steps; the only deferred inputs are Jose's assets/PDFs, handled by explicit `null`/`src`-less data.
- **Type consistency:** `FeaturedWork.slug` values equal `CaseStudy.slug` values and route paths; `ResponsibilityName` equals Scene02's `allResponsibilities` names; `navLinks.hash` values are in `sectionIds`; `availableResumes()` returns objects with non-null `file`.
- **Known risk:** vitest/Vite 8 compatibility (T1 Step 1 checks it); GSAP pinned scenes after reorder (T6 Step 5 checks it); the exact JSX of `EditorialNav` and Scene02/03's inner markup was not fully read, so T8 Step 2 and T9/T10 tell the executor to read those regions first.
