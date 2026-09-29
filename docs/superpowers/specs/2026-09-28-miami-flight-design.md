# Miami Flight — Design Spec

**Date:** 2026-09-28
**Status:** Approved in conversation; awaiting written-spec review
**Branch:** `feat/miami-flight`

## 1. Intent

The Home page becomes a cinematic, scroll-driven drone flight through Miami. As
visitors scroll, the camera travels along the Miami River, past the Brickell and
Downtown towers, across Biscayne Bay, and settles at the beach. Portfolio content
appears at planned points along the route, connecting Jose's professional story
with the identity and atmosphere of South Florida.

**Behavioral requirements (from the brief):**

- Scrolling forward advances the flight; scrolling backward reverses it exactly.
- Stopping scrolling pauses the flight so visitors can read. No scroll-snapping.
- Motion is continuous and smooth, with gentle turns and elevation changes.
- The route is cinematically compressed so the journey fits the page comfortably.

**Milestone 1 (this spec's build scope):** the river transit with the introduction,
followed by the Brickell stop with Service Map Planner. It exists to judge realism,
scroll feel, and readability before extending the flight to the beach.

## 2. Decisions

| Decision | Choice | Why |
|---|---|---|
| Footage source | Google Earth Studio render | One continuous camera path over real Miami geometry, consistent light, exports an image sequence directly. Free with attribution. |
| Placement | Replaces the Home page (`/`) | The flight *is* the landing story; case-study routes stay as deep links. |
| Light | Late golden hour, sun behind-right of camera flying east | Warm towers, deep-blue bay, long shadows that hide Earth Studio's low-altitude softness. |
| Scroll → footage | WebP image sequence drawn to `<canvas>`, driven by GSAP ScrollTrigger | Frame-exact in both directions on every browser. Video `currentTime` scrubbing stutters on Safari/iOS, worst in reverse. Live 3D tiles need an exposed API key and stream in blurry. |

**Rejected:** licensed stock clips (inconsistent light/heading between clips),
own drone footage (downtown sits under MIA Class B airspace), video scrubbing,
live Photorealistic 3D Tiles, a stylized three.js city (not realistic).

## 3. Choreography

The flight alternates **transit** segments (camera moving, light or no text,
dense frames) and **stops** (camera slows to a hovering drift while a large panel
is shown; long scroll distance, sparse frames). Stops give reading room without
freezing the camera.

| # | Where | Type | Content (existing copy, relocated) | Treatment |
|---|---|---|---|---|
| 1 | Miami River | transit, low and rising | Headline "I turn complex technology into solutions people can use.", portrait, value line, Explore Work / Contact CTAs | Soft light gradient on the text side. CTAs live from first paint. |
| 2 | Brickell towers | stop | Service Map Planner: large screenshot, operational problem / contribution / value | Camera settles into skyline view. Split layout, image-dominant. |
| 3 | Downtown | transit → stop | Scale Garage Studio: configurator imagery; requirements → configurable product | Most image space of any beat; copy ≤ ~3 lines. Small "All work →" link (reaches Enterprise Deployment via `/projects`). |
| 4 | Biscayne Bay | long stop | DISCOVER → DESIGN → DEMONSTRATE → DEPLOY → ADOPT, then compact timeline: DLSG/Image Access · GlobeNet · FAU | Stages advance with scroll within the stop; skyline recedes behind. |
| 5 | Approaching the coast | slow transit | "Engineer at heart, communicator by practice.", philosophy, human side | Calmer: no glass cards, type on open sky/water, more whitespace. |
| 6 | Beach | final stop | Email · LinkedIn · Résumé | Stable coastal view; last frame holds; page ends. |

Content sources (all existing): `src/components/hero/Hero.tsx`,
`src/components/home/FeaturedWorkSection.tsx`, `src/components/home/MethodologySection.tsx`,
`src/data/experience.ts`, `src/components/home/AboutSection.tsx`,
`src/components/home/HomeContactCta.tsx`.

After all milestones, nav anchors re-point to stages: WORK → 2, EXPERIENCE → 4,
ABOUT → 5, CONTACT → 6.

## 4. Asset pipeline

### 4.1 Camera path (Claude authors, user renders)

Claude writes `flight/miami-m1.esp` (Earth Studio project). The `.esp` format is
undocumented JSON; it is generated from the structure used by community tools
(e.g. `mkatzef/google-studio-utils`). **Fallback:** `flight/miami-m1-keyframes.md`,
a table of time / lat / lon / altitude / heading / tilt the user can enter by hand
in Earth Studio if the import fails.

M1 path:

- **River transit (~6 s):** start over the Miami River near the SW 2nd Ave bridge
  at ~100–120 m, looking east downriver. Follow the river's bends east; altitude
  eases to ~250 m and tilt lifts so the skyline rises into frame.
- **Brickell stop (~3 s):** near the river mouth at Brickell Point, bank gently
  right; the camera slows to a slight drift with Brickell Avenue towers on the left.
  This is the hand-off point for milestone 2.
- **Motion rules:** eased keyframes only; heading change < ~15°/s; sun fixed at
  late golden hour.
- Coordinates are approximate until checked in Earth Studio's preview.

### 4.2 Render settings

- 2560×1440, 24 fps, JPEG or PNG sequence (~216 frames for ~9 s).
- **Attribution:** Earth Studio burns "Google Earth" plus data-provider credits into
  every frame; it cannot be removed. Place it **bottom-center** in Render Settings
  so it survives both the mobile center crop and the canvas's bottom-anchored cover
  crop (§5.3). If bottom-center is not offered, do a second 1080×1920 portrait
  render of the same path for mobile, with the attribution in a corner that crop
  keeps.

### 4.3 Processing

`scripts/build-frames.mjs` (dev dependency: `sharp`), run as `npm run frames`:

- Input: raw export folder (git-ignored, e.g. `flight/raw/m1/`).
- Output: `public/flight/m1/desktop/0001.webp…` (1920 wide) and
  `public/flight/m1/mobile/0001.webp…` (720×1280 center 9:16 crop, or downscaled
  portrait render), WebP ~q70, tuned to meet §7 budgets.
- Stop segments are decimated (keep every 3rd frame); the transit keeps every frame.
- Emits a tiny blurred poster of frame 1 (inlined as a data URI, < 2 KB) and a
  still frame for reduced-motion mode (the skyline reveal).
- `--placeholder N` generates a synthetic sequence (numbered gradient frames with a
  moving horizon line) so all code can be built and tested before the real render.

Only optimized WebP output is committed; raw exports are in `.gitignore`.

## 5. Runtime architecture

### 5.1 Units

| Unit | Purpose | Depends on |
|---|---|---|
| `src/flight/manifest.ts` | Data only: per-size frame URL builder, frame counts, ordered segment list `{ id, kind: 'transit' \| 'stop', frames: [start, end], scrollVh }`. Later milestones extend the flight by appending segments. | — |
| `src/flight/scrollMap.ts` | Pure function: overall scroll progress (0–1) → fractional frame index, piecewise across segments by `scrollVh` weight. | manifest types |
| `src/flight/FrameStore.ts` | Plain TS class. Tiered loading (stride 8 → 4 → 2 → 1), each tier ordered by distance from the playhead. Keeps ~±30 decoded frames around the playhead; LRU-evicts others. `nearest(i)` returns the closest ready frame. | `Image`, `decode()` |
| `src/flight/FlightCanvas.tsx` | DPR-aware canvas, bottom-anchored cover-fit. Cross-fades frame ⌊f⌋ → ⌊f⌋+1 by the fractional part. Redraws only when progress changes. `aria-hidden`. | FrameStore |
| `src/flight/FlightJourney.tsx` | The pinned section: one ScrollTrigger (`pin`, `scrub: true`), a GSAP timeline with labels at segment boundaries, `gsap.matchMedia` for desktop / mobile / reduced-motion. Hosts panels. | GSAP, manifest, scrollMap |
| `src/flight/StagePanel.tsx` | One content block that fades and drifts in/out over a progress range. Real DOM text in reading order. | — |

### 5.2 Scroll feel

- Lenis already smooths scrolling, so ScrollTrigger uses `scrub: true` (no extra
  lag). Stacking both makes the camera feel late and rubbery.
- **Targeted fix:** the Lenis → `ScrollTrigger.update` sync currently lives only in
  `src/components/projects/HeroReveal.tsx`. Move it into
  `src/components/motion/SmoothScroll.tsx` once so every trigger on the site stays
  in sync, and remove the local copy.

### 5.3 Rendering details

- Bottom-anchored cover-fit: wide viewports crop sky from the top, never the
  attribution strip at the bottom.
- Canvas backing store capped at DPR 2.
- The rAF draw loop idles when progress is unchanged (zero work while paused) and
  stops when the section is off-screen.

### 5.4 Load and failure states

- The inlined blurred poster paints immediately; intro text does not wait on frames.
- Once frame 1 is decoded, `nearest()` never returns empty, so scrubbing never
  shows a blank canvas.
- If frames fail to load, the canvas stays on the poster (or the last good frame);
  all content remains readable. The flight is decoration; text never depends on it.

### 5.5 Page integration (M1)

- `src/pages/Home.tsx`: `<Hero />` → `<FlightJourney />`.
- `src/components/home/FeaturedWorkSection.tsx`: remove the Service Map Planner
  panel (now in beat 2); keep `id="work"` on the section.
- The global `Atmosphere` / `ContourField` background is skipped on `/` while the
  flight is on screen (it would render invisibly under an opaque canvas).

## 6. Modes

- **Mobile (< 768 px):** mobile frame set; pin ~250vh total vs ~400vh desktop;
  panels stack as a bottom-anchored sheet so the skyline stays visible above them.
- **Save-Data** (`navigator.connection.saveData`): reduced-motion mode.
- **Reduced motion:** no pin, no scrub; the still skyline frame sits behind the
  hero; all content in normal document flow. (Lenis already disables itself.)
- **Keyboard / screen readers:** canvas `aria-hidden`; panels in DOM reading
  order; focusing an element inside a not-yet-visible beat scrolls the flight to
  that beat; a "Skip flight" link to `#work` is the first focusable element.

## 7. Milestone 1 scope, testing, acceptance

**In scope:** §4 pipeline (`.esp` + fallback table, `build-frames.mjs` with
placeholder mode), §5 units, beats 1–2 replacing `<Hero />`, the §5.5 page
integration, the §5.2 Lenis sync move, the §6 modes.

**Out of scope:** beats 3–6, nav anchor re-pointing, retiring the remaining Home
sections (Work, Methodology, Timeline, About, Contact stay below the flight).

**Unit tests (Vitest, new dev dependency, test-first):**

- `scrollMap`: segment boundaries, stop segments map long scroll to few frames,
  clamping at 0 and 1, monotonic in both directions.
- `FrameStore`: tier order (8 → 4 → 2 → 1) biased toward the playhead; decode
  window size and LRU eviction; `nearest()` never empty once frame 1 is ready.

**In-browser verification (preview pane):**

- Fast and slow scrubbing forward and back; pausing.
- Clean console.
- 375 px mobile viewport; emulated reduced motion.
- Throttled network: watch the tiers fill in.
- Performance trace while scrubbing.

**Gates:** `npm run build` and `npm run lint` pass.

**Acceptance bar:**

1. No blank or flashing frames at any scroll speed, in either direction.
2. No long tasks > 50 ms while scrubbing on desktop.
3. Intro readable on first paint; flight coarsely scrubbable after ≤ 3 MB loaded.
4. Full M1 payload ≤ ~25 MB desktop, ≤ ~8 MB mobile.
5. WCAG AA (4.5:1) contrast on the worst frame of each beat.
6. The Earth Studio attribution is visible at 375 px, 1440 px, and 21:9 widths.

**Delivery:** branch `feat/miami-flight` → PR. Reviewed in local preview with the
user's real render; **not merged (not live on Pages) until the user approves the
feel.**

## 8. Risks

| Risk | Mitigation |
|---|---|
| `.esp` import fails (undocumented format) | Hand-entry keyframe table fallback (§4.1). |
| Earth Studio looks melted at low altitude | Start at ~100–120 m, not water level; golden-hour shadows; judge in M1. |
| Payload grows too large for the full journey (6 beats) | Stop decimation; per-segment lazy loading (load current + next segment only) added in M2 if M1 numbers demand it. |
| Decoded-frame memory on phones | ±30 decode window, LRU eviction, DPR cap 2. |
| Attribution cropped | Bottom-center placement + bottom-anchored crop; portrait render fallback (§4.2). |
