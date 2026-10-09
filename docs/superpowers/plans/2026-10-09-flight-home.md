# Flight Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 7-scene Home with the six-stop scroll-driven dusk flight. Each stop opens a condensing-mist card rendered from the shared content data.

**Architecture:** A fixed canvas draws WebP frames chosen by one GSAP ScrollTrigger timeline that scrubs over a tall scroll track. The timeline's shape (hops, reveals, holds, folds) comes from a pure, tested `buildTimeline()`. Cards are real DOM in reading order and contain no copy of their own; everything renders from `src/data/content.ts`. Reduced motion and Save-Data get a static page of the same cards.

**Tech Stack:** React 19, TypeScript, Vite 8, GSAP 3 + ScrollTrigger, Lenis (shared `SmoothScroll`), Vitest 5 (node environment), Python (ComfyUI embedded) for frame export.

**Spec:** `docs/superpowers/specs/2026-10-09-flight-home-design.md` (this branch). Content source: the content session's `docs/superpowers/specs/2026-10-08-content-brief-design.md` and its `src/data/content.ts` / `src/data/routes.ts`.

## Global Constraints

- Start only after the content session's PR 2 (data layer + claims guard) is merged to `main`; this branch merges `origin/main` first.
- Flight files contain **no prose**: only layout labels ("Stop 02", "Lock"), place names and coordinates. All copy comes from `src/data/content.ts`, `src/data/profile.ts` and `src/data/routes.ts`.
- Use the content session's names exactly: `site`, `hero`, `evidenceStrip`, `capabilities`, `featuredWork`, `experience`, `approach`, `tools`, `education`, `languages`, `bio`, `contact`, `availableResumes()`, `sectionIds`, `navLinks`.
- Résumé links render only from `availableResumes()`. A `featuredWork` item with `image === ''` and `imageIsConcept` renders a labeled placeholder, never an invented screenshot. An item with an image and `imageIsConcept` shows the image with a "Concept" label.
- The hero card is visible at first paint; no animation delays name, headline or the résumé link.
- "AI-rendered flight · not real footage" is rendered by `FlightHome` itself and is always visible while the flight is on screen.
- Fonts and colours: Playfair Display (headings), Inter (body), JetBrains Mono (labels), accent `#2452C6`, paper `#F5F2EC`, signal `#A9D2FF`, night `#06080d`.
- Text on cards meets 4.5:1. Cards are keyboard reachable and links have a visible focus state.
- Commands: `npm test`, `npm run lint`, `npm run build`, each green before every commit.
- Spec correction (recorded here, applied in Task 1): the phone frame set is a **420-px-wide crop around the landmark at full 704-px height**, not a 720-px downscale. A downscale would be upscaled about 2× on portrait phones; the crop keeps desktop sharpness at about one third of the bytes.

## Review Focus

1. **Resize or rotate mid-flight:** the reader stays at the same place in the flight (resumeScroll), and pins and leader lines re-attach to their landmarks. Test: `placement.test.ts` in Task 3.
2. **Hash links from other pages** (`/#experience`, `/#about`, the legacy `/work` path) land on the right stop with its card open, and `#about` opens the Beach card's About tab. Test: `stops.test.ts` (Task 4) and the browser check in Task 8.
3. **Frames still loading while scrubbing fast:** the canvas always draws the nearest loaded frame and never goes blank. Test: carried-over `FrameStore.test.ts` (Task 2) plus `drawNearest` in Task 6.
4. **No screenshot yet (AAC):** the card shows a labeled placeholder, with no broken `<img>` and no empty `src`. Test: `cards.test.tsx` in Task 5.
5. **Missing role PDFs:** only existing résumés are linked. Test: `cards.test.tsx` in Task 5.

---

## File Structure

| File | Responsibility |
|---|---|
| `tools/flight/pins.json` | Landmark per stop: `key`, `place`, `coords`, `x`, `y` (fractions of the frame) |
| `tools/flight/export_site.py` | Writes `public/flight/desktop/*.webp`, `public/flight/phone/*.webp` and `src/flight/flightData.ts` |
| `src/flight/flightData.ts` | GENERATED: frame count, sizes, the six stops (frame, x, y, phoneX, place, coords) |
| `src/flight/FrameStore.ts` (+test) | Carried over: coarse-to-fine frame loading |
| `src/flight/useFlightMode.ts` | Carried over: `'desktop' \| 'mobile' \| 'static'` |
| `src/flight/resumeScroll.ts` (+test) | Carried over: keep the reader's place when the track length changes |
| `src/flight/crop.ts` (+test) | Cover-draw rectangle and frame-fraction → screen point |
| `src/flight/timeline.ts` (+test) | Pure scroll layout: segments, total length, each stop's reading position |
| `src/flight/stops.ts` (+test) | Stop ids → section ids, labels, card component lookup |
| `src/flight/mist.ts` (+test) | Deterministic mist-puff layout |
| `src/flight/cards/*.tsx` (+test) | Six card bodies rendered from content data |
| `src/flight/MistCard.tsx` | Card shell, puffs, anchor ids |
| `src/flight/StopMarks.tsx` | Reticle, lock label, pin, leader line for one stop |
| `src/flight/reveal.ts` | GSAP builders for a stop's reveal and fold |
| `src/flight/FlightHome.tsx` | Canvas, timeline wiring, HUD, AI label, anchors |
| `src/flight/StaticFlight.tsx` | Reduced-motion / Save-Data page |
| `src/flight/flight.css` | All flight styles (prefixed `fl-`) |
| `src/App.tsx`, `src/pages/Home.tsx` | Home renders `FlightHome`; scenes removed |

---

### Task 0: Branch setup and carried-over engine

**Files:**
- Modify: branch `feat/flight-home` (worktree `Documents/Code/About-Me-flight-home`)
- Create (from `origin/feat/miami-flight`): `src/flight/FrameStore.ts`, `src/flight/__tests__/FrameStore.test.ts`, `src/flight/useFlightMode.ts`, `src/flight/resumeScroll.ts`, `src/flight/__tests__/resumeScroll.test.ts`

**Interfaces:**
- Produces: `FrameStore<T>` (`start()`, `setPlayhead(i)`, `get(i)`, `nearest(i): {index, frame} | null`, `dispose()`, `version`), `useFlightMode(): 'desktop' | 'mobile' | 'static'`, `resumeScroll(previous: {start, end, y}, next: {start, end}): number`.

- [ ] **Step 1:** Confirm PR 2 is merged: `gh pr list --repo garciabel212/About-Me --state merged --search "content-data-layer"` shows it. If not, stop and report.
- [ ] **Step 2:** `git merge origin/main` in the worktree. Expected: clean merge (this branch only has docs).
- [ ] **Step 3:** Carry the engine over:

```bash
git checkout origin/feat/miami-flight -- src/flight/FrameStore.ts src/flight/__tests__/FrameStore.test.ts src/flight/useFlightMode.ts src/flight/resumeScroll.ts src/flight/__tests__/resumeScroll.test.ts
```

