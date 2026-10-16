# Survey landing: the flight as a marked-up site survey

Date: 2026-10-12. Status: approved in conversation, awaiting written-spec review.
Branch: `feat/survey-landing` (worktree `Documents/Code/About-Me-survey`), off main `516107a`.
Product truth: [PRODUCT.md](../../../PRODUCT.md). Direction chosen through impeccable (seed `756d875b`, assigned direction "Site Survey Redlines").

## Goal

Replace the Home landing with an immersive page where the Miami dusk flight is the full-screen background the whole time and the text adapts to it. The page reads as a field engineer's site survey: each of the six flight stops is a site visit, and Jose's work is marked up on the live footage in redline ink. It must be memorable (not a regular portfolio) and still let a recruiter find role, projects, and contact within seconds.

Out of scope for this spec: the separate Read page with the original reactive background (next task), multi-page structure, new footage, the HD frame set (evaluated before ship, see Assets).

## What the user decided

- Landing = short cinematic opening that lands on the showcase (option C), with the film as the background of the whole page and the text adjusting to it. No cards. Not generic.
- Audience: recruiters first (Customer Solutions / Implementation / Solutions Engineer roles), technical peers and clients second.
- Takeaway, equally weighted: he turns technical things into experiences, and he makes complex systems clear.
- World: Site Survey Redlines (chosen over Main Title Sequence and Ocean Drive Premiere).
- Use the existing flight film (413 frames, `public/flight/`).

## The world

- **Ground:** the flight film, full-bleed, always. No panels, cards, or framed windows. Readability comes from a soft dark falloff only where text sits.
- **Redline ink:** one red ink draws markup directly on the footage: a ring or revision cloud around a landmark, a leader line to a short note, check marks, an arrow toward the next site. Every mark points at something real; nothing is decoration.
- **Title block:** a fixed block bottom-left, modeled on an engineering drawing's title block. Fields never move; only values change per site:
  - **Site:** current site name; also the site navigation (all six sites, jumpable).
  - **Job:** what this site shows.
  - **Status:** e.g. "Working prototype", "Current role".
  - **Contact:** **Email me** (the only control in red ink) and **Résumé**.
  - The AI disclosure line ("AI-rendered imagery, not real footage") lives in the block, as part of the drawing.
- **Type, three roles:** a strong sans display for names and titles; a technical lettering face for markup notes; a plain sans for anything longer than one line. Not Newsreader or any face on impeccable's reflex list. Final faces are chosen at build and recorded in DESIGN.md.
- **Color:** dusk film as ground; redline red for ink and the primary action; field white for text; one cool grey for secondary text. Exact values are set at build against contrast on the real frames.
- **Copy:** short, true lines from the résumé and `content.ts`. Plain language, no hype, no invented numbers, no em dashes.

## The six sites

Stop frames come from `src/flight/flightData.ts`; landmark points (`x`, `y`) are the existing pins.

| Stop (frame) | Site | Markup and text |
|---|---|---|
| River (40) | You | Name large in the title block. One line: "I help customers understand technical solutions, get systems running, and use them confidently." A red ring on the Brickell towers ahead: "next site: Service Map Planner". Email me + Résumé. |
| Brickell (114) | Featured job | Service Map Planner. Callout ring on the tower, leader to the title and a one-line outcome. Tapping the note flips it to "how it was built" (method notes) with a link to the case study. |
| Downtown (189) | Three jobs | AAC communication app, Miniature Garage Configurator, Agent Trading OS (Lab). Each a callout pinned to its own building in the street canyon; each flips to method + link. Needs two new landmark points measured on frame 189. |
| Bay (264) | Method | How I work as a punch list drawn along the waterline: Understand, Explain, Configure, Train, Follow up, each checked off in ink. |
| Beach (338) | Crew log | Experience as a sign-in sheet: Image Access (Service Engineer, 2022 to present), Globenet (NOC Engineer, 2021 to 2022), FAU (B.S. Computer Science & Engineering; Data Science & Analytics certificate), English and Spanish. |
| Sunset Harbour (412) | Handover | "Signed off: Jose Garcia" with email, LinkedIn, GitHub, résumé. |

## Signature interaction and motion

1. Scrolling scrubs the film (existing behavior). Between stops the screen belongs to the film: ink is lifted, only the title block stays.
2. When the camera settles on a stop, that site's ink draws in one continuous stroke (ring, then leader, then note), and the film rack-focuses softly behind it (small blur and dim on the film layer only).
3. Leaving the stop, the ink lifts away whole (fades out together, never stroke by stroke in reverse) and the film sharpens.
4. Before the camera turns toward the next site, that site's landmark pulses once in red in the distance.
5. Title block values change with a single instant swap per field (fixed slots, no sliding).

