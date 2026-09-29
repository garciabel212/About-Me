# Miami Flight — Milestone 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Home hero with a scroll-scrubbed aerial flight (Miami River → Brickell stop) that carries the introduction and the Service Map Planner panel, running on placeholder frames until the user's Google Earth Studio render drops in.

**Architecture:** A build script turns an Earth Studio image export (or a synthetic placeholder sequence) into WebP frames plus a generated TypeScript manifest. At runtime a pinned section maps ScrollTrigger progress → fractional frame index via a piecewise segment map; a `FrameStore` loads frames in coarse-to-fine tiers biased toward the playhead; a canvas cross-fades adjacent frames; content panels fade by progress windows. Pure logic (scroll map, frame store, crop math, beat timing, contrast) is unit-tested with Vitest; the React/GSAP layer is verified in the browser.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Tailwind 3.4, GSAP 3.15 + ScrollTrigger + `@gsap/react`, Lenis 1.3, Vitest 5 (new, dev), sharp 0.35 (new, dev).

**Spec:** `docs/superpowers/specs/2026-09-28-miami-flight-design.md`

## Global Constraints

- Work on branch `feat/miami-flight`. Never commit to `main`. Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Site stays static on GitHub Pages; Vite `base` is `/About-Me/` in production, so every public asset URL is built from `import.meta.env.BASE_URL`.
- `.npmrc` has `legacy-peer-deps=true`; install with plain `npm install -D <pkg>` (it applies automatically).
- `tsconfig.app.json` has `noUnusedLocals` / `noUnusedParameters` and `verbatimModuleSyntax`: type-only imports must use `import type`.
- Frames: desktop 1920×1080, mobile 720×1280, WebP; filenames `0001.webp…` (1-based, 4 digits) under `public/flight/<id>/{desktop,mobile}/`.
- Stop segments are decimated at build time (stride 3); transit keeps every frame.
- Earth Studio attribution is burned into frames; the canvas crop is **bottom-anchored** so it is never cropped vertically.
- Canvas backing store DPR capped at 2.
- Flight panels use only `--text-primary`, `--text-secondary`, `--accent` for text (never `--text-muted`) on a veil of `--bg` at ≥ 84% (`VEIL_ALPHA`).
- Mode is chosen in React (`useFlightMode`) rather than `gsap.matchMedia`, because the static mode renders different markup.
- Acceptance bar (spec §7): no blank/flashing frames either direction; no long tasks > 50 ms while scrubbing on desktop; intro readable on first paint and coarse scrub after ≤ 3 MB; M1 payload ≤ ~25 MB desktop / ≤ ~8 MB mobile; WCAG AA on worst frame; attribution visible at 375 px, 1440 px, and 21:9.
- Out of scope for M1: beats 3–6, nav re-pointing, retiring other Home sections, deleting `src/components/hero/Hero.tsx`.

## Review Focus

1. **Viewport crossing 768 px mid-flight** (rotate phone, resize window) — expected: mode switches, store and trigger rebuild, no console errors, flight still scrubs. Test: Task 8, Step 9.
2. **Hash deep links into Home** (nav CONTACT / WORK from another route) with the pin spacer present — expected: lands on `#contact` / `#work`, not inside the flight. Test: Task 8, Step 10.
3. **Frames fail to load** (404 / offline) — expected: poster stays, all text readable and clickable, no unhandled promise rejections. Test: Task 8, Step 11.
4. **Leaving Home and returning** (case study → back, plus StrictMode double-mount) — expected: exactly one flight ScrollTrigger and one pin spacer, no leaked loaders. Test: Task 8, Step 12.
5. **Fling to the end before fine tiers load** — expected: coarse nearest frame shown, never blank. Unit test: Task 2 (`nearest` with sparse frames); browser test: Task 10, Step 4.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/flight/manifest.ts` | Types (`Segment`, `FlightManifest`, `FrameSize`) and URL helpers. No data. |
| `src/flight/scrollMap.ts` | Pure: segment progress ranges; progress → fractional frame; local → global progress. |
| `src/flight/FrameStore.ts` | Tiered, playhead-biased, bounded-concurrency frame loading with injected loader. |
| `src/flight/coverRect.ts` | Pure: bottom-anchored cover-fit source crop. |
| `src/flight/beats.ts` | Beat specs for M1 and pure opacity / focus-progress math. |
| `src/flight/contrast.ts` | Pure: WCAG contrast and worst-case veil contrast. |
| `src/flight/veil.ts` | `VEIL_ALPHA` constant and the veil style object. |
| `src/flight/useFlightMode.ts` | `'desktop' \| 'mobile' \| 'static'` from media queries + Save-Data. |
| `src/flight/FlightCanvas.tsx` | Canvas renderer (DPR, resize, visibility, cross-fade). |
| `src/flight/StagePanel.tsx` | Positions one beat's content per mode; exposes a ref for style updates. |
| `src/flight/beats/IntroBeat.tsx` | Beat 1 content (relocated Hero copy + portrait). |
| `src/flight/beats/ServiceMapBeat.tsx` | Beat 2 content (relocated Service Map Planner panel). |
| `src/flight/FlightJourney.tsx` | Pinned section; wires ScrollTrigger → frame/panels; static mode; focus & skip link. |
| `src/flight/generated/m1.ts` | **Generated** manifest (frame count, segments, poster). |
| `src/flight/__tests__/*.test.ts` | Unit tests. |
| `flight/m1.config.json` | Build input: raw frame ranges, strides, scroll lengths, still frame. |
| `flight/m1-camera-path.md` | Keyframe table + Earth Studio instructions for the user. |
| `scripts/build-frames.mjs` | Frames + manifest generator (real export or placeholder). |
| `public/flight/m1/**` | Committed WebP frames and stills. |
| Modify `src/components/motion/SmoothScroll.tsx` | Own the Lenis → ScrollTrigger sync. |
| Modify `src/components/projects/HeroReveal.tsx` | Drop its local sync copy. |
| Modify `src/components/motion/PageTransition.tsx` | Clear `filter` after enter so pinned `position: fixed` works. |
| Modify `src/components/background/Atmosphere.tsx` | Pause while the flight is on screen. |
| Modify `src/components/home/FeaturedWorkSection.tsx` | Remove Service Map Planner (now beat 2). |
| Modify `src/pages/Home.tsx` | `<Hero />` → `<FlightJourney />` + `<SignalRail />`. |
| Modify `package.json`, `.gitignore`, `.github/workflows/deploy.yml` | Scripts, deps, raw-export ignore, CI test step. |

---

### Task 1: Test harness, manifest types, scroll map

**Files:**
- Modify: `package.json` (scripts, devDependencies)
- Modify: `.github/workflows/deploy.yml` (add test step)
- Create: `src/flight/manifest.ts`
- Create: `src/flight/scrollMap.ts`
- Test: `src/flight/__tests__/scrollMap.test.ts`

**Interfaces:**
- Produces:
  - `type SegmentKind = 'transit' | 'stop'`
  - `type FrameSize = 'desktop' | 'mobile'`
  - `interface Segment { id: string; kind: SegmentKind; frames: readonly [number, number]; scrollVh: Readonly<Record<FrameSize, number>> }`
  - `interface FlightManifest { id: string; frameCount: number; segments: readonly Segment[]; poster: string }`
  - `frameUrl(baseUrl: string, flightId: string, size: FrameSize, index: number): string` (index 0-based)
  - `stillUrl(baseUrl: string, flightId: string, size: FrameSize): string`
  - `totalScrollVh(manifest: FlightManifest, size: FrameSize): number`
  - `interface SegmentRange { id: string; start: number; end: number }`
  - `segmentRanges(segments: readonly Segment[], size: FrameSize): SegmentRange[]`
  - `progressToFrame(segments: readonly Segment[], size: FrameSize, progress: number): number`
  - `localToGlobal(ranges: readonly SegmentRange[], segmentId: string, local: number): number`

- [ ] **Step 1: Install Vitest and add scripts**

```bash
npm install -D vitest@^5.0.2
```

In `package.json` `"scripts"`, add after `"preview"`:

```json
    "preview": "vite preview",
    "test": "vitest run",
    "frames": "node scripts/build-frames.mjs"
```

(`frames` is used in Task 5; adding it now keeps `package.json` edits in one place.)

- [ ] **Step 2: Add a CI test step**

In `.github/workflows/deploy.yml`, between "Install dependencies" and "Build production bundle":

```yaml
      - name: Run unit tests
        run: npm test
```

- [ ] **Step 3: Write `src/flight/manifest.ts`**

```ts
export type SegmentKind = 'transit' | 'stop';
export type FrameSize = 'desktop' | 'mobile';

export interface Segment {
  id: string;
  kind: SegmentKind;
  /** Inclusive [first, last] indices into the committed frame list (0-based). */
  frames: readonly [number, number];
  /** Scroll length of this segment, in viewport heights, per frame size. */
  scrollVh: Readonly<Record<FrameSize, number>>;
}

export interface FlightManifest {
  id: string;
  frameCount: number;
  segments: readonly Segment[];
  /** Tiny blurred first frame as a data URI, painted before any frame loads. */
  poster: string;
}

export function frameUrl(baseUrl: string, flightId: string, size: FrameSize, index: number): string {
  return `${baseUrl}flight/${flightId}/${size}/${String(index + 1).padStart(4, '0')}.webp`;
}

export function stillUrl(baseUrl: string, flightId: string, size: FrameSize): string {
  return `${baseUrl}flight/${flightId}/still-${size}.webp`;
}

export function totalScrollVh(manifest: FlightManifest, size: FrameSize): number {
  return manifest.segments.reduce((sum, segment) => sum + segment.scrollVh[size], 0);
}
```

- [ ] **Step 4: Write the failing tests** — `src/flight/__tests__/scrollMap.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import type { Segment } from '../manifest';
import { localToGlobal, progressToFrame, segmentRanges } from '../scrollMap';

const SEGMENTS: Segment[] = [
  { id: 'river', kind: 'transit', frames: [0, 143], scrollVh: { desktop: 250, mobile: 150 } },
  { id: 'brickell', kind: 'stop', frames: [144, 167], scrollVh: { desktop: 150, mobile: 100 } },
];