- [ ] **Step 4:** `npm install && npm test`. Expected: the carried-over FrameStore and resumeScroll tests plus the existing suites PASS.
- [ ] **Step 5:** `npm run lint && npm run build`. Expected: green. Commit `chore(flight): carry over the frame loader, flight mode and resume helpers`.

### Task 1: Frame export and generated flight data

**Files:**
- Modify: `tools/flight/pins.json`
- Create: `tools/flight/export_site.py`, `src/flight/flightData.ts` (generated), `public/flight/desktop/f000.webp`…, `public/flight/phone/f000.webp`…
- Test: `src/flight/__tests__/flightData.test.ts`

**Interfaces:**
- Produces: `src/flight/flightData.ts` exporting
  `type StopId = 'river' | 'brickell' | 'downtown' | 'bay' | 'beach' | 'sunset'`,
  `interface FlightStop { id: StopId; frame: number; x: number; y: number; phoneX: number; place: string; coords: string }`,
  `const flight: { frames: number; width: number; height: number; phoneWidth: number; stops: FlightStop[] }`.

- [ ] **Step 1: Write the failing test** `src/flight/__tests__/flightData.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { flight } from '../flightData';

describe('generated flight data', () => {
  it('has six stops in flight order', () => {
    expect(flight.stops.map((s) => s.id)).toEqual(['river', 'brickell', 'downtown', 'bay', 'beach', 'sunset']);
  });
  it('places every stop inside the film, in ascending order', () => {
    const frames = flight.stops.map((s) => s.frame);
    expect([...frames].sort((a, b) => a - b)).toEqual(frames);
    for (const f of frames) expect(f).toBeGreaterThanOrEqual(0);
    expect(frames.at(-1)).toBeLessThan(flight.frames);
  });
  it('keeps landmarks inside the frame on desktop and phone crops', () => {
    for (const s of flight.stops) {
      for (const v of [s.x, s.y, s.phoneX]) {
        expect(v).toBeGreaterThan(0);
        expect(v).toBeLessThan(1);
      }
    }
  });
});
```

- [ ] **Step 2:** `npx vitest run src/flight/__tests__/flightData.test.ts`. Expected: FAIL, "Cannot find module '../flightData'".
- [ ] **Step 3:** Add a `key` to each entry in `tools/flight/pins.json` (`s1_river` → `"key": "river"`, `s2_towers` → `"brickell"`, `s3_canyon` → `"downtown"`, `s4_bay` → `"bay"`, `s5_palms` → `"beach"`, `s6_sunset` → `"sunset"`).
- [ ] **Step 4:** Create `tools/flight/export_site.py`:

```python
"""Exports flight v2 into the site: desktop and phone frame sets plus src/flight/flightData.ts.

Usage (ComfyUI embedded Python): python export_site.py <repo_root>
Reads output/video/flight/flight_v2.mp4 + flight_v2.json and tools/flight/pins.json.
Phone frames are a PHONE_W-wide crop around the landmark (interpolated between stops) at full height,
so portrait phones keep desktop sharpness at about a third of the bytes.
"""
import json
import os
import sys

import av

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # the embedded Python doesn't add the script's folder
from heal_chain import COMFY  # noqa: E402

STRIDE = 2
PHONE_W = 420

here = os.path.dirname(os.path.abspath(__file__))
root = sys.argv[1]
film = os.path.join(COMFY, 'output', 'video', 'flight', 'flight_v2.mp4')
meta = json.load(open(os.path.join(COMFY, 'output', 'video', 'flight', 'flight_v2.json')))
pins = json.load(open(os.path.join(here, 'pins.json'), encoding='utf8'))

stops = [{'id': pins[s['id']]['key'], 'frame': round(s['frame'] / STRIDE), 'x': pins[s['id']]['x'],
          'y': pins[s['id']]['y'], 'place': pins[s['id']]['place'], 'coords': pins[s['id']]['coords']}
         for s in meta['stops']]


def focal_x(i):
    if i <= stops[0]['frame']:
        return stops[0]['x']
    for a, b in zip(stops, stops[1:]):
        if i <= b['frame']:
            t = (i - a['frame']) / (b['frame'] - a['frame'])
            return a['x'] + (b['x'] - a['x']) * t
    return stops[-1]['x']


desktop = os.path.join(root, 'public', 'flight', 'desktop')
phone = os.path.join(root, 'public', 'flight', 'phone')
for d in (desktop, phone):
    os.makedirs(d, exist_ok=True)
    for old in os.listdir(d):
        os.remove(os.path.join(d, old))

crops, n, size = [], 0, None
for k, frame in enumerate(av.open(film).decode(video=0)):
    if k % STRIDE:
        continue
    img = frame.to_image()
    size = img.size
    img.save(os.path.join(desktop, f'f{n:03d}.webp'), quality=72, method=6)
    left = int(min(max(focal_x(n) * size[0] - PHONE_W / 2, 0), size[0] - PHONE_W))
    img.crop((left, 0, left + PHONE_W, size[1])).save(os.path.join(phone, f'f{n:03d}.webp'), quality=74, method=6)
    crops.append(left)
    n += 1

for s in stops:
    s['phoneX'] = round((s['x'] * size[0] - crops[s['frame']]) / PHONE_W, 4)

data = {'frames': n, 'width': size[0], 'height': size[1], 'phoneWidth': PHONE_W, 'stops': stops}
ts = (
    '// GENERATED by tools/flight/export_site.py from flight_v2.mp4 and tools/flight/pins.json. Do not edit.\n'
    "export type StopId = 'river' | 'brickell' | 'downtown' | 'bay' | 'beach' | 'sunset';\n\n"
    'export interface FlightStop {\n  id: StopId;\n  frame: number;\n  x: number;\n  y: number;\n'
    '  phoneX: number;\n  place: string;\n  coords: string;\n}\n\n'
    'export const flight: { frames: number; width: number; height: number; phoneWidth: number; stops: FlightStop[] } = '
    + json.dumps(data, ensure_ascii=False, indent=2) + ';\n'
)
open(os.path.join(root, 'src', 'flight', 'flightData.ts'), 'w', encoding='utf8').write(ts)
bytes_d = sum(os.path.getsize(os.path.join(desktop, f)) for f in os.listdir(desktop))
bytes_p = sum(os.path.getsize(os.path.join(phone, f)) for f in os.listdir(phone))
print(f'EXPORTED {n} frames: desktop {bytes_d / 1e6:.1f} MB, phone {bytes_p / 1e6:.1f} MB; stops {[s["frame"] for s in stops]}')
```

- [ ] **Step 5:** Run it:

```bash
/c/Users/abel/AI/ComfyUI_windows_portable/python_embeded/python.exe tools/flight/export_site.py "$(pwd -W)"
```

