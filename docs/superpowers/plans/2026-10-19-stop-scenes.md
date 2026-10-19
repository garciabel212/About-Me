# Stop Scenes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn each of the six landing points into a held scene whose parts take turns in the film's open text zone. The light wipe plays on arrival, a credits roll moves between parts, the type is larger, and every former "More" section becomes its own part.

**Architecture:**
- **The data model.** A pure parts model (`parts.ts`) turns each `Point` into an ordered list of parts. On compact screens it splits some parts in two.
- **The held scene.** Each point section becomes a tall scroll track with a sticky full-screen stage. Pure scroll math (`scenes.ts`) maps the scroll position to the held scene, the active part and the camera push-in.
- **The controller.** A hook (`useScenes.ts`) writes that state as data attributes on every scroll update, and CSS does all the motion. A shared camera writer (`camera.ts`) combines the pointer sway with the push-in.
- **The light.** In the gaps between scenes it is drawn as document-space S-curves. During a hold, a rail inside the sticky stage takes its place.

**Tech Stack:** React 19, TypeScript, Vite, GSAP ScrollTrigger + Lenis, vitest (node environment, `renderToStaticMarkup`), oxlint.

**Spec:** `docs/superpowers/specs/2026-10-19-stop-scenes-design.md` (approved 2026-10-19). Read it first; this plan argues from it.

**Where:** worktree `C:\Users\abel\Documents\Code\About-Me-survey`. Before Task 1, create the branch: `git switch -c feat/stop-scenes` from `docs/stop-scenes-design` (the branch with the spec and this plan). One PR to `main`, squash-merged.

## Global Constraints

- **No React render per scroll frame.** Scroll work writes attributes and styles directly, like `LightPath.tsx` and `sway.ts` today.
- **Animated properties:** only `transform`, `translate`, `scale`, `opacity` and `mask-position` (with `-webkit-` prefixes), plus the light path's SVG attributes. Never layout properties.
- **Type limits:**
  - body ~19px at 1440, min 17px, max ~21px
  - lead ~21px
  - headline ~52px, min 36px
  - part title ~30px
  - meta ~15px, min 14px
  - label 12px
  - text block max width 560px
- **Roll:**
  - `translateY(105%)` before, `translateY(-105%)` after
  - 1100ms `cubic-bezier(0.65, 0, 0.35, 1)`
  - opacity 0.2 at both ends
  - part-area mask: `linear-gradient(transparent, #000 6%, #000 90%, transparent)`
- **Wipe:**
  - mask `linear-gradient(#000 0 45%, transparent 55% 100%)`, size `100% 220%`, position `0 100%` → `0 0`
  - 1000ms `cubic-bezier(0.45, 0, 0.25, 1)`, 150ms delay; River 0ms
  - head dot ~18px with a blue glow
- **Reduced motion:** no wipe, roll or push-in; parts swap with a 200ms opacity fade.
- **Motion off (`landing--still`):** no held scenes; all parts stack in normal flow; the film shows one still per stop.
- **Push-in:** scale 1.00 → 1.05 across a hold, applied to the film and front canvases together.
- **Scrolling:** free. No snapping and no wheel capture; threshold changes are reversible.
- **Copy:** from `src/data/content.ts` and `caseStudies.ts` only. No em or en dashes in visible text (`points.test.ts` enforces this).
- **Kept intact:**
  - landing CSS never styles `.light` or `.dark`;
  - landing classes never collide with global CSS (`landingCss.test.ts`);
  - the AI disclosure stays visible;
  - one accent, `#4aa8ff`;
  - fonts: Bodoni Moda headlines, Archivo text.
- **Commands:**
  - tests: `npx vitest run`
  - lint: `npm run lint` (0 errors)
  - build: `npm run build`
  - dev server: launch config `about-me-survey-dev` (port 5230)
- **Commits:** none by Claude with attribution lines.

## Review Focus