describe('segmentRanges', () => {
  it('splits progress by scroll weight and ends exactly at 1', () => {
    expect(segmentRanges(SEGMENTS, 'desktop')).toEqual([
      { id: 'river', start: 0, end: 0.625 },
      { id: 'brickell', start: 0.625, end: 1 },
    ]);
    const mobile = segmentRanges(SEGMENTS, 'mobile');
    expect(mobile[0].end).toBeCloseTo(0.6);
    expect(mobile[1].end).toBe(1);
  });
});

describe('progressToFrame', () => {
  it('maps the ends to the first and last frame', () => {
    expect(progressToFrame(SEGMENTS, 'desktop', 0)).toBe(0);
    expect(progressToFrame(SEGMENTS, 'desktop', 1)).toBe(167);
  });

  it('is continuous across a segment boundary (no one-frame pop)', () => {
    expect(progressToFrame(SEGMENTS, 'desktop', 0.625)).toBeCloseTo(144);
    expect(progressToFrame(SEGMENTS, 'desktop', 0.625 + 1e-9)).toBeCloseTo(144, 3);
    expect(progressToFrame(SEGMENTS, 'mobile', 0.6)).toBeCloseTo(144);
  });

  it('interpolates within a transit segment', () => {
    expect(progressToFrame(SEGMENTS, 'desktop', 0.3125)).toBeCloseTo(72);
  });

  it('clamps out-of-range progress', () => {
    expect(progressToFrame(SEGMENTS, 'desktop', -0.5)).toBe(0);
    expect(progressToFrame(SEGMENTS, 'desktop', 1.5)).toBe(167);
  });

  it('is monotonic non-decreasing', () => {
    let previous = -Infinity;
    for (let i = 0; i <= 1000; i += 1) {
      const frame = progressToFrame(SEGMENTS, 'desktop', i / 1000);
      expect(frame).toBeGreaterThanOrEqual(previous);
      previous = frame;
    }
  });

  it('advances far fewer frames per unit of scroll in a stop than in a transit', () => {
    const transitRate = (progressToFrame(SEGMENTS, 'desktop', 0.5) - progressToFrame(SEGMENTS, 'desktop', 0.1)) / 0.4;
    const stopRate = (progressToFrame(SEGMENTS, 'desktop', 0.95) - progressToFrame(SEGMENTS, 'desktop', 0.7)) / 0.25;
    expect(stopRate).toBeLessThan(transitRate / 3);
  });

  it('returns 0 for an empty flight', () => {
    expect(progressToFrame([], 'desktop', 0.5)).toBe(0);
  });
});

describe('localToGlobal', () => {
  it('converts a position inside a segment to overall progress', () => {
    const ranges = segmentRanges(SEGMENTS, 'desktop');
    expect(localToGlobal(ranges, 'river', 0)).toBe(0);
    expect(localToGlobal(ranges, 'brickell', 0.5)).toBeCloseTo(0.8125);
  });

  it('throws on an unknown segment id', () => {
    expect(() => localToGlobal(segmentRanges(SEGMENTS, 'desktop'), 'nope', 0)).toThrow(/nope/);
  });
});
```

- [ ] **Step 5: Run the tests and confirm they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `../scrollMap`.

- [ ] **Step 6: Write `src/flight/scrollMap.ts`**

```ts
import type { FrameSize, Segment } from './manifest';