Expected: `EXPORTED 413 frames: desktop ~12 MB, phone ~4 MB; stops [40, 114, 189, 264, 338, 412]`.
- [ ] **Step 6:** `npx vitest run src/flight/__tests__/flightData.test.ts`. Expected: PASS (3 tests).
- [ ] **Step 7:** Spot-check one phone frame: open `public/flight/phone/f114.webp`. The Brickell tower must be inside the crop.
- [ ] **Step 8:** Commit `feat(flight): export desktop and phone frame sets with generated stop data` (files: `tools/flight/pins.json`, `tools/flight/export_site.py`, `src/flight/flightData.ts`, `src/flight/__tests__/flightData.test.ts`, `public/flight/**`).

### Task 2: Cover crop maths

**Files:**
- Create: `src/flight/crop.ts`
- Test: `src/flight/__tests__/crop.test.ts`

**Interfaces:**
- Produces: `interface DrawRect { dx: number; dy: number; dw: number; dh: number }`, `coverDraw(srcW, srcH, viewW, viewH): DrawRect`, `toScreen(rect: DrawRect, fx: number, fy: number): { x: number; y: number }`.

- [ ] **Step 1: Write the failing test:**

```ts
import { describe, expect, it } from 'vitest';
import { coverDraw, toScreen } from '../crop';

describe('coverDraw', () => {
  it('fills a wide viewport, cropping top and bottom equally', () => {
    const r = coverDraw(1280, 704, 1920, 900);
    expect(r.dw).toBeCloseTo(1920);
    expect(r.dh).toBeCloseTo(1056);
    expect(r.dy).toBeCloseTo(-78);
    expect(r.dx).toBeCloseTo(0);
  });
  it('fills a tall viewport, cropping the sides equally', () => {
    const r = coverDraw(420, 704, 390, 844);
    expect(r.dh).toBeCloseTo(844);
    expect(r.dw).toBeCloseTo(503.5, 0);
    expect(r.dx).toBeCloseTo(-56.75, 0);
  });
});

describe('toScreen', () => {
  it('maps frame fractions through the draw rectangle', () => {
    const r = { dx: -50, dy: -20, dw: 1000, dh: 500 };
    expect(toScreen(r, 0.5, 0.5)).toEqual({ x: 450, y: 230 });
  });
});
```

- [ ] **Step 2:** `npx vitest run src/flight/__tests__/crop.test.ts`. Expected: FAIL, module not found.
- [ ] **Step 3:** Create `src/flight/crop.ts`:

```ts
export interface DrawRect {
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}

/** Where to draw a srcW×srcH frame so it covers a viewW×viewH canvas, centred on both axes. */
export function coverDraw(srcW: number, srcH: number, viewW: number, viewH: number): DrawRect {
  const scale = Math.max(viewW / srcW, viewH / srcH);
  const dw = srcW * scale;
  const dh = srcH * scale;
  return { dx: (viewW - dw) / 2, dy: (viewH - dh) / 2, dw, dh };
}

/** Screen position of a point given as fractions of the frame. */
export function toScreen(rect: DrawRect, fx: number, fy: number): { x: number; y: number } {
  return { x: rect.dx + fx * rect.dw, y: rect.dy + fy * rect.dh };
}
```

- [ ] **Step 4:** Run the test. Expected: PASS (3 tests).
- [ ] **Step 5:** Commit `feat(flight): cover-draw maths for the flight canvas`.

### Task 3: Scroll timeline layout

**Files:**
- Create: `src/flight/timeline.ts`
- Test: `src/flight/__tests__/timeline.test.ts`, `src/flight/__tests__/placement.test.ts`

**Interfaces:**
- Produces:
  - `type SegmentKind = 'open' | 'reveal' | 'hold' | 'fold' | 'hop' | 'tail'`
  - `interface Segment { kind: SegmentKind; stop: number; start: number; end: number; fromFrame?: number; toFrame?: number }`
  - `const UNITS = { open: 10, reveal: 22, hold: 10, fold: 6, perFrame: 1 / 3, tail: 6 }`
  - `buildTimeline(stopFrames: number[]): { segments: Segment[]; total: number; readingAt: number[] }`
  - `anchorTop(readingAt: number, total: number, trackHeight: number, viewportHeight: number): number`, the scroll offset of a stop's reading position inside the track.

- [ ] **Step 1: Write the failing test** `timeline.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildTimeline, UNITS } from '../timeline';

const frames = [40, 114, 189, 264, 338, 412];

describe('buildTimeline', () => {
  const t = buildTimeline(frames);
  it('lays segments end to end from 0 to total', () => {
    let cursor = 0;
    for (const s of t.segments) {
      expect(s.start).toBeCloseTo(cursor);
      expect(s.end).toBeGreaterThan(s.start);
      cursor = s.end;
    }
    expect(cursor).toBeCloseTo(t.total);
  });
  it('opens on stop 1 already revealed, then hops through every stop in order', () => {
    expect(t.segments[0]).toMatchObject({ kind: 'open', stop: 0, start: 0 });
    const hops = t.segments.filter((s) => s.kind === 'hop');
    expect(hops.map((h) => [h.fromFrame, h.toFrame])).toEqual([[40, 114], [114, 189], [189, 264], [264, 338], [338, 412]]);
    expect(hops[0].end - hops[0].start).toBeCloseTo((114 - 40) * UNITS.perFrame);
  });
  it('reveals every later stop and folds every stop except the last', () => {
    expect(t.segments.filter((s) => s.kind === 'reveal').map((s) => s.stop)).toEqual([1, 2, 3, 4, 5]);
    expect(t.segments.filter((s) => s.kind === 'fold').map((s) => s.stop)).toEqual([0, 1, 2, 3, 4]);
  });
  it('puts each reading position where that stop is fully open', () => {
    expect(t.readingAt[0]).toBe(0);
    for (let i = 1; i < frames.length; i++) {
      const reveal = t.segments.find((s) => s.kind === 'reveal' && s.stop === i)!;
      expect(t.readingAt[i]).toBeCloseTo(reveal.end);
    }
  });
});
```

- [ ] **Step 2:** Write the failing test `placement.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { anchorTop } from '../timeline';

describe('anchorTop', () => {
  it('maps a reading position to its share of the scrollable track', () => {
    expect(anchorTop(50, 100, 5900, 900)).toBe(2500);
  });
  it('keeps the same share when the track is rebuilt at a new size', () => {
    const before = anchorTop(30, 120, 10900, 900) / (10900 - 900);
    const after = anchorTop(30, 120, 8644, 844) / (8644 - 844);
    expect(after).toBeCloseTo(before);
  });
  it('never returns a negative offset', () => {
    expect(anchorTop(0, 100, 500, 900)).toBe(0);
  });
});
```

- [ ] **Step 3:** `npx vitest run src/flight/__tests__/timeline.test.ts src/flight/__tests__/placement.test.ts`. Expected: FAIL, module not found.
- [ ] **Step 4:** Create `src/flight/timeline.ts`:

```ts
export type SegmentKind = 'open' | 'reveal' | 'hold' | 'fold' | 'hop' | 'tail';

export interface Segment {
  kind: SegmentKind;
  stop: number;
  start: number;
  end: number;
  fromFrame?: number;
  toFrame?: number;
}

/** Scroll units per phase. One unit is turned into scroll distance by FlightHome. */
export const UNITS = { open: 10, reveal: 22, hold: 10, fold: 6, perFrame: 1 / 3, tail: 6 } as const;

/**
 * Lays out the whole flight as consecutive segments. Stop 1 starts open (the hero must be readable at
 * first paint); every later stop is revealed, held for reading, then folded before the next hop.
 */
export function buildTimeline(stopFrames: number[]): { segments: Segment[]; total: number; readingAt: number[] } {
  const segments: Segment[] = [];
  const readingAt: number[] = [];
  let t = 0;
  const push = (kind: SegmentKind, stop: number, length: number, extra: Partial<Segment> = {}) => {
    segments.push({ kind, stop, start: t, end: t + length, ...extra });
    t += length;
  };
  stopFrames.forEach((frame, i) => {
    if (i === 0) {
      readingAt.push(0);
      push('open', 0, UNITS.open);
    } else {
      push('reveal', i, UNITS.reveal);
      readingAt.push(t);
      push('hold', i, UNITS.hold);
    }
    if (i < stopFrames.length - 1) {
      push('fold', i, UNITS.fold);
      const next = stopFrames[i + 1];
      push('hop', i, (next - frame) * UNITS.perFrame, { fromFrame: frame, toFrame: next });
    }
  });
  push('tail', stopFrames.length - 1, UNITS.tail);
  return { segments, total: t, readingAt };
}

/** Scroll offset inside the track at which a reading position sits. */
export function anchorTop(readingAt: number, total: number, trackHeight: number, viewportHeight: number): number {
  return Math.max(0, (readingAt / total) * (trackHeight - viewportHeight));
}
```

- [ ] **Step 5:** Run both tests. Expected: PASS (7 tests).
- [ ] **Step 6:** Commit `feat(flight): pure scroll timeline for hops, reveals and reading positions`.

### Task 4: Stops ↔ sections

**Files:**
- Create: `src/flight/stops.ts`
- Test: `src/flight/__tests__/stops.test.ts`
- Delete: `src/data/__tests__/navigation.test.ts` if it still exists (it scans `scenes/`, which Task 7 removes; `routes.test.ts` from the content session covers nav links)

**Interfaces:**
- Consumes: `StopId` from `flightData.ts`, `sectionIds` from `@/data/routes`.
- Produces: `STOP_SECTIONS: Record<StopId, readonly SectionId[]>`, `type SectionId = (typeof sectionIds)[number]`, `stopForSection(id: string): StopId | null`, `STOP_LABEL: Record<StopId, string>` ("Stop 01" … "Stop 06").

- [ ] **Step 1: Write the failing test:**

```ts
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
```

- [ ] **Step 2:** Run it. Expected: FAIL, module not found.
- [ ] **Step 3:** Create `src/flight/stops.ts`:

```ts
import { sectionIds } from '@/data/routes';
import type { StopId } from './flightData';

export type SectionId = (typeof sectionIds)[number];

/** Which Home sections each stop carries, in the brief's page order. */
export const STOP_SECTIONS: Record<StopId, readonly SectionId[]> = {
  river: ['intro'],
  brickell: ['capabilities'],
  downtown: ['projects'],
  bay: ['experience'],
  beach: ['who-i-am', 'about'],
  sunset: ['resume', 'contact'],
};

export const STOP_LABEL: Record<StopId, string> = {
  river: 'Stop 01',
  brickell: 'Stop 02',
  downtown: 'Stop 03',
  bay: 'Stop 04',
  beach: 'Stop 05',
  sunset: 'Stop 06',
};

export function stopForSection(id: string): StopId | null {
  for (const [stop, ids] of Object.entries(STOP_SECTIONS) as [StopId, readonly string[]][]) {
    if (ids.includes(id)) return stop;
  }
  return null;
}
```

- [ ] **Step 4:** Run it. Expected: PASS (3 tests). If "follows the brief order" fails because the content session reordered `sectionIds`, change `STOP_SECTIONS` to match their order. Their order is the source of truth.
- [ ] **Step 5:** Delete `src/data/__tests__/navigation.test.ts` if present; run `npm test` (all PASS). Commit `feat(flight): map flight stops to Home section ids`.

### Task 5: Card bodies from content data

**Files:**
- Create: `src/flight/cards/HeroCard.tsx`, `CapabilitiesCard.tsx`, `WorkCard.tsx`, `ExperienceCard.tsx`, `ApproachCard.tsx`, `ContactCard.tsx`, `src/flight/cards/index.ts`
- Test: `src/flight/__tests__/cards.test.tsx`

**Interfaces:**
- Consumes: everything listed in Global Constraints from `@/data/content`; `resumeUrl`, `mailto` from `@/data/profile`.
- Produces: `CARD_BODY: Record<StopId, () => JSX.Element>` from `cards/index.ts`. `ApproachCard` accepts `{ initialTab?: 'approach' | 'tools' | 'about' }`.

- [ ] **Step 1: Write the failing test** (node environment, no jsdom: `renderToStaticMarkup`):

```tsx
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { availableResumes, contact, featuredWork, hero, site } from '@/data/content';
import { CARD_BODY } from '../cards';
import ApproachCard from '../cards/ApproachCard';

const html = (el: JSX.Element) => renderToStaticMarkup(<MemoryRouter>{el}</MemoryRouter>);

describe('flight cards', () => {
  it('hero shows name, headline, heading and the résumé link', () => {
    const out = html(CARD_BODY.river());
    expect(out).toContain(site.name);
    expect(out).toContain(site.headline.split(' | ')[0]);
    expect(out).toContain(hero.heading);
    expect(out).toContain('Jose-Garcia-Resume.pdf');
  });
  it('work shows three items and a labeled placeholder where there is no screenshot', () => {
    const out = html(CARD_BODY.downtown());
    for (const w of featuredWork) expect(out).toContain(w.title);
    const noImage = featuredWork.filter((w) => w.image === '');
    expect((out.match(/data-placeholder="true"/g) ?? []).length).toBe(noImage.length);
    expect(out).not.toMatch(/src=""/);
  });
  it('contact links only résumés that exist', () => {
    const out = html(CARD_BODY.sunset());
    expect(out).toContain(contact.email);
    expect((out.match(/data-resume=/g) ?? []).length).toBe(availableResumes().length);
  });
  it('the beach card opens on the requested tab', () => {
    expect(html(<ApproachCard initialTab="about" />)).toMatch(/aria-selected="true"[^>]*>About/);
  });
});
```

- [ ] **Step 2:** Run it. Expected: FAIL, module not found.
- [ ] **Step 3:** Create the cards. Every card returns a fragment of the card's inner content; the `MistCard` shell (Task 6) supplies the eyebrow, frame and anchors.

`src/flight/cards/HeroCard.tsx`:

```tsx
import { evidenceStrip, hero, site } from '@/data/content';
import { mailto, resumeUrl } from '@/data/profile';

export default function HeroCard() {
  return (
    <>
      <h1 className="fl-h1">{site.name}</h1>
      <p className="fl-role">{site.headline}</p>
      <p className="fl-lead">{hero.heading}</p>
      <p className="fl-body">{hero.intro}</p>
      <p className="fl-details">{hero.details.join(' · ')}</p>
      <div className="fl-actions">
        <a className="fl-btn fl-btn-primary" href="#projects">{hero.workCta}</a>
        <a className="fl-btn fl-btn-ghost" href={resumeUrl} target="_blank" rel="noopener">{hero.resumeCta}</a>
        <a className="fl-btn fl-btn-ghost" href={mailto}>{hero.emailCta}</a>
      </div>
      <ul className="fl-chips">{evidenceStrip.map((e) => <li key={e}>{e}</li>)}</ul>
    </>
  );
}
```

`src/flight/cards/CapabilitiesCard.tsx`:

```tsx
import { Link } from 'react-router-dom';
import { capabilities } from '@/data/content';

export default function CapabilitiesCard() {
  return (
    <>
      <h2 className="fl-h2">What I help customers do</h2>
      <ul className="fl-rows">
        {capabilities.map((c) => (
          <li key={c.id}>
            <b>{c.title}</b>
            <span>{c.body}</span>
            <Link className="fl-link" to={c.href}>{c.linkLabel}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
```

`src/flight/cards/WorkCard.tsx`:

```tsx
import { Link } from 'react-router-dom';
import { featuredWork } from '@/data/content';

const base = import.meta.env.BASE_URL;

export default function WorkCard() {
  return (
    <>
      <h2 className="fl-h2">Selected work</h2>
      <ul className="fl-work">
        {featuredWork.map((w) => (
          <li key={w.slug}>
            {w.image ? (
              <figure className="fl-thumb">
                <img src={`${base}${w.image}`} alt={`${w.title}: ${w.subtitle}`} loading="lazy" />
                {w.imageIsConcept && <figcaption>Concept</figcaption>}
              </figure>
            ) : (
              <div className="fl-thumb fl-thumb-empty" data-placeholder="true" role="img" aria-label={`${w.title}: screenshot coming soon`}>
                <span>Screenshot coming soon</span>
              </div>
            )}
            <div>
              <p className="fl-status">{w.status}</p>
              <b>{w.title}</b>
              <span>{w.subtitle}</span>
              <Link className="fl-link" to={w.href}>Read case study</Link>
            </div>
          </li>
        ))}
      </ul>
      <Link className="fl-link fl-quiet" to="/lab">More in the Lab</Link>
    </>
  );
}
```

`src/flight/cards/ExperienceCard.tsx`:

```tsx
import { useState } from 'react';
import { experience } from '@/data/content';

export default function ExperienceCard() {
  const [all, setAll] = useState(false);
  return (
    <>
      <h2 className="fl-h2">Experience</h2>
      {experience.map((e) => (
        <section key={e.id} className="fl-job">
          <b>{e.title}</b>
          <span className="fl-meta">{e.organization} · {e.period} · {e.location}</span>
          <p className="fl-body">{e.summary}</p>
          {e.bullets.length > 0 && (
            <ul className="fl-bullets">
              {(all ? e.bullets : e.bullets.slice(0, 3)).map((b) => <li key={b}>{b}</li>)}
            </ul>
          )}
          {e.bullets.length > 3 && (
            <button type="button" className="fl-link" aria-expanded={all} onClick={() => setAll(!all)}>
              {all ? 'Show fewer' : `Show all ${e.bullets.length}`}
            </button>
          )}
        </section>
      ))}
    </>
  );
}
```

`src/flight/cards/ApproachCard.tsx`:

```tsx
import { useState } from 'react';
import { approach, bio, education, languages, tools } from '@/data/content';

type Tab = 'approach' | 'tools' | 'about';
const TABS: { id: Tab; label: string }[] = [
  { id: 'approach', label: 'How I work' },
  { id: 'tools', label: 'Tools & education' },
  { id: 'about', label: 'About' },
];

export default function ApproachCard({ initialTab = 'approach' }: { initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  return (
    <>
      <div className="fl-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" id={`fl-tab-${t.id}`} aria-controls={`fl-panel-${t.id}`}
            aria-selected={tab === t.id} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      <div role="tabpanel" id={`fl-panel-${tab}`} aria-labelledby={`fl-tab-${tab}`}>
        {tab === 'approach' && (
          <ol className="fl-steps">
            {approach.map((s) => <li key={s.step}><b>{s.name}</b><span>{s.subtitle}</span></li>)}
          </ol>
        )}
        {tab === 'tools' && (
          <div className="fl-cols">
            <div><p className="fl-status">Professional</p><ul className="fl-bullets">{tools.professional.map((t) => <li key={t.name}>{t.name}</li>)}</ul></div>
            <div><p className="fl-status">Projects</p><ul className="fl-bullets">{tools.project.map((t) => <li key={t.name}>{t.name}</li>)}</ul></div>
            <div><p className="fl-status">Education</p><ul className="fl-bullets">{education.map((e) => <li key={e.name}>{e.name}, {e.issuer}</li>)}<li>{languages}</li></ul></div>
          </div>
        )}
        {tab === 'about' && bio.map((p) => <p key={p} className="fl-body">{p}</p>)}
      </div>
    </>
  );
}
```

`src/flight/cards/ContactCard.tsx`:

```tsx
import { useState } from 'react';
import { availableResumes, contact } from '@/data/content';

const base = import.meta.env.BASE_URL;

export default function ContactCard() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(contact.email); setCopied(true); } catch { setCopied(false); }
  };
  return (
    <>
      <h2 className="fl-h2">{contact.heading}</h2>
      <p className="fl-body">{contact.body}</p>
      <p className="fl-email">{contact.email}</p>
      <div className="fl-actions">
        <a className="fl-btn fl-btn-primary" href={`mailto:${contact.email}`}>Email Jose</a>
        <button type="button" className="fl-btn fl-btn-ghost" onClick={copy}>{copied ? 'Copied' : 'Copy email'}</button>
        <a className="fl-btn fl-btn-ghost" href={contact.linkedin} target="_blank" rel="noopener">LinkedIn</a>
      </div>
      <ul className="fl-resumes" id="resume-list">
        {availableResumes().map((r) => (
          <li key={r.id} data-resume={r.id}>
            <span>{r.label}</span>
            <a className="fl-link" href={`${base}${r.file}`} target="_blank" rel="noopener">Download PDF</a>
            <small>Updated {r.updated}</small>
          </li>
        ))}
      </ul>
      <p className="fl-details">{contact.details.join(' · ')}</p>
    </>
  );
}
```

`src/flight/cards/index.ts`:

```ts
import type { StopId } from '../flightData';
import ApproachCard from './ApproachCard';
import CapabilitiesCard from './CapabilitiesCard';
import ContactCard from './ContactCard';
import ExperienceCard from './ExperienceCard';
import HeroCard from './HeroCard';
import WorkCard from './WorkCard';

export const CARD_BODY: Record<StopId, () => JSX.Element> = {
  river: HeroCard,
  brickell: CapabilitiesCard,
  downtown: WorkCard,
  bay: ExperienceCard,
  beach: ApproachCard,
  sunset: ContactCard,
};
```

- [ ] **Step 4:** Run the test. Expected: PASS (4 tests). If a content field name differs from the plan (the content session owns `content.ts`), use theirs and update this test.
- [ ] **Step 5:** `npm run lint && npm run build`, then commit `feat(flight): stop cards rendered from the content data`.

### Task 6: Mist card, stop marks and the reveal

**Files:**
- Create: `src/flight/mist.ts`, `src/flight/MistCard.tsx`, `src/flight/StopMarks.tsx`, `src/flight/reveal.ts`, `src/flight/flight.css`
- Test: `src/flight/__tests__/mist.test.ts`

**Interfaces:**
- Produces:
  - `puffLayout(count: number, seed: number): { x: number; y: number; r: number; delay: number }[]`: positions as fractions of the card box (x, y in [-0.15, 1.15]), radius in px, deterministic per seed.
  - `<MistCard stop={FlightStop} index={number} cardRef={RefObject<HTMLElement>} placement="side" | "center">` renders the shell, `PUFFS = 9` puffs (3 on phones via CSS), invisible section anchors (none: anchors live in FlightHome), and `CARD_BODY[stop.id]`. For `beach` it passes `initialTab` from the URL hash (`#about` → `'about'`, `#who-i-am` → `'approach'`).
  - `<StopMarks stop={FlightStop} />` renders `.fl-reticle`, `.fl-lock`, `.fl-pin`, and a `<path>` + `<circle>` inside the shared leader `<svg>` via a portal target `#fl-leader`.
  - `revealTimeline(els: StopEls, mode: 'desktop' | 'mobile'): gsap.core.Timeline` (22 units) and `foldTimeline(els: StopEls): gsap.core.Timeline` (6 units), where `interface StopEls { card: HTMLElement; puffs: HTMLElement[]; content: HTMLElement[]; reticle: HTMLElement; lock: HTMLElement; pin: HTMLElement; ring: HTMLElement; path: SVGPathElement; end: SVGCircleElement; veil: HTMLElement }`.

- [ ] **Step 1: Write the failing test** `mist.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { puffLayout } from '../mist';

describe('puffLayout', () => {
  it('is deterministic for a seed', () => {
    expect(puffLayout(9, 3)).toEqual(puffLayout(9, 3));
    expect(puffLayout(9, 3)).not.toEqual(puffLayout(9, 4));
  });
  it('keeps puffs around the card edges and sized to read as mist', () => {
    for (const p of puffLayout(9, 1)) {
      expect(p.x).toBeGreaterThanOrEqual(-0.15);
      expect(p.x).toBeLessThanOrEqual(1.15);
      expect(p.y).toBeGreaterThanOrEqual(-0.15);
      expect(p.y).toBeLessThanOrEqual(1.15);
      expect(p.r).toBeGreaterThanOrEqual(90);
      expect(p.r).toBeLessThanOrEqual(220);
      expect(p.delay).toBeGreaterThanOrEqual(0);
      expect(p.delay).toBeLessThan(1);
    }
  });
});
```

- [ ] **Step 2:** Run it. Expected: FAIL, module not found.
- [ ] **Step 3:** Create `src/flight/mist.ts`:

```ts
/** Small deterministic PRNG (mulberry32) so mist looks organic but renders identically on every visit. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Mist puffs spread around the card's perimeter, as fractions of the card box. */
export function puffLayout(count: number, seed: number): { x: number; y: number; r: number; delay: number }[] {
  const next = rng(seed);
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + next() * 0.6;
    return {
      x: 0.5 + Math.cos(angle) * (0.45 + next() * 0.2),
      y: 0.5 + Math.sin(angle) * (0.45 + next() * 0.2),
      r: 90 + next() * 130,
      delay: next() * 0.6,
    };
  });
}
```

- [ ] **Step 4:** Run it. Expected: PASS (2 tests).
- [ ] **Step 5:** Create `src/flight/flight.css`. Port the prototype's styles from `docs/prototypes/flight-v2/index.html` (HUD, reticle, pin, leader, card, buttons, rows, steps, chips, phone breakpoint, static mode), renaming each class to the `fl-` prefix used in Tasks 5–6. Add the mist styles:

```css
.fl-card { position: fixed; z-index: 3; left: var(--fl-gutter); top: 50%; transform: translateY(-46%);
  width: min(440px, 38vw); max-height: calc(100vh - 150px); overflow: auto; padding: 26px 28px 24px;
  border-radius: 18px; color: var(--fl-ink); display: grid; gap: 14px; opacity: 0; visibility: hidden;
  background: rgba(245, 242, 236, 0.9); backdrop-filter: blur(18px) saturate(1.1);
  -webkit-backdrop-filter: blur(18px) saturate(1.1);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.35) inset, 0 30px 80px -20px rgba(0, 0, 0, 0.55);
  -webkit-mask-image: radial-gradient(140% 130% at 50% 50%, #000 62%, transparent 100%);
          mask-image: radial-gradient(140% 130% at 50% 50%, #000 62%, transparent 100%); }
.fl-card.is-open { -webkit-mask-image: none; mask-image: none; }
.fl-puffs { position: fixed; z-index: 2; pointer-events: none; }
.fl-puff { position: absolute; border-radius: 50%; opacity: 0; filter: blur(22px);
  background: radial-gradient(circle, rgba(245, 242, 236, 0.85) 0%, rgba(214, 205, 230, 0.45) 45%, transparent 70%);
  transform: translate(-50%, -50%) scale(0.4); }
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .fl-card { background: #F5F2EC; }
}
@media (max-width: 767px) {
  .fl-card { backdrop-filter: none; -webkit-backdrop-filter: none; background: #F5F2EC; left: 16px; right: 16px;
    width: auto; top: auto; transform: none; bottom: calc(52px + env(safe-area-inset-bottom, 0px)); max-height: 58vh; }
  .fl-puff:nth-child(n + 4) { display: none; }
}
.fl-thumb-empty { display: grid; place-items: center; aspect-ratio: 16 / 10; border-radius: 8px;
  border: 1px dashed rgba(25, 27, 30, 0.25); color: #4A5058; font: 500 11px/1.4 'JetBrains Mono', monospace; }
.fl-thumb figcaption { font: 500 10px/1 'JetBrains Mono', monospace; letter-spacing: 0.1em; text-transform: uppercase; }
```

- [ ] **Step 6:** Create `src/flight/StopMarks.tsx`, `src/flight/MistCard.tsx` and `src/flight/reveal.ts`. `reveal.ts` contents:

```ts
import gsap from 'gsap';

export interface StopEls {
  card: HTMLElement; puffs: HTMLElement[]; content: HTMLElement[]; reticle: HTMLElement; lock: HTMLElement;
  pin: HTMLElement; ring: HTMLElement; path: SVGPathElement; end: SVGCircleElement; veil: HTMLElement;
}

/** 22 units: lock → pin → line → mist gathers → card condenses → text. Fully reversible when scrubbed. */
export function revealTimeline(els: StopEls, mode: 'desktop' | 'mobile') {
  const puffTravel = mode === 'mobile' ? 0.6 : 1;
  return gsap.timeline({ defaults: { ease: 'none' } })
    .set(els.card, { visibility: 'visible' }, 0)
    .fromTo(els.reticle, { opacity: 0, width: 300, height: 300 }, { opacity: 1, width: 190, height: 190, duration: 3, ease: 'power1.out' }, 0)
    .to(els.reticle, { width: 56, height: 56, duration: 4, ease: 'power3.inOut' }, 3)
    .fromTo(els.lock, { opacity: 0 }, { opacity: 1, duration: 2 }, 6)
    .fromTo(els.pin, { opacity: 0, y: -80 }, { opacity: 1, y: 0, duration: 3, ease: 'power2.in' }, 7)
    .fromTo(els.ring, { opacity: 0.9, scale: 0.2 }, { opacity: 0, scale: 2.4, duration: 3, ease: 'power2.out' }, 10)
    .fromTo(els.path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 5, ease: 'power1.inOut' }, 9)
    .to(els.veil, { opacity: 1, duration: 6 }, 9)
    .fromTo(els.puffs, { opacity: 0, scale: 0.4, xPercent: -50 - 40 * puffTravel, yPercent: -50 },
      { opacity: 1, scale: 1.15, xPercent: -50, yPercent: -50, duration: 6, stagger: 0.25, ease: 'power2.out' }, 10)
    .fromTo(els.card, { opacity: 0, filter: 'blur(14px)' }, { opacity: 1, filter: 'blur(0px)', duration: 6, ease: 'power2.out' }, 13)
    .to(els.puffs, { opacity: 0, scale: 0.7, duration: 4, stagger: 0.15 }, 16)
    .fromTo(els.end, { opacity: 0 }, { opacity: 1, duration: 1 }, 14)
    .fromTo(els.content, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 3, stagger: 0.4, ease: 'power2.out' }, 17)
    .set(els.card, { className: 'fl-card is-open', filter: 'none' }, 22);
}

/** 6 units: text out → card thins to mist and drifts with the direction of travel → marks clear. */
export function foldTimeline(els: StopEls) {
  return gsap.timeline({ defaults: { ease: 'none' } })
    .set(els.card, { className: 'fl-card' }, 0)
    .to(els.content, { opacity: 0, y: -6, duration: 1.5, stagger: 0.08 }, 0)
    .to(els.puffs, { opacity: 0.9, scale: 1.1, duration: 1.5, stagger: 0.05 }, 0.5)
    .to(els.card, { opacity: 0, filter: 'blur(14px)', duration: 2.5, ease: 'power2.in' }, 1)
    .to(els.puffs, { opacity: 0, xPercent: 40, scale: 1.4, duration: 2.5, stagger: 0.05 }, 2.5)
    .to(els.end, { opacity: 0, duration: 1 }, 1.5)
    .to(els.path, { strokeDashoffset: 1, duration: 2.5, ease: 'power1.in' }, 2)
    .to([els.pin, els.lock], { opacity: 0, duration: 1.5 }, 4)
    .to(els.reticle, { opacity: 0, width: 140, height: 140, duration: 1.5 }, 4)
    .to(els.veil, { opacity: 0, duration: 2 }, 4)
    .set(els.card, { visibility: 'hidden' }, 6);
}
```

`MistCard.tsx` renders `<div className="fl-puffs">` positioned over the card (its rect is measured in `FlightHome`), with `puffLayout(9, index + 1)` spans styled `left: x*100%; top: y*100%; width/height: r*2px`, then `<article className="fl-card" aria-labelledby=…>` containing `<p className="fl-eyebrow">{STOP_LABEL[stop.id]} · {stop.place}</p>` and `CARD_BODY[stop.id]`. The sunset card gets `className="fl-card fl-center"`. `StopMarks.tsx` renders the reticle, lock (`Lock · {place}` / `{coords}`), and pin exactly as in the prototype, plus `createPortal(<><path pathLength="1" /><circle r="3" /></>, leaderSvg)`.

- [ ] **Step 7:** `npm test && npm run lint && npm run build`. Expected: green. Commit `feat(flight): condensing-mist card, stop marks and reveal timelines`.

### Task 7: FlightHome, static page, routing, scene removal

**Files:**
- Create: `src/flight/FlightHome.tsx`, `src/flight/StaticFlight.tsx`
- Modify: `src/pages/Home.tsx`, `src/App.tsx` (`SiteLayout`: Home shows the flight HUD, not `EditorialNav`), `index.html` (preload the stop-1 poster)
- Delete: `src/components/scenes/*`, `src/components/journey/*`, and `src/components/editorial/EditorialNav.tsx` if no longer imported (`git grep -l EditorialNav src` must be empty first)

**Interfaces:**
- Consumes: `flight` (Task 1), `coverDraw`/`toScreen` (Task 2), `buildTimeline`/`anchorTop` (Task 3), `STOP_SECTIONS`/`stopForSection` (Task 4), `MistCard`/`StopMarks`/`revealTimeline`/`foldTimeline` (Task 6), `FrameStore`, `useFlightMode`, `resumeScroll` (Task 0), `useLenis` from `@/components/motion/SmoothScroll`, `navLinks` from `@/data/routes`, `resumeUrl`/`mailto` from `@/data/profile`.
- Produces: `export default function FlightHome()`.

