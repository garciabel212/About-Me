# Flight Home: the six-stop dusk flight becomes the Home page

Date: 2026-10-09 · Branch: `feat/flight-home` · Status: draft for Jose's review

## Goal

Replace the current 7-scene Home with the approved scroll-driven dusk flight through Miami: six stops,
each a composed shot where a reticle locks on a landmark, a pin drops, a line draws, and a card
condenses out of mist. Scroll forward flies forward, scroll back reverses, stopping pauses.

Success means a recruiter can see who Jose is, his strongest proof, and how to reach him within
30 seconds, without waiting on the cinematic part, and a hiring manager can read every card at
each stop.

Reference implementation: `docs/prototypes/flight-v2/index.html` (published prototype). Footage:
`tools/flight/` pipeline, film `flight_v2.mp4`, 826 frames at 30 fps.

## Decisions (what Jose has approved, and what this spec assumes)

| Decision | Source |
|---|---|
| Six stops over Miami, footage as rendered: River · Brickell · Downtown · The Bay · The Beach · Sunset | approved 2026-10-07 |
| Pin + line + card at each stop, scroll-linked and reversible | approved 2026-10-07 |
| Cards reveal by **condensing mist**, not a clip-path unfold | approved 2026-10-09 |
| **Content comes from the Website Content Brief** (2026-10-08) and the content session's spec `2026-10-08-content-brief-design.md`, including its claims register | Jose, 2026-10-09 |
| Keep the site's look: Playfair Display headlines, Inter body, JetBrains Mono labels, accent #2452C6 | standing |
| "AI-rendered flight" label is always visible (LTX-2 license) | standing |
| **Proposed:** stop-to-section mapping below (it replaces the 2026-10-07 mapping, which had Service Map Planner alone at Brickell) | needs confirmation |
| **Proposed:** the content session builds the shared data layer, case-study pages, Lab, nav and SEO; this branch builds only Home; the content session's Scene01–07 rewrites are dropped | needs confirmation |

## Content at each stop (from the brief, in its homepage order)

| Stop | Brief section | Card content |
|---|---|---|
| 1 River | Hero | Jose Garcia · role line "Customer Solutions \| Implementation \| Technical Consulting" · heading "Helping customers understand, implement, and use technology." · intro paragraph · details line (South Florida \| English and Spanish \| Open to remote and South Florida \| up to 40% travel) · **View My Work** + **Download Resume** · evidence strip (Customer delivery since 2022 · Previous network operations experience · Fluent in English and Spanish) |
| 2 Brickell | What I help customers do | The five capabilities as compact rows (title + one line), each linking to its experience example or case study |
| 3 Downtown | Selected work | Service Map Planner (lead), AAC communication app, Miniature Garage Configurator: one line each, status label, thumbnail (labelled "concept" until real screenshots exist), **Read case study** links; small "More in the Lab" link |
| 4 The Bay | Experience | Service Engineer · DLSG / Image Access · Oct 2022–present: paragraph + five responsibility bullets (three shown, "Show all") · NOC Engineer · Globenet · Nov 2021–Sep 2022: paragraph |
| 5 The Beach | Working approach · tools and education · short bio | Tabs inside the card: **How I work** (five steps) · **Tools & education** (professional vs project columns; B.S. CS&E FAU; certificate only with issuer and date; English and Spanish) · **About** (short bio) |
| 6 Sunset | Resume downloads · contact | "Let us talk about your team" + contact paragraph · email (copy button) · LinkedIn · **Download Resume** (master) · three role PDFs ("Download PDF", last-updated date) |

Every number, status and claim follows the claims register in the content spec. In particular: no
"100+ accounts" as a project result, Service Map Planner is "map-based visit planning" (MapLibre/OSM +
OSRM; not "routing optimization", not the Google Maps API), AAC has no offline/AA claims, Garage is 1:18
with no STL export claim, location is "South Florida", and Agent Trading OS lives in the Lab, not on Home.

## What the visitor experiences