export interface SegmentRange {
  id: string;
  /** Overall scroll progress (0–1) where this segment begins. */
  start: number;
  /** Overall scroll progress (0–1) where this segment ends. */
  end: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function segmentRanges(segments: readonly Segment[], size: FrameSize): SegmentRange[] {
  const total = segments.reduce((sum, segment) => sum + segment.scrollVh[size], 0);
  let cursor = 0;
  return segments.map((segment, index) => {
    const start = cursor;
    cursor += total > 0 ? segment.scrollVh[size] / total : 0;
    return { id: segment.id, start, end: index === segments.length - 1 ? 1 : cursor };
  });
}

/**
 * Overall scroll progress → fractional frame index. Each segment interpolates from
 * its first frame to the next segment's first frame, so boundaries are continuous.
 */
export function progressToFrame(segments: readonly Segment[], size: FrameSize, progress: number): number {
  if (segments.length === 0) return 0;
  const p = clamp(progress, 0, 1);
  const ranges = segmentRanges(segments, size);
  let index = ranges.findIndex((range) => p <= range.end);
  if (index === -1) index = ranges.length - 1;

  const range = ranges[index];
  const segment = segments[index];
  const next = segments[index + 1];
  const from = segment.frames[0];
  const to = next ? next.frames[0] : segment.frames[1];
  const span = range.end - range.start;
  const t = span > 0 ? (p - range.start) / span : 1;
  return from + (to - from) * t;
}

export function localToGlobal(ranges: readonly SegmentRange[], segmentId: string, local: number): number {
  const range = ranges.find((candidate) => candidate.id === segmentId);
  if (!range) throw new Error(`Unknown flight segment: ${segmentId}`);
  return range.start + (range.end - range.start) * clamp(local, 0, 1);
}
```

- [ ] **Step 7: Run the tests and confirm they pass**

Run: `npm test`
Expected: PASS (10 tests).

- [ ] **Step 8: Typecheck and lint**

Run: `npm run build && npm run lint`
Expected: build succeeds; oxlint reports no errors.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json .github/workflows/deploy.yml src/flight/manifest.ts src/flight/scrollMap.ts src/flight/__tests__/scrollMap.test.ts
git commit -m "feat(flight): add scroll-to-frame mapping with Vitest harness

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: FrameStore (tiered, playhead-biased loading)

**Files:**
- Create: `src/flight/FrameStore.ts`
- Test: `src/flight/__tests__/FrameStore.test.ts`

**Interfaces:**
- Produces:
  - `type FrameLoader<T> = (index: number) => Promise<T>`
  - `interface FrameStoreOptions<T> { frameCount: number; load: FrameLoader<T>; concurrency?: number; onLoad?: (index: number) => void }`
  - `class FrameStore<T>` with `start(): void`, `setPlayhead(index: number): void`, `get(index: number): T | undefined`, `nearest(index: number): { index: number; frame: T } | null`, `dispose(): void`, readonly-ish `version: number`, getters `readyCount: number`, `failedCount: number`
  - Tier rule: stride 8 → 4 → 2 → 1; the **last frame is always tier 0**; within a tier, closest to the playhead first, ties to the lower index. Default concurrency 6.

- [ ] **Step 1: Write the failing tests** — `src/flight/__tests__/FrameStore.test.ts`

```ts
import { describe, expect, it, vi } from 'vitest';
import { FrameStore } from '../FrameStore';

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function deferredLoader() {
  const calls: number[] = [];
  const pending = new Map<number, { resolve: (value: string) => void; reject: (error: Error) => void }>();
  const load = (index: number) => {
    calls.push(index);
    return new Promise<string>((resolve, reject) => pending.set(index, { resolve, reject }));
  };
  return {
    calls,
    load,
    resolve: (index: number) => pending.get(index)!.resolve(`frame-${index}`),
    reject: (index: number) => pending.get(index)!.reject(new Error(`missing ${index}`)),
  };
}

function instantOrder(frameCount: number, playhead: number) {
  const calls: number[] = [];
  const store = new FrameStore<string>({
    frameCount,
    concurrency: 1,
    load: async (index) => {
      calls.push(index);
      return `frame-${index}`;
    },
  });
  store.setPlayhead(playhead);
  store.start();
  return { store, calls };
}

describe('FrameStore load order', () => {
  it('loads coarse tiers first (8 → 4 → 2 → 1), last frame in the first tier', async () => {
    const { calls } = instantOrder(18, 0);
    await flush();
    expect(calls).toEqual([0, 8, 16, 17, 4, 12, 2, 6, 10, 14, 1, 3, 5, 7, 9, 11, 13, 15]);
  });

  it('orders each tier by distance from the playhead', async () => {
    const { calls } = instantOrder(18, 17);
    await flush();
    expect(calls.slice(0, 4)).toEqual([17, 16, 8, 0]);
    expect(calls.slice(4, 6)).toEqual([12, 4]);
  });

  it('re-prioritizes remaining work when the playhead moves mid-load', async () => {
    const loader = deferredLoader();
    const store = new FrameStore<string>({ frameCount: 18, concurrency: 1, load: loader.load });
    store.start();
    expect(loader.calls).toEqual([0]);
    store.setPlayhead(17);
    loader.resolve(0);
    await flush();
    expect(loader.calls).toEqual([0, 17]);
  });

  it('never exceeds the concurrency limit', () => {
    const loader = deferredLoader();
    new FrameStore<string>({ frameCount: 40, concurrency: 3, load: loader.load }).start();
    expect(loader.calls).toHaveLength(3);
  });
});

describe('FrameStore lookup', () => {
  it('returns null from nearest() before anything loads', () => {
    const loader = deferredLoader();
    const store = new FrameStore<string>({ frameCount: 18, load: loader.load });
    expect(store.nearest(5)).toBeNull();
  });

  it('falls back to the closest loaded frame when only coarse frames exist', async () => {
    const loader = deferredLoader();
    const store = new FrameStore<string>({ frameCount: 18, concurrency: 1, load: loader.load });
    store.start();
    loader.resolve(0);
    await flush();
    expect(store.nearest(15)).toEqual({ index: 0, frame: 'frame-0' });
    loader.resolve(8);
    await flush();
    expect(store.nearest(15)).toEqual({ index: 8, frame: 'frame-8' });
    expect(store.nearest(99)).toEqual({ index: 8, frame: 'frame-8' });
  });

  it('get() returns only exact frames', async () => {
    const { store } = instantOrder(18, 0);
    await flush();
    expect(store.get(5)).toBe('frame-5');
    expect(store.get(18)).toBeUndefined();
    expect(store.readyCount).toBe(18);
  });

  it('bumps version and calls onLoad for each loaded frame', async () => {
    const onLoad = vi.fn();
    const store = new FrameStore<string>({ frameCount: 3, load: async (i) => `frame-${i}`, onLoad });
    store.start();
    await flush();
    expect(store.version).toBe(3);
    expect(onLoad).toHaveBeenCalledTimes(3);
  });
});

describe('FrameStore failures and disposal', () => {
  it('skips failed frames and keeps loading the rest', async () => {
    const store = new FrameStore<string>({
      frameCount: 18,
      load: (i) => (i === 8 ? Promise.reject(new Error('404')) : Promise.resolve(`frame-${i}`)),
    });
    store.start();
    await flush();
    expect(store.readyCount).toBe(17);
    expect(store.failedCount).toBe(1);
    expect(store.nearest(8)).toEqual({ index: 7, frame: 'frame-7' });
  });

  it('stops loading and ignores late results after dispose()', async () => {
    const loader = deferredLoader();
    const store = new FrameStore<string>({ frameCount: 18, concurrency: 1, load: loader.load });
    store.start();
    store.dispose();
    loader.resolve(0);
    await flush();
    expect(loader.calls).toEqual([0]);
    expect(store.get(0)).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npm test -- FrameStore`
Expected: FAIL — cannot resolve `../FrameStore`.

- [ ] **Step 3: Write `src/flight/FrameStore.ts`**

```ts
export type FrameLoader<T> = (index: number) => Promise<T>;

export interface FrameStoreOptions<T> {
  frameCount: number;
  load: FrameLoader<T>;
  /** Maximum simultaneous loads. Default 6. */
  concurrency?: number;
  onLoad?: (index: number) => void;
}

const TIER_STRIDES = [8, 4, 2, 1] as const;

/**
 * Loads a frame sequence coarse-to-fine (every 8th frame, then every 4th, 2nd, all),
 * nearest-to-playhead first within each tier, so a scrub always has something close
 * to show. Holding decoded-image memory is left to the browser.
 */
export class FrameStore<T> {
  /** Increments on every successful load so renderers can detect new data cheaply. */
  version = 0;

  private readonly frames = new Map<number, T>();
  private readonly failed = new Set<number>();
  private readonly pending: Set<number>[];
  private inFlight = 0;
  private playhead = 0;
  private started = false;
  private disposed = false;
  private readonly options: FrameStoreOptions<T>;

  constructor(options: FrameStoreOptions<T>) {
    this.options = options;
    this.pending = TIER_STRIDES.map(() => new Set<number>());
    for (let index = 0; index < options.frameCount; index += 1) {
      this.pending[this.tierOf(index)].add(index);
    }
  }

  get readyCount(): number {
    return this.frames.size;
  }

  get failedCount(): number {
    return this.failed.size;
  }

  start(): void {
    if (this.started || this.disposed) return;
    this.started = true;
    this.pump();
  }

  setPlayhead(index: number): void {
    this.playhead = index;
  }

  get(index: number): T | undefined {
    return this.frames.get(index);
  }

  nearest(index: number): { index: number; frame: T } | null {
    const count = this.options.frameCount;
    if (this.frames.size === 0 || count === 0) return null;
    const base = Math.min(count - 1, Math.max(0, Math.round(index)));
    for (let distance = 0; distance < count; distance += 1) {
      const lower = base - distance;
      if (lower >= 0) {
        const frame = this.frames.get(lower);
        if (frame !== undefined) return { index: lower, frame };
      }
      const upper = base + distance;
      if (upper < count) {
        const frame = this.frames.get(upper);
        if (frame !== undefined) return { index: upper, frame };
      }
    }
    return null;
  }

  dispose(): void {
    this.disposed = true;
    this.pending.forEach((tier) => tier.clear());
  }

  private tierOf(index: number): number {
    if (index === this.options.frameCount - 1) return 0;
    const tier = TIER_STRIDES.findIndex((stride) => index % stride === 0);
    return tier === -1 ? TIER_STRIDES.length - 1 : tier;
  }

  private next(): number | undefined {
    for (const tier of this.pending) {
      if (tier.size === 0) continue;
      let best: number | undefined;
      let bestDistance = Infinity;
      for (const index of tier) {
        const distance = Math.abs(index - this.playhead);
        if (distance < bestDistance) {
          best = index;
          bestDistance = distance;
        }
      }
      if (best !== undefined) tier.delete(best);
      return best;
    }
    return undefined;
  }

  private pump(): void {
    const limit = this.options.concurrency ?? 6;
    while (!this.disposed && this.inFlight < limit) {
      const index = this.next();
      if (index === undefined) return;
      this.inFlight += 1;
      this.options
        .load(index)
        .then(
          (frame) => {
            if (this.disposed) return;
            this.frames.set(index, frame);
            this.version += 1;
            this.options.onLoad?.(index);
          },
          () => {
            if (!this.disposed) this.failed.add(index);
          },
        )
        .finally(() => {
          this.inFlight -= 1;
          this.pump();
        });
    }
  }
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `npm test`
Expected: PASS (all scrollMap + FrameStore tests).

- [ ] **Step 5: Commit**

```bash
git add src/flight/FrameStore.ts src/flight/__tests__/FrameStore.test.ts
git commit -m "feat(flight): add tiered, playhead-biased FrameStore

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Crop math and FlightCanvas

**Files:**
- Create: `src/flight/coverRect.ts`
- Create: `src/flight/FlightCanvas.tsx`
- Test: `src/flight/__tests__/coverRect.test.ts`

**Interfaces:**
- Consumes: `FrameStore<HTMLImageElement>` (`nearest`, `get`, `version`) from Task 2.
- Produces:
  - `interface SourceRect { sx: number; sy: number; sw: number; sh: number }`
  - `coverRect(srcW: number, srcH: number, dstW: number, dstH: number, anchorY?: number): SourceRect` — `anchorY` 0 keeps top, 1 (default) keeps bottom; horizontal crops centered.
  - `FlightCanvas` default export, props `{ store: FrameStore<HTMLImageElement> | null; frameRef: { current: number }; poster: string }`. Fills its positioned parent (`absolute inset-0`).

- [ ] **Step 1: Write the failing tests** — `src/flight/__tests__/coverRect.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { coverRect } from '../coverRect';

describe('coverRect', () => {
  it('uses the whole source when aspects match', () => {
    expect(coverRect(1920, 1080, 960, 540)).toEqual({ sx: 0, sy: 0, sw: 1920, sh: 1080 });
  });

  it('crops sky from the top on wider viewports, keeping the bottom attribution strip', () => {
    const rect = coverRect(1920, 1080, 2520, 1080); // 21:9
    expect(rect.sx).toBe(0);
    expect(rect.sw).toBe(1920);
    expect(rect.sh).toBeCloseTo(822.857, 2);
    expect(rect.sy + rect.sh).toBeCloseTo(1080); // bottom edge preserved
  });

  it('crops the sides evenly on narrower viewports', () => {
    const rect = coverRect(1920, 1080, 1080, 1920); // 9:16
    expect(rect.sy).toBe(0);
    expect(rect.sh).toBe(1080);
    expect(rect.sw).toBeCloseTo(607.5);
    expect(rect.sx).toBeCloseTo(656.25);
  });

  it('keeps the top when anchorY is 0', () => {
    expect(coverRect(1920, 1080, 2520, 1080, 0).sy).toBe(0);
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- coverRect`
Expected: FAIL — cannot resolve `../coverRect`.

- [ ] **Step 3: Write `src/flight/coverRect.ts`**

```ts
export interface SourceRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

/**
 * Source rectangle that makes a srcW×srcH image cover a dstW×dstH box.
 * Vertical crops are anchored by `anchorY` (1 = keep the bottom, where the
 * Earth Studio attribution lives); horizontal crops are centered.
 */
export function coverRect(srcW: number, srcH: number, dstW: number, dstH: number, anchorY = 1): SourceRect {
  const srcAspect = srcW / srcH;
  const dstAspect = dstW / dstH;
  if (dstAspect > srcAspect) {
    const sh = srcW / dstAspect;
    return { sx: 0, sy: (srcH - sh) * anchorY, sw: srcW, sh };
  }
  const sw = srcH * dstAspect;
  return { sx: (srcW - sw) / 2, sy: 0, sw, sh: srcH };
}
```

- [ ] **Step 4: Run and confirm pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Write `src/flight/FlightCanvas.tsx`**

```tsx
import { useEffect, useRef } from 'react';
import type { FrameStore } from './FrameStore';
import { coverRect } from './coverRect';

interface FlightCanvasProps {
  store: FrameStore<HTMLImageElement> | null;
  /** Fractional frame index, written by the scroll driver, read every animation frame. */
  frameRef: { current: number };
  /** Blurred data-URI poster shown until the first frame is drawn. */
  poster: string;
}

export default function FlightCanvas({ store, frameRef, poster }: FlightCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !store) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let animationFrame = 0;
    let visible = true;
    let dirty = true;
    let drawnFrame = Number.NaN;
    let drawnVersion = -1;

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(canvas.clientWidth * pixelRatio));
      const height = Math.max(1, Math.round(canvas.clientHeight * pixelRatio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        dirty = true;
      }
    };

    const paint = (image: HTMLImageElement, alpha: number) => {
      const source = coverRect(image.naturalWidth, image.naturalHeight, canvas.width, canvas.height, 1);
      context.globalAlpha = alpha;
      context.drawImage(image, source.sx, source.sy, source.sw, source.sh, 0, 0, canvas.width, canvas.height);
    };

    const render = () => {
      animationFrame = 0;
      if (!visible) return;
      const frame = frameRef.current;
      if (dirty || frame !== drawnFrame || store.version !== drawnVersion) {
        const base = Math.floor(frame);
        const current = store.nearest(base);
        if (current) {
          paint(current.frame, 1);
          const blend = frame - base;
          const next = current.index === base && blend > 0.001 ? store.get(base + 1) : undefined;
          if (next) paint(next, blend);
          context.globalAlpha = 1;
          drawnFrame = frame;
          drawnVersion = store.version;
          dirty = false;
        }
      }
      animationFrame = window.requestAnimationFrame(render);
    };

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible && !animationFrame) {
        dirty = true;
        animationFrame = window.requestAnimationFrame(render);
      }
    });
    const resizeObserver = new ResizeObserver(resize);

    resize();
    intersection.observe(canvas);
    resizeObserver.observe(canvas);
    animationFrame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      intersection.disconnect();
      resizeObserver.disconnect();
    };
  }, [store, frameRef]);

  return (
    <div
      className="absolute inset-0 bg-cover bg-bottom"
      style={{ backgroundImage: `url("${poster}")` }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
```

- [ ] **Step 6: Typecheck and lint**

Run: `npm run build && npm run lint`
Expected: success (the component is not mounted yet; this checks types).

- [ ] **Step 7: Commit**

```bash
git add src/flight/coverRect.ts src/flight/FlightCanvas.tsx src/flight/__tests__/coverRect.test.ts
git commit -m "feat(flight): add bottom-anchored cover crop and cross-fading canvas

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Beat timing, veil, and contrast guarantee

**Files:**
- Create: `src/flight/beats.ts`
- Create: `src/flight/contrast.ts`
- Create: `src/flight/veil.ts`
- Test: `src/flight/__tests__/beats.test.ts`
- Test: `src/flight/__tests__/contrast.test.ts`

**Interfaces:**
- Consumes: `SegmentRange`, `localToGlobal`, `segmentRanges` (Task 1).
- Produces:
  - `type BeatId = 'intro' | 'service-map'`
  - `interface BeatSpec { id: BeatId; segment: string; fadeIn: readonly [number, number] | null; fadeOut: readonly [number, number] | null }` (segment-local 0–1)
  - `interface BeatWindow { fadeIn: readonly [number, number] | null; fadeOut: readonly [number, number] | null }` (global 0–1)
  - `M1_BEATS: readonly BeatSpec[]`
  - `resolveBeat(ranges: readonly SegmentRange[], spec: BeatSpec): BeatWindow`
  - `beatOpacity(progress: number, beatWindow: BeatWindow): number`
  - `beatFocusProgress(ranges: readonly SegmentRange[], spec: BeatSpec): number` — global progress where the beat is fully visible.
  - `VEIL_ALPHA = 0.84`, `veilStyle: { backgroundColor: string }`
  - `type RGB = readonly [number, number, number]`, `hexToRgb`, `contrastRatio(a: RGB, b: RGB)`, `worstVeilContrast(text: RGB, bg: RGB, veilAlpha: number)`

- [ ] **Step 1: Write the failing beat tests** — `src/flight/__tests__/beats.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import type { Segment } from '../manifest';
import { segmentRanges } from '../scrollMap';
import { M1_BEATS, beatFocusProgress, beatOpacity, resolveBeat } from '../beats';

const SEGMENTS: Segment[] = [
  { id: 'river', kind: 'transit', frames: [0, 143], scrollVh: { desktop: 250, mobile: 150 } },
  { id: 'brickell', kind: 'stop', frames: [144, 167], scrollVh: { desktop: 150, mobile: 100 } },
];
const ranges = segmentRanges(SEGMENTS, 'desktop');
const intro = M1_BEATS.find((beat) => beat.id === 'intro')!;
const serviceMap = M1_BEATS.find((beat) => beat.id === 'service-map')!;

describe('M1 beats', () => {
  it('shows the intro on first paint and clears it before the skyline reveal', () => {
    const w = resolveBeat(ranges, intro);
    expect(beatOpacity(0, w)).toBe(1);
    expect(beatOpacity(0.625 * 0.65, w)).toBeCloseTo(0.5);
    expect(beatOpacity(0.625 * 0.8, w)).toBe(0);
  });

  it('brings Service Map Planner in during the Brickell stop and holds it to the end', () => {
    const w = resolveBeat(ranges, serviceMap);
    expect(beatOpacity(0.625, w)).toBe(0);
    expect(beatOpacity(0.625 + 0.375 * 0.15, w)).toBeCloseTo(0.5);
    expect(beatOpacity(1, w)).toBe(1);
  });

  it('never has both beats fully visible at once', () => {
    const a = resolveBeat(ranges, intro);
    const b = resolveBeat(ranges, serviceMap);
    for (let i = 0; i <= 200; i += 1) {
      const p = i / 200;
      expect(Math.min(beatOpacity(p, a), beatOpacity(p, b))).toBeLessThan(1);
    }
  });

  it('focus progress lands where each beat is fully visible', () => {
    expect(beatOpacity(beatFocusProgress(ranges, intro), resolveBeat(ranges, intro))).toBe(1);
    expect(beatOpacity(beatFocusProgress(ranges, serviceMap), resolveBeat(ranges, serviceMap))).toBe(1);
  });
});
```

- [ ] **Step 2: Write the failing contrast tests** — `src/flight/__tests__/contrast.test.ts`

This reads the real theme tokens from `src/index.css`, so the guarantee stays true if the palette changes.

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrastRatio, hexToRgb, worstVeilContrast } from '../contrast';
import { VEIL_ALPHA } from '../veil';

const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

function token(theme: 'light' | 'dark', name: string): string {
  const start = css.indexOf(`[data-theme="${theme}"] {`);
  const block = css.slice(start, css.indexOf('}', start));
  const match = block.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`));
  if (start === -1 || !match) throw new Error(`token --${name} not found for ${theme}`);
  return match[1];
}

describe('contrast math', () => {
  it('matches known WCAG values', () => {
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21);
    expect(contrastRatio(hexToRgb('#777777'), [255, 255, 255])).toBeCloseTo(4.48, 1);
  });
});

describe.each(['light', 'dark'] as const)('flight veil in %s theme', (theme) => {
  const bg = hexToRgb(token(theme, 'bg'));
  it.each(['text-primary', 'text-secondary'])('%s meets WCAG AA over any footage', (name) => {
    expect(worstVeilContrast(hexToRgb(token(theme, name)), bg, VEIL_ALPHA)).toBeGreaterThanOrEqual(4.5);
  });
});
```

- [ ] **Step 3: Run and confirm failure**

Run: `npm test`
Expected: FAIL — cannot resolve `../beats`, `../contrast`, `../veil`.

- [ ] **Step 4: Write `src/flight/beats.ts`**

```ts
import { localToGlobal, type SegmentRange } from './scrollMap';

export type BeatId = 'intro' | 'service-map';

export interface BeatSpec {
  id: BeatId;
  /** Segment this beat lives in; fade ranges are 0–1 within that segment. */
  segment: string;
  fadeIn: readonly [number, number] | null;
  fadeOut: readonly [number, number] | null;
}

export interface BeatWindow {
  /** Global progress range over which the beat fades in (null = visible from the start). */
  fadeIn: readonly [number, number] | null;
  /** Global progress range over which the beat fades out (null = holds to the end). */
  fadeOut: readonly [number, number] | null;
}

export const M1_BEATS: readonly BeatSpec[] = [
  { id: 'intro', segment: 'river', fadeIn: null, fadeOut: [0.55, 0.75] },
  { id: 'service-map', segment: 'brickell', fadeIn: [0.05, 0.25], fadeOut: null },
];

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function ramp(value: number, from: number, to: number): number {
  if (to <= from) return value >= to ? 1 : 0;
  return clamp01((value - from) / (to - from));
}

export function resolveBeat(ranges: readonly SegmentRange[], spec: BeatSpec): BeatWindow {
  const toGlobal = (pair: readonly [number, number] | null) =>
    pair ? ([localToGlobal(ranges, spec.segment, pair[0]), localToGlobal(ranges, spec.segment, pair[1])] as const) : null;
  return { fadeIn: toGlobal(spec.fadeIn), fadeOut: toGlobal(spec.fadeOut) };
}

export function beatOpacity(progress: number, beatWindow: BeatWindow): number {
  const { fadeIn, fadeOut } = beatWindow;
  let opacity = 1;
  if (fadeIn) opacity = Math.min(opacity, ramp(progress, fadeIn[0], fadeIn[1]));
  if (fadeOut) opacity = Math.min(opacity, 1 - ramp(progress, fadeOut[0], fadeOut[1]));
  return opacity;
}

export function beatFocusProgress(ranges: readonly SegmentRange[], spec: BeatSpec): number {
  return localToGlobal(ranges, spec.segment, spec.fadeIn ? spec.fadeIn[1] : 0);
}
```

- [ ] **Step 5: Write `src/flight/contrast.ts`**

```ts
export type RGB = readonly [number, number, number];

export function hexToRgb(hex: string): RGB {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16)) as unknown as RGB;
}

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance([r, g, b]: RGB): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: RGB, b: RGB): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** Contrast of `text` over a veil of `bg` at `veilAlpha`, against the worst possible footage (pure black or white). */
export function worstVeilContrast(text: RGB, bg: RGB, veilAlpha: number): number {
  const over = (backdrop: RGB): RGB =>
    bg.map((value, i) => value * veilAlpha + backdrop[i] * (1 - veilAlpha)) as unknown as RGB;
  return Math.min(contrastRatio(text, over([0, 0, 0])), contrastRatio(text, over([255, 255, 255])));
}
```

- [ ] **Step 6: Write `src/flight/veil.ts`**

```ts
/** Opacity of the page-background veil behind flight text. Tested against theme tokens in contrast.test.ts. */
export const VEIL_ALPHA = 0.84;

export const veilStyle = {
  backgroundColor: `color-mix(in srgb, var(--bg) ${Math.round(VEIL_ALPHA * 100)}%, transparent)`,
} as const;
```

- [ ] **Step 7: Run and confirm pass**

Run: `npm test`
Expected: PASS. If a contrast case fails, raise `VEIL_ALPHA` in 0.02 steps until it passes — do **not** weaken the 4.5 threshold.

- [ ] **Step 8: Commit**

```bash
git add src/flight/beats.ts src/flight/contrast.ts src/flight/veil.ts src/flight/__tests__/beats.test.ts src/flight/__tests__/contrast.test.ts
git commit -m "feat(flight): add beat timing and veil contrast guarantee

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Frame pipeline (config, build script, placeholder frames)

**Files:**
- Create: `flight/m1.config.json`
- Create: `scripts/build-frames.mjs`
- Modify: `.gitignore`
- Generated + committed: `src/flight/generated/m1.ts`, `public/flight/m1/**`

**Interfaces:**
- Consumes: `FlightManifest` type (Task 1) — the generated file imports it.
- Produces: `export const M1: FlightManifest` from `src/flight/generated/m1.ts`; frames at `public/flight/m1/{desktop,mobile}/NNNN.webp`; `public/flight/m1/still-{desktop,mobile}.webp`.
- CLI: `npm run frames -- --config flight/m1.config.json --placeholder` or `--raw <dir> [--mobile-raw <dir>]`.

- [ ] **Step 1: Install sharp**

```bash
npm install -D sharp@^0.35.5
```

- [ ] **Step 2: Write `flight/m1.config.json`**

Raw frame numbers are 1-based positions in the sorted Earth Studio export (9 s × 24 fps = 216 frames). Frame 145 is the first Brickell frame, used as the skyline-reveal still.

```json
{
  "id": "m1",
  "rawFrameCount": 216,
  "stillRawFrame": 145,
  "segments": [
    { "id": "river", "kind": "transit", "raw": [1, 144], "stride": 1, "scrollVh": { "desktop": 250, "mobile": 150 } },
    { "id": "brickell", "kind": "stop", "raw": [145, 216], "stride": 3, "scrollVh": { "desktop": 150, "mobile": 100 } }
  ]
}
```

- [ ] **Step 3: Ignore raw exports**

Append to `.gitignore`:

```
# Earth Studio raw exports (only optimized WebP frames are committed)
flight/raw/
```

- [ ] **Step 4: Write `scripts/build-frames.mjs`**

```js
#!/usr/bin/env node
// Builds a flight's committed WebP frames and generated manifest.
//
//   npm run frames -- --config flight/m1.config.json --placeholder
//   npm run frames -- --config flight/m1.config.json --raw flight/raw/m1 [--mobile-raw flight/raw/m1-portrait]
//
// --raw        Earth Studio landscape export (PNG/JPEG, sorted by filename).
// --mobile-raw Optional portrait render of the same path; otherwise mobile frames are
//              a center 9:16 crop of the landscape export.
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import sharp from 'sharp';

const SIZES = {
  desktop: { width: 1920, height: 1080, quality: 70 },
  mobile: { width: 720, height: 1280, quality: 68 },
};

const { values } = parseArgs({
  options: {
    config: { type: 'string' },
    raw: { type: 'string' },
    'mobile-raw': { type: 'string' },
    placeholder: { type: 'boolean', default: false },
  },
});

if (!values.config || (!values.raw && !values.placeholder)) {
  console.error('usage: build-frames --config <file> (--placeholder | --raw <dir> [--mobile-raw <dir>])');
  process.exit(1);
}

const config = JSON.parse(await readFile(values.config, 'utf8'));
const outDir = path.join('public', 'flight', config.id);
const generatedFile = path.join('src', 'flight', 'generated', `${config.id}.ts`);

async function listFrames(dir) {
  const names = (await readdir(dir)).filter((name) => /\.(png|jpe?g)$/i.test(name));
  names.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (names.length < config.rawFrameCount) {
    throw new Error(`${dir} has ${names.length} frames; config expects ${config.rawFrameCount}`);
  }
  return names.map((name) => path.join(dir, name));
}

function placeholderSvg(rawNumber, { width, height }) {
  const t = (rawNumber - 1) / (config.rawFrameCount - 1);
  const horizon = height * (0.74 - 0.18 * t);
  const drift = -t * width * 0.6;
  const towers = Array.from({ length: 14 }, (_, i) => {
    const x = drift + i * width * 0.11 + width * 0.25;
    const h = height * (0.12 + ((i * 37) % 23) / 60) * (0.6 + t * 0.6);
    return `<rect x="${x.toFixed(1)}" y="${(horizon - h).toFixed(1)}" width="${(width * 0.05).toFixed(1)}" height="${h.toFixed(1)}" fill="#3d4a5c" opacity="0.85"/>`;
  }).join('');
  const fontSize = Math.round(height * 0.12);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f3c77e"/><stop offset="0.7" stop-color="#f7e3c0"/><stop offset="1" stop-color="#e8a86a"/>
  </linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#sky)"/>
  ${towers}
  <rect y="${horizon.toFixed(1)}" width="100%" height="${(height - horizon).toFixed(1)}" fill="#1f5f7a"/>
  <text x="50%" y="42%" font-family="monospace" font-size="${fontSize}" text-anchor="middle" fill="#ffffff" opacity="0.8">${rawNumber}</text>
  <text x="50%" y="${height - 14}" font-family="sans-serif" font-size="${Math.max(12, Math.round(height * 0.018))}" text-anchor="middle" fill="#ffffff">Google Earth · placeholder attribution</text>
</svg>`);
}

async function renderFrame(rawNumber, size, sources) {
  const spec = SIZES[size];
  if (!sources) return sharp(placeholderSvg(rawNumber, spec));
  const file = size === 'mobile' && sources.mobile ? sources.mobile[rawNumber - 1] : sources.landscape[rawNumber - 1];
  if (size === 'desktop' || sources.mobile) {
    return sharp(file).resize(spec.width, spec.height, { fit: 'cover', position: 'south' });
  }
  const { width, height } = await sharp(file).metadata();
  const cropWidth = Math.round((height * 9) / 16);
  return sharp(file)
    .extract({ left: Math.round((width - cropWidth) / 2), top: 0, width: cropWidth, height })
    .resize(spec.width, spec.height);
}

const sources = values.placeholder
  ? null
  : {
      landscape: await listFrames(values.raw),
      mobile: values['mobile-raw'] ? await listFrames(values['mobile-raw']) : null,
    };

// Raw frame numbers to keep, in order, and the committed index range of each segment.
const kept = [];
const segments = config.segments.map((segment) => {
  const first = kept.length;
  for (let raw = segment.raw[0]; raw <= segment.raw[1]; raw += segment.stride) kept.push(raw);
  return { id: segment.id, kind: segment.kind, frames: [first, kept.length - 1], scrollVh: segment.scrollVh };
});

await rm(outDir, { recursive: true, force: true });
const bytes = { desktop: 0, mobile: 0 };
for (const size of Object.keys(SIZES)) {
  await mkdir(path.join(outDir, size), { recursive: true });
  for (let start = 0; start < kept.length; start += 8) {
    await Promise.all(
      kept.slice(start, start + 8).map(async (raw, offset) => {
        const file = path.join(outDir, size, `${String(start + offset + 1).padStart(4, '0')}.webp`);
        await (await renderFrame(raw, size, sources)).webp({ quality: SIZES[size].quality }).toFile(file);
        bytes[size] += (await stat(file)).size;
      }),
    );
  }
  const still = path.join(outDir, `still-${size}.webp`);
  await (await renderFrame(config.stillRawFrame, size, sources)).webp({ quality: 78 }).toFile(still);
}

const posterBuffer = await (await renderFrame(kept[0], 'desktop', sources))
  .resize(32)
  .blur(1.2)
  .webp({ quality: 40 })
  .toBuffer();

const manifest = {
  id: config.id,
  frameCount: kept.length,
  segments,
  poster: `data:image/webp;base64,${posterBuffer.toString('base64')}`,
};

await mkdir(path.dirname(generatedFile), { recursive: true });
await writeFile(
  generatedFile,
  `// Generated by scripts/build-frames.mjs from ${values.config.replaceAll('\\', '/')}. Do not edit by hand.\n` +
    `import type { FlightManifest } from '../manifest';\n\n` +
    `export const ${config.id.toUpperCase()}: FlightManifest = ${JSON.stringify(manifest, null, 2)};\n`,
);

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;
console.log(`${config.id}: ${kept.length} frames (${values.placeholder ? 'placeholder' : 'rendered'})`);
console.log(`  desktop ${mb(bytes.desktop)} · mobile ${mb(bytes.mobile)} · poster ${posterBuffer.length} B`);
```

- [ ] **Step 5: Generate placeholder frames**

Run: `npm run frames -- --config flight/m1.config.json --placeholder`
Expected output: `m1: 168 frames (placeholder)` and a size line. Verify:

```bash
ls public/flight/m1/desktop | head -3
ls public/flight/m1/desktop | wc -l
head -c 600 src/flight/generated/m1.ts
```

Expected: `0001.webp 0002.webp 0003.webp`, `168`, and a manifest with segments `river` `[0, 143]` and `brickell` `[144, 167]`.

- [ ] **Step 6: Typecheck, lint, test**

Run: `npm run build && npm run lint && npm test`
Expected: all pass (the generated file must typecheck against `FlightManifest`).

- [ ] **Step 7: Commit**

```bash
git add flight/m1.config.json scripts/build-frames.mjs .gitignore package.json package-lock.json src/flight/generated/m1.ts public/flight/m1
git commit -m "feat(flight): add frame build pipeline with placeholder sequence

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Centralize Lenis → ScrollTrigger sync

**Files:**
- Modify: `src/components/motion/SmoothScroll.tsx` (inside the effect, after `lenisRef.current = lenisInstance;` and in cleanup)
- Modify: `src/components/projects/HeroReveal.tsx:29,40,59-62,121-124,127-128`

**Interfaces:**
- Produces: every ScrollTrigger on the site is updated on Lenis scroll without per-component wiring.

- [ ] **Step 1: Add the sync in `SmoothScroll.tsx`**

Add imports at the top:

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
```

After `lenisRef.current = lenisInstance;`:

```ts
    // Keep every ScrollTrigger in step with Lenis's smoothed scroll position.
    lenisInstance.on('scroll', ScrollTrigger.update);
```

In the cleanup, before `lenisInstance.destroy();`:

```ts
      lenisInstance.off('scroll', ScrollTrigger.update);
```

- [ ] **Step 2: Remove the local copy in `HeroReveal.tsx`**

Delete the `import useLenis from '@/hooks/useLenis';` line, the `const lenis = useLenis();` line, this block:

```ts
      // Sync GSAP ScrollTrigger with Lenis if available
      if (lenis) {
        lenis.on('scroll', ScrollTrigger.update);
      }
```

and in the returned cleanup:

```ts
        if (lenis) {
          lenis.off('scroll', ScrollTrigger.update);
        }
```

Change the options line to:

```ts
    // Re-run if reduceMotion changes
    { scope: sectionRef, dependencies: [reduceMotion] },
```

- [ ] **Step 3: Typecheck, lint, test**

Run: `npm run build && npm run lint && npm test`
Expected: all pass (no unused `lenis`).

- [ ] **Step 4: Verify the existing pinned reveal still scrubs**

Start the preview (Task 8 Step 1 creates `.claude/launch.json` — create it now if absent), open `/#/projects/service-map-planner` at 1440 px, scroll through the hero reveal, and confirm the clip-path expands while pinned and the console is clean.

- [ ] **Step 5: Commit**

```bash
git add src/components/motion/SmoothScroll.tsx src/components/projects/HeroReveal.tsx
git commit -m "refactor(motion): sync Lenis with ScrollTrigger once in SmoothScroll

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Mode hook, StagePanel, and beat content

**Files:**
- Create: `src/flight/useFlightMode.ts`
- Create: `src/flight/StagePanel.tsx`
- Create: `src/flight/beats/IntroBeat.tsx`
- Create: `src/flight/beats/ServiceMapBeat.tsx`

**Interfaces:**
- Consumes: `veilStyle` (Task 4).
- Produces:
  - `type FlightMode = 'desktop' | 'mobile' | 'static'`; `useFlightMode(): FlightMode` (static when reduced motion or Save-Data; mobile below 768 px).
  - `StagePanel` default export, props `{ mode: FlightMode; panelRef: (element: HTMLDivElement | null) => void; children: ReactNode }`.
  - `IntroBeat` default export, props `{ onExploreWork: () => void }`.
  - `ServiceMapBeat` default export, no props.

- [ ] **Step 1: Write `src/flight/useFlightMode.ts`**

```ts
import { useEffect, useState } from 'react';

export type FlightMode = 'desktop' | 'mobile' | 'static';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const MOBILE = '(max-width: 767px)';

function readMode(): FlightMode {
  if (typeof window === 'undefined') return 'static';
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (window.matchMedia(REDUCED_MOTION).matches || connection?.saveData === true) return 'static';
  return window.matchMedia(MOBILE).matches ? 'mobile' : 'desktop';
}

/** Flight presentation mode; updates when motion preference or viewport width changes. */
export function useFlightMode(): FlightMode {
  const [mode, setMode] = useState<FlightMode>(readMode);

  useEffect(() => {
    const queries = [REDUCED_MOTION, MOBILE].map((query) => window.matchMedia(query));
    const onChange = () => setMode(readMode());
    queries.forEach((query) => query.addEventListener('change', onChange));
    return () => queries.forEach((query) => query.removeEventListener('change', onChange));
  }, []);

  return mode;
}
```

- [ ] **Step 2: Write `src/flight/StagePanel.tsx`**

Mobile panels sit above the 72 px QuickActionBar (`pb-24`).

```tsx
import type { ReactNode } from 'react';
import type { FlightMode } from './useFlightMode';

interface StagePanelProps {
  mode: FlightMode;
  /** Receives the element whose opacity/transform the scroll driver updates. */
  panelRef: (element: HTMLDivElement | null) => void;
  children: ReactNode;
}

const LAYOUT: Record<FlightMode, string> = {
  desktop: 'absolute inset-0 flex items-center pt-20',
  mobile: 'absolute inset-x-0 bottom-0 pb-24',
  static: 'relative',
};

export default function StagePanel({ mode, panelRef, children }: StagePanelProps) {
  return (
    <div ref={panelRef} className={`${LAYOUT[mode]} will-change-[opacity,transform]`}>
      <div className="section-container w-full">{children}</div>
    </div>
  );
}
```

- [ ] **Step 3: Write `src/flight/beats/IntroBeat.tsx`**

Copy is carried over verbatim from `src/components/hero/Hero.tsx`.

```tsx
import { ArrowDown, ArrowUpRight, FileDown, Mail } from 'lucide-react';
import { veilStyle } from '../veil';

const RESUME_MAILTO =
  'mailto:joseabelgarcia99@gmail.com?subject=R%C3%A9sum%C3%A9%20Request%20-%20Jose%20Garcia&body=Hi%20Jose,%0D%0A%0D%0AI%20would%20like%20to%20request%20a%20copy%20of%20your%20current%20r%C3%A9sum%C3%A9.%0D%0A%0D%0AThanks!';
const LINKEDIN = 'https://www.linkedin.com/in/jose-abel-garcia-a5006616b/';

interface IntroBeatProps {
  onExploreWork: () => void;
}

export default function IntroBeat({ onExploreWork }: IntroBeatProps) {
  const portrait = `${import.meta.env.BASE_URL}images/jose_garcia_portrait.png`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
      <div className="lg:col-span-7 rounded-3xl p-5 sm:p-8 backdrop-blur-md" style={veilStyle}>
        <p className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-4">
          <img src={portrait} alt="" className="lg:hidden h-10 w-10 rounded-full object-cover object-top" />
          <span className="font-semibold text-[var(--accent)]">Jose Garcia</span>
          <span aria-hidden="true">&middot;</span>
          <span>South Florida</span>
          <span aria-hidden="true">&middot;</span>
          <span>Sales Engineering &middot; Solutions Consulting</span>
        </p>

        <h1 className="font-serif font-bold uppercase tracking-tight leading-[1.06] text-[var(--text-primary)] text-4xl sm:text-5xl xl:text-6xl mb-5">
          I turn complex technology into solutions people can use.
        </h1>

        <p className="hidden sm:block text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mb-6">
          Customer-facing engineer bridging technical discovery, tailored solution demonstrations, hardware and
          software implementation, and long-term customer success. Translating deep technical execution into
          verifiable business impact.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onExploreWork}
            className="btn-primary inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base shadow-[var(--shadow-blue)] group"
          >
            <span>Explore Selected Work</span>
            <ArrowDown size={16} className="group-hover:translate-y-0.5 transition-transform" aria-hidden="true" />
          </button>
          <a
            href="#contact"
            className="btn-secondary inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-medium text-sm sm:text-base"
          >
            <Mail size={16} aria-hidden="true" />
            <span>Let&apos;s Connect</span>
          </a>
          <a
            href={RESUME_MAILTO}
            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <FileDown size={15} aria-hidden="true" />
            <span>R&Eacute;SUM&Eacute; ON REQUEST</span>
          </a>
        </div>
      </div>

      <figure
        className="hidden lg:block lg:col-span-5 justify-self-center w-full max-w-sm rounded-3xl p-3 border border-[var(--border)] shadow-[var(--shadow-floating)] backdrop-blur-md"
        style={veilStyle}
      >
        <img
          src={portrait}
          alt="Jose Garcia - Solutions Engineer and Computer Engineer"
          className="aspect-[4/5] w-full rounded-2xl object-cover object-top"
        />
        <figcaption className="pt-3 px-1 flex items-center justify-between font-mono text-xs">
          <span className="font-semibold text-[var(--text-primary)]">Jose Garcia, B.S. CE</span>
          <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline">
            <span>LinkedIn Profile</span>
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </figcaption>
      </figure>
    </div>
  );
}
```

- [ ] **Step 4: Write `src/flight/beats/ServiceMapBeat.tsx`**

Copy is carried over verbatim from the Service Map Planner entry in `src/components/home/FeaturedWorkSection.tsx`.

```tsx
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { veilStyle } from '../veil';

const LABEL = 'block font-mono text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-1';

export default function ServiceMapBeat() {
  const image = `${import.meta.env.BASE_URL}images/service_map_tablet.jpg`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-12 items-center">
      <div className="order-2 lg:order-1 lg:col-span-5 rounded-3xl p-5 sm:p-7 backdrop-blur-md" style={veilStyle}>
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">
          <span className="font-black text-[var(--accent)] mr-2">01</span>
          Field Service Operations &amp; Asset Intelligence
        </p>
        <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-4">
          Service Map Planner
        </h2>
        <dl className="space-y-3 text-sm sm:text-base leading-relaxed text-[var(--text-primary)]">
          <div className="hidden sm:block">
            <dt className={LABEL}>The operational problem</dt>
            <dd>
              Managing nationwide hardware installations across research universities and public libraries relied on
              fragmented spreadsheets, causing scheduling conflicts and version drift.
            </dd>
          </div>
          <div className="hidden sm:block">
            <dt className={LABEL}>My contribution</dt>
            <dd>Architecture · Product Design · Frontend Engineering</dd>
          </div>
          <div>
            <dt className={LABEL}>Value delivered</dt>
            <dd>
              Unified 100+ accounts, scanner inventories, and nationwide routing into an active daily internal tool with
              proactive compliance flags.
            </dd>
          </div>
        </dl>
        <Link
          to="/projects/service-map-planner"
          className="btn-primary mt-5 inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider shadow-[var(--shadow-blue)] group"
        >
          <span>Explore system</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </Link>
      </div>

      <div className="order-1 lg:order-2 lg:col-span-7">
        <img
          src={image}
          alt="Service Map Planner operational interface displayed on a field tablet"
          className="w-full aspect-[16/10] max-h-[26svh] lg:max-h-none object-cover rounded-2xl border border-[var(--border)] shadow-[var(--shadow-floating)]"
          loading="lazy"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Typecheck and lint**

Run: `npm run build && npm run lint`
Expected: success.

- [ ] **Step 6: Commit**

```bash
git add src/flight/useFlightMode.ts src/flight/StagePanel.tsx src/flight/beats
git commit -m "feat(flight): add flight modes, stage panel, intro and Service Map beats

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: FlightJourney and Home integration

**Files:**
- Create: `src/flight/FlightJourney.tsx`
- Create (untracked): `.claude/launch.json`
- Modify: `src/pages/Home.tsx`
- Modify: `src/components/home/FeaturedWorkSection.tsx` (remove the first `projects` entry)
- Modify: `src/components/motion/PageTransition.tsx` (clear filter after enter)
- Modify: `src/components/background/Atmosphere.tsx` (pause while flight visible)

**Interfaces:**
- Consumes: everything from Tasks 1–7; `M1` from `src/flight/generated/m1.ts`; `useLenis` from `@/components/motion/SmoothScroll`.
- Produces: `FlightJourney` default export (no props); window event `flight-visibility` (`CustomEvent<boolean>`).

- [ ] **Step 1: Create the preview config (not committed)**

`.claude/launch.json`:

```json
{
  "version": "0.0.1",
  "configurations": [
    { "name": "about-me", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev"], "port": 5173 }
  ]
}
```

Then: `echo ".claude/" >> .git/info/exclude`

- [ ] **Step 2: Write `src/flight/FlightJourney.tsx`**

`ScrollTrigger.create` has no tween, so no `scrub` option: progress comes straight from the (Lenis-smoothed) scroll position.

```tsx
import { useEffect, useMemo, useRef, useState, type FocusEvent } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLenis } from '@/components/motion/SmoothScroll';
import FlightCanvas from './FlightCanvas';
import StagePanel from './StagePanel';
import IntroBeat from './beats/IntroBeat';
import ServiceMapBeat from './beats/ServiceMapBeat';
import { FrameStore } from './FrameStore';
import { M1 } from './generated/m1';
import { frameUrl, stillUrl, totalScrollVh } from './manifest';
import { progressToFrame, segmentRanges } from './scrollMap';
import { M1_BEATS, beatFocusProgress, beatOpacity, resolveBeat, type BeatId } from './beats';
import { useFlightMode } from './useFlightMode';

gsap.registerPlugin(ScrollTrigger);

function loadImage(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.decoding = 'async';
  image.src = url;
  return image.decode().then(() => image);
}

const SCRIM = {
  desktop: 'linear-gradient(90deg, color-mix(in srgb, var(--bg) 55%, transparent) 0%, transparent 60%)',
  mobile: 'linear-gradient(0deg, color-mix(in srgb, var(--bg) 55%, transparent) 0%, transparent 55%)',
};

export default function FlightJourney() {
  const mode = useFlightMode();
  const lenis = useLenis();
  const baseUrl = import.meta.env.BASE_URL;
  const size = mode === 'mobile' ? 'mobile' : 'desktop';

  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef(0);
  const panels = useRef(new Map<BeatId, HTMLDivElement>());
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const [store, setStore] = useState<FrameStore<HTMLImageElement> | null>(null);

  const ranges = useMemo(() => segmentRanges(M1.segments, size), [size]);
  const windows = useMemo(() => new Map(M1_BEATS.map((beat) => [beat.id, resolveBeat(ranges, beat)])), [ranges]);

  const registerPanel = (id: BeatId) => (element: HTMLDivElement | null) => {
    if (element) panels.current.set(id, element);
    else panels.current.delete(id);
  };

  // One frame store per mode/size; StrictMode's double effect creates and disposes cleanly.
  useEffect(() => {
    if (mode === 'static') {
      setStore(null);
      return;
    }
    const next = new FrameStore<HTMLImageElement>({
      frameCount: M1.frameCount,
      load: (index) => loadImage(frameUrl(baseUrl, M1.id, size, index)),
    });
    next.start();
    setStore(next);
    return () => next.dispose();
  }, [mode, size, baseUrl]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section || mode === 'static') return;

      const apply = (progress: number) => {
        const frame = progressToFrame(M1.segments, size, progress);
        frameRef.current = frame;
        store?.setPlayhead(frame);
        for (const beat of M1_BEATS) {
          const element = panels.current.get(beat.id);
          const beatWindow = windows.get(beat.id);
          if (!element || !beatWindow) continue;
          const opacity = beatOpacity(progress, beatWindow);
          element.style.opacity = String(opacity);
          element.style.transform = `translate3d(0, ${((1 - opacity) * 24).toFixed(1)}px, 0)`;
          element.style.pointerEvents = opacity < 0.05 ? 'none' : '';
        }
      };

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: `+=${totalScrollVh(M1, size)}%`,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => apply(self.progress),
        onRefresh: (self) => apply(self.progress),
      });
      triggerRef.current = trigger;
      apply(trigger.progress);

      return () => {
        triggerRef.current = null;
      };
    },
    { scope: sectionRef, dependencies: [mode, size, store, windows], revertOnUpdate: true },
  );