Motion is scroll-linked and reversible. Ink positions are static per stop because ink only exists while the camera is settled, so no per-frame tracking is needed.

## Phones, reduced motion, accessibility

- **Phones (< 768px):** film fills the portrait screen using the existing phone crop (`phoneX`). The title block becomes a slim ruled strip at the bottom (site name + Email me; tap to open the site list). One job per screen; ink scales with the crop. Downtown's three jobs become three consecutive holds.
- **Reduced motion or data saver** (existing `motion` logic): no scrub. Each site shows its stop frame as a still; ink appears with a short fade instead of drawing; scrolling moves site to site.
- **Accessibility:** every word is real DOM text in reading order inside one `<section>` per site with a heading. The ink layer is `aria-hidden` SVG. The site list is a real `<nav>`. Visible focus, AA contrast on the darkest and brightest frames, and a pause control for the film.

## Architecture

Builds on main's existing flight modules.

**Reused:**
- `FrameStore.ts` (coarse-to-fine frame loading, nearest the playhead first, phones skip every other frame).
- `crop.ts` (`coverDraw`, `toScreen`): maps a landmark point in film space to screen space for any viewport. This is what keeps ink on its landmark.
- `flightData.ts` (stops, frames, pins), `disclosure.ts`, `poster.ts`.
- `FlightBackdrop.tsx` as the starting point for the fixed full-bleed canvas (its windowed split-screen path is removed from the landing).

**New (each one job, testable on its own):**
- `src/survey/sites.ts`: the six sites as data (stop id, title block values, markup items with landmark points and note text), built from `content.ts` so copy is not duplicated.
- `src/survey/geometry.ts`: pure functions. Landmark to screen via `toScreen`; ring, leader, and check paths for a note; layout that keeps notes inside the safe text zone.
- `src/survey/progress.ts`: pure mapping from scroll progress to `{ stop, phase: 'transit' | 'settling' | 'settled' | 'leaving', t }`.
- `src/survey/RedlineLayer.tsx`: SVG overlay that draws a site's ink from geometry and phase (stroke-dashoffset draw, whole-layer lift, pulse).
- `src/survey/TitleBlock.tsx`: fixed fields, site nav, contact, disclosure.
- `src/survey/SurveyLanding.tsx`: composes film, ink, title block, and the per-site sections; GSAP ScrollTrigger drives progress (no `window` scroll listeners).
- `src/pages/Home.tsx`: renders `SurveyLanding` in Cinematic mode. Read mode stays as it is today until the Read page task replaces it.

**Removed from the landing:** split-screen evidence window, paper panels, framed film window, HUD coordinates and route dots.

## Assets

- Film: `public/flight/desktop` (413 frames, 1280x704, ~13 MB) and `public/flight/phone`. Unchanged.
- HD frame set: local commit `760e7c3` on `feat/flight-hd` (not pushed). Before ship, compare full-screen at 1440 and 1920; swap in only if clearly sharper and the weight is acceptable. File swap, no code change.
- Downtown needs two extra landmark points measured on frame 189 (added to the site data, not to the generated `flightData.ts`).

## Errors and edge cases

- Frames not loaded yet: show the poster frame; ink waits for the stop frame to be drawn.
- Canvas or decode failure: fall back to stop stills as `<img>`; text and title block are unaffected.
- Very wide or very short viewports: notes clamp into the safe zone; if a note cannot fit, it moves to the text column beside the title block instead of overlapping the landmark.
- Deep links (`/#projects`, `/#contact`) land on the matching site.

## Testing

- **Unit (vitest):** `geometry.ts` (landmark mapping at desktop and phone sizes, paths stay in bounds, safe-zone clamping), `progress.ts` (phase boundaries, reversibility), `sites.ts` (every site has title block values, every markup item has a valid landmark, copy comes from `content.ts`).
- **Visual:** headless Chrome screenshots of every settled site at 1440x900 and 390x844, plus reduced motion, saved to `.impeccable/review/`.
- **Impeccable:** `impeccable detect` on changed files, then the finish reviewer against the direction contract, then the documenter writes DESIGN.md.
- **Gates:** `npm run lint`, `npm test`, `npm run build` green before the PR.

## Open questions

- HD frame set: decided at the pre-ship comparison.
- Exact fonts and color values: decided at build, recorded in DESIGN.md.
