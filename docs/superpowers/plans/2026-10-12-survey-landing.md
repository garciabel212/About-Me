# Survey Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Cinematic Home with the "Site Survey Redlines" landing: the Miami flight full-screen behind everything, each stop a site visit marked up in redline ink, and a fixed engineering title block.

**Architecture:** Pure modules (`sites`, `geometry`, `progress`, `readingPlace`) carry every decision and are unit-tested. Thin React components (`SurveyFilm`, `RedlineLayer`, `TitleBlock`, `SiteSection`, `SurveyLanding`) render them. Scroll drives CSS custom properties (`--ink`, `--lift`, `--focus`) on one root element, so ink drawing never re-renders React per frame. Read mode is untouched.

**Tech Stack:** React 19, TypeScript 6, Vite 8, GSAP ScrollTrigger (already synced with Lenis in `SmoothScroll.tsx`), vitest 5 (node environment, `renderToStaticMarkup` for component tests), plain CSS.

**Spec:** `docs/superpowers/specs/2026-10-12-survey-landing-design.md`. Direction contract: `.impeccable/surfaces/src-pages-home-tsx.md`.

## Global Constraints

- Work in `C:\Users\abel\Documents\Code\About-Me-survey` on branch `feat/survey-landing`. Never commit to `main`. No attribution lines in commit messages.
- The film is always full-bleed. No cards, panels, glass/backdrop blur, glow, or framed film windows on the landing.
- One red ink (`--ink-red: #ff5b3d`) for markup and for **Email me** only. Text `--field: #f3f4f6`, secondary `--field-2: rgba(243, 244, 246, 0.74)`, ground `--dusk: #0b0d18`.
- Fonts: display and body `Archivo` (variable, `wdth 62..125`, `wght 100..900`); markup notes `B612` (400, 700). Not Newsreader, Playfair, Inter-as-display, or any face on impeccable's reflex list.
- Copy comes from `src/data/content.ts` / `src/data/caseStudies.ts` or is a plain paraphrase of it. No invented numbers or claims. No em dash (`—`) or en dash (`–`) in any visible string.
- The AI disclosure (`AI_DISCLOSURE` from `src/flight/disclosure.ts`) is visible whenever the film is.
- No `window.addEventListener('scroll', …)` in new code: scroll updates come from `ScrollTrigger.create({ start: 0, end: 'max', onUpdate })`.
- Reduced motion / data saver (`motion === false` from `useViewMode()`): no scrubbing, no draw animation, no blur; ink appears with a short fade.
- Every component test that touches `window` stubs it like `src/flight/__tests__/disclosure.test.tsx` does (`vi.stubGlobal('window', …)`, then dynamic `import()`).

## Review Focus