  // Let the global Atmosphere background sleep while the opaque flight covers it.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || mode === 'static') return;
    const announce = (visible: boolean) =>
      window.dispatchEvent(new CustomEvent<boolean>('flight-visibility', { detail: visible }));
    const observer = new IntersectionObserver(([entry]) => announce(entry?.isIntersecting ?? false));
    observer.observe(section);
    return () => {
      observer.disconnect();
      announce(false);
    };
  }, [mode]);

  const scrollToProgress = (progress: number, immediate: boolean) => {
    const trigger = triggerRef.current;
    if (!trigger) return false;
    const top = trigger.start + (trigger.end - trigger.start) * progress;
    if (lenis) lenis.scrollTo(top, { immediate });
    else window.scrollTo({ top, behavior: immediate ? 'auto' : 'smooth' });
    return true;
  };

  const scrollToBeat = (id: BeatId) => {
    const beat = M1_BEATS.find((candidate) => candidate.id === id);
    if (beat && scrollToProgress(beatFocusProgress(ranges, beat), false)) return;
    panels.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Keyboard users tabbing into a beat that is not on screen yet: fly there.
  const onFocusCapture = (event: FocusEvent<HTMLElement>) => {
    for (const beat of M1_BEATS) {
      const element = panels.current.get(beat.id);
      if (!element?.contains(event.target as Node)) continue;
      if (Number(element.style.opacity || '1') < 0.5) scrollToProgress(beatFocusProgress(ranges, beat), true);
      return;
    }
  };

  const skipLink = (
    <a
      href="#work"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-24 focus:z-20 focus:rounded-lg focus:bg-[var(--surface)] focus:px-4 focus:py-2 focus:text-[var(--text-primary)]"
    >
      Skip flight
    </a>
  );

  if (mode === 'static') {
    return (
      <section ref={sectionRef} className="relative overflow-hidden" data-contour-section="hero" aria-label="Introduction">
        {skipLink}
        <picture>
          <source media="(max-width: 767px)" srcSet={stillUrl(baseUrl, M1.id, 'mobile')} />
          <img
            src={stillUrl(baseUrl, M1.id, 'desktop')}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-bottom"
          />
        </picture>
        <div className="relative flex flex-col gap-16 pt-28 pb-16 lg:pt-36">
          <StagePanel mode={mode} panelRef={registerPanel('intro')}>
            <IntroBeat onExploreWork={() => scrollToBeat('service-map')} />
          </StagePanel>
          <StagePanel mode={mode} panelRef={registerPanel('service-map')}>
            <ServiceMapBeat />
          </StagePanel>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative h-[100svh] overflow-hidden"
      data-contour-section="hero"
      aria-label="Introduction"
      onFocusCapture={onFocusCapture}
    >
      {skipLink}
      <FlightCanvas store={store} frameRef={frameRef} poster={M1.poster} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: SCRIM[size] }} aria-hidden="true" />
      <StagePanel mode={mode} panelRef={registerPanel('intro')}>
        <IntroBeat onExploreWork={() => scrollToBeat('service-map')} />
      </StagePanel>
      <StagePanel mode={mode} panelRef={registerPanel('service-map')}>
        <ServiceMapBeat />
      </StagePanel>
    </section>
  );
}
```

- [ ] **Step 3: Clear the page-transition filter so pinning works**

A non-`none` `filter` on an ancestor makes `position: fixed` (used by the pin) relative to that ancestor. In `src/components/motion/PageTransition.tsx`, change the `animate` prop to:

```tsx
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
```

- [ ] **Step 4: Pause Atmosphere while the flight is visible**

In `src/components/background/Atmosphere.tsx`, inside the main `useEffect`, next to `let regionVisible = true;` add:

```ts
    let flightVisible = false;