1. **Resizing across the compact breakpoint mid-scene** (rotating a phone, or a window dropping below 700px tall). The part count changes, so the active part must clamp to a valid part and the holds must re-measure. Pinned in Task 2 (`partAt` clamps a stale `prev`) and Task 6 (re-measure on resize and on a `compact` change).
2. **Jumping across scenes** (a nav link from the top to Contact). Scenes passed over must show their last part, scenes ahead their first part, and only the held scene may arrive. Pinned in Task 2 (`sceneFrame` jump test).
3. **Deep link on load** (`/#exp-globenet` cold). It must land on Globenet's part, not the top of Experience. Pinned in Task 4 (anchor offset test) and Task 7 (headless probe).
4. **Keyboard focus into a part that isn't showing.** It must scroll to that part. Hidden parts' links must not take clicks. Pinned in Task 2 (`partScrollY` round-trips through `partAt`) and Task 7 (probe).
5. **Short desktop windows and tablets** (1280×600, 1024×768, where Downtown's center column shifts). No part may be clipped. Pinned in Task 7 (fit probe at both sizes).

---

### Task 1: Parts model

**Files:**
- Create: `src/landing/parts.ts`
- Test: `src/landing/__tests__/parts.test.ts`

**Interfaces:**
- Consumes: `Point`, `Role`, `WorkItem` from `src/landing/points.ts` (unchanged).
- Produces:

```ts
export const COMPACT_QUERY = '(max-width: 767px), (max-height: 700px)';
export type PartContent =
  | { kind: 'intro' }
  | { kind: 'role'; role: Role; half?: 1 | 2 }
  | { kind: 'responsibilities'; role: Role; half?: 1 | 2 }
  | { kind: 'step'; index: number }
  | { kind: 'tools' }
  | { kind: 'project'; item: WorkItem; half?: 1 | 2 }
  | { kind: 'story'; item: WorkItem }
  | { kind: 'contact' }
  | { kind: 'about'; half?: 1 | 2 };
export interface Part { id: string; anchors: string[]; slot: number; content: PartContent }
export function partsFor(point: Point, compact: boolean): Part[];
```

**Parts per point, desktop** (spec table):
- **river:** intro
- **brickell:** role(dlsg), responsibilities(dlsg), role(globenet)
- **downtown:** step 0–4 (all slot 0), tools (slot 1)
- **bay:** project(SMP), story(SMP), project(AAC), story(AAC)
- **beach:** project(garage), story(garage), project(ATOS), story(ATOS)
- **sunset:** contact, about

**Compact splits:** each of these becomes `half: 1` then `half: 2`:
- every role;
- every responsibilities part (lines 0–2, then 3–5);
- every project that has an `image`;
- about.

Part ids are `${point.id}-${n}`. Slots increase by one per part, except the Downtown steps, which share slot 0. `anchors` is `['exp-' + role.id]` on a role part with no `half` or `half: 1`, and `[]` everywhere else.

- [ ] **Step 1: Write the failing tests** in `parts.test.ts`:

```ts
const counts = (compact: boolean) => points.map((p) => partsFor(p, compact).length);
it('splits each point into the parts the spec lists', () => expect(counts(false)).toEqual([1, 3, 6, 4, 4, 2]));
it('splits long parts in two on compact screens', () => expect(counts(true)).toEqual([1, 6, 6, 5, 5, 3]));
it('keeps the five Expertise steps in one rolled slot, then Tools', () =>
  expect(partsFor(byId('downtown'), false).map((p) => p.slot)).toEqual([0, 0, 0, 0, 0, 1]));
it('puts each role deep link on its role part, exactly once', () => {
  for (const compact of [false, true]) {
    const all = points.flatMap((p) => partsFor(p, compact));
    expect(all.filter((p) => p.anchors.includes('exp-globenet'))).toHaveLength(1);
    expect(all.filter((p) => p.anchors.includes('exp-dlsg'))).toHaveLength(1);
  }
  expect(partsFor(byId('brickell'), false).findIndex((p) => p.anchors.includes('exp-globenet'))).toBe(2);
  expect(partsFor(byId('brickell'), true).findIndex((p) => p.anchors.includes('exp-globenet'))).toBe(4);
});
it('gives everything that was behind "More" its own part', () => {
  const kinds = points.flatMap((p) => partsFor(p, false)).map((p) => p.content.kind);
  expect(kinds.filter((k) => k === 'responsibilities')).toHaveLength(1);
  expect(kinds.filter((k) => k === 'story')).toHaveLength(4);
  expect(kinds).toContain('tools');
  expect(kinds).toContain('about');
});
it('gives every part a unique id', () => { /* ids across all points, both modes, are unique */ });
```

- [ ] **Step 2: Run** `npx vitest run src/landing/__tests__/parts.test.ts`. Expected: FAIL, because `parts.ts` doesn't exist.
- [ ] **Step 3: Implement** `partsFor(point, compact)` in `src/landing/parts.ts`: a `switch` on `point.body.kind`, with a helper that pushes `half: 1` and `half: 2` copies when compact.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** `feat(landing): parts model for stop scenes`.

### Task 2: Scene math

**Files:**
- Create: `src/landing/scenes.ts`
- Test: `src/landing/__tests__/scenes.test.ts`

**Interfaces:**
- Produces:

```ts
/** A held scene in page pixels: held while start <= scrollY <= end. */
export interface Hold { start: number; end: number; parts: number }
export type PartState = 'before' | 'active' | 'after';
export const HYSTERESIS = 0.04; // share of one part's scroll
export const PUSH_MAX = 1.05;
export function partAt(scrollY: number, hold: Hold, prev: number): number;
export function partScrollY(hold: Hold, index: number): number; // start + (index === 0 ? 0 : (index + 0.15) * step)
export function slotStates(slots: number[], active: number): PartState[]; // one entry per distinct slot, in order
export function stepIn(slots: number[], active: number): number; // index of `active` within its slot
export function gapProgress(scrollY: number, a: Hold, b: Hold): number; // 0 at a.end, 1 at b.start, clamped
export function pushFor(scrollY: number, holds: Hold[]): number;
export function sceneFrame(scrollY: number, holds: Hold[], prev: number[]): { held: number; active: number[]; push: number };
```

**Semantics:**
- `step = (end - start) / parts`.
- **`partAt`:**
  - returns `prev` while `(scrollY - start) / step` lies within `[prev - HYSTERESIS, prev + 1 + HYSTERESIS]`;
  - otherwise returns `floor` of that value;
  - always clamped to `[0, parts - 1]`, including a stale `prev` that is out of range.
- **`pushFor`:**
  - inside hold i: `1 + (PUSH_MAX - 1) * (scrollY - start) / (end - start)`;
  - in the gap after hold i: `PUSH_MAX - (PUSH_MAX - 1) * smooth(gapProgress)`, with `smooth(t) = t*t*(3-2t)`;
  - before the first hold: 1.
- **`sceneFrame`:** `held` is the index of the hold that contains `scrollY`, or -1. `active[i] = partAt(scrollY, holds[i], prev[i])`.

- [ ] **Step 1: Write the failing tests** in `scenes.test.ts`, with `const hold: Hold = { start: 1000, end: 1000 + 3 * 540, parts: 3 }`:

```ts
it('picks the part under the scroll position', () => {
  expect(partAt(1000, hold, -1)).toBe(0);
  expect(partAt(1541, hold, -1)).toBe(1);
  expect(partAt(999999, hold, -1)).toBe(2);
  expect(partAt(0, hold, -1)).toBe(0);
});
it('does not flicker near a threshold', () => {
  expect(partAt(1550, hold, 0)).toBe(0);   // 10px past, inside 0.04 * 540 = 21.6
  expect(partAt(1570, hold, 0)).toBe(1);
  expect(partAt(1530, hold, 1)).toBe(1);
  expect(partAt(1510, hold, 1)).toBe(0);
});
it('clamps a stale previous part after the part count shrinks', () => expect(partAt(1000, hold, 7)).toBe(0));
it('round-trips part scroll positions', () => {
  for (let k = 0; k < 3; k++) expect(partAt(partScrollY(hold, k), hold, -1)).toBe(k);
});
it('rolls slots: earlier slots after, later before', () => {
  expect(slotStates([0, 0, 0, 0, 0, 1], 3)).toEqual(['active', 'before']);
  expect(slotStates([0, 0, 0, 0, 0, 1], 5)).toEqual(['after', 'active']);
  expect(stepIn([0, 0, 0, 0, 0, 1], 3)).toBe(3);
});
it('pushes in across a hold and eases back across the gap, with no jump', () => {
  const next: Hold = { start: 4000, end: 4540, parts: 1 };
  expect(pushFor(1000, [hold, next])).toBe(1);
  expect(pushFor(hold.end, [hold, next])).toBeCloseTo(1.05, 5);
  expect(pushFor(hold.end + 0.01, [hold, next])).toBeCloseTo(1.05, 3);
  expect(pushFor((hold.end + 4000) / 2, [hold, next])).toBeCloseTo(1.025, 3);
  expect(pushFor(4000, [hold, next])).toBeCloseTo(1, 5);
});
it('after a jump, scenes passed show their last part and scenes ahead their first', () => {
  const holds = [hold, { start: 4000, end: 5080, parts: 2 }, { start: 7000, end: 7540, parts: 1 }];
  const f = sceneFrame(7100, holds, [0, 0, 0]);
  expect(f.held).toBe(2);
  expect(f.active).toEqual([2, 1, 0]);
  expect(sceneFrame(3500, holds, [0, 0, 0]).held).toBe(-1);
});
it('measures gap progress from one hold end to the next hold start', () => {
  const next: Hold = { start: 3620, end: 4000, parts: 1 };
  expect(gapProgress(hold.end, hold, next)).toBe(0);
  expect(gapProgress(3620, hold, next)).toBe(1);
  expect(gapProgress(3100, hold, next)).toBeCloseTo(0.5, 5);
});
```

- [ ] **Step 2: Run** `npx vitest run src/landing/__tests__/scenes.test.ts`. Expected: FAIL (module missing).
- [ ] **Step 3: Implement** the functions above in `scenes.ts`.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** `feat(landing): scroll math for held scenes`.

### Task 3: Shared camera (sway + push-in)

**Files:**
- Create: `src/landing/camera.ts`
- Modify: `src/landing/sway.ts`. Move `FILM_SELECTOR` to `camera.ts` and re-export it, so `sway.test.ts` keeps working. `useCameraSway` writes through the camera.
- Test: `src/landing/__tests__/camera.test.ts`

**Interfaces:**
- Produces:

```ts
export const FILM_SELECTOR = '.film__canvas, .film__poster, .film__front';
export const TEXT_SELECTOR = '.point__body, .light-path';
export function filmScale(swayOn: boolean, push: number): number; // (swayOn ? 1.04 : 1) * push
export interface Camera { setSway(film: string | null, text: string | null): void; setPush(push: number): void; reset(): void }
export function cameraFor(root: HTMLElement): Camera; // one per root (WeakMap)
```

`setSway(null, null)` means no sway. Every call rewrites the film layers' `translate` and `scale` (as `filmScale(sway !== null, push)`, written to 4 decimals) and the text layers' `translate`. `reset()` clears all of these styles. `useCameraSway(root, enabled)` keeps its signature and calls `cameraFor(root.current).setSway(f, t)`; its cleanup calls `setSway(null, null)`.

- [ ] **Step 1: Write the failing tests.** Use a fake root whose `querySelectorAll(sel)` returns fake nodes `{ style: {} }` for the film selector and for the text selector.

```ts
it('scales for sway headroom only when swaying', () => {
  expect(filmScale(false, 1)).toBe(1);
  expect(filmScale(true, 1)).toBeCloseTo(1.04);
  expect(filmScale(true, 1.05)).toBeCloseTo(1.092);
});
it('combines push-in with sway on the film layers', () => {
  const cam = cameraFor(root);
  cam.setPush(1.05);
  expect(film[0].style.scale).toBe('1.0500');
  cam.setSway('2px 1px', '-1px 0px');
  expect(film[0].style.scale).toBe('1.0920');
  expect(film[0].style.translate).toBe('2px 1px');
  expect(text[0].style.translate).toBe('-1px 0px');
  cam.reset();
  expect(film[0].style.scale).toBe('');
});
it('returns the same camera for the same root', () => expect(cameraFor(root)).toBe(cameraFor(root)));
```

- [ ] **Step 2: Run** `npx vitest run src/landing/__tests__/camera.test.ts src/landing/__tests__/sway.test.ts`. Expected: FAIL (camera missing).
- [ ] **Step 3: Implement** `camera.ts` and route `sway.ts` writes through it.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** `refactor(landing): one camera writer for sway and push-in`.

### Task 4: Scene markup

**Files:**
- Create: `src/landing/PartView.tsx`, one renderer per `PartContent.kind`.
  - **role:** `half 1` = org (h3), title, meta, summary; `half 2` = org as `.point__meta`, then contributions. No `half` = both.
  - **responsibilities:** h3 "Full responsibilities" with sr-only `: {organization}`, then the `role.details` list (halves = lines 0–2, then 3–5).
  - **project:** today's `WorkBlock` minus `More`. `half 1` = everything but the figure; `half 2` = the title as `.point__meta`, then the figure.
  - **story:** the title as `.point__meta`; h3 "The problem and my part" with sr-only `: {title}`; `problem`; workflow steps as text if present; "My part." `contribution`.
  - **step:** not rendered alone. The steps slot renders one `<ol className="point-steps">` with every step. Each `<li>` holds the step's h3, then all of `work` and `projects` as text plus a source link. The first `<li>` has `data-on`.
  - **tools:** the tool groups (today's `.tools` markup).
  - **contact:** the portrait, `bio[0]`, the pitch, and all four contact links (today's connect block minus `More`).
  - **about:** `half 1` = `bio.slice(1)`; `half 2` = details, education, languages, then one line of the four contact links. No `half` = both.
- Modify: `src/landing/Point.tsx`. Rewrite `PointSection({ point, compact }: { point: Point; compact: boolean })` to render the structure below. Remove `More`, `RoleBlock`, `WorkBlock` and the `point__rise` spans.
- Test: `src/landing/__tests__/Point.test.tsx` (rewrite)

```html
<section class="point point--{placement} scene" data-point data-parts="{n}" style="--parts:{n}" tabindex="-1" aria-labelledby>
  <span class="point__anchor" id="{point anchor}"></span>            (as today; top 0)
  <span class="scene__anchor" id="{part anchor}" style="top:{offset}"></span>  (one per part anchor)
  <div class="scene__stage">
    <div class="point__body">
      <span class="point__node" data-node="true" aria-hidden="true"></span>
      <div class="scene__text">
        label (if numbered) + h1 name (intro) or h2 headline
        <div class="scene__parts">
          <div class="scene__part" data-slot="{s}" data-state="active|before">…</div>   (one per distinct slot)
        </div>
      </div>
      <span class="scene__rail" aria-hidden="true"><i class="scene__mark" />×n (first has data-on)</span>
      <span class="scene__head" aria-hidden="true"></span>
      <span class="point__node point__node--exit" data-node="exit" aria-hidden="true"></span>
    </div>
  </div>
</section>
```

The part anchor `offset` is `0` for part index 0. Otherwise it is `calc((k + 0.15) * var(--part-scroll))`, matching `partScrollY`.

**Interfaces:**
- Consumes: `partsFor`, `Part`, `PartContent` (Task 1).
- Produces: the class names and data attributes above. Tasks 5, 6 and 7 rely on them exactly: `scene`, `data-parts`, `--parts`, `scene__stage`, `scene__text`, `scene__parts`, `scene__part[data-slot][data-state]`, `point-steps li[data-on]`, `scene__rail`, `scene__mark[data-on]`, `scene__head`, `scene__anchor`, and `[data-node="true"|"exit"]`.

- [ ] **Step 1: Write the failing tests** (keep today's still-valid ones: one h1, labels, screenshots lazy with dimensions, case-study links, every contact route):

```ts
it('renders each point as a scene with one scroll length per part', () => {
  for (const p of points) {
    const html = renderToStaticMarkup(<PointSection point={p} compact={false} />);
    const n = partsFor(p, false).length;
    expect(html).toContain(`data-parts="${n}"`);
    expect(html).toContain(`--parts:${n}`);
    expect(html.match(/class="scene__mark"/g)).toHaveLength(n);
  }
});
it('starts on the first slot with the rest waiting below', () => {
  const html = render('bay');
  expect(html.match(/data-state="active"/g)).toHaveLength(1);
  expect(html.match(/data-state="before"/g)).toHaveLength(3);
});
it('hides nothing behind "More"', () => points.forEach((p) => expect(render(p.id)).not.toMatch(/<details|point-more/)));
it('puts /#exp-globenet at Globenet's part scroll position', () => {
  expect(render('brickell')).toMatch(/<span class="scene__anchor" id="exp-globenet" style="top:calc\(\(2 \+ 0\.15\) \* var\(--part-scroll\)\)"/);
  expect(renderCompact('brickell')).toMatch(/id="exp-globenet" style="top:calc\(\(4 \+ 0\.15\)/);
});
it('never hides parts from assistive tech', () => {
  const parts = render('beach').match(/<div class="scene__part"[^>]*>/g)!;
  parts.forEach((t) => expect(t).not.toContain('aria-hidden'));
});
it('lists every Expertise step with all of its examples, first one lit', () => {
  const html = render('downtown');
  expect(html.match(/<li[^>]*data-on/g)).toHaveLength(1);
  for (const s of method) for (const p of [...s.work, ...s.projects]) expect(html).toContain(p.source);
});
it('ends the About part with every contact route', () => {
  const about = render('sunset').split('data-slot="1"')[1];
  expect(about).toContain('mailto:');
  expect(about).toContain(contact.linkedin);
});
```

- [ ] **Step 2: Run** `npx vitest run src/landing/__tests__/Point.test.tsx`. Expected: FAIL.
- [ ] **Step 3: Implement** `PartView.tsx` and the new `PointSection`. Update `FlightLanding.tsx` to pass `compact={false}` for now (Task 6 wires the real value).
- [ ] **Step 4: Run** `npx vitest run`. Expected: Point tests PASS. `LightPath`, `lightCurve` and `landingCss` tests may still pass or fail on the old behavior; anything failing must be owned by Task 5 or Task 6. Note which fail.
- [ ] **Step 5: Commit** `feat(landing): render points as scenes with parts`.

### Task 5: Scene CSS (layout, type, roll, wipe, rail)

**Files:**
- Modify: `src/landing/landing.css`
- Test: `src/landing/__tests__/landingCss.test.ts`

**What to write:**
- **Layout:**
  - `.landing { --part-scroll: 60svh }`.
  - `.scene { height: calc(100svh + var(--parts) * var(--part-scroll)) }`, replacing the old `.point` min-height and padding.
  - `.scene__stage { position: sticky; top: 0; height: 100svh }`. The stage takes the 12-column grid and the gutter that `.point` has today.
  - The body sits at `padding-top: calc(var(--header-h) + 6svh)`. River stays top-right; Sunset aligns to the bottom with 56px clear of the disclosure.
  - `.scene__parts` is a positioned box, with each `.scene__part` absolutely stacked at its top.
  - `.scene__anchor { position: absolute; left: 0; width: 1px; height: 1px }`.
- **Type:** the Global Constraints limits, via `clamp()`:
  - `.point p` and list text: `clamp(17px, 1.32vw, 21px)`
  - lead: `clamp(18px, 1.46vw, 23px)`
  - headline: `clamp(36px, 3.6vw, 64px)`
  - part title h3: `clamp(24px, 2.1vw, 34px)`
  - meta: `clamp(14px, 1.05vw, 16px)`
- **Roll:**
  - `.scene__part[data-state="before"]` → `transform: translateY(105%); opacity: 0.2`
  - `[data-state="after"]` → `translateY(-105%); opacity: 0.2`
  - `active` → `none; 1`
  - `transition: transform 1100ms cubic-bezier(0.65, 0, 0.35, 1), opacity 1100ms cubic-bezier(0.65, 0, 0.35, 1)`
  - non-active parts get `pointer-events: none`
  - the part-area mask on `.scene__parts`, with `-webkit-` and unprefixed forms
- **Steps:**
  - `.point-steps li { opacity: 0.42 }`, and `li[data-on] { opacity: 1 }`.
  - A step's detail shows only when on; use transitions on opacity and translate.
- **Wipe:** `.landing[data-arrive="on"] .scene .scene__text` uses the Global Constraints mask (both prefixes).
  - Before arrival: `mask-position: 0 100%`. With `[data-arrived]`: `0 0`, transition `1000ms cubic-bezier(0.45, 0, 0.25, 1) 150ms`.
  - `.scene[data-point="river"]` uses a 0ms delay.
  - The head and the rail use `--rail-h`, the distance in px from the entry node down to the exit node. Task 6 writes it on each `.point__body` when it measures; it is never written per frame.
  - `.scene__head` is positioned at the exit node. When `[data-arrived]` is first set, it runs the matching keyframe (`scene-head`) from `translate: 0 calc(-1 * var(--rail-h))` to `translate: 0 0` over the same 1000ms.
  - Afterward it stays at the exit, except at Downtown, where Task 6 moves it to the active step through `translate`.
- **Rail:**
  - A 2px glowing vertical line from the entry node down to the exit node, in `#4aa8ff`.
  - It sits on the open-frame side: the right of the text for `left` and `bottom-left`, the left otherwise.
  - Marks are 10px rings, 14px apart, below the entry node; `[data-on]` fills them.
  - Below 768px, the rail sits at the left gutter.
- **Remove:** the old entrance rules: `[data-arrive] .point__body > …`, the stagger delays, `.point__rise`, `shot-in`, and `point-more` with its `::details-content` rules.
- **Reduced motion** (`prefers-reduced-motion: reduce`): parts use `transform: none` and `transition: opacity 200ms ease`. Inactive parts get `opacity: 0`. No wipe (`mask-image: none`). The head is hidden. With `.landing[data-arrive="fade"]`, a scene's `.scene__text` sits at `opacity: 0` until `[data-arrived]`, then fades in over 200ms.
- **Still mode** (`.landing--still`):
  - `.scene { height: auto }`, `.scene__stage { position: static; height: auto }`
  - parts static in normal flow with `transform: none; opacity: 1`
  - head hidden; marks hidden; rail shown full

- [ ] **Step 1: Write the failing tests** (strip comments first, like the existing tests):

```ts
it('holds each scene for one scroll length per part', () => {
  expect(css).toMatch(/--part-scroll:\s*60svh/);
  expect(css).toMatch(/\.scene\s*\{[^}]*height:\s*calc\(100svh \+ var\(--parts\) \* var\(--part-scroll\)\)/);
  expect(css).toMatch(/\.scene__stage\s*\{[^}]*position:\s*sticky/);
});
it('sets body text at 17px or more', () => expect(css).toMatch(/\.point p\s*\{[^}]*clamp\(17px, 1\.32vw, 21px\)/));
it('rolls parts like credits', () => {
  expect(css).toMatch(/data-state="before"\][^{]*\{[^}]*translateY\(105%\)/);
  expect(css).toMatch(/data-state="after"\][^{]*\{[^}]*translateY\(-105%\)/);
  expect(css).toContain('1100ms cubic-bezier(0.65, 0, 0.35, 1)');
});
it('lets the light write each scene on arrival, in every engine', () => {
  expect(css).toContain('1000ms cubic-bezier(0.45, 0, 0.25, 1)');
  expect(css).toMatch(/-webkit-mask-image:[^;]*45%/);
  expect(css).toMatch(/[^-]mask-image:[^;]*45%/);
});
it('drops the old entrances and "More"', () => expect(css).not.toMatch(/point__rise|point-more|shot-in/));
it('stacks everything in normal flow with motion off', () => {
  expect(css).toMatch(/\.landing--still \.scene\s*\{[^}]*height:\s*auto/);
  expect(css).toMatch(/\.landing--still \.scene__stage\s*\{[^}]*position:\s*static/);
});
it('fades instead of rolling with reduced motion', () => expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*scene__part[\s\S]*opacity 200ms/));
```

- [ ] **Step 2: Run** `npx vitest run src/landing/__tests__/landingCss.test.ts`. Expected: the new tests FAIL; the old regression tests still PASS.
- [ ] **Step 3: Write the CSS** as specified.
- [ ] **Step 4: Run** `npx vitest run src/landing/__tests__/landingCss.test.ts`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(landing): scene layout, larger type, credits roll and light wipe`.

### Task 6: Scene controller and wiring

**Files:**
- Create: `src/landing/useScenes.ts` and `src/landing/useCompact.ts`
- Modify: `src/landing/FlightLanding.tsx`
- Test: `src/landing/__tests__/FlightLanding.test.tsx`

**Interfaces:**
- Consumes: `partAt`, `sceneFrame`, `slotStates`, `stepIn`, `partScrollY` and `Hold` (Task 2); `cameraFor` (Task 3); the markup contract (Task 4); `partsFor` (Task 1, for each scene's slot list); `useLenis` from `@/components/motion/SmoothScroll`.
- Produces:
  - `useCompact(): boolean`. It reads `matchMedia(COMPACT_QUERY)` and starts `false` when `window` is undefined.
  - `useScenes(root: RefObject<HTMLElement | null>, opts: { motion: boolean; reduced: boolean; compact: boolean }): void`.
  - `holdsFrom(root: HTMLElement, vh: number): Hold[]`, exported for Task 7. For each `[data-point]` section: `start = rect.top + scrollY`, `end = start + offsetHeight - vh`, `parts = Number(dataset.parts)`.

**`useScenes` behavior:**
- **Measure:**
  - Measure holds on mount, on ScrollTrigger refresh, on a `ResizeObserver` of the root, on `document.fonts.ready`, and whenever `compact` changes.
  - Keep a `prev: number[]` (initially `-1`s). Clamp it when the part count changes.
- **On every ScrollTrigger update**, compute `sceneFrame(scrollY, holds, prev)` and write:
  - `data-held` on the held section only;
  - `data-arrived` once, never removed, when a section is first held. River also gets it on mount when `motion`;
  - each `.scene__part`'s `data-state` from `slotStates`;
  - `data-on` on the `li` at `stepIn` (Downtown), and on marks `0..active`;
  - the Downtown head's `translate`: `0 {stepY - exitY}px`, where `stepY` is the active `li`'s `offsetTop`-chain offset within the body;
  - `--rail-h` on each `.point__body`, on measure only (see Task 5);
  - `cameraFor(root).setPush(opts.motion && !opts.reduced ? push : 1)`.
- **Arrival mode:** set `data-arrive` on the root to `'on'` (motion and not reduced) or `'fade'` (motion and reduced). Remove it in cleanup.
- **Focus:** on `focusin` inside a `.scene__part` whose state isn't `active`, scroll to `partScrollY(hold, first part index of that slot)` with `lenis.scrollTo(y, { immediate: true, force: true })`. Without Lenis, use `window.scrollTo`.
- **Motion off** (`!motion`): do nothing except `cameraFor(root).setPush(1)`. The CSS still mode handles layout.

**Wiring in `FlightLanding.tsx`:**
- `compact = useCompact()`;
- `reduced = useMatches('(prefers-reduced-motion: reduce)')`, a local hook in `useCompact.ts`;
- `useScenes(root, { motion, reduced, compact })`;
- pass `compact` to every `PointSection`.

- [ ] **Step 1: Write the failing tests** (SSR, like today):

```ts
it('lays out six scenes with five gaps where the camera flies', async () => {
  const html = await render();
  expect(html.match(/class="point point--[a-z-]+ scene"/g)).toHaveLength(6);
  expect(html.match(/class="landing__gap"/g)).toHaveLength(5);
});
it('renders the desktop parts before the screen is measured', async () => {
  expect(await render()).toContain('data-parts="3"'); // Brickell, non-compact on the server
});
```

Keep today's tests: still mode, AI disclosure, nothing drawn on the film.

- [ ] **Step 2: Run** `npx vitest run src/landing/__tests__/FlightLanding.test.tsx`. Expected: FAIL until the wiring lands.
- [ ] **Step 3: Implement** `useCompact.ts`, `useScenes.ts` and the wiring.
- [ ] **Step 4: Run** `npx vitest run` and `npm run lint`. Expected: everything PASSES except the `LightPath` and `lightCurve` tests owned by Task 7, and lint has 0 errors.
- [ ] **Step 5: Smoke check.** Start `about-me-survey-dev` and open `http://localhost:5230/About-Me/?view=cinematic`. Scroll Brickell: its parts roll and the marks fill. The console has no errors.
- [ ] **Step 6: Commit** `feat(landing): scene controller drives parts, arrival and push-in`.

### Task 7: The light in the gaps, the rail in the holds

**Files:**
- Create: `src/landing/measureScenes.ts`
- Modify: `src/landing/LightPath.tsx` and `src/landing/lightCurve.ts`. Remove `lightFor`, `HEAD_LINE` and `reached`; add `pointAt`.
- Test: `src/landing/__tests__/LightPath.test.tsx`, `src/landing/__tests__/lightCurve.test.ts`, `src/landing/__tests__/measureScenes.test.ts`

**Interfaces:**
- Consumes: `holdsFrom` (Task 6); `gapProgress` (Task 2); `pathD` and `samplePath` (existing).
- Produces:

```ts
export interface SceneBox { top: number; height: number; entry: Node; exit: Node } // landing coordinates
export function offsetWithin(el: HTMLElement, ancestor: HTMLElement): { x: number; y: number }; // offsetTop/Left chain, ignores transforms
export function measureScenes(root: HTMLElement, vh: number, held: boolean): SceneBox[];
export function gapNodes(boxes: SceneBox[]): [Node, Node][]; // [exit_i, entry_{i+1}]
export function pointAt(samples: Sample[], fraction: number): Node; // by length; 0 = first, 1 = last
```

**Geometry:** for a section at landing `top`:
- `entry = { x: e.x, y: top + e.y }`, where `e = offsetWithin(entryNode, stage)` plus the node's half size;
- `exit = { x: x.x, y: top + (held ? height - vh : 0) + x.y }`.

This places the entry where it is on screen when the hold starts, and the exit where it is when the hold ends.

**`LightPath`:**
- Render one group per gap (route, halo, glow and core paths with `pathLength={1}`), plus one head group. Drop the per-stop dots; the rail marks replace them.
- On update:
  - for each gap g, `t = gapProgress(scrollY, holds[g], holds[g + 1])` sets the dash offset `1 - t`;
  - the head sits at `pointAt(samples[g], t)` for the gap with `0 < t < 1`;
  - the head gets `data-hidden` when no gap is in progress.
- With motion off, every gap is drawn whole (`t = 1`) and there is no head.
- Re-measure on the same triggers as Task 6.
- `LightPath` no longer sets `data-arrive` or `data-arrived`; Task 6 owns both.
- Keep `landingSize`.

- [ ] **Step 1: Write the failing tests.**
  - **`measureScenes`:** fake sections whose `getBoundingClientRect().top` and `offsetHeight` are set, with nodes whose `offsetTop`/`offsetLeft`/`offsetParent` chain ends at the stage.
    - Held: with `top 1000, height 3000, vh 900`, an entry node at y 120 and an exit node at y 700 give `entry.y === 1120` and `exit.y === 1000 + 2100 + 700`.
    - Still: `exit.y === 1700`.
  - **`gapNodes`:** pairs scene i's exit with scene i+1's entry; 6 boxes give 5 pairs.
  - **`pointAt`:** `pointAt(s, 0)` is the first sample, `pointAt(s, 1)` the last, and `pointAt(s, 0.5)` sits at half the total length (±1px).
  - **`offsetWithin`:** ignores a `style.translate` on an intermediate element (the fake has one; the sum is unchanged).
  - **Removals:** delete the `lightFor`/`reached` tests. Keep the `pathD`/`samplePath` tests, the `landingSize` test, and "renders nothing to draw before nodes are measured".
- [ ] **Step 2: Run** `npx vitest run src/landing/__tests__/measureScenes.test.ts src/landing/__tests__/lightCurve.test.ts src/landing/__tests__/LightPath.test.tsx`. Expected: FAIL.
- [ ] **Step 3: Implement** `measureScenes.ts`, `pointAt`, and the new `LightPath`.
- [ ] **Step 4: Run** `npx vitest run`, `npm run lint` and `npm run build`. Expected: all PASS, 0 lint errors, build OK.
- [ ] **Step 5: Commit** `feat(landing): light flies the gaps and rails beside each held scene`.

### Task 8: Verify in a real browser, tune, document

**Files:**
- Create: `.superpowers/sdd/2026-10-19-stop-scenes/probe.cjs` (git-ignored scratch; same pattern as `.superpowers/sdd/2026-10-14-light-path-landing/shots.cjs`: `playwright-core` from `C:/Users/abel/Documents/Code/3d-app/node_modules`, `channel: 'chrome'`, headless)
- Modify, only if the probe finds a problem: the compact splits in `parts.ts` (with matching updates to its count tests), or type sizes in `landing.css` within the limits.
- Modify: `DESIGN.md` and `.impeccable/design.json`. Record the type scale, the roll and wipe motion, held scenes, and the removal of "More".

**The probe**, against `http://localhost:5230/About-Me/?view=cinematic`, at 1920×1080, 1440×900, 1280×600, 1024×768 and 390×844, plus 1440×900 with `reducedMotion: 'reduce'`. For every scene and every part, it scrolls to `partScrollY` and waits 1300ms, then checks:

1. **Fit:** the active `.scene__part` box, plus the label and headline, lies between the header bottom and `innerHeight - 40`.
2. **Attached light:** the `.scene__rail` and `.point__body` rects differ by the same amount at the first and last part (within 1px).
3. **Deep links:** loading `/#exp-globenet` cold leaves Brickell's Globenet part `data-state="active"`.
4. **Focus:** tabbing from the last link of a part brings the next part to `active`.
5. **Footer:** after scrolling to the bottom, nothing renders below the footer (0px).
6. **Long tasks:** a `PerformanceObserver` for `longtask` during 10 part changes records none over 50ms.
7. **Nav highlight:** at each scene, the header's active nav link matches that point (Overview, Experience, Expertise, Projects, Contact).
8. **Resize mid-scene:** on Brickell's third part at 1440×900, resizing to 390×844 leaves exactly one `data-state="active"` part in Brickell, with no console errors.

It saves a screenshot per part to `.impeccable/review/scenes-<w>x<h>-<point>-<part>.png`.

- [ ] **Step 1: Run the probe.** Expected: a report line per size; all checks pass.
- [ ] **Step 2: Fix and re-run.** For every failure, fix the cause: add a compact split, or tune a size within the limits. Update the tests that pin the change, and re-run the probe until it's clean.
- [ ] **Step 3: Look at the captures.** No part covers a landmark tower: compare against the stop's zone in `tools/flight/zones.py`. The rail sits on the open-frame side.
- [ ] **Step 4: Update** `DESIGN.md` and `.impeccable/design.json`. Check the JSON parses: `node -e "JSON.parse(require('fs').readFileSync('.impeccable/design.json','utf8'))"`.
- [ ] **Step 5: Final run.** `npx vitest run`, `npm run lint` and `npm run build` all pass.
- [ ] **Step 6: Commit** `test(landing): fit and behavior probe for stop scenes; docs`, then open the PR with the finishing-a-development-branch skill.