1. **Resize or rotate while settled at a site** → rings stay on their landmarks and leaders still end on their notes. Pinned by geometry tests at 1280x720, 1920x1080, 2560x1080 and by re-measuring anchors on resize and note layout changes (Task 8).
2. **Phone crop hides a landmark** (Downtown's AAC and Agent Trading OS at 390x844) → no ring is drawn off-screen; an edge arrow points toward it. Pinned in Task 2.
3. **Deep links** `/#overview`, `/#about`, `/#projects`, `/#more-projects`, `/#expertise`, `/#experience`, `/#exp-dlsg`, `/#exp-globenet`, `/#contact` → each exists exactly once and lands on a settled site (ink drawn). Pinned in Tasks 1 and 7.
4. **Reduced motion** → ink fully visible whenever a site is under the reading line, no blur, no pulse. Pinned in Task 3.
5. **Switching Cinematic ↔ Read** keeps the reader on the same topic even though the two modes order and name sections differently (`more-projects` has no Read twin). Pinned in Task 8.

---

### Task 1: Site data

**Files:**
- Create: `src/survey/sites.ts`
- Test: `src/survey/__tests__/sites.test.ts`

**Interfaces:**
- Consumes: `content.ts` (`site`, `overview`, `glance`, `experience`, `method`, `projects`, `education`, `languages`, `contact`), `caseStudies.ts` (`caseStudies`), `flightData.ts` (`StopId`, `flight`).
- Produces:
  - `interface Mark { x: number; y: number; r: number }` (x, y: fractions of the desktop frame 1280x704; r: fraction of the drawn frame height)
  - `interface Job { id: string; title: string; outcome: string; method: string; status: string; href: string; mark: Mark }`
  - `interface PunchItem { id: string; step: string; line: string }`
  - `interface LogEntry { id: string; name: string; line: string; period: string }`
  - `type SiteBody = { kind: 'intro'; name: string; role: string; statement: string; next: string } | { kind: 'jobs'; jobs: Job[] } | { kind: 'punch'; items: PunchItem[] } | { kind: 'log'; entries: LogEntry[] } | { kind: 'handover'; heading: string; body: string }`
  - `interface Site { id: StopId; anchors: string[]; label: string; job: string; status: string; heading: string; mark: Mark; body: SiteBody }`
  - `const sites: Site[]` (six, in flight order)
  - `function plain(text: string): string` (replaces dash separators with words)

- [ ] **Step 1: Write the failing test**

```ts
// src/survey/__tests__/sites.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/survey/__tests__/sites.test.ts`
Expected: FAIL, `Failed to resolve import "../sites"`.

- [ ] **Step 3: Write the implementation**

```ts
// src/survey/sites.ts
import { caseStudies } from '@/data/caseStudies';
import { contact, education, experience, glance, languages, method, overview, projects, site } from '@/data/content';
import type { StopId } from '@/flight/flightData';

/**
 * A landmark on a stop frame. x, y: its centre as fractions of the desktop
 * frame (1280x704). r: the ink ring's radius as a fraction of the drawn
 * frame's height. Measured on the stop frames in public/flight/desktop.
 */
export interface Mark {
  x: number;
  y: number;
  r: number;
}

export interface Job {
  /** DOM id of the note; its leader line ends here. */
  id: string;
  title: string;
  /** Front of the note: what it does, in one line. */
  outcome: string;
  /** Back of the note: how it was built. */
  method: string;
  status: string;
  /** App route of the case study. */
  href: string;
  mark: Mark;
}

export interface PunchItem {
  id: string;
  step: string;
  line: string;
}

export interface LogEntry {
  id: string;
  name: string;
  line: string;
  period: string;
}

export type SiteBody =
  | { kind: 'intro'; name: string; role: string; statement: string; next: string }
  | { kind: 'jobs'; jobs: Job[] }
  | { kind: 'punch'; items: PunchItem[] }
  | { kind: 'log'; entries: LogEntry[] }
  | { kind: 'handover'; heading: string; body: string };

export interface Site {
  id: StopId;
  /** Hash targets that land on this site, primary first. Existing deep links keep working. */
  anchors: string[];
  /** Title block fields. */
  label: string;
  job: string;
  status: string;
  /** The site's heading. */
  heading: string;
  /** The site's main ring. Job sites ring each job instead. */
  mark: Mark;
  body: SiteBody;
}

/** Dash separators read as words on the survey ("October 2022 to Present"). */
export function plain(text: string): string {
  return text.replace(/\s*[—–]\s*/g, ' to ');
}

function project(slug: string) {
  const p = projects.find((x) => x.slug === slug);
  if (!p) throw new Error(`Unknown project: ${slug}`);
  return p;
}

function role(id: 'dlsg' | 'globenet') {
  const e = experience.find((x) => x.id === id);
  if (!e) throw new Error(`Unknown role: ${id}`);
  return e;
}

const smp = project('service-map-planner');
const aac = project('aac-communication-app');
const garage = project('scale-garage-studio');
const lab = caseStudies.find((c) => c.slug === 'agent-trading-os');
if (!lab) throw new Error('Unknown case study: agent-trading-os');
const dlsg = role('dlsg');
const globenet = role('globenet');

const jobs = {
  smp: {
    id: 'job-service-map-planner',
    title: smp.title,
    outcome: 'One place to prepare a service visit: site, equipment, maintenance, and route.',
    method: smp.contribution,
    status: smp.status,
    href: smp.href,
    mark: { x: 0.67, y: 0.36, r: 0.07 },
  },
  aac: {
    id: 'job-aac-communication-app',
    title: aac.title,
    outcome: 'Yes and no answers with buttons that never move, in Spanish and English.',
    method: aac.contribution,
    status: aac.status,
    href: aac.href,
    mark: { x: 0.48, y: 0.5, r: 0.07 },
  },
  garage: {
    id: 'job-miniature-garage',
    title: garage.title,
    outcome: 'A 1:18 model-car garage configured in 3D, with fit and printability checks.',
    method: garage.contribution,
    status: garage.status,
    href: garage.href,
    mark: { x: 0.645, y: 0.36, r: 0.09 },
  },
  lab: {
    id: 'job-agent-trading-os',
    title: lab.title,
    outcome: 'Simple agents propose paper trades, and every step is recorded for replay.',
    method: lab.role,
    status: 'Experiment',
    href: '/lab',
    mark: { x: 0.865, y: 0.53, r: 0.07 },
  },
} satisfies Record<string, Job>;

export const sites: Site[] = [
  {
    id: 'river',
    anchors: ['overview', 'about'],
    label: 'River',
    job: overview.title,
    status: glance[0].value,
    heading: site.name,
    mark: { x: 0.59, y: 0.33, r: 0.14 },
    body: { kind: 'intro', name: site.name, role: overview.title, statement: overview.statement, next: `Next site: ${smp.title}` },
  },
  {
    id: 'brickell',
    anchors: ['projects'],
    label: 'Brickell',
    job: smp.title,
    status: smp.status,
    heading: 'Featured job',
    mark: jobs.smp.mark,
    body: { kind: 'jobs', jobs: [jobs.smp] },
  },
  {
    id: 'downtown',
    anchors: ['more-projects'],
    label: 'Downtown',
    job: 'Three more jobs',
    status: 'Prototypes and an experiment',
    heading: 'More jobs',
    mark: jobs.garage.mark,
    body: { kind: 'jobs', jobs: [jobs.aac, jobs.garage, jobs.lab] },
  },
  {
    id: 'bay',
    anchors: ['expertise'],
    label: 'Biscayne Bay',
    job: 'How I work',
    status: 'Five steps on every job',
    heading: 'How I work',
    mark: { x: 0.56, y: 0.45, r: 0.1 },
    body: { kind: 'punch', items: method.map((m, i) => ({ id: `punch-${i + 1}`, step: m.step, line: m.work[0].text })) },
  },
  {
    id: 'beach',
    anchors: ['experience', 'exp-dlsg', 'exp-globenet'],
    label: 'The Beach',
    job: 'Crew log',
    status: `${dlsg.title} since ${dlsg.start[0]}`,
    heading: 'Experience',
    mark: { x: 0.585, y: 0.47, r: 0.1 },
    body: {
      kind: 'log',
      entries: [
        { id: 'log-dlsg', name: dlsg.organization, line: dlsg.title, period: plain(dlsg.period) },
        { id: 'log-globenet', name: globenet.organization, line: globenet.title, period: plain(globenet.period) },
        ...education.map((e, i) => ({ id: `log-edu-${i + 1}`, name: e.name, line: e.issuer, period: '' })),
        { id: 'log-languages', name: 'Languages', line: languages, period: '' },
      ],
    },
  },
  {
    id: 'sunset',
    anchors: ['contact'],
    label: 'Sunset Harbour',
    job: 'Handover',
    status: 'Open to new roles',
    heading: 'Handover',
    mark: { x: 0.625, y: 0.36, r: 0.1 },
    body: { kind: 'handover', heading: contact.heading, body: contact.body },
  },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/survey/__tests__/sites.test.ts`
Expected: PASS (8 tests). If "uses no em or en dashes" fails, the failing string comes from content; wrap that field in `plain(...)` in `sites.ts`, never edit `content.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/survey/sites.ts src/survey/__tests__/sites.test.ts
git commit -m "feat(survey): six survey sites built from the portfolio content"
```

---

### Task 2: Geometry

**Files:**
- Create: `src/survey/geometry.ts`
- Test: `src/survey/__tests__/geometry.test.ts`

**Interfaces:**
- Consumes: `coverDraw`, `toScreen`, `DrawRect` from `src/flight/crop.ts`; `flight`, `FlightStop` from `src/flight/flightData.ts`; `Mark` from Task 1.
- Produces:
  - `interface Viewport { w: number; h: number; phone: boolean }`
  - `const PHONE_QUERY = '(max-width: 767px)'`
  - `interface Point { x: number; y: number }`
  - `interface PlacedMark { cx: number; cy: number; r: number; offscreen: 'left' | 'right' | null }`
  - `filmRect(vp: Viewport): DrawRect`
  - `phoneX(x: number, stop: FlightStop): number`
  - `placeMark(mark: Mark, stop: FlightStop, vp: Viewport): PlacedMark`
  - `ringPath(cx: number, cy: number, r: number): string`
  - `leaderPath(from: Point, ring: PlacedMark, dir: 'right' | 'up'): string`
  - `checkPath(x: number, y: number, size: number): string`
  - `arrowPath(side: 'left' | 'right', y: number, vp: Viewport): string`

- [ ] **Step 1: Write the failing test**

```ts
// src/survey/__tests__/geometry.test.ts
import { describe, expect, it } from 'vitest';
import { coverDraw, toScreen } from '@/flight/crop';
import { flight } from '@/flight/flightData';
import { sites } from '../sites';
import { arrowPath, checkPath, filmRect, leaderPath, phoneX, placeMark, ringPath, type Viewport } from '../geometry';

const points = (d: string) => [...d.matchAll(/-?\d+(\.\d+)?/g)].map((m) => Number(m[0]));
const pairs = (d: string) => {
  const n = points(d);
  const out: [number, number][] = [];
  for (let i = 0; i + 1 < n.length; i += 2) out.push([n[i], n[i + 1]]);
  return out;
};
const downtown = flight.stops[2];
const jobsAt = (i: number) => {
  const b = sites[i].body;
  if (b.kind !== 'jobs') throw new Error('not a job site');
  return b.jobs;
};

describe('filmRect', () => {
  it('matches the canvas cover rule on desktop and phone', () => {
    expect(filmRect({ w: 1920, h: 1080, phone: false })).toEqual(coverDraw(flight.width, flight.height, 1920, 1080));
    expect(filmRect({ w: 390, h: 844, phone: true })).toEqual(coverDraw(flight.phoneWidth, flight.height, 390, 844));
  });
});

describe('phoneX', () => {
  it('puts each stop landmark where the phone export put it', () => {
    for (const stop of flight.stops) expect(phoneX(stop.x, stop)).toBeCloseTo(stop.phoneX, 3);
  });
});

describe('placeMark', () => {
  it.each([
    [1280, 720],
    [1920, 1080],
    [2560, 1080],
  ])('keeps the ring on its landmark at %ix%i', (w, h) => {
    const vp: Viewport = { w, h, phone: false };
    for (const [i, stop] of flight.stops.entries()) {
      const placed = placeMark(sites[i].mark, stop, vp);
      const expected = toScreen(filmRect(vp), sites[i].mark.x, sites[i].mark.y);
      expect(placed.cx).toBeCloseTo(expected.x);
      expect(placed.cy).toBeCloseTo(expected.y);
      expect(placed.r).toBeCloseTo(sites[i].mark.r * filmRect(vp).dh);
      expect(placed.offscreen).toBeNull();
    }
  });

  it('flags Downtown landmarks that fall outside the phone crop', () => {
    const vp: Viewport = { w: 390, h: 844, phone: true };
    const [aac, garage, lab] = jobsAt(2).map((j) => placeMark(j.mark, downtown, vp));
    expect(aac.offscreen).toBe('left');
    expect(garage.offscreen).toBeNull();
    expect(lab.offscreen).toBe('right');
  });
});

describe('ringPath', () => {
  it('draws one continuous loop that overshoots its start, close to the radius', () => {
    const d = ringPath(500, 300, 80);
    expect(d.startsWith('M')).toBe(true);
    expect(d.match(/M/g)).toHaveLength(1);
    const pts = pairs(d);
    expect(pts.length).toBeGreaterThan(40);
    for (const [x, y] of pts) {
      const dist = Math.hypot(x - 500, y - 300);
      expect(dist).toBeGreaterThan(80 * 0.9);
      expect(dist).toBeLessThan(80 * 1.1);
    }
  });
});

describe('leaderPath', () => {
  const ring = { cx: 900, cy: 300, r: 60, offscreen: null } as const;

  it('runs right from the note, then ends on the ring', () => {
    const pts = pairs(leaderPath({ x: 400, y: 500 }, ring, 'right'));
    expect(pts[0]).toEqual([400, 500]);
    const [ex, ey] = pts[pts.length - 1];
    expect(Math.hypot(ex - 900, ey - 300)).toBeCloseTo(60, 0);
  });

  it('runs up from the note on phones', () => {
    const pts = pairs(leaderPath({ x: 195, y: 600 }, ring, 'up'));
    expect(pts[1][0]).toBeCloseTo(195);
    expect(pts[1][1]).toBeLessThan(600);
  });
});

describe('checkPath and arrowPath', () => {
  it('draws a two-stroke check inside its box', () => {
    for (const [x, y] of pairs(checkPath(100, 200, 18))) {
      expect(x).toBeGreaterThanOrEqual(100);
      expect(x).toBeLessThanOrEqual(118);
      expect(y).toBeGreaterThanOrEqual(200);
      expect(y).toBeLessThanOrEqual(218);
    }
  });

  it('points the edge arrow off the side it names, inside the viewport', () => {
    const vp: Viewport = { w: 390, h: 844, phone: true };
    const right = pairs(arrowPath('right', 300, vp));
    const left = pairs(arrowPath('left', 300, vp));
    for (const [x] of [...right, ...left]) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(390);
    }
    expect(Math.max(...right.map(([x]) => x))).toBeGreaterThan(390 - 30);
    expect(Math.min(...left.map(([x]) => x))).toBeLessThan(30);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/survey/__tests__/geometry.test.ts`
Expected: FAIL, `Failed to resolve import "../geometry"`.

- [ ] **Step 3: Write the implementation**

```ts
// src/survey/geometry.ts
import { coverDraw, toScreen, type DrawRect } from '@/flight/crop';
import { flight, type FlightStop } from '@/flight/flightData';
import type { Mark } from './sites';

export interface Viewport {
  w: number;
  h: number;
  phone: boolean;
}

export interface Point {
  x: number;
  y: number;
}

export interface PlacedMark {
  cx: number;
  cy: number;
  r: number;
  /** Set when the landmark lies outside the visible film (phone crops). */
  offscreen: 'left' | 'right' | null;
}

export const PHONE_QUERY = '(max-width: 767px)';

const f = (n: number) => n.toFixed(1);

/** Where the film is drawn for this viewport: the same cover rule the canvas uses. */
export function filmRect(vp: Viewport): DrawRect {
  return coverDraw(vp.phone ? flight.phoneWidth : flight.width, flight.height, vp.w, vp.h);
}

/**
 * A desktop-frame x fraction as a fraction of the phone frame. The phone set is
 * cropped per stop so the stop's landmark sits at `phoneX` (tools/flight/export_site.py).
 */
export function phoneX(x: number, stop: FlightStop): number {
  const left = stop.x * flight.width - stop.phoneX * flight.phoneWidth;
  return (x * flight.width - left) / flight.phoneWidth;
}

export function placeMark(mark: Mark, stop: FlightStop, vp: Viewport): PlacedMark {
  const rect = filmRect(vp);
  const p = toScreen(rect, vp.phone ? phoneX(mark.x, stop) : mark.x, mark.y);
  const offscreen = p.x < 0 ? 'left' : p.x > vp.w ? 'right' : null;
  return { cx: p.x, cy: p.y, r: mark.r * rect.dh, offscreen };
}

/**
 * A surveyor's ring: one continuous stroke that starts upper-left, goes once
 * around with a slight hand wobble, and overshoots its start.
 */
export function ringPath(cx: number, cy: number, r: number): string {
  const steps = 48;
  const start = (-110 * Math.PI) / 180;
  const sweep = (380 * Math.PI) / 180;
  let d = '';
  for (let i = 0; i <= steps; i += 1) {
    const a = start + (sweep * i) / steps;
    const rr = r * (1 + 0.035 * Math.sin(3 * a + 0.6)) * (1 + 0.04 * (i / steps));
    d += `${i === 0 ? 'M' : 'L'}${f(cx + rr * Math.cos(a))} ${f(cy + rr * Math.sin(a))}`;
  }
  return d;
}

/** Leader from a note to the ring: a short shoulder out of the note, then straight to the ring's edge. */
export function leaderPath(from: Point, ring: PlacedMark, dir: 'right' | 'up'): string {
  const shoulder = dir === 'right' ? { x: from.x + 28, y: from.y } : { x: from.x, y: from.y - 24 };
  const a = Math.atan2(shoulder.y - ring.cy, shoulder.x - ring.cx);
  const ex = ring.cx + ring.r * Math.cos(a);
  const ey = ring.cy + ring.r * Math.sin(a);
  return `M${f(from.x)} ${f(from.y)}L${f(shoulder.x)} ${f(shoulder.y)}L${f(ex)} ${f(ey)}`;
}

/** A check mark in a size x size box whose top-left corner is (x, y). */
export function checkPath(x: number, y: number, size: number): string {
  return `M${f(x)} ${f(y + size * 0.55)}L${f(x + size * 0.38)} ${f(y + size)}L${f(x + size)} ${f(y)}`;
}

/** An arrow at the screen edge pointing toward a landmark the crop hides. */
export function arrowPath(side: 'left' | 'right', y: number, vp: Viewport): string {
  const tip = side === 'right' ? vp.w - 16 : 16;
  const tail = side === 'right' ? tip - 44 : tip + 44;
  const back = side === 'right' ? tip - 10 : tip + 10;
  return `M${f(tail)} ${f(y)}L${f(tip)} ${f(y)}M${f(back)} ${f(y - 8)}L${f(tip)} ${f(y)}L${f(back)} ${f(y + 8)}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/survey/__tests__/geometry.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/survey/geometry.ts src/survey/__tests__/geometry.test.ts
git commit -m "feat(survey): map landmarks to the screen and draw ink paths"
```

---

### Task 3: Scroll phases

**Files:**
- Create: `src/survey/progress.ts`
- Test: `src/survey/__tests__/progress.test.ts`

**Interfaces:**
- Consumes: `Span` from `src/flight/flightTarget.ts` (`{ top: number; bottom: number }`, viewport px).
- Produces:
  - `type Phase = 'transit' | 'drawing' | 'settled' | 'lifting'`
  - `interface SitePhase { stop: number; phase: Phase; ink: number; lift: number; inside: boolean }`
  - `const DRAW = 0.3`, `const LIFT = 0.18`
  - `sitePhase(spans: (Span | null)[], vh: number): SitePhase`
  - `interface InkStyle { ink: number; lift: number; focus: number }`
  - `inkStyle(p: SitePhase, motion: boolean): InkStyle`

A site "holds" while its section covers the whole viewport (its sticky frame is stuck). Of that hold, the first `DRAW` share draws the ink, the last `LIFT` share lifts it.

- [ ] **Step 1: Write the failing test**

```ts
// src/survey/__tests__/progress.test.ts
import { describe, expect, it } from 'vitest';
import { DRAW, LIFT, inkStyle, sitePhase } from '../progress';

const VH = 1000;
/** Two 2200px sites with a 900px gap, scrolled by `y`. */
const layout = (y: number) => [
  { top: 0 - y, bottom: 2200 - y },
  { top: 3100 - y, bottom: 5300 - y },
];
const HOLD = 2200 - VH;

describe('sitePhase', () => {
  it('starts drawing as soon as the first site holds', () => {
    expect(sitePhase(layout(0), VH)).toMatchObject({ stop: 0, phase: 'drawing', ink: 0, lift: 0, inside: true });
  });

  it('draws in proportion to the hold, then settles', () => {
    expect(sitePhase(layout(HOLD * DRAW * 0.5), VH).ink).toBeCloseTo(0.5);
    expect(sitePhase(layout(HOLD * 0.5), VH)).toMatchObject({ phase: 'settled', ink: 1, lift: 0 });
  });

  it('lifts during the last part of the hold', () => {
    const p = sitePhase(layout(HOLD * (1 - LIFT * 0.5)), VH);
    expect(p.phase).toBe('lifting');
    expect(p.lift).toBeCloseTo(0.5);
    expect(p.ink).toBe(1);
  });

  it('is in transit in the gap, keeping the previous site until the next passes mid-screen', () => {
    expect(sitePhase(layout(2400), VH)).toMatchObject({ stop: 0, phase: 'transit', ink: 0 });
    expect(sitePhase(layout(2700), VH)).toMatchObject({ stop: 1, phase: 'transit' });
  });

  it('is reversible: the same scroll position gives the same phase', () => {
    const y = HOLD * 0.1;
    expect(sitePhase(layout(y), VH)).toEqual(sitePhase(layout(y), VH));
  });

  it('skips missing sections', () => {
    expect(sitePhase([null, { top: 0, bottom: 2200 }], VH)).toMatchObject({ stop: 1, phase: 'drawing' });
  });

  it('reports whether the reading line is inside the current site', () => {
    // At 1500 the first site has stopped holding (its bottom is at 700) but still covers mid-screen.
    expect(sitePhase(layout(1500), VH).inside).toBe(true);
    expect(sitePhase(layout(2400), VH).inside).toBe(false);
  });
});

describe('inkStyle', () => {
  it('racks focus with the ink and releases it with the lift', () => {
    expect(inkStyle(sitePhase(layout(HOLD * DRAW * 0.5), VH), true).focus).toBeCloseTo(0.5);
    expect(inkStyle(sitePhase(layout(HOLD * 0.5), VH), true).focus).toBe(1);
    expect(inkStyle(sitePhase(layout(HOLD * (1 - LIFT * 0.5)), VH), true).focus).toBeCloseTo(0.5);
  });

  it('with motion off shows the ink whole while the site is under the reading line, without blur', () => {
    // Still mode: sections are one viewport tall with no gaps.
    const still = [
      { top: -300, bottom: 700 },
      { top: 700, bottom: 1700 },
    ];
    expect(inkStyle(sitePhase(still, VH), false)).toEqual({ ink: 1, lift: 0, focus: 0 });
    expect(inkStyle(sitePhase(layout(2400), VH), false)).toEqual({ ink: 0, lift: 0, focus: 0 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/survey/__tests__/progress.test.ts`
Expected: FAIL, `Failed to resolve import "../progress"`.

- [ ] **Step 3: Write the implementation**

```ts
// src/survey/progress.ts
import type { Span } from '@/flight/flightTarget';

export type Phase = 'transit' | 'drawing' | 'settled' | 'lifting';

export interface SitePhase {
  /** The site the title block shows. */
  stop: number;
  phase: Phase;
  /** Ink drawn, 0 to 1. */
  ink: number;
  /** Ink lifted away, 0 to 1. */
  lift: number;
  /** The reading line (mid-viewport) is inside the current site's section. */
  inside: boolean;
}

export interface InkStyle {
  ink: number;
  lift: number;
  /** Film rack focus: 0 sharp, 1 softened behind the ink. */
  focus: number;
}

/** Share of a site's hold spent drawing its ink. */
export const DRAW = 0.3;
/** Share of a site's hold spent lifting its ink. */
export const LIFT = 0.18;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Where the survey is for the current layout. `spans` are the site sections'
 * viewport rects in page order (null if missing). A site holds while its
 * section covers the whole viewport; anywhere else the camera is in transit.
 */
export function sitePhase(spans: (Span | null)[], vh: number): SitePhase {
  const line = vh * 0.5;
  let stop = -1;
  for (let i = 0; i < spans.length; i += 1) {
    const s = spans[i];
    if (!s) continue;
    if (stop < 0 || s.top <= line) stop = i;
    if (s.top <= 0 && s.bottom >= vh) {
      const hold = Math.max(1, s.bottom - s.top - vh);
      const h = clamp01(-s.top / hold);
      if (h < DRAW) return { stop: i, phase: 'drawing', ink: h / DRAW, lift: 0, inside: true };
      if (h > 1 - LIFT) return { stop: i, phase: 'lifting', ink: 1, lift: (h - (1 - LIFT)) / LIFT, inside: true };
      return { stop: i, phase: 'settled', ink: 1, lift: 0, inside: true };
    }
  }
  const current = Math.max(0, stop);
  const span = spans[current];
  const inside = !!span && span.top <= line && span.bottom >= line;
  return { stop: current, phase: 'transit', ink: 0, lift: 0, inside };
}

/** CSS values for a phase. With motion off the ink is whole whenever its site is being read, and the film never blurs. */
export function inkStyle(p: SitePhase, motion: boolean): InkStyle {
  if (!motion) return { ink: p.inside ? 1 : 0, lift: 0, focus: 0 };
  const focus = p.phase === 'transit' ? 0 : p.phase === 'drawing' ? p.ink : 1 - p.lift;
  return { ink: p.ink, lift: p.lift, focus };
}
```

Note: the loop's first-site rule (`stop < 0 ||`) makes the first non-null section the default before anything passes the line; `skips missing sections` relies on it.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/survey/__tests__/progress.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/survey/progress.ts src/survey/__tests__/progress.test.ts
git commit -m "feat(survey): scroll phases for drawing, holding, and lifting ink"
```

---

### Task 4: Film and film state

**Files:**
- Create: `src/survey/filmState.ts`, `src/survey/dom.ts`, `src/survey/SurveyFilm.tsx`
- Test: `src/survey/__tests__/filmState.test.ts`, `src/survey/__tests__/SurveyFilm.test.tsx`

**Interfaces:**
- Consumes: `FrameStore` (`new FrameStore<T>({ frameCount, load, onLoad })`, `.start()`, `.setPlayhead(i)`, `.nearest(i) → { index, frame } | null`, `.dispose()`), `flightTarget(spans, vh, stopFrames) → { frame, stop }`, `coverDraw`, `POSTER_FRAME`, `flight`, `PHONE_QUERY` (Task 2).
- Produces:
  - `filmState.ts`: `AT_STOP = 2`; `setDrawnFrame(frame: number): void`; `stopAt(frame: number): number` (stop index or -1); `useFilmStop(): number`.
  - `dom.ts`: `siteSpans(ids: string[]): (Span | null)[]` (rects of `[data-site="<id>"]`); `useMatches(query: string): boolean`.
  - `SurveyFilm({ motion, siteIds }: { motion: boolean; siteIds: string[] })` default export: fixed full-bleed film, `aria-hidden`, class `survey-film`, poster `img.survey-film__poster`, `canvas.survey-film__canvas`. Calls `setDrawnFrame` with the frame index it actually painted.

- [ ] **Step 1: Write the failing tests**

```ts
// src/survey/__tests__/filmState.test.ts
import { describe, expect, it } from 'vitest';
import { flight } from '@/flight/flightData';
import { AT_STOP, stopAt } from '../filmState';

describe('stopAt', () => {
  it('names the stop the film is showing, within a couple of frames', () => {
    flight.stops.forEach((s, i) => {
      expect(stopAt(s.frame)).toBe(i);
      expect(stopAt(s.frame + AT_STOP)).toBe(i);
    });
  });

  it('is -1 while flying between stops or before anything is drawn', () => {
    expect(stopAt((flight.stops[0].frame + flight.stops[1].frame) / 2)).toBe(-1);
    expect(stopAt(-1)).toBe(-1);
  });
});
```

```tsx
// src/survey/__tests__/SurveyFilm.test.tsx
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { POSTER_FRAME } from '@/flight/poster';

const desktopWindow = { innerHeight: 900, innerWidth: 1440, matchMedia: () => ({ matches: false }) };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SurveyFilm', () => {
  it('renders a hidden full-bleed film that starts on the poster frame', async () => {
    vi.stubGlobal('window', desktopWindow);
    const { default: SurveyFilm } = await import('../SurveyFilm');
    const out = renderToStaticMarkup(<SurveyFilm motion siteIds={['river']} />);
    expect(out).toContain('class="survey-film" aria-hidden="true"');
    expect(out).toContain('survey-film__canvas');
    expect(out).toContain(`flight/desktop/f${String(POSTER_FRAME).padStart(3, '0')}.webp`);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/survey/__tests__/filmState.test.ts src/survey/__tests__/SurveyFilm.test.tsx`
Expected: FAIL, unresolved imports `../filmState` and `../SurveyFilm`.

- [ ] **Step 3: Write `filmState.ts` and `dom.ts`**

```ts
// src/survey/filmState.ts
import { useSyncExternalStore } from 'react';
import { flight } from '@/flight/flightData';

const STOP_FRAMES = flight.stops.map((s) => s.frame);
/** Frames from a stop that still count as "at the stop" (coarse-to-fine loading may hold a neighbour). */
export const AT_STOP = 2;

let drawn = -1;
const subscribers = new Set<() => void>();

/** The film reports the frame it actually painted. */
export function setDrawnFrame(frame: number): void {
  if (frame === drawn) return;
  drawn = frame;
  subscribers.forEach((fn) => fn());
}

export function stopAt(frame: number): number {
  if (frame < 0) return -1;
  return STOP_FRAMES.findIndex((f) => Math.abs(frame - f) <= AT_STOP);
}

function subscribe(fn: () => void) {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

/** The stop the film is showing right now, or -1 while it flies. Changes only at stops, so it rarely re-renders. */
export function useFilmStop(): number {
  return useSyncExternalStore(subscribe, () => stopAt(drawn), () => -1);
}
```

```ts
// src/survey/dom.ts
import { useEffect, useState } from 'react';
import type { Span } from '@/flight/flightTarget';

/** Viewport rects of the site sections, in the order of `ids` (null when a section is missing). */
export function siteSpans(ids: string[]): (Span | null)[] {
  return ids.map((id) => {
    const r = document.querySelector(`[data-site="${id}"]`)?.getBoundingClientRect();
    return r ? { top: r.top, bottom: r.bottom } : null;
  });
}

export function useMatches(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = () => setMatches(list.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}
```

- [ ] **Step 4: Write `SurveyFilm.tsx`**

Adapted from `src/flight/FlightBackdrop.tsx` with the window/HUD/veil removed: always full-bleed, always the cover rule from `crop.ts` (the same rule `geometry.filmRect` uses, so ink and film agree).

```tsx
// src/survey/SurveyFilm.tsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { coverDraw } from '@/flight/crop';
import { flight } from '@/flight/flightData';
import { flightTarget } from '@/flight/flightTarget';
import { FrameStore } from '@/flight/FrameStore';
import { POSTER_FRAME } from '@/flight/poster';
import { siteSpans, useMatches } from './dom';
import { setDrawnFrame } from './filmState';
import { PHONE_QUERY } from './geometry';

const base = import.meta.env.BASE_URL;
const pad = (n: number) => String(n).padStart(3, '0');
const STOP_FRAMES = flight.stops.map((s) => s.frame);
/** Seconds for the drawn frame to catch up with the scroll position. */
const LAG = 0.12;

function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  return img.decode().then(() => img);
}

/**
 * The flight, full-bleed behind the survey. It holds still while a site's
 * section covers the reading line and flies across the gaps between sites,
 * driven by scroll. With motion off it shows one still per site.
 */
export default function SurveyFilm({ motion, siteIds }: { motion: boolean; siteIds: string[] }) {
  const phone = useMatches(PHONE_QUERY);
  const root = useRef<HTMLDivElement>(null);
  const set = phone ? 'phone' : 'desktop';

  useEffect(() => {
    // Registered here, not at import, so node tests can import this module without a DOM.
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
    let still: { img: HTMLImageElement; frame: number } | null = null;
    let disposed = false;

    const paint = (img: HTMLImageElement, frame: number) => {
      const r = coverDraw(srcW, srcH, w, h);
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, r.dx, r.dy, r.dw, r.dh);
      poster.style.visibility = 'hidden';
      painted = frame;
      setDrawnFrame(frame);
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
        still = { img, frame: STOP_FRAMES[i] };
        paint(img, STOP_FRAMES[i]);
      }, () => {});
    };

    function tick(now: number) {
      raf = 0;
      const target = flightTarget(siteSpans(siteIds), window.innerHeight, STOP_FRAMES);
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
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingQuality = 'high';
      painted = -1;
      if (still) paint(still.img, still.frame);
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
      setDrawnFrame(-1);
    };
  }, [phone, set, motion, siteIds]);

  return (
    <div ref={root} className="survey-film" aria-hidden="true">
      <img className="survey-film__poster" src={`${base}flight/${set}/f${pad(POSTER_FRAME)}.webp`} alt="" fetchPriority="high" />
      <canvas className="survey-film__canvas" />
    </div>
  );
}
```

`siteIds` must be a stable array (a module constant in `SurveyLanding`), or the effect restarts every render.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/survey/__tests__/filmState.test.ts src/survey/__tests__/SurveyFilm.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/survey/filmState.ts src/survey/dom.ts src/survey/SurveyFilm.tsx src/survey/__tests__/filmState.test.ts src/survey/__tests__/SurveyFilm.test.tsx
git commit -m "feat(survey): full-bleed film that reports the frame it shows"
```

---

### Task 5: Redline ink layer

**Files:**
- Create: `src/survey/RedlineLayer.tsx`, `src/survey/survey.css`
- Test: `src/survey/__tests__/RedlineLayer.test.tsx`

**Interfaces:**
- Consumes: `placeMark`, `ringPath`, `leaderPath`, `checkPath`, `arrowPath`, `Viewport`, `Point` (Task 2); `Site`, `Mark` (Task 1); `flight`.
- Produces:
  - `type Anchors = Record<string, Point>` (note anchor points in viewport px, keyed by note id)
  - `inkFor(site: Site): { id: string; mark: Mark }[]`
  - `RedlineLayer({ site, index, anchors, vp, ready })` default export: `svg.redline` (`aria-hidden`), class `is-ready` when `ready`. Every stroke is a `path.ink` with `pathLength="1"` and inline `--from` / `--to` (its slice of `--ink`).
  - `survey.css`: tokens, film, falloff, and ink rules (later tasks append).

The ink for a site: for job sites one ring per job, led from that job's note (anchor id = job id); for other sites the site ring, led from the site's first note (anchor id = `site.id`). Punch items get a check each (anchor id = item id). Marks the crop hides get an edge arrow instead of a ring.

- [ ] **Step 1: Write the failing test**

```tsx
// src/survey/__tests__/RedlineLayer.test.tsx
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import RedlineLayer, { inkFor } from '../RedlineLayer';
import { sites } from '../sites';

const desktop = { w: 1440, h: 900, phone: false };
const phone = { w: 390, h: 844, phone: true };

describe('inkFor', () => {
  it('rings each job on job sites and the site landmark elsewhere', () => {
    expect(inkFor(sites[2]).map((m) => m.id)).toEqual(['job-aac-communication-app', 'job-miniature-garage', 'job-agent-trading-os']);
    expect(inkFor(sites[0]).map((m) => m.id)).toEqual(['river']);
  });
});

describe('RedlineLayer', () => {
  it('is decorative to assistive tech', () => {
    const out = renderToStaticMarkup(<RedlineLayer site={sites[0]} index={0} anchors={{}} vp={desktop} ready={false} />);
    expect(out).toMatch(/^<svg class="redline" aria-hidden="true"/);
  });

  it('draws a ring per mark and a leader only where a note anchor exists', () => {
    const out = renderToStaticMarkup(
      <RedlineLayer site={sites[2]} index={2} anchors={{ 'job-miniature-garage': { x: 500, y: 400 } }} vp={desktop} ready />,
    );
    expect(out).toContain('class="redline is-ready"');
    expect(out.match(/ink--ring/g)).toHaveLength(3);
    expect(out.match(/ink--leader/g)).toHaveLength(1);
  });

  it('gives each mark its own slice of the draw', () => {
    const out = renderToStaticMarkup(<RedlineLayer site={sites[2]} index={2} anchors={{}} vp={desktop} ready />);
    const froms = [...out.matchAll(/ink--ring"[^>]*--from:([\d.]+)/g)].map((m) => Number(m[1]));
    expect(froms).toHaveLength(3);
    expect(froms[0]).toBeLessThan(froms[1]);
    expect(froms[1]).toBeLessThan(froms[2]);
  });

  it('points an edge arrow at landmarks the phone crop hides', () => {
    const out = renderToStaticMarkup(<RedlineLayer site={sites[2]} index={2} anchors={{}} vp={phone} ready />);
    expect(out.match(/ink--arrow/g)).toHaveLength(2);
    expect(out.match(/ink--ring/g)).toHaveLength(1);
  });

  it('checks off each punch item that has an anchor', () => {
    const out = renderToStaticMarkup(
      <RedlineLayer site={sites[3]} index={3} anchors={{ 'punch-1': { x: 60, y: 300 }, 'punch-2': { x: 60, y: 340 } }} vp={desktop} ready />,
    );
    expect(out.match(/ink--check/g)).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/survey/__tests__/RedlineLayer.test.tsx`
Expected: FAIL, `Failed to resolve import "../RedlineLayer"`.

- [ ] **Step 3: Write `RedlineLayer.tsx`**

```tsx
// src/survey/RedlineLayer.tsx
import type { CSSProperties } from 'react';
import { flight } from '@/flight/flightData';
import { arrowPath, checkPath, leaderPath, placeMark, ringPath, type Point, type Viewport } from './geometry';
import type { Mark, Site } from './sites';

export type Anchors = Record<string, Point>;

/** The marks a site rings, each with the id of the note its leader starts from. */
export function inkFor(site: Site): { id: string; mark: Mark }[] {
  if (site.body.kind === 'jobs') return site.body.jobs.map((j) => ({ id: j.id, mark: j.mark }));
  return [{ id: site.id, mark: site.mark }];
}

/** Inline custom properties: this stroke draws while --ink runs from `from` to `to`. */
const slice = (from: number, to: number) => ({ '--from': from.toFixed(3), '--to': to.toFixed(3) }) as unknown as CSSProperties;

/**
 * The redline markup over the film for one site. Strokes draw from the
 * --ink custom property set on the survey root by scroll; the layer only
 * shows once the film is actually on this site's stop frame (`ready`).
 */
export default function RedlineLayer({ site, index, anchors, vp, ready }: { site: Site; index: number; anchors: Anchors; vp: Viewport; ready: boolean }) {
  const stop = flight.stops[index];
  const marks = inkFor(site);
  const share = 1 / marks.length;
  const dir = vp.phone ? 'up' : 'right';

  return (
    <svg className={`redline${ready ? ' is-ready' : ''}`} aria-hidden="true" width={vp.w} height={vp.h} viewBox={`0 0 ${vp.w} ${vp.h}`}>
      {marks.map(({ id, mark }, i) => {
        const placed = placeMark(mark, stop, vp);
        const at = (a: number, b: number) => slice(i * share + a * share, i * share + b * share);
        if (placed.offscreen) {
          return <path key={id} className="ink ink--arrow" pathLength={1} d={arrowPath(placed.offscreen, Math.min(vp.h - 140, Math.max(120, placed.cy)), vp)} style={at(0, 1)} />;
        }
        const anchor = anchors[id];
        return (
          <g key={id}>
            <circle className="ink-pulse" cx={placed.cx} cy={placed.cy} r={placed.r} style={at(0, 0.2)} />
            <path className="ink ink--ring" pathLength={1} d={ringPath(placed.cx, placed.cy, placed.r)} style={at(0.15, 0.7)} />
            {anchor && <path className="ink ink--leader" pathLength={1} d={leaderPath(anchor, placed, dir)} style={at(0.7, 1)} />}
          </g>
        );
      })}
      {site.body.kind === 'punch' &&
        site.body.items.map((item, i) => {
          const a = anchors[item.id];
          if (!a) return null;
          const start = 0.35 + i * 0.12;
          return <path key={item.id} className="ink ink--check" pathLength={1} d={checkPath(a.x - 28, a.y - 9, 18)} style={slice(start, start + 0.1)} />;
        })}
    </svg>
  );
}
```

- [ ] **Step 4: Write `survey.css` (tokens, film, falloff, ink)**

```css
/* src/survey/survey.css — the Site Survey landing. Scroll sets --ink, --lift and --focus on .survey. */
.survey {
  --ink-red: #ff5b3d;
  --field: #f3f4f6;
  --field-2: rgba(243, 244, 246, 0.74);
  --rule: rgba(243, 244, 246, 0.26);
  --dusk: #0b0d18;
  --f-display: "Archivo", system-ui, sans-serif;
  --f-note: "B612", "Archivo", system-ui, sans-serif;
  --tb-h: 176px;
  position: relative;
  color: var(--field);
  font-family: var(--f-display);
}

/* Film: fixed, full-bleed. Racks focus softly behind the ink. */
.survey-film { position: fixed; inset: 0; z-index: 0; overflow: hidden; background: var(--dusk); pointer-events: none; }
.survey-film__poster, .survey-film__canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.survey-film__poster { object-fit: cover; }
.survey-film__canvas { filter: blur(calc(var(--focus, 0) * 2px)) brightness(calc(1 - var(--focus, 0) * 0.22)); }

/* Readability: dark falloff only where text sits (notes column, title block). */
.survey__falloff {
  position: fixed; inset: 0; z-index: 1; pointer-events: none;
  background:
    linear-gradient(90deg, rgba(11, 13, 24, 0.8) 0, rgba(11, 13, 24, 0.58) min(560px, 40vw), rgba(11, 13, 24, 0) min(880px, 64vw)),
    linear-gradient(0deg, rgba(11, 13, 24, 0.66) 0, rgba(11, 13, 24, 0) 42%);
}

/* Ink. Each stroke draws while --ink crosses its own --from..--to slice. */
.redline { position: fixed; inset: 0; z-index: 2; pointer-events: none; opacity: 0; transition: opacity 180ms ease-out; }
.redline.is-ready { opacity: calc(1 - var(--lift, 0)); }
.ink {
  --p: clamp(0, (var(--ink, 1) - var(--from)) / (var(--to) - var(--from)), 1);
  fill: none; stroke: var(--ink-red); stroke-width: 2.25; stroke-linecap: round; stroke-linejoin: round;
  stroke-dasharray: 1; stroke-dashoffset: calc(1 - var(--p));
}
.ink--leader { stroke-width: 1.5; }
.ink-pulse {
  --p: clamp(0, (var(--ink, 1) - var(--from)) / (var(--to) - var(--from)), 1);
  fill: none; stroke: var(--ink-red); stroke-width: 1.5;
  transform-box: fill-box; transform-origin: center;
  transform: scale(calc(0.35 + var(--p) * 0.9));
  opacity: calc(min(1, var(--p) * 6) * (1 - var(--p)));
}

/* Motion off: whole ink, faded in; no pulse, no blur. */
.survey--still .ink { stroke-dashoffset: 0; }
.survey--still .ink-pulse { display: none; }
.survey--still .redline { transition-duration: 250ms; }

@media (max-width: 767px) {
  .survey { --tb-h: 92px; }
  .survey__falloff { background: linear-gradient(0deg, rgba(11, 13, 24, 0.9) 0, rgba(11, 13, 24, 0.62) 46%, rgba(11, 13, 24, 0) 72%); }
}
```

Replace the em dash in the first comment line with a colon when writing the file (no em dashes anywhere, comments included).

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/survey/__tests__/RedlineLayer.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/survey/RedlineLayer.tsx src/survey/survey.css src/survey/__tests__/RedlineLayer.test.tsx
git commit -m "feat(survey): redline ink layer drawn from scroll"
```

---

### Task 6: Title block

**Files:**
- Create: `src/survey/TitleBlock.tsx`
- Modify: `src/survey/survey.css` (append title block rules)
- Test: `src/survey/__tests__/TitleBlock.test.tsx`

**Interfaces:**
- Consumes: `Site`, `sites` (Task 1); `site` from `content.ts`; `mailto`, `profile`, `resumeUrl` from `src/data/profile.ts`; `AI_DISCLOSURE`.
- Produces: `TitleBlock({ sites, current }: { sites: Site[]; current: number })` default export. `aside.title-block` with fields Drawn by, Site (button toggling `nav#tb-sites`), Job, Status, Contact (`a.tb-email` "Email me", `a.tb-resume` "Résumé"), and `p.tb-disclosure`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/survey/__tests__/TitleBlock.test.tsx
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AI_DISCLOSURE } from '@/flight/disclosure';
import { mailto } from '@/data/profile';
import TitleBlock from '../TitleBlock';
import { sites } from '../sites';

const render = (current: number) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <TitleBlock sites={sites} current={current} />
    </MemoryRouter>,
  );

describe('TitleBlock', () => {
  it('shows the current site in fixed fields', () => {
    const out = render(1);
    expect(out).toContain('Brickell');
    expect(out).toContain('Sheet 2 of 6');
    expect(out).toContain(sites[1].job);
    expect(out).toContain(sites[1].status);
  });

  it('always offers Email me and the résumé', () => {
    for (const i of [0, 5]) {
      const out = render(i);
      expect(out).toContain(`class="tb-email" href="${mailto}"`);
      expect(out).toContain('>Email me<');
      expect(out).toContain('class="tb-resume"');
    }
  });

  it('lists every site as a link to its primary anchor, marking the current one', () => {
    const out = render(3);
    for (const s of sites) expect(out).toContain(`href="/#${s.anchors[0]}"`);
    expect(out).toMatch(/aria-current="location"[^>]*>Biscayne Bay/);
  });

  it('keeps the site list collapsed until asked', () => {
    const out = render(0);
    expect(out).toContain('aria-expanded="false"');
    expect(out).toMatch(/<nav[^>]*id="tb-sites"[^>]*hidden/);
  });

  it('carries the AI footage disclosure', () => {
    expect(render(0)).toContain(`<p class="tb-disclosure">${AI_DISCLOSURE}</p>`);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/survey/__tests__/TitleBlock.test.tsx`
Expected: FAIL, `Failed to resolve import "../TitleBlock"`.

- [ ] **Step 3: Write `TitleBlock.tsx`**

```tsx
// src/survey/TitleBlock.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { site as siteCopy } from '@/data/content';
import { mailto, profile, resumeUrl } from '@/data/profile';
import { AI_DISCLOSURE } from '@/flight/disclosure';
import type { Site } from './sites';

/**
 * The survey's title block, fixed low-left like the block on an engineering
 * drawing. Its fields never move; only their values change per site. The Site
 * field opens the sheet list (all six sites).
 */
export default function TitleBlock({ sites, current }: { sites: Site[]; current: number }) {
  const [open, setOpen] = useState(false);
  const here = sites[current];
  return (
    <aside className="title-block" aria-label="Site survey">
      <nav id="tb-sites" className="tb-sites" aria-label="Sites" hidden={!open}>
        <ol>
          {sites.map((s, i) => (
            <li key={s.id}>
              <Link to={{ pathname: '/', hash: `#${s.anchors[0]}` }} aria-current={i === current ? 'location' : undefined} onClick={() => setOpen(false)}>
                {s.label}
                <span>{s.job}</span>
              </Link>
            </li>
          ))}
        </ol>
      </nav>
      <dl className="tb-fields">
        <div className="tb-field tb-field--by">
          <dt>Drawn by</dt>
          <dd>{siteCopy.name}</dd>
        </div>
        <div className="tb-field tb-field--site">
          <dt>Site</dt>
          <dd>
            <button type="button" className="tb-site" aria-expanded={open} aria-controls="tb-sites" onClick={() => setOpen((v) => !v)}>
              {here.label}
              <span className="tb-sheet">Sheet {current + 1} of {sites.length}</span>
            </button>
          </dd>
        </div>
        <div className="tb-field tb-field--contact">
          <dt>Contact</dt>
          <dd>
            <a className="tb-email" href={mailto}>Email me</a>
            <a className="tb-resume" href={resumeUrl} download={profile.resumeFile}>Résumé</a>
          </dd>
        </div>
        <div className="tb-field tb-field--job">
          <dt>Job</dt>
          <dd>{here.job}</dd>
        </div>
        <div className="tb-field tb-field--status">
          <dt>Status</dt>
          <dd>{here.status}</dd>
        </div>
      </dl>
      <p className="tb-disclosure">{AI_DISCLOSURE}</p>
    </aside>
  );
}
```

- [ ] **Step 4: Append the title block rules to `survey.css`**

```css
/* Title block: a ruled grid, fixed low-left. */
.title-block {
  position: fixed; z-index: 4; left: var(--gutter); bottom: 20px;
  width: min(580px, calc(100vw - var(--gutter) * 2));
  border: 1px solid var(--rule); background: rgba(11, 13, 24, 0.8); color: var(--field);
}
.tb-fields {
  display: grid; margin: 0;
  grid-template-columns: 1fr 1.35fr 1fr;
  grid-template-areas: "by site contact" "job job status";
}
.tb-field { min-width: 0; padding: 9px 12px 11px; border-right: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
.tb-field:nth-child(3), .tb-field:nth-child(5) { border-right: 0; }
.tb-field--by { grid-area: by; } .tb-field--site { grid-area: site; } .tb-field--contact { grid-area: contact; }
.tb-field--job { grid-area: job; } .tb-field--status { grid-area: status; }
.tb-field dt { margin: 0 0 6px; font: 400 10px/1 var(--f-note); letter-spacing: 0.12em; text-transform: uppercase; color: var(--field-2); }
.tb-field dd { margin: 0; font: 600 15px/1.25 var(--f-display); overflow-wrap: anywhere; }
.tb-site { all: unset; cursor: pointer; display: grid; gap: 3px; font: 600 15px/1.2 var(--f-display); }
.tb-site:focus-visible, .title-block a:focus-visible { outline: 2px solid var(--ink-red); outline-offset: 3px; }
.tb-sheet { font: 400 11px/1 var(--f-note); color: var(--field-2); }
.tb-field--contact dd { display: flex; flex-wrap: wrap; gap: 4px 14px; }
.tb-email { color: var(--ink-red); font-weight: 700; text-decoration: none; border-bottom: 2px solid currentColor; }
.tb-resume { color: var(--field); text-decoration: underline; text-underline-offset: 3px; }
.tb-disclosure { margin: 0; padding: 6px 12px 7px; font: 400 10px/1.2 var(--f-note); letter-spacing: 0.04em; color: var(--field-2); }
.tb-sites { position: absolute; left: -1px; right: -1px; bottom: 100%; border: 1px solid var(--rule); border-bottom: 0; background: rgba(11, 13, 24, 0.92); }
.tb-sites ol { list-style: none; margin: 0; padding: 6px 0; }
.tb-sites a { display: flex; justify-content: space-between; gap: 16px; padding: 9px 12px; color: var(--field); text-decoration: none; font: 600 15px/1.2 var(--f-display); }
.tb-sites a span { font: 400 12px/1.2 var(--f-note); color: var(--field-2); }
.tb-sites a[aria-current] { color: var(--ink-red); }

@media (max-width: 767px) {
  .title-block { left: 0; right: 0; bottom: 0; width: auto; border-width: 1px 0 0; }
  .tb-fields { grid-template-columns: 1fr auto; grid-template-areas: "site contact"; }
  .tb-field--by, .tb-field--job, .tb-field--status { display: none; }
  .tb-field:nth-child(2) { border-right: 1px solid var(--rule); }
  .tb-disclosure { padding-bottom: calc(7px + env(safe-area-inset-bottom)); }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/survey/__tests__/TitleBlock.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/survey/TitleBlock.tsx src/survey/survey.css src/survey/__tests__/TitleBlock.test.tsx
git commit -m "feat(survey): fixed title block with site list and contact"
```

---

### Task 7: Site sections

**Files:**
- Create: `src/survey/SiteSection.tsx`
- Modify: `src/survey/survey.css` (append section and note rules)
- Test: `src/survey/__tests__/SiteSection.test.tsx`

**Interfaces:**
- Consumes: `Site`, `Job` (Task 1); `site`, `contact` from `content.ts`; `mailto`, `profile`, `resumeUrl`.
- Produces:
  - `JobNote({ job, initiallyFlipped }: { job: Job; initiallyFlipped?: boolean })` named export.
  - `SiteSection({ site }: { site: Site })` default export: `section.site.site--<id>` with `data-site="<id>"`, one zero-height `span.site__anchor` per entry in `site.anchors` (ids for hash links, placed mid-hold so links land with ink drawn), and `div.site__frame` (sticky) > `div.site__notes`. Note elements carry `data-anchor` (leader start); punch items also `data-anchor-side="left"`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/survey/__tests__/SiteSection.test.tsx
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import SiteSection, { JobNote } from '../SiteSection';
import { sites, type Job } from '../sites';

const render = (node: React.ReactNode) => renderToStaticMarkup(<MemoryRouter>{node}</MemoryRouter>);
const job = (i: number, j = 0): Job => {
  const b = sites[i].body;
  if (b.kind !== 'jobs') throw new Error('not a job site');
  return b.jobs[j];
};

describe('SiteSection', () => {
  it('renders every site as a labelled section with its hash anchors', () => {
    for (const s of sites) {
      const out = render(<SiteSection site={s} />);
      expect(out).toContain(`data-site="${s.id}"`);
      expect(out).toContain(`aria-labelledby="site-${s.id}-title"`);
      for (const a of s.anchors) expect(out).toContain(`<span class="site__anchor" id="${a}"></span>`);
    }
  });

  it('opens the River with the name as the page heading', () => {
    const out = render(<SiteSection site={sites[0]} />);
    expect(out).toMatch(/<h1 id="site-river-title"[^>]*>Jose Garcia<\/h1>/);
    expect(out).toContain('data-anchor="river"');
  });

  it('marks every job note as a leader anchor', () => {
    const out = render(<SiteSection site={sites[2]} />);
    for (let j = 0; j < 3; j += 1) expect(out).toContain(`data-anchor="${job(2, j).id}"`);
  });

  it('anchors punch checks on the left of each step', () => {
    const out = render(<SiteSection site={sites[3]} />);
    expect(out.match(/data-anchor-side="left"/g)).toHaveLength(5);
  });

  it('signs off the handover with every contact route', () => {
    const out = render(<SiteSection site={sites[5]} />);
    expect(out).toContain('Signed off');
    expect(out).toContain('>Email me<');
    expect(out).toContain('linkedin.com');
    expect(out).toContain('github.com');
  });
});

describe('JobNote', () => {
  it('leads with the outcome and keeps the method behind the flip', () => {
    const out = render(<JobNote job={job(1)} />);
    expect(out).toContain('aria-expanded="false"');
    expect(out).toContain('How it was built');
    expect(out).toMatch(new RegExp(`<p class="note__method" hidden="">`));
  });

  it('shows the method when flipped', () => {
    const out = render(<JobNote job={job(1)} initiallyFlipped />);
    expect(out).toContain('aria-expanded="true"');
    expect(out).toContain('What it does');
    expect(out).toMatch(/<p class="note__outcome" hidden="">/);
  });

  it('links to the case study', () => {
    expect(render(<JobNote job={job(1)} />)).toContain('href="/projects/service-map-planner"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/survey/__tests__/SiteSection.test.tsx`
Expected: FAIL, `Failed to resolve import "../SiteSection"`.

- [ ] **Step 3: Write `SiteSection.tsx`**

```tsx
// src/survey/SiteSection.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { contact, site as siteCopy } from '@/data/content';
import { mailto, profile, resumeUrl } from '@/data/profile';
import type { Job, Site } from './sites';

/** A job's note: outcome on the front, how it was built on the back. */
export function JobNote({ job, initiallyFlipped = false }: { job: Job; initiallyFlipped?: boolean }) {
  const [flipped, setFlipped] = useState(initiallyFlipped);
  return (
    <article className="note note--job" data-anchor={job.id} aria-labelledby={`${job.id}-title`}>
      <h3 id={`${job.id}-title`} className="note__title">{job.title}</h3>
      <p className="note__outcome" hidden={flipped}>{job.outcome}</p>
      <p className="note__method" hidden={!flipped}>{job.method}</p>
      <p className="note__meta">
        <span className="note__status">{job.status}</span>
        <button type="button" className="note__flip" aria-expanded={flipped} onClick={() => setFlipped((v) => !v)}>
          {flipped ? 'What it does' : 'How it was built'}
        </button>
        <Link to={job.href} className="note__link">
          Case study<span className="sr-only">: {job.title}</span>
        </Link>
      </p>
    </article>
  );
}

/**
 * One site of the survey. The section is tall; its frame sticks to the
 * viewport while the site holds, so the notes stay put as the ink draws to
 * them. Hash anchors sit mid-hold so links land with the ink drawn.
 */
export default function SiteSection({ site }: { site: Site }) {
  const b = site.body;
  const titleId = `site-${site.id}-title`;
  return (
    <section className={`site site--${site.id}`} data-site={site.id} aria-labelledby={titleId}>
      {site.anchors.map((a) => (
        <span key={a} className="site__anchor" id={a} />
      ))}
      <div className="site__frame">
        <div className="site__notes">
          {b.kind === 'intro' ? (
            <div className="note note--intro" data-anchor={site.id}>
              <h1 id={titleId} className="intro__name">{b.name}</h1>
              <p className="intro__role">{b.role}</p>
              <p className="intro__statement">{b.statement}</p>
              <p className="intro__next">{b.next}</p>
            </div>
          ) : (
            <>
              <h2 id={titleId} className="site__heading" data-anchor={b.kind === 'jobs' ? undefined : site.id}>
                {site.heading}
              </h2>
              {b.kind === 'jobs' && b.jobs.map((j) => <JobNote key={j.id} job={j} />)}
              {b.kind === 'punch' && (
                <ol className="punch">
                  {b.items.map((it) => (
                    <li key={it.id} data-anchor={it.id} data-anchor-side="left">
                      <strong>{it.step}</strong>
                      <span>{it.line}</span>
                    </li>
                  ))}
                </ol>
              )}
              {b.kind === 'log' && (
                <ul className="log">
                  {b.entries.map((e) => (
                    <li key={e.id}>
                      <strong>{e.name}</strong>
                      <span>{e.line}</span>
                      {e.period && <span className="log__period">{e.period}</span>}
                    </li>
                  ))}
                </ul>
              )}
              {b.kind === 'handover' && (
                <div className="handover">
                  <p className="handover__heading">{b.heading}</p>
                  <p className="handover__body">{b.body}</p>
                  <p className="handover__sign">
                    Signed off <span>{siteCopy.name}</span>
                  </p>
                  <ul className="handover__links">
                    <li><a className="tb-email" href={mailto}>Email me</a></li>
                    <li><a href={contact.linkedin}>LinkedIn</a></li>
                    <li><a href={profile.github}>GitHub</a></li>
                    <li><a href={resumeUrl} download={profile.resumeFile}>Résumé</a></li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Append section and note rules to `survey.css`**

```css
/* Sites: tall sections whose frame sticks while the site holds. Gaps are where the camera flies. */
.site { position: relative; z-index: 3; height: 220vh; height: 220svh; }
.survey__gap { height: 90vh; height: 90svh; }
.site__anchor { position: absolute; left: 0; top: calc(120svh * 0.5); width: 1px; height: 1px; scroll-margin-top: 0; }
.site__frame { position: sticky; top: 0; height: 100vh; height: 100dvh; }
.site__notes {
  position: absolute; left: var(--gutter); bottom: calc(var(--tb-h) + 32px);
  width: min(520px, calc(42vw - var(--gutter)));
  max-height: calc(100dvh - var(--header-h) - var(--tb-h) - 64px); overflow-y: auto;
  display: flex; flex-direction: column; gap: 20px;
  opacity: calc(min(1, var(--ink, 1) * 1.6) * (1 - var(--lift, 0)));
}
.survey--still .site { height: auto; min-height: 100vh; min-height: 100dvh; }
.survey--still .survey__gap { display: none; }
.survey--still .site__anchor { top: 0; }
.survey--still .site__notes { opacity: 1; }

.intro__name { margin: 0; font: 800 clamp(48px, 7vw, 104px)/0.95 var(--f-display); font-stretch: 118%; letter-spacing: -0.01em; text-wrap: balance; }
.intro__role { margin: 14px 0 0; font: 400 15px/1.3 var(--f-note); color: var(--field-2); }
.intro__statement { margin: 12px 0 0; max-width: 34ch; font: 400 clamp(17px, 1.4vw, 20px)/1.45 var(--f-display); text-wrap: pretty; }
.intro__next { margin: 18px 0 0; font: 700 13px/1.2 var(--f-note); color: var(--ink-red); }

.site__heading { margin: 0; font: 700 clamp(30px, 3.4vw, 46px)/1.02 var(--f-display); font-stretch: 112%; text-wrap: balance; }
.note__title { margin: 0; font: 700 clamp(20px, 1.8vw, 26px)/1.1 var(--f-display); font-stretch: 108%; }
.note__outcome, .note__method { margin: 8px 0 0; max-width: 46ch; font: 400 15px/1.45 var(--f-note); }
.note__method { color: var(--field); }
.note__meta { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 16px; margin: 10px 0 0; font: 400 13px/1.2 var(--f-note); color: var(--field-2); }
.note__flip { all: unset; cursor: pointer; color: var(--field); text-decoration: underline; text-underline-offset: 3px; }
.note__link { color: var(--field); text-underline-offset: 3px; }
.note__flip:focus-visible, .note__link:focus-visible, .handover a:focus-visible { outline: 2px solid var(--ink-red); outline-offset: 3px; }

.punch { list-style: none; margin: 0; padding: 0 0 0 34px; display: grid; gap: 12px; }
.punch li { display: grid; gap: 3px; }
.punch strong { font: 700 19px/1.15 var(--f-display); }
.punch span { font: 400 14px/1.4 var(--f-note); color: var(--field-2); }

.log { list-style: none; margin: 0; padding: 0; }
.log li { display: grid; grid-template-columns: 1fr auto; gap: 2px 16px; padding: 10px 0; }
.log li + li { border-top: 1px dashed var(--rule); }
.log strong { font: 700 17px/1.2 var(--f-display); }
.log span { grid-column: 1; font: 400 14px/1.35 var(--f-note); color: var(--field-2); }
.log .log__period { grid-column: 2; grid-row: 1; align-self: baseline; font-size: 13px; }

.handover__heading { margin: 0; font: 700 clamp(28px, 3vw, 40px)/1.05 var(--f-display); font-stretch: 112%; text-wrap: balance; }
.handover__body { margin: 10px 0 0; max-width: 44ch; font: 400 16px/1.5 var(--f-display); }
.handover__sign { margin: 16px 0 0; font: 400 13px/1.2 var(--f-note); color: var(--field-2); }
.handover__sign span { display: block; margin-top: 6px; padding-bottom: 4px; border-bottom: 1px solid var(--field); font: italic 700 28px/1.1 var(--f-display); color: var(--field); width: fit-content; }
.handover__links { list-style: none; display: flex; flex-wrap: wrap; gap: 8px 20px; margin: 16px 0 0; padding: 0; font: 600 15px/1.2 var(--f-display); }
.handover__links a { color: var(--field); text-underline-offset: 3px; }
.handover__links .tb-email { color: var(--ink-red); text-decoration: none; }

@media (max-width: 767px) {
  .site__notes { left: 16px; right: 16px; width: auto; bottom: calc(var(--tb-h) + 16px); max-height: calc(100dvh - var(--header-h) - var(--tb-h) - 40px); }
  .intro__name { font-size: clamp(40px, 12vw, 56px); }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/survey/__tests__/SiteSection.test.tsx`
Expected: PASS. If the `hidden=""` assertions fail, check how React 19 serializes boolean `hidden` (`hidden=""`) and adjust the regex only, not the markup.

- [ ] **Step 6: Commit**

```bash
git add src/survey/SiteSection.tsx src/survey/survey.css src/survey/__tests__/SiteSection.test.tsx
git commit -m "feat(survey): site sections with notes, punch list, crew log, and handover"
```

---

### Task 8: Landing, Home integration, fonts, cleanup

**Files:**
- Create: `src/survey/SurveyLanding.tsx`, `src/components/home/readingPlace.ts`
- Modify: `src/survey/dom.ts` (add `measureAnchors`), `src/pages/Home.tsx`, `index.html:37`, `src/flight/__tests__/disclosure.test.tsx`, `src/styles/site.css` (remove dead Cinematic rules)
- Delete: `src/flight/FlightBackdrop.tsx`, `src/flight/flight.css`, `src/flight/windowRect.ts`, `src/flight/__tests__/windowRect.test.ts`, `src/components/home/EvidenceWindow.tsx` (only after the grep in Step 9 confirms nothing imports them)
- Test: `src/survey/__tests__/SurveyLanding.test.tsx`, `src/components/home/__tests__/readingPlace.test.ts`

**Interfaces:**
- Consumes: everything above; `useViewMode()` → `{ mode, motion }`; `sectionIds` from `src/data/routes.ts`; `saveHomeReturn(mode)`.
- Produces:
  - `measureAnchors(section: Element, phone: boolean): Anchors` in `dom.ts`
  - `SurveyLanding({ motion }: { motion: boolean })` default export
  - `readingPlace.ts`: `interface PlaceRect { id: string; top: number; bottom: number }`; `readingPlaceFrom(line: number, rects: PlaceRect[]): { id: string; ratio: number } | null`; `placeTarget(id: string, mode: 'cinematic' | 'read'): string` (a CSS selector)

- [ ] **Step 1: Write the failing tests**

```ts
// src/components/home/__tests__/readingPlace.test.ts
import { describe, expect, it } from 'vitest';
import { placeTarget, readingPlaceFrom } from '../readingPlace';

describe('readingPlaceFrom', () => {
  it('reads sections in page order even when listed out of order', () => {
    const rects = [
      { id: 'contact', top: 2000, bottom: 2600 },
      { id: 'overview', top: -400, bottom: 300 },
      { id: 'projects', top: 300, bottom: 1200 },
    ];
    expect(readingPlaceFrom(500, rects)).toEqual({ id: 'projects', ratio: 200 / 900 });
  });

  it('returns the next section at ratio 0 when the line sits in a gap', () => {
    const rects = [
      { id: 'a', top: -900, bottom: 100 },
      { id: 'b', top: 600, bottom: 1600 },
    ];
    expect(readingPlaceFrom(300, rects)).toEqual({ id: 'b', ratio: 0 });
  });
});

describe('placeTarget', () => {
  it('finds the survey site that owns a Read section id', () => {
    expect(placeTarget('projects', 'cinematic')).toBe('[data-site="brickell"]');
    expect(placeTarget('about', 'cinematic')).toBe('[data-site="river"]');
    expect(placeTarget('experience', 'cinematic')).toBe('[data-site="beach"]');
  });

  it('sends Cinematic-only places to their nearest Read section', () => {
    expect(placeTarget('more-projects', 'read')).toBe('#projects');
    expect(placeTarget('contact', 'read')).toBe('#contact');
  });
});
```

```tsx
// src/survey/__tests__/SurveyLanding.test.tsx
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AI_DISCLOSURE } from '@/flight/disclosure';

const desktopWindow = { innerHeight: 900, innerWidth: 1440, matchMedia: () => ({ matches: false }) };

afterEach(() => {
  vi.unstubAllGlobals();
});

async function render(motion: boolean) {
  vi.stubGlobal('window', desktopWindow);
  const { default: SurveyLanding } = await import('../SurveyLanding');
  return renderToStaticMarkup(
    <MemoryRouter>
      <SurveyLanding motion={motion} />
    </MemoryRouter>,
  );
}

describe('SurveyLanding', () => {
  it('lays out film, ink, title block, and six sites with gaps between them', async () => {
    const out = await render(true);
    expect(out).toContain('class="survey"');
    expect(out).toContain('survey-film');
    expect(out).toContain('class="redline"');
    expect(out).toContain('class="title-block"');
    expect(out.match(/data-site="/g)).toHaveLength(6);
    expect(out.match(/class="survey__gap"/g)).toHaveLength(5);
  });

  it('marks still mode for motion off', async () => {
    expect(await render(false)).toContain('class="survey survey--still"');
  });

  it('shows the AI disclosure with the film', async () => {
    expect(await render(true)).toContain(AI_DISCLOSURE);
  });

  it('has exactly one h1', async () => {
    expect((await render(true)).match(/<h1/g)).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/home/__tests__/readingPlace.test.ts src/survey/__tests__/SurveyLanding.test.tsx`
Expected: FAIL, unresolved imports.

- [ ] **Step 3: Write `readingPlace.ts`**

```ts
// src/components/home/readingPlace.ts
import { sites } from '@/survey/sites';

export interface PlaceRect {
  id: string;
  top: number;
  bottom: number;
}

/** Cinematic places with no Read section of their own: the Read section that covers them. */
const READ_FALLBACK: Record<string, string> = { 'more-projects': 'projects', about: 'about' };

/** Which section the reading line is in, and how far through it. Sections are taken in page order. */
export function readingPlaceFrom(line: number, rects: PlaceRect[]): { id: string; ratio: number } | null {
  const sorted = [...rects].sort((a, b) => a.top - b.top);
  for (const r of sorted) {
    if (line < r.top) return { id: r.id, ratio: 0 };
    if (line <= r.bottom) return { id: r.id, ratio: (line - r.top) / Math.max(1, r.bottom - r.top) };
  }
  return null;
}

/** Selector for the element that holds a place in the given mode. */
export function placeTarget(id: string, mode: 'cinematic' | 'read'): string {
  if (mode === 'read') return `#${READ_FALLBACK[id] ?? id}`;
  const owner = sites.find((s) => s.anchors.includes(id));
  return owner ? `[data-site="${owner.id}"]` : `#${id}`;
}
```

- [ ] **Step 4: Add `measureAnchors` to `dom.ts`**

Append to `src/survey/dom.ts` (add `import type { Anchors } from './RedlineLayer';` at the top):

```ts
/**
 * Leader start points for the notes in a site's frame, in viewport px. The
 * frame is sticky at the top-left of the viewport while the site holds, so
 * positions relative to it are screen positions. Desktop leaders leave a note's
 * right edge; phone leaders leave its top; punch checks sit at an item's left.
 */
export function measureAnchors(section: Element, phone: boolean): Anchors {
  const frame = section.querySelector('.site__frame');
  if (!frame) return {};
  const f = frame.getBoundingClientRect();
  const out: Anchors = {};
  section.querySelectorAll<HTMLElement>('[data-anchor]').forEach((el) => {
    const r = el.getBoundingClientRect();
    const id = el.dataset.anchor!;
    const midY = r.top - f.top + r.height / 2;
    if (el.dataset.anchorSide === 'left') out[id] = { x: r.left - f.left, y: midY };
    else if (phone) out[id] = { x: r.left - f.left + Math.min(r.width / 2, 120), y: r.top - f.top };
    else out[id] = { x: r.left - f.left + Math.min(r.width, el.scrollWidth) + 12, y: midY };
  });
  return out;
}
```

- [ ] **Step 5: Write `SurveyLanding.tsx`**

```tsx
// src/survey/SurveyLanding.tsx
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { measureAnchors, siteSpans } from './dom';
import { useFilmStop } from './filmState';
import { PHONE_QUERY, type Viewport } from './geometry';
import { inkStyle, sitePhase } from './progress';
import RedlineLayer, { type Anchors } from './RedlineLayer';
import SiteSection from './SiteSection';
import { sites } from './sites';
import SurveyFilm from './SurveyFilm';
import TitleBlock from './TitleBlock';
import './survey.css';

const SITE_IDS = sites.map((s) => s.id);
const readViewport = (): Viewport => ({ w: window.innerWidth, h: window.innerHeight, phone: window.matchMedia(PHONE_QUERY).matches });

/**
 * The Cinematic landing: the flight full-bleed, each stop a site visit marked
 * up in redline ink, and a fixed title block. Scroll sets --ink, --lift and
 * --focus on the root; React renders again only when the site changes.
 */
export default function SurveyLanding({ motion }: { motion: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const stopRef = useRef(0);
  const [stop, setStop] = useState(0);
  const [vp, setVp] = useState<Viewport>(readViewport);
  const [anchors, setAnchors] = useState<Anchors>({});
  const filmStop = useFilmStop();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = root.current!;
    const update = () => {
      const p = sitePhase(siteSpans(SITE_IDS), window.innerHeight);
      const s = inkStyle(p, motion);
      el.style.setProperty('--ink', s.ink.toFixed(4));
      el.style.setProperty('--lift', s.lift.toFixed(4));
      el.style.setProperty('--focus', s.focus.toFixed(4));
      el.dataset.phase = p.phase;
      if (p.stop !== stopRef.current) {
        stopRef.current = p.stop;
        setStop(p.stop);
      }
    };
    const trigger = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update, onRefresh: update });
    update();
    return () => trigger.kill();
  }, [motion]);

  useEffect(() => {
    const onResize = () => setVp(readViewport());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Re-measure the current site's note anchors whenever its notes change size (flip, fonts, resize).
  useLayoutEffect(() => {
    const section = document.querySelector(`[data-site="${sites[stop].id}"]`);
    const notes = section?.querySelector('.site__notes');
    if (!section || !notes) return;
    const measure = () => setAnchors(measureAnchors(section, vp.phone));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(notes);
    document.fonts?.ready.then(measure, () => {});
    return () => ro.disconnect();
  }, [stop, vp]);

  return (
    <div ref={root} className={`survey${motion ? '' : ' survey--still'}`}>
      <SurveyFilm motion={motion} siteIds={SITE_IDS} />
      <div className="survey__falloff" aria-hidden="true" />
      <RedlineLayer site={sites[stop]} index={stop} anchors={anchors} vp={vp} ready={filmStop === stop} />
      <TitleBlock sites={sites} current={stop} />
      {sites.map((s, i) => (
        <Fragment key={s.id}>
          {i > 0 && <div className="survey__gap" aria-hidden="true" />}
          <SiteSection site={s} />
        </Fragment>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Wire `Home.tsx`**

Replace the imports of `About, Contact, …`, `EvidenceWindow`, `FlightBackdrop` usage and `readingPlace` with the survey in Cinematic mode. Full new file:

```tsx
// src/pages/Home.tsx
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLenis } from '@/components/motion/SmoothScroll';
import { useViewMode } from '@/components/view/ViewMode';
import { About, Contact, Experience, Expertise, Overview, Projects } from '@/components/home/Sections';
import { saveHomeReturn } from '@/components/home/homeReturn';
import { placeTarget, readingPlaceFrom, type PlaceRect } from '@/components/home/readingPlace';
import { sectionIds } from '@/data/routes';
import SurveyLanding from '@/survey/SurveyLanding';
import { sites } from '@/survey/sites';

const SECTIONS = [Overview, Experience, Expertise, Projects, About, Contact];
/** Where the reader's place is read from when the mode switches: the upper third of the viewport. */
const READ_LINE = 0.3;

function placeRects(cinematic: boolean): PlaceRect[] {
  const entries = cinematic
    ? sites.map((s) => ({ id: s.anchors[0], el: document.querySelector(`[data-site="${s.id}"]`) }))
    : sectionIds.map((id) => ({ id, el: document.getElementById(id) }));
  return entries.flatMap(({ id, el }) => {
    const r = el?.getBoundingClientRect();
    return r ? [{ id, top: r.top, bottom: r.bottom }] : [];
  });
}

/**
 * Home. Cinematic mode is the site survey over the Miami flight; Read mode is
 * the same content as a compact, plain page.
 */
export default function Home() {
  const { mode, motion } = useViewMode();
  const lenis = useLenis();
  const cinematic = mode === 'cinematic';
  const place = useRef<{ id: string; ratio: number } | null>(null);
  const modeRef = useRef(mode);

  // Track the reader's place so switching modes keeps them on the same topic.
  useEffect(() => {
    let frame = 0;
    const record = () => {
      frame = 0;
      place.current = readingPlaceFrom(window.innerHeight * READ_LINE, placeRects(modeRef.current === 'cinematic'));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(record);
    };
    record();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useLayoutEffect(() => {
    if (modeRef.current === mode) return;
    modeRef.current = mode;
    const at = place.current;
    const el = at && document.querySelector(placeTarget(at.id, mode));
    if (!at || !el) return;
    const r = el.getBoundingClientRect();
    const y = window.scrollY + r.top + at.ratio * r.height - window.innerHeight * READ_LINE;
    if (lenis) {
      lenis.resize();
      lenis.scrollTo(Math.max(0, y), { immediate: true, force: true });
    } else {
      window.scrollTo(0, Math.max(0, y));
    }
  }, [mode, lenis]);

  // Opening a case study remembers this place, so "Back to Projects" returns here.
  const onClickCapture = (e: React.MouseEvent) => {
    const href = (e.target as HTMLElement).closest('a')?.getAttribute('href') ?? '';
    if (href.startsWith('#/projects/') || href.startsWith('#/lab')) saveHomeReturn(mode);
  };

  return (
    <main id="main" tabIndex={-1} className={`home ${cinematic ? 'home--cinematic' : 'home--read'}`} onClickCapture={onClickCapture}>
      {cinematic ? <SurveyLanding motion={motion} /> : SECTIONS.map((Section, i) => <Section key={sectionIds[i]} />)}
    </main>
  );
}
```

(The existing passive scroll listener for reading place is kept as it was; it is not new scroll-driven animation code.)

- [ ] **Step 7: Load the fonts**

In `index.html` line 37, extend the Google Fonts URL so the `family=` list also contains `Archivo:wdth,wght@62..125,100..900` and `B612:wght@400;700`:

```html
    <link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=B612:wght@400;700&family=Inter:ital,opsz,wght@0,14..32,300..700;1,14..32,400&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,400..800;1,400..700&display=swap" rel="stylesheet" />
```

- [ ] **Step 8: Point the disclosure test at the title block**

In `src/flight/__tests__/disclosure.test.tsx`, replace the first test (`is drawn on the Cinematic film…`) with:

```tsx
  it('is shown in the survey title block, with the film', async () => {
    const { renderToStaticMarkup: render } = await import('react-dom/server');
    const { MemoryRouter } = await import('react-router-dom');
    const { default: TitleBlock } = await import('@/survey/TitleBlock');
    const { sites } = await import('@/survey/sites');
    const out = render(
      <MemoryRouter>
        <TitleBlock sites={sites} current={0} />
      </MemoryRouter>,
    );
    expect(out).toContain(`<p class="tb-disclosure">${AI_DISCLOSURE}</p>`);
  });
```

Remove the now-unused `desktopWindow` constant and the `renderToStaticMarkup` import at the top if nothing else in the file uses them (keep `vi`/`afterEach` only if still used; `noUnusedLocals` will tell you).

- [ ] **Step 9: Remove the old Cinematic pieces**

Run: `git grep -l -E "FlightBackdrop|EvidenceWindow|windowRect|flight\.css" -- src`
Expected: only the files listed under Delete (and nothing else). If another file imports one of them, keep that file and note it in the commit message.

Then delete them:

```bash
git rm src/flight/FlightBackdrop.tsx src/flight/flight.css src/flight/windowRect.ts src/flight/__tests__/windowRect.test.ts src/components/home/EvidenceWindow.tsx
```

In `src/styles/site.css`, delete every rule whose selector starts with `.home--cinematic` or is `.cine-gap` (the block around lines 303 to 320, including the `@media` block that only contains those selectors). Then run `git grep -n -E "cine-|home--cinematic|evidence-window" -- src` and remove any remaining rule that only styled the deleted components. If `src/styles/evidence.css` is now imported by nothing (`git grep -n "evidence.css" -- src`), delete it too.

- [ ] **Step 10: Run the whole suite, lint, and build**

Run: `npm test && npm run lint && npm run build`
Expected: all tests pass (new survey tests plus the existing suite), oxlint reports no errors, `tsc -b` and `vite build` succeed.

- [ ] **Step 11: Commit**

```bash
git add -A src index.html
git commit -m "feat(home): Cinematic mode becomes the site survey landing"
```

---

### Task 9: Visual check round

**Files:**
- Modify: whatever the round shows is wrong (CSS in `src/survey/survey.css`, landmark values in `src/survey/sites.ts`)
- Output: `.impeccable/review/*.png` (not committed)

Two rounds maximum (impeccable's budget): capture everything, fix in one batch, capture once more.

- [ ] **Step 1: Start the dev server**

Add to `C:\Users\abel\Documents\Code\.claude\launch.json` a configuration `about-me-survey-dev`: `npm --prefix About-Me-survey run dev -- --port 5230 --strictPort`, port 5230. Start it with the Browser pane's `preview_start` (`name: "about-me-survey-dev"`).

- [ ] **Step 2: Capture every settled site, desktop and phone**

With the Playwright MCP browser (the Browser pane pauses animation frames when hidden): for each viewport `1440x900`, `1280x600`, `1920x1080`, `390x844`, open `http://localhost:5230/?view=cinematic`, and for each site run

```js
async (id) => {
  const s = document.querySelector(`[data-site="${id}"]`);
  const top = s.getBoundingClientRect().top + scrollY;
  scrollTo(0, top + (s.offsetHeight - innerHeight) * 0.5);
  await new Promise((r) => setTimeout(r, 1200));
}
```

then save a viewport screenshot to `.impeccable/review/<id>-<w>x<h>.png`. Also capture `desktop.png` (1440 full page from the top) and `mobile.png` (390 full page). Then emulate `prefers-reduced-motion: reduce` and capture `river` and `downtown` at 1440x900 as `still-<id>.png`.

- [ ] **Step 3: Check every capture against this list**

For each image confirm: the ring sits on its landmark (River ring on the Brickell towers; Downtown rings on the left tower, the tallest tower, and the right building; Beach ring on the lifeguard tower); every leader ends on its ring and starts at its note; no note overlaps the title block; text is readable on the brightest frame (Bay and Sunset skies); the title block fields are on one row each and nothing wraps badly at 1280x600; on 390x844 Downtown shows one ring and two edge arrows, and the strip shows Site and Email me; in still captures the ink is whole and the film is sharp. Check the console for errors (`browser_console_messages`).

- [ ] **Step 4: Fix everything the round showed, in one batch**

Typical fixes: nudge a `mark` x/y/r in `sites.ts`; adjust `--tb-h` or `.site__notes` bottom/width in `survey.css`; strengthen `.survey__falloff` stops where contrast fails. Keep each value change minimal.

- [ ] **Step 5: Re-capture once and confirm, then run the detector**

Repeat Step 2 for the viewports that had problems. Then run:

```bash
C:/Users/abel/.claude/skills/impeccable/scripts/impeccable.cmd detect --json src/survey src/pages/Home.tsx
```

Fix the mechanical findings it reports; note the rest for the reviewer in Task 10.

- [ ] **Step 6: Commit**

```bash
git add src/survey src/pages/Home.tsx
git commit -m "fix(survey): placement and contrast from the visual check"
```

---

### Task 10: Finish: review, documentation, HD frames, PR

**Files:**
- Create: `DESIGN.md`, `.impeccable/design.json` (by the documenter)
- Possibly modify: `public/flight/desktop/*` (only if the HD set wins)

- [ ] **Step 1: Finish review**

Spawn the `impeccable-finish-reviewer` agent (fresh, no conversation history) with: the original request ("cinematic flight as the full-screen background, text adapts to it, not generic, no cards; recruiters first"), the confirmed answers from PRODUCT.md, the artifact path `src/survey/` + `src/pages/Home.tsx`, the screenshot paths in `.impeccable/review/` (`desktop.png`, `mobile.png`, and the per-site captures), the direction contract `.impeccable/surfaces/src-pages-home-tsx.md`, the detector findings from Task 9, the QUALITY BAR note that this round was code-led with no comp, and the craft floor path `C:/Users/abel/.claude/skills/impeccable/reference/craft-floor.md`. Act on its disposition (`ship`, `fix`, `rebuild`, `recapture`) exactly as `reference/new-work.md` section 7 describes; at most two fix rounds.

- [ ] **Step 2: Documenter**

Spawn `impeccable-documenter` with the project root, the artifact path, the direction contract, `PRODUCT.md`, and `C:/Users/abel/.claude/skills/impeccable/reference/document.md`. Verify `DESIGN.md` and `.impeccable/design.json` exist and carry the tokens from `survey.css`.

- [ ] **Step 3: HD frame comparison**

From the `About-Me` main checkout, list the HD frames in commit `760e7c3` (`git -C ../About-Me show --stat 760e7c3`). Export the River (f040) and Downtown (f189) frames from that commit into `.impeccable/review/hd/` and compare them against `public/flight/desktop/` at 1920x1080 full-screen (same capture method as Task 9). Report the sharpness difference and the total size of each set to the user and let them decide; do not swap frames without their yes.

- [ ] **Step 4: Gates**

Run: `npm test && npm run lint && npm run build`
Expected: all green.

- [ ] **Step 5: Push and open the PR**

```bash
git add DESIGN.md .impeccable/design.json
git commit -m "docs: record the survey landing design system"
git push -u origin feat/survey-landing
gh pr create --base main --title "feat: Site Survey Redlines landing" --body-file .impeccable/review/pr-body.md
```

Write `.impeccable/review/pr-body.md` first: summary (what changed, why), screenshots list, test results, the reviewer's verdict word, the HD decision, and the known deviations below. No attribution lines.

---

## Known deviations from the spec

- **Pulse timing:** the landmark pulse plays at the start of each site's draw (just before its ring), not during the previous site's departure. During the flight the next landmark has no fixed screen position to pulse at; River's note ("Next site: Service Map Planner") still points ahead.
- **Phone Downtown:** the three jobs share one hold; landmarks the phone crop hides get an edge arrow instead of separate holds. This keeps one section per site and one scroll rhythm.