```

Change the `shouldAnimate` line in `syncLoop` to:

```ts
      const shouldAnimate = !isPaused && pageVisible && regionVisible && !flightVisible;
```

After the `onProjectChange` handler add:

```ts
    const onFlightVisibility = (event: Event) => {
      flightVisible = (event as CustomEvent<boolean>).detail === true;
      syncLoop();
    };
```

Register it next to the `contour-project-change` listener:

```ts
    window.addEventListener('flight-visibility', onFlightVisibility);
```

And remove it in cleanup next to the matching `removeEventListener`:

```ts
      window.removeEventListener('flight-visibility', onFlightVisibility);
```

- [ ] **Step 5: Swap the hero on Home**

In `src/pages/Home.tsx` replace `import Hero from '@/components/hero/Hero';` with:

```tsx
import FlightJourney from '@/flight/FlightJourney';
import SignalRail from '@/components/hero/SignalRail';
```

and replace `<Hero />` (and its comment) with:

```tsx
      {/* 01. FLIGHT — Miami River intro → Brickell stop (Service Map Planner) */}
      <FlightJourney />
      <SignalRail />
```

- [ ] **Step 6: Remove Service Map Planner from FeaturedWorkSection**

In `src/components/home/FeaturedWorkSection.tsx`, delete the entire first object in the `projects` array (the one with `num: '01'`, `title: 'SERVICE MAP PLANNER'`), leaving only the Scale Garage Studio entry (keep its `num: '02'` — it follows the flight's 01). Leave `id="work"` untouched.

- [ ] **Step 7: Typecheck, lint, test**

Run: `npm run build && npm run lint && npm test`
Expected: all pass.

- [ ] **Step 8: Browser check — core behavior at 1440 px**

`preview_start` `{name: "about-me"}`, then on `/`:
- Intro visible immediately; `read_console_messages` clean.
- Scroll down slowly then quickly to the end of the flight and back up: placeholder frame numbers advance and reverse; intro fades out ~50% into the river, the skyline clears, Service Map Planner fades in during the stop; after the pin ends, SignalRail and "Selected Work" (Scale Garage Studio only) follow.
- `javascript_tool` — no ancestor of the flight may create a containing block for `position: fixed`:
  ```js
  const out = [];
  for (let el = document.querySelector('section[aria-label="Introduction"]').parentElement; el; el = el.parentElement) {
    const cs = getComputedStyle(el);
    if (cs.filter !== 'none' || cs.transform !== 'none') out.push(el.className || el.tagName);
  }
  out
  ```
  Expected: `[]` (the `.pin-spacer` itself has no transform). While pinned, the canvas stays put as you scroll.
- Click "Explore Selected Work": flies to the Service Map Planner beat.
- Tab from the top: first stop is "Skip flight"; tabbing into "Explore system" while at the top scrolls the flight to the Brickell stop.

- [ ] **Step 9: Browser check — Review Focus 1 (crossing 768 px)**

Scroll to mid-river, `resize_window` to 375×812, then back to desktop. Expected: mobile frames load (`read_network_requests` shows `/flight/m1/mobile/`), panels become bottom sheets, no console errors, scrubbing still works after each switch.

- [ ] **Step 10: Browser check — Review Focus 2 (hash deep links)**

Navigate to `/#/projects`, then click nav CONTACT, then nav WORK. Expected: lands on the `#contact` section, then `#work` ("Selected Work" heading at the top), not inside the flight.

