# Light Path Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the redline survey with the light path landing: the Miami flight plays full-screen behind detailed text points laid out in a zig-zag, joined by one glowing light that draws forward as you scroll and reaches each next point first.

**Architecture:** Pure modules carry every decision and are unit-tested: `points.ts` (the six points as data), `lightPath.ts` (S-curve path through measured nodes, light progress from scroll), `focusTarget.ts` (which element a hash link focuses). Thin React components render them: `Film` (the existing scroll-scrubbed film, moved), `Point` (one detailed text point), `LightPath` (the SVG, updated from scroll by direct attribute writes, no React render per frame), `FlightLanding` (composes all). Text is in normal page flow and always visible; nothing else is drawn on the film.

**Tech Stack:** React 19, TypeScript 6, Vite 8, GSAP ScrollTrigger (synced with Lenis in `SmoothScroll.tsx`), vitest 5 (node environment, `renderToStaticMarkup`), plain CSS, Google Fonts.

**Spec:** `docs/superpowers/specs/2026-10-14-light-path-landing-design.md`.

## Global Constraints

- Work in `C:\Users\abel\Documents\Code\About-Me-survey` on branch `feat/survey-landing`. Never commit to `main`. No attribution lines in commit messages or PR text.
- Nothing drawn on the film except the light path and its nodes. No rings, leaders, cards, panels, glass, or title block.
- Colors: text `#f3f4f6`, secondary `rgba(243, 244, 246, 0.74)`, ground `#0b0d18`, accent light blue `#4aa8ff`, light core `#eaf6ff`. No red on the landing.
- Fonts: display serif `Bodoni Moda` (Google Fonts, `ital,opsz,wght@0,6..96,400..900;1,6..96,400..900`); text and labels `Archivo` (already loaded).
- Copy comes from `src/data/content.ts` and `src/data/caseStudies.ts`, plus the five headlines in the spec ("Technology. People. Results.", "Understand. Implement. Support.", "Built for real needs.", "Built to learn by doing.", "Let’s make technology work for people."). No em dash (`—`) or en dash (`–`) in visible text.
- The AI disclosure (`AI_DISCLOSURE` in `src/flight/disclosure.ts`) is always visible with the film.
- No `window.addEventListener('scroll', …)` in new code: scroll updates come from `ScrollTrigger.create({ start: 0, end: 'max', onUpdate })`, registered inside effects (`gsap.registerPlugin(ScrollTrigger)` in the effect, never at import).
- Motion off (`motion === false` from `useViewMode()`, which covers reduced motion and data saver): the light path is fully drawn with every node lit and no moving head; the film shows one still per point.
- Component tests that touch `window` stub it the way `src/survey/__tests__/SurveyFilm.test.tsx` does (`vi.stubGlobal('window', …)`, then dynamic `import()`).

## Review Focus

1. **Fonts or screenshots load after the first measurement** → the light path's nodes would drift off their text. The path must re-measure when the landing's size changes. Pinned by `measureNodes` tests (Task 5) plus a ResizeObserver on the landing root.
2. **A deep link or a header link** (`/#projects`, `/#contact`, `/#exp-dlsg`) → lands on that point and moves keyboard focus to its section, not to an empty anchor. Pinned by `focusTarget` tests (Task 7).
3. **Reduced motion** → the whole path drawn, every node lit, no head. Pinned by `lightFor` tests (Task 2).
4. **Switching Cinematic ↔ Read** → lands on the same topic even though point ids differ from Read section ids. Pinned by `readingPlace` tests (Task 7).
5. **A role's "Full responsibilities" opened** → the section grows and the path follows. Same re-measure as item 1; checked in the browser round (Task 8).

---

### Task 1: Points data

**Files:**
- Create: `src/landing/points.ts`
- Modify: `src/components/home/ServiceWorkflow.tsx:3-8` (export the step titles)
- Test: `src/landing/__tests__/points.test.ts`

**Interfaces:**
- Consumes: from `content.ts`: `site`, `overview`, `glance`, `experience`, `method`, `toolGroups`, `projects`, `about`, `education`, `languages`, `contact`, types `Contribution`, `Proof`, `ToolGroup`, `EducationItem`; `caseStudies`; `StopId` from `flightData.ts`; `SERVICE_STEPS` from `ServiceWorkflow.tsx`.
- Produces:
  - `type Placement = 'top-right' | 'left' | 'center' | 'right' | 'bottom-left'`
  - `interface Shot { src: string; alt: string; width: number; height: number; caption: string }`
  - `interface WorkItem { id: string; title: string; focus: string; problem: string; contribution: string; status: string; statusNote: string; href: string; linkLabel: string; steps?: string[]; image?: Shot }`
  - `interface Role { id: 'dlsg' | 'globenet'; organization: string; title: string; period: string; location: string; summary: string; contributions: Contribution[]; details: string[] }`
  - `type PointBody = { kind: 'intro'; name: string; role: string; statement: string; facts: { label: string; value: string }[] } | { kind: 'experience'; roles: Role[] } | { kind: 'expertise'; steps: { step: string; work: Proof[]; projects: Proof[] }[]; groups: ToolGroup[] } | { kind: 'work'; items: WorkItem[] } | { kind: 'connect'; bio: string[]; portrait: { src: string; alt: string }; education: EducationItem[]; languages: string; body: string; details: string[] }`
  - `interface Point { id: StopId; anchors: string[]; number: string | null; label: string; headline: string; placement: Placement; body: PointBody }`
  - `const points: Point[]` (six, in flight order); `function plain(text: string): string`
  - `ServiceWorkflow.tsx` exports `SERVICE_STEPS` (the existing `STEPS` array, renamed).

- [ ] **Step 1: Write the failing test**

```ts
// src/landing/__tests__/points.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/landing/__tests__/points.test.ts`
Expected: FAIL, `Cannot find module '../points'`.

- [ ] **Step 3: Export the workflow steps**

In `src/components/home/ServiceWorkflow.tsx`, rename `const STEPS = [` to `export const SERVICE_STEPS = [` and update its one use (`{STEPS.map(` becomes `{SERVICE_STEPS.map(`). Nothing else changes.

- [ ] **Step 4: Write `points.ts`**