1. **Load:** the River stop frame paints immediately (preloaded poster) **with the hero card already
   visible**: name, focus and the résumé link never wait for animation (brief: "keep essential text
   visible without waiting for an introduction animation"). The camera then makes a gentle 3 s settle
   behind the card. There is no fly-in that delays the text.
2. **Scroll:** the card evaporates, the camera flies to the next stop with the speed-ramped footage, and
   the next card condenses. About 4 viewport heights of scroll per hop, about 42 in total.
3. **HUD:** top bar with the brand, the six-stop route (click to jump), and an always-visible
   **Résumé** button. Bottom: "AI-rendered flight · not real footage".
4. **Phones (< 768 px):** the same flight from a lighter 720-px frame set; cards are bottom sheets; the
   crop slides to keep each landmark in view; the mist is simplified (no backdrop blur).
5. **Reduced motion or Save-Data:** no flight. Six still sections (stop frame plus card in place), a
   normal readable page.

## The condensing mist reveal

Per stop, scroll-linked and fully reversible (scrolling back re-condenses the card into mist):

1. **Gather (0–30%):** 8–10 soft mist puffs (radial-gradient blobs, blurred) drift from the landmark
   toward the card area and thicken. Reticle lock and pin drop run alongside, as in the prototype.
2. **Condense (30–70%):** the card fades up as frosted "cloud glass": paper at about 88% opacity,
   `backdrop-filter: blur(18px)`, edges feathered with a soft mask. The puffs shrink into its edges.
3. **Text (60–100%):** label, headline and body fade in crisp, staggered. Text sits on near-opaque
   paper, so contrast stays at or above 4.5:1 regardless of the frame behind it.
4. **Leave:** the reverse of the reveal: text out, the card thins to mist, puffs drift off toward the
   direction of travel.

Phones: no backdrop blur (cost), opaque paper, 3 puffs. Reduced motion: no mist, the card is simply there.

## Architecture

```
src/flight/                      (new on main; tested pieces carried over from feat/miami-flight)
  FrameStore.ts      + test      coarse-to-fine loader, nearest-to-playhead first      (carried over)
  coverRect.ts       + test      cover-crop maths with a focal point                    (carried over)
  useFlightMode.ts               desktop | mobile | static                              (carried over)
  resumeScroll.ts    + test      return to the same place after visiting a project page (carried over)
  flightData.ts                  GENERATED by tools/flight/export_web.py: frame count, stride,
                                 stop frames, landmark x/y, place names, coordinates
  timeline.ts        + test      pure function: stops + frames -> scroll units for hops, holds,
                                 reveal/fold segments, and each stop's reading position
  FlightHome.tsx                 canvas + one GSAP ScrollTrigger timeline (scrub) on the shared Lenis
  StopMarks.tsx                  reticle, lock label, pin, leader line for one stop
  MistCard.tsx                   card shell + mist puffs; exposes reveal/fold tweens for the timeline
  StaticFlight.tsx               reduced-motion / Save-Data page
  stops/                         six card bodies: HeroCard, CapabilitiesCard, WorkCard,
                                 ExperienceCard, ApproachCard (tabs), ContactCard
public/flight/desktop/fNNN.webp  413 frames, 1280 px, about 12 MB in total, loaded progressively
public/flight/mobile/fNNN.webp   413 frames, 720 px, about 4 MB
```

- **Content stays single-sourced.** Cards contain no prose of their own. They render from the content
  session's data layer (`src/data/content.ts` plus `profile.ts`, `experience.ts` and `projects.ts`,
  delivered in its PR 2), so the flight can't contradict the résumé, the case-study pages or the claims
  register. **Dependency:** this branch starts after that PR merges. If it slips, the cards read from the
  current `src/data` files with the claims register applied, and switch over afterwards.
- **Section links keep working.** Each stop renders an invisible anchor at its reading position with a
  stable id: `intro` (River), `capabilities` (Brickell), `work` (Downtown), `experience` (Bay), `about`
  (Beach), `resume` and `contact` (Sunset). The brief's nav (Work, Experience, About, Resume, Contact)
  and `homeSectionLinks` point at these. The navigation test reads the stop ids from the stops module
  instead of scanning `scenes/`.
- **Routing:** `/` renders `FlightHome`. Other routes are unchanged; case-study pages, `/lab` and
  redirects come from the content session. `EditorialNav` becomes the HUD's route bar plus
  Résumé and Email buttons.
- **Removed:** `Scene01`–`Scene07`, `JourneyBackground`/`JourneyNav`/`journeyConfig`, and any assets
  only they use. They stay in git history.

## Loading and performance budget

- First paint: the stop-1 frame as a preloaded `<link rel="preload" as="image">` poster.
  No more than 300 KB of images before the intro can start.
- Stop frames load first, then every 8th, 4th, 2nd and all (FrameStore). Scrubbing always draws the
  nearest loaded frame, never a blank.
- Canvas draws only when the frame index or size changes. Device pixel ratio is capped at 2.
- Target: Home is interactive in under 2.5 s on a mid-range laptop over cable. No long tasks over
  50 ms while scrubbing.

## Accessibility

- Cards are real DOM in reading order (headings, lists, links), not drawn on the canvas. Screen readers
  read all six stops.
- The route bar consists of buttons with `aria-current` on the active stop. Focus is visible everywhere.
- Text on cards meets 4.5:1. HUD text sits on a gradient scrim.
- Reduced motion gets the static page. Nothing auto-plays except the 3 s intro, which is skipped
  under reduced motion.

## Testing

- Unit (Vitest): `timeline.ts` (unit maths, monotonic, each stop's reading position inside its hold),
  the carried-over FrameStore, coverRect and resumeScroll tests, and the navigation test (every Home
  link points at a stop id).
- Browser checks (headless, as for PRs #1 and #2):
  - Each stop at 1440×900 and 390×844: card fully visible, pin on its landmark.
  - Scroll back reverses.
  - Route-bar jumps land on each stop.
  - Nav links from project pages land on the right stop.
  - Reduced motion renders the static page.
  - No console errors.
- Performance check: bytes before the intro starts, and frame time while scrubbing.

## Out of scope (phase 2)

- Proof panels behind each card: screenshots, short clips, architecture sketches. These need the
  Map Planner demo mode, plus decisions on the private repos and on the Brickell card numbers.
- The 4K/HDR re-render, and SeedVR2 upscaling of the footage.

## Risks

- **Weight:** 12 MB of frames on desktop. Mitigated by progressive loading and a lighter phone set.
  A video-based fallback is possible if field data shows slow loads.
- **Backdrop blur cost** on older laptops. MistCard falls back to opaque paper when
  `backdrop-filter` is unsupported or a frame-time probe exceeds budget.
- **AI-footage disclosure:** must never be removed. The label is part of `FlightHome` itself, not the
  footer.