- [ ] **Step 11: Browser check — Review Focus 3 (frames fail)**

Temporarily rename `public/flight/m1/desktop` to `desktop-off`, reload `/`. Expected: poster visible, intro readable and clickable, scrolling moves panels, `read_console_messages` shows 404s only (no unhandled promise rejection). Rename it back.

- [ ] **Step 12: Browser check — Review Focus 4 (leave and return)**

On `/`, scroll mid-flight, open the Service Map Planner case study, go back. Then `javascript_tool`: `document.querySelectorAll('.pin-spacer').length` — expected `1` on `/`. Repeat twice; the count stays `1` and the console stays clean.

- [ ] **Step 13: Commit**

```bash
git add src/flight/FlightJourney.tsx src/pages/Home.tsx src/components/home/FeaturedWorkSection.tsx src/components/motion/PageTransition.tsx src/components/background/Atmosphere.tsx
git commit -m "feat(home): replace hero with Miami River flight (milestone 1)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Camera path for the user's Earth Studio render

**Files:**
- Create: `flight/m1-camera-path.md`

**Interfaces:**
- Consumes: `flight/m1.config.json` (216 raw frames, 24 fps; raw 1–144 river, 145–216 Brickell).
- Produces: the procedure that yields `flight/raw/m1/` for `npm run frames -- --config flight/m1.config.json --raw flight/raw/m1`.

- [ ] **Step 1: Write `flight/m1-camera-path.md`**

````markdown
# Milestone 1 camera path — Google Earth Studio

Renders the Miami River transit and the Brickell stop: **9 s at 24 fps = 216 frames**.
Frames 1–144 are the river (0–6 s); 145–216 are the Brickell stop (6–9 s).

## 1. Project settings

1. Open https://earth.google.com/studio in Chrome and sign in.
2. **New Project → Blank Project.**
3. Project settings: **Frame rate 24**, **Duration 9 s** (216 frames), **Dimensions 2560 × 1440**.
4. Date & time: set the scene's time of day to **late golden hour** (about 1 hour before local sunset);
   the sun should sit behind-right of a camera heading east.

## 2. Keyframes

Set each keyframe on **Camera Position** (longitude, latitude, altitude) and **Camera Rotation**
(pan = heading, tilt). Leave roll at 0. Keep Earth Studio's default auto-ease; do not make keyframes linear.

| Time | Latitude | Longitude | Altitude (m) | Heading / pan (°) | Tilt (°) | Where |
|---|---|---|---|---|---|---|
| 0.0 s | 25.77245 | -80.20020 | 110 | 98 | 76 | Over the river, west of the SW 2nd Ave bridge |
| 2.0 s | 25.77180 | -80.19690 | 135 | 100 | 75 | Approaching SW 2nd Ave bridge |
| 4.0 s | 25.77125 | -80.19330 | 180 | 102 | 73 | Near the Miami Ave bridge; towers rising |
| 6.0 s | 25.77070 | -80.18960 | 245 | 110 | 71 | Brickell Ave bridge — skyline reveal (frame 145) |
| 7.5 s | 25.76985 | -80.18760 | 258 | 128 | 70 | River mouth, banking right |
| 9.0 s | 25.76940 | -80.18700 | 262 | 140 | 70 | Hover drift; Brickell towers on the right |

Tilt convention: 0° looks straight down, 90° looks at the horizon.
Heading convention: 0° = north, 90° = east. If the preview faces west at 0 s, the pan field uses the
opposite sign — enter `360 − heading` instead.

**Coordinates are approximate.** Scrub the timeline before rendering and adjust any keyframe that
clips a building, drifts off the river, or turns faster than ~15° per second. Adjust this table to
match what you changed, so the path stays reproducible.

## 3. Render

1. **Render → Local.** Format **JPEG** (or PNG), full 2560 × 1440.
2. **Attribution:** choose a **bottom-center** placement if offered. If only corner placements exist,
   also do a second render at **1080 × 1920** with the same keyframes for mobile (step 4b).
3. Render, download the zip, and extract its footage folder to `flight/raw/m1/` (git-ignored).

## 4. Build frames

a. Landscape only (bottom-center attribution):

```bash
npm run frames -- --config flight/m1.config.json --raw flight/raw/m1
```

b. With a portrait render for mobile (extracted to `flight/raw/m1-portrait/`):

```bash
npm run frames -- --config flight/m1.config.json --raw flight/raw/m1 --mobile-raw flight/raw/m1-portrait
```

The script prints frame count and desktop/mobile payload; compare with the budgets
(≤ ~25 MB desktop, ≤ ~8 MB mobile). If over, lower `quality` in `scripts/build-frames.mjs` `SIZES`.
````

- [ ] **Step 2: Commit**

```bash
git add flight/m1-camera-path.md
git commit -m "docs(flight): add milestone 1 Earth Studio camera path

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Acceptance check and pull request