- [ ] **Step 1:** Write `StaticFlight.tsx`: one `<section>` per stop with `id` = the first of `STOP_SECTIONS[stop.id]` and extra `<span id=…>` anchors for the rest. Background is `url(${BASE_URL}flight/desktop/f${pad(stop.frame)}.webp)` under a left-to-right dark gradient. It renders `MistCard` with `static` (no puffs, `opacity: 1`, `visibility: visible`, `position: relative`), and the AI label at the bottom of the page.
- [ ] **Step 2:** Write `FlightHome.tsx`. It ports these functions from `docs/prototypes/flight-v2/index.html` into React effects: `layout()`, `draw()`, `placeMarks()`, the `mm.add(...)` timeline builder and the route-bar `onclick`. The prototype is the working reference for every behaviour below.
  - `mode = useFlightMode()`. If `'static'`, return `<StaticFlight />`.
  - Frames: `const set = mode === 'mobile' ? 'phone' : 'desktop'`, `const srcW = set === 'phone' ? flight.phoneWidth : flight.width`. Create `new FrameStore<HTMLImageElement>({ frameCount: flight.frames, load: (i) => loadImage(`${BASE_URL}flight/${set}/f${pad(i)}.webp`), onLoad: () => drawCurrent() })` in an effect; `start()` it; `dispose()` on cleanup. `loadImage` resolves on `img.decode()`.
  - `drawNearest(f)`: `store.setPlayhead(Math.round(f))`, then `const hit = store.nearest(Math.round(f))`. If `hit` is set, `ctx.drawImage(hit.frame, rect.dx, rect.dy, rect.dw, rect.dh)` with `rect = coverDraw(srcW, flight.height, innerWidth, innerHeight)`. Otherwise leave the poster visible.
  - Poster: an `<img className="fl-poster">` of the stop-1 frame that sits under the canvas, so the first paint is never blank.
  - Marks: for each stop, `toScreen(rect, mode === 'mobile' ? stop.phoneX : stop.x, stop.y)` sets the reticle, pin and lock positions. The leader path is computed from the card rect, as in the prototype (`M pin → L card.right + 64, card.top + 34 → L card.right, card.top + 34` on desktop; vertical into the sheet's top on phones).
  - Timeline: `const plan = buildTimeline(flight.stops.map((s) => s.frame))`. Build one paused `gsap.timeline()`. For each segment: `open` sets stop 0 to its revealed end state (`revealTimeline(els0).progress(1)` standalone, not added); `reveal` → `tl.add(revealTimeline(els[i], mode), seg.start)`; `fold` → `tl.add(foldTimeline(els[i]), seg.start)`; `hop` → `tl.fromTo(state, { frame: seg.fromFrame }, { frame: seg.toFrame, duration: seg.end - seg.start, onUpdate: () => drawNearest(state.frame) }, seg.start)`; `tail` → `tl.to({}, { duration: seg.end - seg.start }, seg.start)`. Track height: `plan.total * 4.2vh`. `ScrollTrigger.create({ trigger: track, start: 'top top', end: 'bottom bottom', scrub: 0.7, animation: tl })`.
  - Settle: on mount (not reduced motion), tween `state.frame` from `max(0, stops[0].frame - 24)` to `stops[0].frame` over 3 s with `power2.out`. The hero card is already open, so the text never waits.
  - Anchors: for each stop and each id in `STOP_SECTIONS[stop.id]`, render `<span id={id} className="fl-anchor" style={{ top: anchorTop(plan.readingAt[i], plan.total, trackHeight, innerHeight) + 64 }} />` absolutely inside the track. The `+ 64` cancels App's `offset: -64` so the stop's reading position lands exactly. `intro` stays at the top.
  - HUD: brand; a route bar of six buttons that `lenis.scrollTo(anchorY)`, with `aria-current` on the stop nearest the playhead; Résumé (`resumeUrl`) and Email (`mailto`) buttons; bottom-left "AI-rendered flight · not real footage".
  - Resize: recompute `rect`, marks, leader paths, track height and anchors. Keep the reader's place with `resumeScroll({ start, end, y }, { start: newStart, end: newEnd })` and `ScrollTrigger.refresh()`.
- [ ] **Step 3:** `src/pages/Home.tsx` becomes `export default function Home() { return <FlightHome />; }`. In `App.tsx` `SiteLayout`, the Home branch renders no `EditorialNav` (the flight HUD replaces it). Keep `Footer`.
- [ ] **Step 4:** In `index.html`, add `<link rel="preload" as="image" href="/About-Me/flight/desktop/f040.webp" fetchpriority="high">`, using the first stop's frame from `flightData.ts`.
- [ ] **Step 5:** Delete the scenes and journey components. `git grep -nE "scenes/|journey/|EditorialNav" src` must return nothing. `npm test && npm run lint && npm run build` → green.
- [ ] **Step 6:** Commit `feat(home): the six-stop flight replaces the scene-based Home`.

### Task 8: Browser verification, performance and PR

**Files:**
- Modify: `.claude/launch.json` in `Documents/Code` (add `about-me-flight-home`: `npm --prefix About-Me-flight-home run dev -- --port 5201 --strictPort`, port 5201)

- [ ] **Step 1:** Start the preview (`preview_start about-me-flight-home`). With headless Playwright at 1440×900 and 390×844, for each stop: scroll to its anchor and wait 1.5 s. Assert the card is fully visible (rect inside the viewport), the pin's centre is within 12 px of `toScreen(...)` for the landmark, and there are no console errors.
- [ ] **Step 2:** Reverse check: from the Sunset stop, scroll back to the top. Every card folds and reopens, and stop 1's hero is visible at `scrollY = 0`.
- [ ] **Step 3:** Links: from `#/projects/service-map-planner`, click each `navLinks` item (Work, Experience, About, Resume, Contact). Each lands with the matching card open. `#/#about` opens the Beach card on the About tab. Legacy `#/work` lands on Downtown.
- [ ] **Step 4:** Reduced motion (`page.emulateMedia({ reducedMotion: 'reduce' })`): the static page renders, all six cards are visible, and there is no canvas.
- [ ] **Step 5:** Performance:
  - Count image bytes requested before the hero is visible: must be ≤ 300 KB.
  - Record a 5 s scripted scroll with `performance.measure`: no long task over 50 ms.
  - Text contrast: sample the card background and text colours with `getComputedStyle`; the ratio must be ≥ 4.5.
- [ ] **Step 6:** Screenshots of each stop on desktop and phone for the PR description.
- [ ] **Step 7:** `npm test && npm run lint && npm run build`. Push and run `gh pr create --title "feat(home): six-stop dusk flight Home" --body …`, listing what changed, the checks above with results, the screenshots, and the AI-footage disclosure. Bind it with the ccd_pr tools.

---

## Self-review

- **Spec coverage:**

  | Spec item | Task |
  |---|---|
  | stops/content mapping | 4, 5 |
  | mist reveal | 6 |
  | hero visible at first paint | 3 (`open` segment), 7 (settle without delay) |
  | HUD + route bar + Résumé/Email + AI label | 7 |
  | phone layout and frames | 1, 6, 7 |
  | static page | 7 |
  | section links and nav | 4, 7, 8 |
  | single-sourced content and claims | Global Constraints, 5 |
  | loading budget | 1, 7, 8 |
  | accessibility | 5 (tabs, buttons), 6 (contrast fallback), 8 |
  | removal of scenes | 7 |
  | testing | every task, plus 8 |

  Phase-2 proof panels are out of scope, as in the spec.
- **Placeholders:** none. Task 6 Step 5 ports CSS from a named file, the prototype source in this branch, and gives the new rules verbatim.
- **Type consistency:** `StopId`, `FlightStop`, `flight`, `DrawRect`, `buildTimeline`, `anchorTop`, `STOP_SECTIONS`, `CARD_BODY`, `StopEls`, `revealTimeline` and `foldTimeline` are used with the same names and signatures in every task.
- **Review Focus:** each of the five lines has a test in its owning task (placement, stops, FrameStore/drawNearest, cards ×2) and a browser check in Task 8.