```ts
// src/landing/points.ts
import { SERVICE_STEPS } from '@/components/home/ServiceWorkflow';
import { caseStudies } from '@/data/caseStudies';
import {
  about, contact, education, experience, glance, languages, method, overview, projects, site, toolGroups,
  type Contribution, type EducationItem, type Proof, type ToolGroup,
} from '@/data/content';
import type { StopId } from '@/flight/flightData';

export type Placement = 'top-right' | 'left' | 'center' | 'right' | 'bottom-left';

export interface Shot {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
}

export interface WorkItem {
  id: string;
  title: string;
  focus: string;
  problem: string;
  contribution: string;
  status: string;
  statusNote: string;
  href: string;
  linkLabel: string;
  /** Service Map Planner has no screenshot; its workflow shows as text. */
  steps?: string[];
  image?: Shot;
}

export interface Role {
  id: 'dlsg' | 'globenet';
  organization: string;
  title: string;
  period: string;
  location: string;
  summary: string;
  contributions: Contribution[];
  details: string[];
}

export type PointBody =
  | { kind: 'intro'; name: string; role: string; statement: string; facts: { label: string; value: string }[] }
  | { kind: 'experience'; roles: Role[] }
  | { kind: 'expertise'; steps: { step: string; work: Proof[]; projects: Proof[] }[]; groups: ToolGroup[] }
  | { kind: 'work'; items: WorkItem[] }
  | { kind: 'connect'; bio: string[]; portrait: { src: string; alt: string }; education: EducationItem[]; languages: string; body: string; details: string[] };

export interface Point {
  id: StopId;
  /** Hash targets that land on this point, primary first. Existing deep links keep working. */
  anchors: string[];
  /** "01" to "05"; the intro has none. */
  number: string | null;
  label: string;
  headline: string;
  placement: Placement;
  body: PointBody;
}

/** Dash separators read as words ("October 2022 to Present"). */
export function plain(text: string): string {
  return text.replace(/\s*[—–]\s*/g, ' to ');
}

function project(slug: string) {
  const p = projects.find((x) => x.slug === slug);
  if (!p) throw new Error(`Unknown project: ${slug}`);
  return p;
}

/** A project's screenshot at the 800px size the landing shows (800x500). */
function shot(p: ReturnType<typeof project>): Shot | undefined {
  if (!p.image || p.image.kind !== 'screenshot' || !p.image.small) return undefined;
  return { src: p.image.small, alt: p.image.alt, width: 800, height: 500, caption: p.image.caption };
}

function work(slug: string, extra: Partial<WorkItem> = {}): WorkItem {
  const p = project(slug);
  return {
    id: `work-${slug}`,
    title: p.title,
    focus: p.focus,
    problem: p.problem,
    contribution: p.contribution,
    status: p.status,
    statusNote: p.statusNote,
    href: p.href,
    linkLabel: 'Read the case study',
    image: shot(p),
    ...extra,
  };
}

const lab = caseStudies.find((c) => c.slug === 'agent-trading-os');
if (!lab) throw new Error('Unknown case study: agent-trading-os');

export const points: Point[] = [
  {
    id: 'river',
    anchors: ['overview'],
    number: null,
    label: 'Introduction',
    headline: site.name,
    placement: 'top-right',
    body: {
      kind: 'intro',
      name: site.name,
      role: overview.title,
      statement: overview.statement,
      facts: glance.map((g) => ({ label: g.label, value: g.value })),
    },
  },
  {
    id: 'brickell',
    anchors: ['experience', 'exp-dlsg', 'exp-globenet'],
    number: '01',
    label: 'Experience',
    headline: 'Technology. People. Results.',
    placement: 'left',
    body: {
      kind: 'experience',
      roles: experience.map((e) => ({
        id: e.id,
        organization: e.organization,
        title: e.title,
        period: plain(e.period),
        location: e.location,
        summary: e.summary,
        contributions: e.contributions,
        details: e.details,
      })),
    },
  },
  {
    id: 'downtown',
    anchors: ['expertise'],
    number: '02',
    label: 'Expertise',
    headline: 'Understand. Implement. Support.',
    placement: 'center',
    body: { kind: 'expertise', steps: method.map((m) => ({ step: m.step, work: m.work, projects: m.projects })), groups: toolGroups },
  },
  {
    id: 'bay',
    anchors: ['projects'],
    number: '03',
    label: 'Selected work',
    headline: 'Built for real needs.',
    placement: 'right',
    body: {
      kind: 'work',
      items: [work('service-map-planner', { steps: SERVICE_STEPS.map((s) => s.title), image: undefined }), work('aac-communication-app')],
    },
  },
  {
    id: 'beach',
    anchors: ['more-projects'],
    number: '04',
    label: 'More work',
    headline: 'Built to learn by doing.',
    placement: 'left',
    body: {
      kind: 'work',
      items: [
        work('scale-garage-studio'),
        {
          id: 'work-agent-trading-os',
          title: lab.title,
          focus: lab.subtitle,
          problem: lab.summary,
          contribution: lab.role,
          status: 'Experiment',
          statusNote: lab.statusNote,
          href: '/lab',
          linkLabel: 'Open the Lab notes',
        },
      ],
    },
  },
  {
    id: 'sunset',
    anchors: ['contact', 'about'],
    number: '05',
    label: 'Let’s connect',
    headline: 'Let’s make technology work for people.',
    placement: 'bottom-left',
    body: {
      kind: 'connect',
      bio: [...about.bio],
      portrait: { ...about.portrait },
      education,
      languages,
      body: contact.body,
      details: [...contact.details],
    },
  },
];
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/landing/__tests__/points.test.ts`
Expected: PASS (9 tests). If "no em or en dashes" fails, wrap the failing field in `plain(...)` inside `points.ts`; never edit `content.ts`.

- [ ] **Step 6: Run the existing ServiceWorkflow users' tests**

Run: `npx vitest run`
Expected: PASS (the rename touched only `ServiceWorkflow.tsx`).

- [ ] **Step 7: Commit**

```bash
git add src/landing/points.ts src/landing/__tests__/points.test.ts src/components/home/ServiceWorkflow.tsx
git commit -m "feat(landing): six detailed points built from the portfolio content"
```

---

### Task 2: Light path math

**Files:**
- Create: `src/landing/lightPath.ts`
- Test: `src/landing/__tests__/lightPath.test.ts`