**Files:** none new (fixes, if any, go in the file that owns the failing behavior, with a test where the logic is pure).

- [ ] **Step 1: Full gate**

Run: `npm test && npm run lint && npm run build`
Expected: all pass.

- [ ] **Step 2: Payload (acceptance 3, 4)**

On `/` at 1440 px, after the flight has fully loaded, `javascript_tool`:

```js
const flight = performance.getEntriesByType('resource').filter((e) => e.name.includes('/flight/'));
({ files: flight.length, mb: (flight.reduce((s, e) => s + (e.transferSize || e.encodedBodySize), 0) / 1048576).toFixed(2) })
```

Record desktop MB; repeat at 375 px for mobile. With placeholders these are far under budget; record them anyway as the baseline. For "coarse scrub after ≤ 3 MB": sum the first 22 entries (tier 0 = every 8th frame + last) and confirm ≤ 3 MB.

- [ ] **Step 3: No blank frames, both directions (acceptance 1)**

`javascript_tool`:

```js
const canvas = document.querySelector('section[aria-label="Introduction"] canvas');
const ctx = canvas.getContext('2d');
const max = document.documentElement.scrollHeight - innerHeight;
const blank = [];
for (const dir of [1, -1]) {
  for (let i = 0; i <= 60; i += 1) {
    const t = dir === 1 ? i / 60 : 1 - i / 60;
    window.scrollTo(0, t * Math.min(max, innerHeight * 4));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const px = ctx.getImageData(canvas.width >> 1, canvas.height >> 1, 1, 1).data;
    if (px[3] === 0) blank.push({ dir, t });
  }
}
blank
```

Expected: `[]`.

- [ ] **Step 4: Fling before fine tiers load (Review Focus 5)**

Reload `/` and immediately (same `javascript_tool` call) `window.scrollTo(0, innerHeight * 4)`, wait two animation frames, sample the canvas center as in Step 3. Expected: non-transparent pixel (a coarse frame).

- [ ] **Step 5: Long tasks while scrubbing (acceptance 2)**

```js
const long = [];
const po = new PerformanceObserver((list) => list.getEntries().forEach((e) => e.duration > 50 && long.push(Math.round(e.duration))));
po.observe({ type: 'longtask', buffered: false });
for (let i = 0; i <= 120; i += 1) {
  window.scrollTo(0, (i / 120) * innerHeight * 4);
  await new Promise((r) => requestAnimationFrame(r));
}
po.disconnect();
long
```

Expected: `[]` once frames are loaded.

- [ ] **Step 6: Modes and attribution (acceptance 5, 6)**

- `resize_window` 375×812: bottom-sheet panels, CTAs clear of the QuickActionBar, placeholder attribution text visible at the bottom center.
- `resize_window` 2520×1080 (21:9): attribution still visible at the bottom.
- `resize_window` preset desktop, `colorScheme: "dark"`: text readable; contrast is guaranteed by `contrast.test.ts`.
- Reduced motion: load the Playwright tools (`ToolSearch` `select:mcp__playwright__browser_emulate_media,mcp__playwright__browser_navigate,mcp__playwright__browser_take_screenshot,mcp__playwright__browser_evaluate`), `browser_emulate_media` with `reducedMotion: "reduce"`, navigate to `http://localhost:5173/`. Expected: still image behind content, no `.pin-spacer` (`document.querySelectorAll('.pin-spacer').length === 0`), both beats in normal flow. Repeat at 375 px width: the mobile still (`still-mobile.webp`) is requested.
- Screenshot each state.

- [ ] **Step 7: Push and open the PR**

```bash
git push -u origin feat/miami-flight
gh pr create --base main --title "feat: Miami flight home — milestone 1 (river + Brickell)" --body "$(cat <<'EOF'
## Summary
- Replaces the Home hero with a scroll-scrubbed aerial flight: Miami River intro → Brickell stop with Service Map Planner.
- Frames ship as a **placeholder sequence**; the real Google Earth Studio render drops in via `flight/m1-camera-path.md` + `npm run frames`.
- Tiered frame loading, cross-fade between frames, bottom-anchored crop (keeps Earth Studio attribution), mobile / reduced-motion / Save-Data modes.
- Lenis → ScrollTrigger sync centralized in `SmoothScroll`; page-transition filter cleared so pinning works.

Spec: `docs/superpowers/specs/2026-09-28-miami-flight-design.md`
Plan: `docs/superpowers/plans/2026-09-28-miami-flight-m1.md`

## Do not merge yet
Merging deploys to GitHub Pages. Hold until the real render is in and the feel is approved.

## Test plan
- [x] `npm test` (scroll map, frame store, crop, beats, veil contrast)
- [x] `npm run lint`, `npm run build`
- [x] Browser: scrub both directions, no blank frames, no long tasks, 375 / 1440 / 21:9, dark theme, static mode, deep links, leave/return, frame-failure fallback
- [ ] Real Earth Studio render: realism, feel, payload budgets

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Then bind the PR with the ccd_pr tools (`get_status`, `bind_pr` if needed). Do **not** enable auto-merge.
````