**Interfaces:**
- Produces:
  - `interface Node { x: number; y: number }` (landing coordinates, px)
  - `interface Sample { x: number; y: number; len: number }`
  - `const HEAD_LINE = 0.65` (the head's place on screen, share of viewport height)
  - `pathD(nodes: Node[]): string`
  - `samplePath(nodes: Node[], steps?: number): Sample[]` (default 32 per segment)
  - `interface Light { fraction: number; head: Node; lit: number }`
  - `lightFor(samples: Sample[], nodes: Node[], view: { scrollY: number; vh: number; maxScroll: number; top: number; motion: boolean }): Light` (`top`: the landing's document top, so node y converts to page y)

Each segment between nodes `a` and `b` is a cubic Bézier whose control points share their end's x (`(a.x, a.y + d/2)` and `(b.x, b.y - d/2)`, `d = b.y - a.y`): vertical tangents at every node, so the light sweeps across the page in an S and its x never leaves the range of its two ends.

- [ ] **Step 1: Write the failing test**

```ts
// src/landing/__tests__/lightPath.test.ts
import { describe, expect, it } from 'vitest';
import { HEAD_LINE, lightFor, pathD, samplePath } from '../lightPath';

const nodes = [
  { x: 1130, y: 120 },
  { x: 540, y: 1400 },
  { x: 700, y: 2700 },
  { x: 1160, y: 4000 },
];
const samples = samplePath(nodes);
const view = (scrollY: number, motion = true) => ({ scrollY, vh: 1000, maxScroll: 5000, top: 0, motion });

describe('pathD', () => {
  it('starts at the first node and ends exactly on each following node', () => {
    const d = pathD(nodes);
    expect(d.startsWith('M1130.0 120.0')).toBe(true);
    for (const n of nodes.slice(1)) expect(d).toContain(`${n.x.toFixed(1)} ${n.y.toFixed(1)}`);
    expect(d.match(/C/g)).toHaveLength(nodes.length - 1);
  });

  it('is empty with fewer than two nodes', () => {
    expect(pathD([{ x: 1, y: 1 }])).toBe('');
  });
});

describe('samplePath', () => {
  it('never leaves the horizontal range of each segment, so the S stays on the page', () => {
    for (let i = 0; i + 1 < nodes.length; i += 1) {
      const lo = Math.min(nodes[i].x, nodes[i + 1].x);
      const hi = Math.max(nodes[i].x, nodes[i + 1].x);
      for (const s of samples.filter((p) => p.y >= nodes[i].y && p.y <= nodes[i + 1].y)) {
        expect(s.x).toBeGreaterThanOrEqual(lo - 0.01);
        expect(s.x).toBeLessThanOrEqual(hi + 0.01);
      }
    }
  });

  it('only moves down the page, with growing length', () => {
    for (let i = 1; i < samples.length; i += 1) {
      expect(samples[i].y).toBeGreaterThanOrEqual(samples[i - 1].y);
      expect(samples[i].len).toBeGreaterThan(samples[i - 1].len);
    }
  });
});

describe('lightFor', () => {
  it('draws more of the light as the page scrolls', () => {
    const a = lightFor(samples, nodes, view(400));
    const b = lightFor(samples, nodes, view(1600));
    expect(b.fraction).toBeGreaterThan(a.fraction);
  });

  it('puts the head ahead of the reading line, so the light reaches the next point first', () => {
    const l = lightFor(samples, nodes, view(1000));
    expect(l.head.y).toBeCloseTo(1000 + 1000 * HEAD_LINE, 0);
  });

  it('lights every node the head has passed', () => {
    expect(lightFor(samples, nodes, view(0)).lit).toBe(1);
    expect(lightFor(samples, nodes, view(1400 - 1000 * HEAD_LINE)).lit).toBe(2);
  });

  it('is complete at the bottom of the page', () => {
    expect(lightFor(samples, nodes, view(5000))).toMatchObject({ fraction: 1, lit: 4 });
  });

  it('with motion off draws the whole light and lights every node', () => {
    expect(lightFor(samples, nodes, view(0, false))).toEqual({ fraction: 1, head: nodes[3], lit: 4 });
  });

  it('measures from the landing top, not the document top', () => {
    const shifted = lightFor(samples, nodes, { ...view(1068), top: 68 });
    expect(shifted.head.y).toBeCloseTo(lightFor(samples, nodes, view(1000)).head.y, 0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/landing/__tests__/lightPath.test.ts`
Expected: FAIL, `Cannot find module '../lightPath'`.

- [ ] **Step 3: Write `lightPath.ts`**

```ts
// src/landing/lightPath.ts
export interface Node {
  x: number;
  y: number;
}

export interface Sample {
  x: number;
  y: number;
  len: number;
}

export interface Light {
  /** Share of the path drawn, 0 to 1. */
  fraction: number;
  /** Where the bright head is. */
  head: Node;
  /** Nodes the head has reached. */
  lit: number;
}

/** The head sits this far down the screen: ahead of the reader, so the light reaches the next point first. */
export const HEAD_LINE = 0.65;

const f = (n: number) => n.toFixed(1);

/** Control points for the segment a to b: vertical tangents at both ends. */
function controls(a: Node, b: Node): [Node, Node] {
  const d = (b.y - a.y) / 2;
  return [{ x: a.x, y: a.y + d }, { x: b.x, y: b.y - d }];
}

function cubic(a: Node, c1: Node, c2: Node, b: Node, t: number): Node {
  const u = 1 - t;
  const w0 = u * u * u;
  const w1 = 3 * u * u * t;
  const w2 = 3 * u * t * t;
  const w3 = t * t * t;
  return { x: w0 * a.x + w1 * c1.x + w2 * c2.x + w3 * b.x, y: w0 * a.y + w1 * c1.y + w2 * c2.y + w3 * b.y };
}

/** One smooth S-curve through the nodes, top to bottom. */
export function pathD(nodes: Node[]): string {
  if (nodes.length < 2) return '';
  let d = `M${f(nodes[0].x)} ${f(nodes[0].y)}`;
  for (let i = 0; i + 1 < nodes.length; i += 1) {
    const [c1, c2] = controls(nodes[i], nodes[i + 1]);
    d += `C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(nodes[i + 1].x)} ${f(nodes[i + 1].y)}`;
  }
  return d;
}

/** The path as points with running length, for finding how much is drawn at a given height. */
export function samplePath(nodes: Node[], steps = 32): Sample[] {
  if (nodes.length === 0) return [];
  const out: Sample[] = [{ ...nodes[0], len: 0 }];
  for (let i = 0; i + 1 < nodes.length; i += 1) {
    const [c1, c2] = controls(nodes[i], nodes[i + 1]);
    for (let s = 1; s <= steps; s += 1) {
      const p = cubic(nodes[i], c1, c2, nodes[i + 1], s / steps);
      const prev = out[out.length - 1];
      out.push({ ...p, len: prev.len + Math.hypot(p.x - prev.x, p.y - prev.y) });
    }
  }
  return out;
}

/** How much of the light is drawn for a scroll position. */
export function lightFor(samples: Sample[], nodes: Node[], view: { scrollY: number; vh: number; maxScroll: number; top: number; motion: boolean }): Light {
  const last = nodes[nodes.length - 1];
  if (!last || samples.length === 0) return { fraction: 0, head: { x: 0, y: 0 }, lit: 0 };
  if (!view.motion || view.scrollY >= view.maxScroll - 1) return { fraction: 1, head: last, lit: nodes.length };
  const y = view.scrollY + view.vh * HEAD_LINE - view.top;
  const total = samples[samples.length - 1].len || 1;
  const lit = nodes.filter((n) => n.y <= y + 0.5).length;
  if (y <= samples[0].y) return { fraction: 0, head: { x: samples[0].x, y: samples[0].y }, lit: Math.max(1, lit) };
  const i = samples.findIndex((s) => s.y >= y);
  if (i < 0) return { fraction: 1, head: last, lit: nodes.length };
  const a = samples[i - 1];
  const b = samples[i];
  const t = b.y === a.y ? 1 : (y - a.y) / (b.y - a.y);
  const head = { x: a.x + (b.x - a.x) * t, y };
  return { fraction: (a.len + (b.len - a.len) * t) / total, head, lit: Math.max(1, lit) };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/landing/__tests__/lightPath.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/landing/lightPath.ts src/landing/__tests__/lightPath.test.ts
git commit -m "feat(landing): S-curve light path and its progress from scroll"
```

---

### Task 3: Point component

**Files:**
- Create: `src/landing/Point.tsx`, `src/landing/landing.css`
- Test: `src/landing/__tests__/Point.test.tsx`

**Interfaces:**
- Consumes: `Point`, `Role`, `WorkItem` (Task 1); `mailto`, `profile`, `resumeUrl` from `src/data/profile.ts`; `contact` from `content.ts`.
- Produces: `PointSection({ point }: { point: Point })` default export: `<section class="point point--<placement>" data-point="<id>" tabindex="-1" aria-labelledby="point-<id>-title">`, a zero-size `span.point__anchor` per anchor id, `div.point__body` containing `span.point__node[data-node]` (the light's node), then the content. The intro's heading is the page's only `h1`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/landing/__tests__/Point.test.tsx
import { describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import PointSection from '../Point';
import { points } from '../points';

const render = (node: ReactNode) => renderToStaticMarkup(<MemoryRouter>{node}</MemoryRouter>);
const all = points.map((p) => render(<PointSection point={p} />));

describe('PointSection', () => {
  it('renders every point as a focusable, labelled section with its anchors and one light node', () => {
    points.forEach((p, i) => {
      const out = all[i];
      expect(out).toMatch(new RegExp(`<section class="point point--${p.placement}" data-point="${p.id}" tabindex="-1" aria-labelledby="point-${p.id}-title">`));
      for (const a of p.anchors) expect(out).toContain(`<span class="point__anchor" id="${a}"></span>`);
      expect(out.match(/data-node="true"/g)).toHaveLength(1);
    });
  });

  it('makes the intro name the only h1, with contact actions on the first screen', () => {
    expect(all.join('').match(/<h1/g)).toHaveLength(1);
    expect(all[0]).toMatch(/<h1 id="point-river-title" class="point__name">Jose Garcia<\/h1>/);
    expect(all[0]).toContain('>Email me<');
    expect(all[0]).toContain('>Résumé<');
    expect(all[0]).not.toContain('point__label');
  });

  it('labels numbered points like the reference', () => {
    expect(all[1]).toContain('<p class="point__label"><span>01 /</span> Experience</p>');
    expect(all[1]).toContain('Technology. People. Results.');
  });

  it('shows each role in full, with the résumé details on demand', () => {
    expect(all[1]).toContain('Digital Library Systems Group / Image Access');
    expect(all[1]).toContain('October 2022 to Present');
    expect(all[1].match(/<details/g)).toHaveLength(2);
    expect(all[1]).toContain('Full responsibilities from my résumé');
  });

  it('shows the five method steps with proof, and the tool groups', () => {
    expect(all[2].match(/class="method__step"/g)).toHaveLength(5);
    expect(all[2].match(/class="tools__group"/g)).toHaveLength(4);
  });

  it('shows real screenshots with alt text and fixed dimensions, lazily loaded', () => {
    const imgs = [...all[3].matchAll(/<img [^>]*>/g), ...all[4].matchAll(/<img [^>]*>/g)].map((m) => m[0]);
    expect(imgs).toHaveLength(2);
    for (const img of imgs) {
      expect(img).toMatch(/alt="[^"]{20,}"/);
      expect(img).toContain('width="800"');
      expect(img).toContain('height="500"');
      expect(img).toContain('loading="lazy"');
    }
  });

  it('links every project to its case study', () => {
    expect(all[3]).toContain('href="/projects/service-map-planner"');
    expect(all[3]).toContain('href="/projects/aac-communication-app"');
    expect(all[4]).toContain('href="/projects/scale-garage-studio"');
    expect(all[4]).toContain('href="/lab"');
  });

  it('closes with the bio, portrait, and every contact route', () => {
    expect(all[5]).toContain('jose-portrait-320.webp');
    for (const s of ['>Email me<', 'linkedin.com', 'github.com', '>Résumé<']) expect(all[5]).toContain(s);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/landing/__tests__/Point.test.tsx`
Expected: FAIL, `Cannot find module '../Point'`.

- [ ] **Step 3: Write `Point.tsx`**

```tsx
// src/landing/Point.tsx
import { Link } from 'react-router-dom';
import { contact } from '@/data/content';
import { mailto, profile, resumeUrl } from '@/data/profile';
import type { Point, Role, WorkItem } from './points';

const base = import.meta.env.BASE_URL;

function Contact() {
  return (
    <p className="point__actions">
      <a className="point__primary" href={mailto}>Email me</a>
      <a href={resumeUrl} download={profile.resumeFile}>Résumé</a>
    </p>
  );
}

function RoleBlock({ role }: { role: Role }) {
  return (
    <article className="role-note" aria-labelledby={`role-${role.id}`}>
      <h3 id={`role-${role.id}`}>{role.organization}</h3>
      <p className="role-note__title">{role.title}</p>
      <p className="point__meta">{role.period}. {role.location}</p>
      <p>{role.summary}</p>
      <ul className="role-note__contributions">
        {role.contributions.map((c) => (
          <li key={c.label}><strong>{c.label}.</strong> {c.text}</li>
        ))}
      </ul>
      <details className="role-note__details">
        <summary>Full responsibilities from my résumé</summary>
        <ul>
          {role.details.map((d) => <li key={d}>{d}</li>)}
        </ul>
      </details>
    </article>
  );
}

function WorkBlock({ item }: { item: WorkItem }) {
  return (
    <article className="work-note" aria-labelledby={item.id}>
      <h3 id={item.id}>{item.title}</h3>
      <p className="point__meta">{item.focus}</p>
      {item.image && (
        <figure className="work-note__shot">
          <img src={`${base}${item.image.src}`} alt={item.image.alt} width={item.image.width} height={item.image.height} loading="lazy" decoding="async" />
          <figcaption>{item.image.caption}</figcaption>
        </figure>
      )}
      <p>{item.problem}</p>
      {item.steps && <p className="work-note__steps">Workflow: {item.steps.join(' → ')}</p>}
      <p><strong>My part.</strong> {item.contribution}</p>
      <p className="point__meta">{item.status}. {item.statusNote}.</p>
      <Link to={item.href} className="point__link">
        {item.linkLabel}<span className="sr-only">: {item.title}</span>
      </Link>
    </article>
  );
}

/**
 * One point of the landing: a detailed text block in normal page flow, placed
 * by `placement`. Its node is where the light path passes; anchors keep the
 * old deep links working.
 */
export default function PointSection({ point }: { point: Point }) {
  const b = point.body;
  const titleId = `point-${point.id}-title`;
  return (
    <section className={`point point--${point.placement}`} data-point={point.id} tabIndex={-1} aria-labelledby={titleId}>
      {point.anchors.map((a) => (
        <span key={a} className="point__anchor" id={a} />
      ))}
      <div className="point__body">
        <span className="point__node" data-node="true" aria-hidden="true" />
        {point.number && (
          <p className="point__label"><span>{point.number} /</span> {point.label}</p>
        )}
        {b.kind === 'intro' ? (
          <>
            <h1 id={titleId} className="point__name">{b.name}</h1>
            <p className="point__role">{b.role}</p>
            <p className="point__lead">{b.statement}</p>
            <Contact />
            <dl className="facts">
              {b.facts.map((f) => (
                <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>
              ))}
            </dl>
          </>
        ) : (
          <h2 id={titleId} className="point__headline">{point.headline}</h2>
        )}
        {b.kind === 'experience' && b.roles.map((r) => <RoleBlock key={r.id} role={r} />)}
        {b.kind === 'expertise' && (
          <>
            <ol className="method">
              {b.steps.map((s) => (
                <li key={s.step} className="method__step">
                  <h3>{s.step}</h3>
                  {s.work.map((p) => (
                    <p key={p.text}><span className="point__meta">At work</span> {p.text} <Link to={p.href}>{p.source}</Link></p>
                  ))}
                  {s.projects.map((p) => (
                    <p key={p.text}><span className="point__meta">In a project</span> {p.text} <Link to={p.href}>{p.source}</Link></p>
                  ))}
                </li>
              ))}
            </ol>
            <div className="tools">
              {b.groups.map((g) => (
                <div key={g.name} className="tools__group">
                  <h3>{g.name}</h3>
                  <ul>{g.items.map((i) => <li key={i}>{i}</li>)}</ul>
                </div>
              ))}
            </div>
          </>
        )}
        {b.kind === 'work' && b.items.map((w) => <WorkBlock key={w.id} item={w} />)}
        {b.kind === 'connect' && (
          <>
            <div className="connect__about">
              <img className="connect__portrait" src={`${base}${b.portrait.src}`} alt={b.portrait.alt} width={120} height={120} loading="lazy" decoding="async" />
              <div>{b.bio.map((p) => <p key={p}>{p}</p>)}</div>
            </div>
            <p className="point__lead">{b.body}</p>
            <ul className="connect__details">{b.details.map((d) => <li key={d}>{d}</li>)}</ul>
            <ul className="connect__education">
              {b.education.map((e) => <li key={e.name}><strong>{e.name}</strong> {e.issuer}</li>)}
              <li><strong>Languages</strong> {b.languages}</li>
            </ul>
            <p className="point__actions">
              <a className="point__primary" href={mailto}>Email me</a>
              <a href={contact.linkedin}>LinkedIn</a>
              <a href={profile.github}>GitHub</a>
              <a href={resumeUrl} download={profile.resumeFile}>Résumé</a>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Write `landing.css` (tokens, points, text)**

```css
/* src/landing/landing.css: the light path landing. LightPath sets the drawn length on its own elements. */
.landing {
  --text: #f3f4f6;
  --text-2: rgba(243, 244, 246, 0.74);
  --accent: #4aa8ff;
  --core: #eaf6ff;
  --dusk: #0b0d18;
  --f-display: "Bodoni Moda", "Times New Roman", serif;
  --f-text: "Archivo", system-ui, sans-serif;
  position: relative;
  color: var(--text);
  font-family: var(--f-text);
}

/* Points: normal flow on a 12-column grid, placed like the reference. */
.point {
  position: relative; z-index: 3;
  display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: 24px;
  min-height: 110vh; min-height: 110svh;
  padding: 16svh var(--gutter);
}
.point:focus { outline: none; }
.point__anchor { position: absolute; top: 0; left: 0; width: 1px; height: 1px; scroll-margin-top: calc(var(--header-h) + 8px); }
.point__body {
  position: relative; max-width: 560px; align-self: center;
  padding: 28px 32px; margin: -28px -32px;
  background: radial-gradient(closest-side, rgba(11, 13, 24, 0.72), rgba(11, 13, 24, 0.5) 70%, rgba(11, 13, 24, 0));
}
.point--top-right { min-height: 100vh; min-height: 100svh; padding-top: calc(var(--header-h) + 9svh); }
.point--top-right .point__body { grid-column: 7 / 13; justify-self: end; align-self: start; }
.point--left .point__body { grid-column: 1 / 7; }
.point--center .point__body { grid-column: 4 / 10; justify-self: center; }
.point--right .point__body { grid-column: 7 / 13; justify-self: end; }
.point--bottom-left .point__body { grid-column: 1 / 7; align-self: end; }
.landing__gap { height: 60vh; height: 60svh; }

.point .point__label { margin: 0 0 14px; font: 600 12px/1 var(--f-text); letter-spacing: 0.28em; text-transform: uppercase; }
.point .point__label span { color: #7cc4ff; letter-spacing: 0.12em; margin-right: 6px; }
.point .point__name { margin: 0; font: 500 clamp(52px, 6.4vw, 92px)/0.98 var(--f-display); letter-spacing: -0.01em; color: var(--text); }
.point .point__role { margin: 10px 0 0; font: 400 clamp(19px, 1.6vw, 24px)/1.25 var(--f-display); color: var(--text); }
.point .point__headline { margin: 0 0 22px; font: 500 clamp(32px, 3.2vw, 46px)/1.08 var(--f-display); color: var(--text); text-wrap: balance; }
.point .point__lead { margin: 16px 0 0; max-width: 44ch; font: 400 17px/1.55 var(--f-text); color: var(--text); text-wrap: pretty; }
.point p { margin: 10px 0 0; font: 400 15px/1.55 var(--f-text); color: var(--text-2); }
.point h3 { margin: 0; font: 500 23px/1.2 var(--f-display); color: var(--text); }
.point .point__meta { font-size: 13px; letter-spacing: 0.02em; color: var(--text-2); }
.point strong { color: var(--text); font-weight: 600; }
.point a { color: var(--text); text-underline-offset: 3px; }
.point a:focus-visible, .point summary:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
.point .point__actions { display: flex; flex-wrap: wrap; gap: 10px 22px; margin-top: 22px; font: 600 15px/1.2 var(--f-text); }
.point .point__primary { color: var(--accent); text-decoration: none; border-bottom: 2px solid currentColor; }
.point .point__link { display: inline-block; margin-top: 12px; font: 600 14px/1.2 var(--f-text); }

.facts { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; margin: 26px 0 0; }
.facts dt { font: 600 11px/1.2 var(--f-text); letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-2); }
.facts dd { margin: 4px 0 0; font: 400 14px/1.4 var(--f-text); color: var(--text); }

.role-note + .role-note, .work-note + .work-note { margin-top: 34px; }
.role-note__title { color: var(--text) !important; }
.role-note__contributions { margin: 12px 0 0; padding-left: 18px; display: grid; gap: 8px; font: 400 15px/1.5 var(--f-text); color: var(--text-2); }
.role-note__details { margin-top: 12px; font: 400 14px/1.5 var(--f-text); color: var(--text-2); }
.role-note__details summary { cursor: pointer; color: var(--text); font-weight: 600; }
.role-note__details ul { margin: 10px 0 0; padding-left: 18px; display: grid; gap: 6px; }

.method { list-style: none; margin: 0; padding: 0; display: grid; gap: 18px; }
.method__step h3 { font-size: 21px; }
.tools { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 28px; margin-top: 30px; }
.tools__group h3 { font: 600 12px/1.2 var(--f-text); letter-spacing: 0.16em; text-transform: uppercase; color: var(--text); }
.tools__group ul { margin: 8px 0 0; padding: 0; list-style: none; display: grid; gap: 4px; font: 400 14px/1.4 var(--f-text); color: var(--text-2); }

.work-note__shot { margin: 14px 0 0; }
.work-note__shot img { display: block; width: 100%; height: auto; border-radius: 10px; border: 1px solid rgba(243, 244, 246, 0.16); }
.work-note__shot figcaption { margin-top: 6px; font: 400 12px/1.4 var(--f-text); color: var(--text-2); }
.work-note__steps { color: var(--text) !important; }

.connect__about { display: grid; grid-template-columns: 120px 1fr; gap: 20px; align-items: start; }
.connect__portrait { width: 120px; height: 120px; border-radius: 10px; object-fit: cover; }
.connect__about p:first-child { margin-top: 0; }
.connect__details, .connect__education { list-style: none; margin: 16px 0 0; padding: 0; display: grid; gap: 6px; font: 400 14px/1.45 var(--f-text); color: var(--text-2); }
.connect__education strong { display: block; }

/* Tablets: left and right only; the center point joins the left. */
@media (max-width: 1023px) {
  .point--center .point__body { grid-column: 1 / 9; justify-self: start; }
  .point--left .point__body, .point--bottom-left .point__body { grid-column: 1 / 10; }
  .point--right .point__body, .point--top-right .point__body { grid-column: 4 / 13; }
}

/* Phones: one column; the light runs down the left margin. */
@media (max-width: 767px) {
  .point { display: block; min-height: 0; padding: 12svh 16px 12svh 52px; }
  .point--top-right { min-height: 100svh; padding-top: calc(var(--header-h) + 6svh); }
  .point__body { max-width: none; margin: -20px -16px; padding: 20px 16px; }
  .landing__gap { height: 40svh; }
  .facts, .tools { grid-template-columns: 1fr; }
  .connect__about { grid-template-columns: 1fr; }
}
```

Replace the em dash in the file's first comment line with a colon when writing it (no em dashes anywhere).

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/landing/__tests__/Point.test.tsx`
Expected: PASS. If the section regex fails only on attribute order, check React's serialization order and adjust the regex, not the markup.

- [ ] **Step 6: Commit**

```bash
git add src/landing/Point.tsx src/landing/landing.css src/landing/__tests__/Point.test.tsx
git commit -m "feat(landing): detailed point sections placed in a zig-zag"
```

---

### Task 4: Film

**Files:**
- Create: `src/landing/Film.tsx` (moved from `src/survey/SurveyFilm.tsx`)
- Modify: `src/landing/landing.css` (append film rules)
- Test: `src/landing/__tests__/Film.test.tsx`

**Interfaces:**
- Consumes: `FrameStore`, `flightTarget`, `coverDraw`, `POSTER_FRAME`, `flight`.
- Produces: `Film({ motion, pointIds }: { motion: boolean; pointIds: string[] })` default export: `div.film` (`aria-hidden`), `img.film__poster`, `canvas.film__canvas`. Holds at a stop while that point's section covers the middle of the screen (spans from `[data-point="<id>"]`), flies across the gaps.

- [ ] **Step 1: Write the failing test**

```tsx
// src/landing/__tests__/Film.test.tsx
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { POSTER_FRAME } from '@/flight/poster';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Film', () => {
  it('renders a hidden full-bleed film that starts on the poster frame', async () => {
    vi.stubGlobal('window', { innerHeight: 900, innerWidth: 1440, matchMedia: () => ({ matches: false }) });
    const { default: Film } = await import('../Film');
    const out = renderToStaticMarkup(<Film motion pointIds={['river']} />);
    expect(out).toContain('<div class="film" aria-hidden="true">');
    expect(out).toContain('class="film__canvas"');
    expect(out).toContain(`flight/desktop/f${String(POSTER_FRAME).padStart(3, '0')}.webp`);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/landing/__tests__/Film.test.tsx`
Expected: FAIL, `Cannot find module '/src/landing/Film'`.

- [ ] **Step 3: Write `Film.tsx`**

```tsx
// src/landing/Film.tsx
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { coverDraw } from '@/flight/crop';
import { flight } from '@/flight/flightData';
import { flightTarget, type Span } from '@/flight/flightTarget';
import { FrameStore } from '@/flight/FrameStore';
import { POSTER_FRAME } from '@/flight/poster';

const base = import.meta.env.BASE_URL;
const pad = (n: number) => String(n).padStart(3, '0');
const STOP_FRAMES = flight.stops.map((s) => s.frame);
const PHONE = '(max-width: 767px)';
/** Seconds for the drawn frame to catch up with the scroll position. */
const LAG = 0.12;

function useMatches(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = () => setMatches(list.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  return img.decode().then(() => img);
}

/** Viewport rects of the point sections, in order (null when one is missing). */
function pointSpans(ids: string[]): (Span | null)[] {
  return ids.map((id) => {
    const r = document.querySelector(`[data-point="${id}"]`)?.getBoundingClientRect();
    return r ? { top: r.top, bottom: r.bottom } : null;
  });
}

/**
 * The flight, full-bleed behind the landing. It holds still while a point's
 * section covers the middle of the screen and flies across the gaps between
 * points, driven by scroll. With motion off it shows one still per point.
 */
export default function Film({ motion, pointIds }: { motion: boolean; pointIds: string[] }) {
  const phone = useMatches(PHONE);
  const root = useRef<HTMLDivElement>(null);
  const set = phone ? 'phone' : 'desktop';

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = root.current!;
    const canvas = el.querySelector('canvas')!;
    const poster = el.querySelector('img')!;
    const ctx = canvas.getContext('2d')!;
    const srcW = phone ? flight.phoneWidth : flight.width;
    const srcH = flight.height;
    const url = (i: number) => `${base}flight/${set}/f${pad(i)}.webp`;
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let shown = -1;
    let painted = -1;
    let current = -1;
    let still: HTMLImageElement | null = null;
    let disposed = false;

    const paint = (img: HTMLImageElement, frame: number) => {
      const r = coverDraw(srcW, srcH, w, h);
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, r.dx, r.dy, r.dw, r.dh);
      poster.style.visibility = 'hidden';
      painted = frame;
    };

    const store = motion
      ? new FrameStore<HTMLImageElement>({
          frameCount: flight.frames,
          load: (i) => loadImage(url(i)),
          onLoad: (i) => {
            if (Math.abs(i - shown) < 6) {
              painted = -1;
              schedule();
            }
          },
        })
      : null;

    const showStill = (i: number) => {
      loadImage(url(STOP_FRAMES[i])).then((img) => {
        if (disposed || i !== current) return;
        still = img;
        paint(img, STOP_FRAMES[i]);
      }, () => {});
    };

    function tick(now: number) {
      raf = 0;
      const target = flightTarget(pointSpans(pointIds), window.innerHeight, STOP_FRAMES);
      if (!store) {
        if (target.stop !== current) {
          current = target.stop;
          showStill(current);
        }
        return;
      }
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 1;
      last = now;
      shown = shown < 0 ? target.frame : shown + (target.frame - shown) * (1 - Math.exp(-dt / LAG));
      if (Math.abs(target.frame - shown) < 0.3) shown = target.frame;
      const f = Math.round(shown);
      store.setPlayhead(f);
      const hit = store.nearest(f);
      if (hit && hit.index !== painted) paint(hit.frame, hit.index);
      if (shown !== target.frame) schedule();
      else last = 0;
    }

    function schedule() {
      if (!raf && !disposed) raf = requestAnimationFrame(tick);
    }

    function layout() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = document.documentElement.clientWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingQuality = 'high';
      painted = -1;
      if (still) paint(still, STOP_FRAMES[current]);
      schedule();
    }

    layout();
    if (store) {
      let started = false;
      const begin = () => {
        if (!started) {
          started = true;
          store.start();
        }
      };
      poster.decode().then(begin, begin);
    }
    const trigger = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: schedule, onRefresh: schedule });
    window.addEventListener('resize', layout);
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      trigger.kill();
      window.removeEventListener('resize', layout);
      ro.disconnect();
      store?.dispose();
    };
  }, [phone, set, motion, pointIds]);

  return (
    <div ref={root} className="film" aria-hidden="true">
      <img className="film__poster" src={`${base}flight/${set}/f${pad(POSTER_FRAME)}.webp`} alt="" fetchPriority="high" />
      <canvas className="film__canvas" />
    </div>
  );
}
```

(`clientWidth` instead of `innerWidth` keeps the film from being squashed by a classic scrollbar; code review minor 8.)

- [ ] **Step 4: Append film rules to `landing.css`**

```css
/* Film: fixed, full-bleed, clean. */
.film { position: fixed; inset: 0; z-index: 0; overflow: hidden; background: var(--dusk); pointer-events: none; }
.film__poster, .film__canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.film__poster { object-fit: cover; }
/* Header legibility: a soft dark band under the fixed header only. */
.landing__veil { position: fixed; inset: 0 0 auto; height: 160px; z-index: 1; pointer-events: none; background: linear-gradient(rgba(11, 13, 24, 0.7), rgba(11, 13, 24, 0)); }
.landing__disclosure { position: fixed; right: 16px; bottom: 12px; z-index: 4; margin: 0; font: 400 11px/1.2 var(--f-text); letter-spacing: 0.04em; color: var(--text-2); pointer-events: none; }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/landing/__tests__/Film.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/landing/Film.tsx src/landing/landing.css src/landing/__tests__/Film.test.tsx
git commit -m "feat(landing): clean full-bleed film synced to the points"
```

---

### Task 5: Light path component

**Files:**
- Create: `src/landing/LightPath.tsx`
- Modify: `src/landing/landing.css` (append light rules)
- Test: `src/landing/__tests__/LightPath.test.tsx`

**Interfaces:**
- Consumes: `pathD`, `samplePath`, `lightFor`, `Node` (Task 2).
- Produces:
  - `measureNodes(root: Element): Node[]`: centers of every `[data-node]` inside `root`, relative to `root`'s top-left, in DOM order.
  - `LightPath({ motion }: { motion: boolean })` default export: `<svg class="light" aria-hidden="true">` absolutely positioned over the whole landing (its parent `.landing`). Contains a glow path (`path.light__glow`), the drawn core (`path.light__core`, `pathLength="1"`), the dim full route (`path.light__route`), one `circle.light__node` per node (`data-lit` when reached), and `circle.light__head`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/landing/__tests__/LightPath.test.tsx
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import LightPath, { measureNodes } from '../LightPath';

type Box = { top: number; left: number; width: number; height: number };
const rect = (b: Box) => ({ ...b, right: b.left + b.width, bottom: b.top + b.height, x: b.left, y: b.top });

function landing(rootBox: Box, nodes: Box[]) {
  return {
    getBoundingClientRect: () => rect(rootBox),
    querySelectorAll: () => nodes.map((n) => ({ getBoundingClientRect: () => rect(n) })),
  } as unknown as Element;
}

describe('measureNodes', () => {
  it('returns node centers relative to the landing, so the path scrolls with the text', () => {
    const root = landing({ top: -500, left: 0, width: 1440, height: 8000 }, [
      { top: 100, left: 1120, width: 12, height: 12 },
      { top: 900, left: 540, width: 12, height: 12 },
    ]);
    expect(measureNodes(root)).toEqual([
      { x: 1126, y: 606 },
      { x: 546, y: 1406 },
    ]);
  });

  it('re-reads positions on every call, so late fonts and images move the nodes with the text', () => {
    let top = 100;
    const root = {
      getBoundingClientRect: () => rect({ top: 0, left: 0, width: 1440, height: 8000 }),
      querySelectorAll: () => [{ getBoundingClientRect: () => rect({ top, left: 0, width: 10, height: 10 }) }],
    } as unknown as Element;
    expect(measureNodes(root)[0].y).toBe(105);
    top = 160;
    expect(measureNodes(root)[0].y).toBe(165);
  });
});

describe('LightPath', () => {
  it('is decorative to assistive tech and renders nothing to draw before nodes are measured', () => {
    const out = renderToStaticMarkup(<LightPath motion />);
    expect(out).toMatch(/^<svg class="light" aria-hidden="true"/);
    expect(out).not.toContain('<path');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/landing/__tests__/LightPath.test.tsx`
Expected: FAIL, `Cannot find module '../LightPath'`.

- [ ] **Step 3: Write `LightPath.tsx`**

```tsx
// src/landing/LightPath.tsx
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { lightFor, pathD, samplePath, type Node } from './lightPath';

/** Centers of the points' light nodes, relative to the landing's top-left. */
export function measureNodes(root: Element): Node[] {
  const r = root.getBoundingClientRect();
  return [...root.querySelectorAll('[data-node]')].map((el) => {
    const b = el.getBoundingClientRect();
    return { x: b.left - r.left + b.width / 2, y: b.top - r.top + b.height / 2 };
  });
}

/**
 * The one glowing light that joins the points. It is drawn over the whole
 * landing, so it scrolls with the text; scroll sets how much is lit and where
 * the bright head is, by writing attributes directly (no React render per frame).
 */
export default function LightPath({ motion }: { motion: boolean }) {
  const svg = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const d = useMemo(() => pathD(nodes), [nodes]);
  const samples = useMemo(() => samplePath(nodes), [nodes]);

  // Measure the nodes now and whenever the landing changes size (fonts, images, opened details, resize).
  useLayoutEffect(() => {
    const root = svg.current?.parentElement;
    if (!root) return;
    const measure = () => {
      setNodes(measureNodes(root));
      setSize({ w: root.clientWidth, h: root.scrollHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    document.fonts?.ready.then(measure, () => {});
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = svg.current;
    if (!el || nodes.length < 2) return;
    const core = el.querySelector<SVGPathElement>('.light__core');
    const glow = el.querySelector<SVGPathElement>('.light__glow');
    const head = el.querySelector<SVGCircleElement>('.light__head');
    const dots = [...el.querySelectorAll<SVGCircleElement>('.light__node')];
    const update = () => {
      const top = (el.parentElement?.getBoundingClientRect().top ?? 0) + window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const l = lightFor(samples, nodes, { scrollY: window.scrollY, vh: window.innerHeight, maxScroll, top, motion });
      core?.setAttribute('stroke-dashoffset', String(1 - l.fraction));
      glow?.setAttribute('stroke-dashoffset', String(1 - l.fraction));
      head?.setAttribute('cx', l.head.x.toFixed(1));
      head?.setAttribute('cy', l.head.y.toFixed(1));
      dots.forEach((dot, i) => dot.toggleAttribute('data-lit', i < l.lit));
    };
    const trigger = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update, onRefresh: update });
    update();
    return () => trigger.kill();
  }, [nodes, samples, motion]);

  return (
    <svg ref={svg} className="light" aria-hidden="true" width={size.w} height={size.h} viewBox={`0 0 ${size.w || 1} ${size.h || 1}`}>
      {d && (
        <>
          <path className="light__route" d={d} />
          <path className="light__glow" d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={motion ? 1 : 0} />
          <path className="light__core" d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={motion ? 1 : 0} />
          {nodes.map((n, i) => (
            <circle key={i} className="light__node" cx={n.x} cy={n.y} r={6} />
          ))}
          {motion && <circle className="light__head" cx={nodes[0].x} cy={nodes[0].y} r={5} />}
        </>
      )}
    </svg>
  );
}
```

The glow and the core share the same dash values, so both stop at the head; the dim route underneath shows the way ahead.

- [ ] **Step 4: Append light rules to `landing.css`**

```css
/* The light: a dim full route, a soft glow, and a bright core drawn to the head. */
.light { position: absolute; inset: 0 auto auto 0; z-index: 2; pointer-events: none; overflow: visible; }
.light path { fill: none; stroke-linecap: round; }
.light__route { stroke: rgba(74, 168, 255, 0.14); stroke-width: 1.5; }
.light__glow { stroke: rgba(74, 168, 255, 0.35); stroke-width: 9; }
.light__core { stroke: var(--core); stroke-width: 1.8; }
.light__node { fill: rgba(74, 168, 255, 0.25); stroke: rgba(234, 246, 255, 0.4); stroke-width: 1; transition: fill 0.4s ease, r 0.4s ease; }
.light__node[data-lit] { fill: var(--core); r: 7px; }
.light__head { fill: var(--core); }
.landing--still .light__head { display: none; }

/* Node marks inside each point: where the light passes (the side facing the middle of the page). */
.point__node { position: absolute; top: 34px; width: 12px; height: 12px; }
.point--left .point__node, .point--bottom-left .point__node { right: -6px; }
.point--top-right .point__node, .point--center .point__node, .point--right .point__node { left: -6px; }
.point--top-right .point__node { top: 52px; }
@media (max-width: 767px) {
  .point__node { left: -30px !important; right: auto !important; top: 24px; }
  .point:nth-of-type(even) .point__node { left: -18px !important; }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/landing/__tests__/LightPath.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/landing/LightPath.tsx src/landing/landing.css src/landing/__tests__/LightPath.test.tsx
git commit -m "feat(landing): glowing light path drawn from scroll"
```

---

### Task 6: Landing, Home, header, fonts

**Files:**
- Create: `src/landing/FlightLanding.tsx`
- Modify: `src/pages/Home.tsx` (render `FlightLanding`, use `points` for places), `index.html:37` (fonts), `src/styles/site.css` (Cinematic header: blue accent, serif brand, gutter alignment; selection color)
- Test: `src/landing/__tests__/FlightLanding.test.tsx`

**Interfaces:**
- Consumes: `Film`, `LightPath`, `PointSection`, `points`, `AI_DISCLOSURE`.
- Produces: `FlightLanding({ motion }: { motion: boolean })` default export: `div.landing` (`landing--still` when motion is off) containing `Film`, `div.landing__veil`, `LightPath`, the six points with `div.landing__gap` between them, and `p.landing__disclosure`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/landing/__tests__/FlightLanding.test.tsx
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AI_DISCLOSURE } from '@/flight/disclosure';

afterEach(() => {
  vi.unstubAllGlobals();
});

async function render(motion: boolean) {
  vi.stubGlobal('window', { innerHeight: 900, innerWidth: 1440, matchMedia: () => ({ matches: false }) });
  const { default: FlightLanding } = await import('../FlightLanding');
  return renderToStaticMarkup(
    <MemoryRouter>
      <FlightLanding motion={motion} />
    </MemoryRouter>,
  );
}

describe('FlightLanding', () => {
  it('lays out the film, the light, and six points with gaps where the camera flies', async () => {
    const out = await render(true);
    expect(out).toMatch(/^<div class="landing">/);
    expect(out).toContain('class="film"');
    expect(out).toContain('class="light"');
    expect(out.match(/data-point="/g)).toHaveLength(6);
    expect(out.match(/class="landing__gap"/g)).toHaveLength(5);
  });

  it('marks still mode when motion is off', async () => {
    expect(await render(false)).toMatch(/^<div class="landing landing--still">/);
  });

  it('always shows the AI disclosure with the film', async () => {
    expect(await render(true)).toContain(`<p class="landing__disclosure">${AI_DISCLOSURE}</p>`);
  });

  it('draws nothing on the film but the light: no rings, ink, or title block', async () => {
    const out = await render(true);
    for (const gone of ['redline', 'ink--', 'title-block', 'tb-']) expect(out).not.toContain(gone);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/landing/__tests__/FlightLanding.test.tsx`
Expected: FAIL, `Cannot find module '/src/landing/FlightLanding'`.

- [ ] **Step 3: Write `FlightLanding.tsx`**

```tsx
// src/landing/FlightLanding.tsx
import { Fragment } from 'react';
import { AI_DISCLOSURE } from '@/flight/disclosure';
import Film from './Film';
import LightPath from './LightPath';
import PointSection from './Point';
import { points } from './points';
import './landing.css';

const POINT_IDS = points.map((p) => p.id);

/**
 * The Cinematic landing: the flight plays full-screen behind detailed points
 * laid out in a zig-zag, and one light joins them, drawing ahead of the reader.
 */
export default function FlightLanding({ motion }: { motion: boolean }) {
  return (
    <div className={`landing${motion ? '' : ' landing--still'}`}>
      <Film motion={motion} pointIds={POINT_IDS} />
      <div className="landing__veil" aria-hidden="true" />
      <LightPath motion={motion} />
      {points.map((p, i) => (
        <Fragment key={p.id}>
          {i > 0 && <div className="landing__gap" aria-hidden="true" />}
          <PointSection point={p} />
        </Fragment>
      ))}
      <p className="landing__disclosure">{AI_DISCLOSURE}</p>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/landing/__tests__/FlightLanding.test.tsx`
Expected: PASS.

- [ ] **Step 5: Wire `Home.tsx`**

In `src/pages/Home.tsx`: replace `import SurveyLanding from '@/survey/SurveyLanding';` with `import FlightLanding from '@/landing/FlightLanding';`, replace `import { sites } from '@/survey/sites';` with `import { points } from '@/landing/points';`, replace `<SurveyLanding motion={motion} />` with `<FlightLanding motion={motion} />`, and in `placeRects` replace

```ts
    ? sites.map((s) => ({ id: s.anchors[0], el: document.querySelector(`[data-site="${s.id}"]`) }))
```

with

```ts
    ? points.map((p) => ({ id: p.anchors[0], el: document.querySelector(`[data-point="${p.id}"]`) }))
```

- [ ] **Step 6: Fonts**

In `index.html` line 37 replace `family=B612:wght@400;700&` with `family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&` (Archivo stays; B612 is no longer used).

- [ ] **Step 7: Cinematic header in `site.css`**

In `src/styles/site.css`, inside the block that starts `/* Over the survey the header joins the drawing`, make these replacements:
- `.site-header.is-film .site-brand { font: 800 20px/1 "Archivo", system-ui, sans-serif; font-stretch: 112%; letter-spacing: 0; }` becomes `.site-header.is-film .site-brand { font: 500 22px/1 "Bodoni Moda", "Times New Roman", serif; letter-spacing: 0; }`
- every `#ff5b3d` in that block becomes `#4aa8ff`
- add `.site-header.is-film .site-header__bar { max-width: none; }` so the header shares the page gutter.
- change the comment `/* Over the survey the header joins the drawing: no glass band, Archivo lettering, one red. */` to `/* Over the flight the header stays light: no glass band, the light's blue as the one accent. */`

and replace `.site-shell.is-film ::selection { background: rgba(255, 91, 61, 0.35); }` with `.site-shell.is-film ::selection { background: rgba(74, 168, 255, 0.35); }`.

- [ ] **Step 8: Run the whole suite**

Run: `npx vitest run`
Expected: PASS (`src/survey` still exists until Task 7, so its tests still run and pass).

- [ ] **Step 9: Commit**

```bash
git add src/landing/FlightLanding.tsx src/landing/__tests__/FlightLanding.test.tsx src/pages/Home.tsx index.html src/styles/site.css
git commit -m "feat(home): Cinematic mode becomes the light path landing"
```

---

### Task 7: Navigation, places, focus, and removing the survey

**Files:**
- Create: `src/lib/focusTarget.ts`, `src/lib/__tests__/focusTarget.test.ts`
- Modify: `src/data/navigation.ts`, `src/data/__tests__/navigation.test.ts`, `src/components/home/readingPlace.ts`, `src/components/home/__tests__/readingPlace.test.ts`, `src/App.tsx:82`, `src/flight/__tests__/disclosure.test.tsx`
- Delete: `src/survey/` (every file and its `__tests__`)

**Interfaces:**
- Consumes: `points` (Task 1).
- Produces: `focusTarget(target: HTMLElement): HTMLElement | null` (the element a hash link should focus: the target itself when it carries `tabindex="-1"`, otherwise its nearest `[data-point]` section, otherwise null). Check the attribute, not the `tabIndex` property: every non-focusable element reports `tabIndex === -1`, which is why focus silently did nothing before.

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/__tests__/focusTarget.test.ts
import { describe, expect, it } from 'vitest';
import { focusTarget } from '../focusTarget';

/** A stand-in element: `tabindex` attribute value (null when absent) and the section `closest` finds. */
const el = (tabindex: string | null, section: unknown = null) =>
  ({ tabIndex: -1, getAttribute: (n: string) => (n === 'tabindex' ? tabindex : null), closest: () => section }) as unknown as HTMLElement;

describe('focusTarget', () => {
  it('focuses a Read section directly', () => {
    const s = el('-1');
    expect(focusTarget(s)).toBe(s);
  });

  it('hands focus from a landing anchor to its point section, even though a plain span reports tabIndex -1', () => {
    const section = el('-1');
    expect(focusTarget(el(null, section))).toBe(section);
  });

  it('focuses nothing when neither is focusable', () => {
    expect(focusTarget(el(null))).toBeNull();
  });
});
```

Replace the `describe('Cinematic navigation', …)` block in `src/data/__tests__/navigation.test.ts` with:

```ts
describe('Cinematic navigation', () => {
  it('follows the points in page order, with About folded into the closing point', () => {
    expect(cinematicSectionLinks.map((l) => l.id)).toEqual(['overview', 'experience', 'expertise', 'projects', 'contact']);
  });
});
```

Replace the `describe('placeTarget', …)` block in `src/components/home/__tests__/readingPlace.test.ts` with:

```ts
describe('placeTarget', () => {
  it('finds the landing point that owns a Read section id', () => {
    expect(placeTarget('projects', 'cinematic')).toBe('[data-point="bay"]');
    expect(placeTarget('about', 'cinematic')).toBe('[data-point="sunset"]');
    expect(placeTarget('experience', 'cinematic')).toBe('[data-point="brickell"]');
  });

  it('sends Cinematic-only places to their nearest Read section', () => {
    expect(placeTarget('more-projects', 'read')).toBe('#projects');
    expect(placeTarget('contact', 'read')).toBe('#contact');
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/lib src/data src/components/home`
Expected: FAIL: `focusTarget` missing; navigation order differs; `placeTarget` still returns `[data-site=…]`.

- [ ] **Step 3: Implement**

```ts
// src/lib/focusTarget.ts
/**
 * The element a hash link should move keyboard focus to: a Read section
 * (tabIndex -1) itself, or the landing point that holds a zero-size anchor.
 */
export function focusTarget(target: HTMLElement): HTMLElement | null {
  // The attribute, not the property: elements that cannot take focus also report tabIndex -1.
  if (target.getAttribute('tabindex') === '-1') return target;
  return target.closest<HTMLElement>('[data-point]');
}
```

In `src/App.tsx`, add `import { focusTarget } from '@/lib/focusTarget';` and replace

```ts
        if (target.tabIndex === -1) target.focus({ preventScroll: true });
```

with

```ts
        focusTarget(target)?.focus({ preventScroll: true });
```

In `src/data/navigation.ts`, replace `import { sites } from '@/survey/sites';` with `import { points } from '@/landing/points';`, and replace the last export with:

```ts
/**
 * Cinematic mode's links: the landing points in page order, each by its
 * primary anchor. "More work" has no Home section of its own and About is part
 * of the closing point, so the route reads Overview, Experience, Expertise,
 * Projects, Contact.
 */
export const cinematicSectionLinks = points.flatMap((point) => homeSectionLinks.filter((l) => l.id === point.anchors[0]));
```

In `src/components/home/readingPlace.ts`, replace `import { sites } from '@/survey/sites';` with `import { points } from '@/landing/points';` and the body of the cinematic branch of `placeTarget` with:

```ts
  const owner = points.find((p) => p.anchors.includes(id));
  return owner ? `[data-point="${owner.id}"]` : `#${id}`;
```

Replace `src/flight/__tests__/disclosure.test.tsx` with:

```tsx
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AI_DISCLOSURE } from '../disclosure';
import { POSTER_FRAME } from '../poster';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AI footage disclosure (LTX-2 license)', () => {
  it('is shown on the landing, with the film', async () => {
    vi.stubGlobal('window', { innerHeight: 900, innerWidth: 1440, matchMedia: () => ({ matches: false }) });
    const { default: FlightLanding } = await import('@/landing/FlightLanding');
    const out = renderToStaticMarkup(
      <MemoryRouter>
        <FlightLanding motion />
      </MemoryRouter>,
    );
    expect(out).toContain(`<p class="landing__disclosure">${AI_DISCLOSURE}</p>`);
  });

  it('preloads the poster frame the film paints first', () => {
    const html = readFileSync('index.html', 'utf8');
    const name = `f${String(POSTER_FRAME).padStart(3, '0')}.webp`;
    expect(html).toContain(`flight/desktop/${name}`);
    expect(html).toContain(`flight/phone/${name}`);
  });
});
```

- [ ] **Step 4: Delete the survey**

```bash
git rm -r -q src/survey
git grep -n -E "@/survey|survey\.css|SurveyLanding|SurveyFilm|RedlineLayer|TitleBlock" -- src index.html
```

Expected: the grep prints nothing.

- [ ] **Step 5: Run the gates**

Run: `npm test && npm run lint && npm run build`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add -A src
git commit -m "refactor(landing): nav, places, and focus follow the points; remove the survey"
```

---

### Task 8: Browser round

**Files:**
- Modify: whatever the round shows is wrong (`src/landing/landing.css`, `src/landing/points.ts` placement)
- Output: `.impeccable/review/*.png` (not committed)

Two capture rounds at most.

- [ ] **Step 1: Start the dev server**: Browser pane `preview_start` with `name: "about-me-survey-dev"` (port 5230). Use the Playwright MCP browser for captures, and reset its viewport size after each capture set (it keeps the size inside a larger window).

- [ ] **Step 2: Capture** at 1440x900, 1920x1080, 1280x600, 390x844: the first screen (scrollY 0); each point with its heading at the middle of the screen; one capture mid-way between two points (light head visible between nodes). Then reduced motion (`browser_emulate_media reducedMotion: reduce`) at 1440x900, first screen and Selected work. Save as `.impeccable/review/<point>-<w>x<h>.png`, plus `desktop.png` and `mobile.png` (first screens).

- [ ] **Step 3: Check** each capture: name, role, statement, Email me, Résumé visible on the first screen without scrolling; points zig-zag (top right, left, center, right, left, bottom left on desktop; one column on phones); the light passes through every node and its head sits ahead of the text being read; text readable on the brightest frames (Bay, Sunset skies); screenshots sharp and captioned; header aligned to the page gutter; no red anywhere; console has no errors. Open one role's "Full responsibilities" and confirm the light re-routes to the moved nodes.

- [ ] **Step 4: Fix everything the round showed in one batch, re-capture once, then run the detector**

```bash
C:/Users/abel/.claude/skills/impeccable/scripts/impeccable.cmd detect --json src/landing src/pages/Home.tsx
```

- [ ] **Step 5: Commit**

```bash
git add src/landing src/pages/Home.tsx
git commit -m "fix(landing): placement and legibility from the browser round"
```

---

### Task 9: Finish

- [ ] **Step 1: Update the direction contract.** Rewrite `.impeccable/surfaces/src-pages-home-tsx.md` through `impeccable surface-brief write src/pages/Home.tsx <body-file>` with the six blocks for the light path world (THESIS: the information flows over the flight and one light leads to each next point; OWN-WORLD: clean footage, Bodoni Moda and Archivo, one light blue, glowing path and nodes, no panels or markup; STORY: name and contact first, then experience, expertise, work, contact; FIRST VIEWPORT: name top right with role, statement, Email me, Résumé, quick facts, the light starting at the name's node; FORM: user-pinned reference (light path), replacing seed 756d875b's Site Survey Redlines; FINISH line verbatim from new-work.md).
- [ ] **Step 2: Finish review.** Spawn `impeccable-finish-reviewer` with the user's words (credits, "the light leads you to the next point", "the information will be detailed", the reference image description), PRODUCT.md, the contract, the artifact paths, every capture, the detector output, and the craft floor path. Act on its disposition; at most two fix rounds.
- [ ] **Step 3: Whole-branch code review.** Run `review-package` for `516107a..HEAD` and spawn the code reviewer (most capable model) with this plan's Review Focus. Fix Critical and Important findings test-first in one pass; ledger minors.
- [ ] **Step 4: Documenter.** Spawn `impeccable-documenter`; verify `DESIGN.md` and `.impeccable/design.json`.
- [ ] **Step 5: Gates and PR.** `npm test && npm run lint && npm run build`; push `feat/survey-landing`; open the PR to `main` with a summary, the captures list, test results, both reviewers' verdicts, the HD-frames note (not produced; needs a GPU upscale of the current film), and no attribution lines.
