# Stop scenes: detailed points that fit the film

Date: 2026-10-19. Owner: Jose Garcia. Status: for the owner's approval.

This changes how the information is laid out on the Cinematic landing (`src/landing/`). The film, the light path and the six stops stay. The Read page is a separate, later project.

## Why

The v3 film is live. Each of its six stops was composed with an open patch of sky or water for the text (`tools/flight/zones.py`). But on a 1440×900 screen, each stop still reads like a document laid over a film:

- **A lot of small text at once.** Experience and Expertise fill half the screen with 13–15px type, over the towers the film was framed around.
- **Points are taller than the screen.** On Projects you scroll through text while the film sits still, and screenshots cover the bay and the beach.
- **Every stop looks the same:** label, headline, paragraphs.

The owner wants the information to stay **detailed** (their words, 2026-10-14) and **larger, so it's easy to read** (2026-10-19). Recruiters come first. The fix is how the detail is staged, not how much of it there is.

## Decided by the owner

- **Each stop is a scene made of parts** (2026-10-18). When the reader reaches a stop, the film settles, and each scroll moves to the next part in the same open patch of the frame. No part covers the landmark. All the detail stays on the Cinematic page.
- **Larger text** (2026-10-19). Body text is about 19px on a 1440-wide screen, up from 13–15px. Headings scale up with it.
- **Arrival = light wipe** (option C, 2026-10-19). When the light reaches a stop, its bright head runs down beside the text and reveals it at its own height, so the light writes the information.
- **Between parts = credits roll** (option D, 2026-10-19). The current part rolls up and out the top while the next rolls up from below, in one continuous move.
- **Kept from earlier decisions:** the film is the full-screen background, and the text adapts to it. No cards. Nothing is drawn on the footage except the light path. Bodoni Moda headlines with Archivo body text. The "01 / EXPERIENCE" numbered labels. The zig-zag placement per stop. One light-blue accent (`#4aa8ff`). The AI disclosure stays always visible.

The mockups and live motion demos the owner reacted to are in `.superpowers/brainstorm/1684-1792298349/content/` (local, not committed): `stops-as-scenes-v3.html`, `part-transitions.html` (A–C) and `part-transitions-2.html` (D–G). They use real v3 frames.

## Goals

1. At every stop, at every supported size, the text sits inside that stop's text zone and never covers the landmark.
2. Every part fits on one screen. Nothing is clipped, and nothing needs scrolling inside a part.
3. Body text is easy to read: 17px minimum and about 19px at 1440, with lines of no more than about 62 characters.
4. The page still feels like one continuous flight: the camera never looks frozen, and the light visibly leads from stop to stop.
5. Recruiters can still find any fact quickly. Nav links and deep links land on the right part.

## Non-goals

- The Read page (a separate project; it keeps its own content and design).
- New footage or new mattes.
- Rewriting copy. Content comes from `src/data/content.ts` and `caseStudies.ts` as today. Splitting it into parts is fine; new claims are not.
- Changing the header, nav labels, URLs or the footer.

## Anti-goals (a failure even if it technically works)

- **Scroll-jacking.** No forced snapping, no wheel capture, and no trapping the reader inside a stop. Scrolling stays free and smooth with Lenis. Parts change as the scroll position crosses thresholds, and scrolling back reverses them.
- **Animations that stall halfway.** Transitions are *triggered* when a threshold is crossed, not dragged with the scrollbar.
- **Text over a tower,** or a screenshot over a landmark.
- **Cards or panels** behind the text beyond today's feathered backing.
- **Hiding content** from screen readers, keyboard users or no-JS readers.

## The experience, stop by stop

Each point keeps its stop, placement and headline from `points.ts`. A point becomes a **scene**: its label and headline stay put while its **parts** take turns below them.

| Stop | Point | Placement | Parts |
|---|---|---|---|
| River | Intro | top-right | 1. Name, role, statement, Email me and Résumé, and the four quick facts (as today). |
| Brickell | 01 Experience | left | 1. DLSG / Image Access: title, dates and place, summary, and its three contributions. 2. DLSG full responsibilities: the six résumé lines (`role.details`). 3. Globenet: title, dates and place, summary, and its three contributions. |
| Downtown | 02 Expertise | center | 1–5. The five steps (Understand, Explain, Configure, Train, Follow up) as one list. Each scroll moves the light down one step: that step lights up and shows its detail, and the others dim. A step's detail is all of its examples, its work proofs and its project proofs, each with its source link. These five parts don't roll; the list itself is the picture. 6. Tools: the tool groups. The list rolls out and Tools rolls in. |
| Bay | 03 Selected work | right | 1. Service Map Planner: the project. 2. Service Map Planner: the problem and my part, with the workflow steps as text, since it has no screenshot. 3. AAC communication app: the project, with its screenshot. 4. AAC: the problem and my part. |
| Beach | 04 More work | left | 1. Miniature Garage Configurator: the project, with its screenshot. 2. Garage: the problem and my part. 3. Agent Trading OS: the project. 4. Agent Trading OS: the problem and my part. |
| Sunset Harbour | 05 Let's connect | bottom-left | 1. Portrait, first bio paragraph, the pitch, and all contact routes. 2. About: the rest of the bio, the details list, education and languages. Contact routes stay reachable here too, as a short line of links at the end of the part. |

**A project part** shows the project name, its focus line, the screenshot (if it has one), the one-line outcome, the status line and the case-study link, as `WorkBlock` does today. **The project's next part** ("The problem and my part") repeats the project name small, then shows `problem` and `contribution`.

**Nothing is hidden behind "More" anymore** (the owner's call, 2026-10-19). Everything that used to sit behind "More" now has its own part, so the `point-more` disclosure leaves the landing. The page gets about six screens longer.

**My calls (the owner can check these):**
- **When arrival happens.** A stop arrives when its scene becomes held. The light's head reaches the top of the rail, which is the stop's entry node, at that same moment, so the wipe and the hold start together.
- **Contact links in the last part.** The About part ends with a short line of contact links, so the page doesn't end on a part with no way to reach Jose.
- **River plays the wipe on page load.** There's no 150ms delay, so the name is fully shown about a second after load. This is the light's first act. Screen readers and no-JS readers get the text immediately.
- **The Expertise marker.** At Downtown, the light's head on the rail is what marks the active step; the five steps are the stop's marks.

### Arrival (option C, light wipe)

Arrival happens when the light's head reaches the stop's entry node, which is when the scene becomes held. That moment is detected today by `reached()` in `lightCurve.ts`, which sets `data-arrived`.

- The text block (label, headline and part 1) is revealed top to bottom by a soft-edged wipe. Its edge travels with the light's bright head as the head runs down the rail beside the text.
- Demo values to start from: a mask with a soft edge about 10% tall, 1000ms, `cubic-bezier(.45, 0, .25, 1)`, after a 150ms delay. The head dot is about 18px with a blue glow and moves in sync.
- It plays once per stop, like today's arrival, which is one-way. Scrolling back up past a stop does not re-hide it.
- It replaces today's text entrances on the landing: the stagger, the headline rise and the screenshot settle. The "More" open animation goes, along with "More".

### Between parts (option D, credits roll)

- Crossing a part's threshold rolls the current part up and out the top while the next rolls up from below, in one move.
- Demo values: `translateY(±105%)`, 1100ms, `cubic-bezier(.65, 0, .35, 1)` (moving on screen, so ease-in-out). The part fades toward 0.2 opacity at both ends. The part area gets a soft mask fade at its top and bottom edges.
- Scrolling back rolls the other way (down).
- A fast scroll across several thresholds must retarget smoothly, never queue a backlog. Use transitions, not keyframes.

### The light inside a stop

- While a stop's parts are on screen, the light runs as a short vertical **rail** beside the text, on the side facing the open frame. Small **marks**, one per part, fill as the reader moves through them, so they can see how much of the stop is left.
- After the last part, the light leaves through the stop's exit node and flies to the next stop in the gap. That flight is today's S-curve, still passing behind buildings via the front matte layer.
- The light must stay attached to the text while the scene is held. There is no drift between the rail and the text at any scroll position.

### The camera while reading

- While a stop is held, the camera slowly pushes in: about 1.00 → 1.05 scale across the stop's full held scroll, linked to the scroll so it reverses.
- The film canvas and the front (matte) canvas scale together, so buildings in front stay registered. This combines with the existing camera sway, which also sets `scale` on these elements.

## Type

Starting scale, measured at 1440×900. Values at other sizes come from `clamp()` and are the builder's to tune within the limits.

| Role | Today | New |
|---|---|---|
| Body (`.point p`, contributions) | 15px | ~19px; min 17px; max ~21px |
| Lead / statement | 17px | ~21px |
| Headline (Bodoni) | 32–46px | ~52px; min 36px |
| Part title: org or project name (Bodoni) | 23px | ~30px |
| Meta (title, dates, status) | 14–15px | ~15px; min 14px |
| Label (01 / EXPERIENCE) | 12px | 12px (unchanged) |

The text block keeps its 560px maximum width, which gives about 60 characters per line at 19px.

## Fit rule

Every part, plus its scene's label and headline, fits inside the space between the header and the bottom disclosure at these sizes: 1920×1080, 1440×900, 1280×600 and 390×844. When a part doesn't fit at a size, it **splits into two parts at that size**. The split is declared in the content data, so phones and short screens may have more parts than desktop. Text never shrinks below the minimums above to make something fit. A headless probe checks every part at every size (see Verification).

## Phones (under 768px)

- Same scenes and same motion. The text area is full width, as today. Parts are likely to split more often: for example, DLSG's summary as one part and its contributions as the next.
- The rail and marks sit at the left gutter.
- Screenshots go full width in their part, and the part splits if the image doesn't fit.

## Reduced motion and motion off

- **`prefers-reduced-motion: reduce`:** no wipe, no roll, no push-in. Parts swap with a 200ms opacity fade, and the marks still fill. The film behaves as it does today with reduced motion.
- **The site's motion-off mode (`landing--still`) and no JS:** no scenes are held. Every part of a point stacks in normal flow, in the new larger type, and the film shows one still per stop as today. All content is readable without scrolling tricks.

## Navigation, deep links, focus, assistive tech

- Nav links and the `points[].anchors` hashes land on a point's first part. Role deep links (`#exp-dlsg`, `#exp-globenet`) land on that role's part. Each part gets a scroll position, and hash navigation goes there, not to the section top.
- `useActiveSection` keeps highlighting the point being read.
- Tabbing to a link inside a part that isn't showing brings that part in, by scrolling to its position. Only the current part's links receive clicks.
- All parts stay in the DOM in reading order and are never `aria-hidden`, so screen readers read the full detail in sequence.

## Constraints

- **Stack:** React 19, TypeScript, Vite, GSAP ScrollTrigger synced with Lenis, and vitest in a node environment.
- **Rendering:** no React render per scroll frame. Keep direct attribute and style writes, like `LightPath` and `sway.ts`.
- **Animated properties:** only `transform`, `opacity` and the wipe's mask position, plus the existing light path attributes. No layout properties.
- **Unchanged pieces:** `flightTarget` keeps holding the film while the probe line is inside a point's section. A held scene is a taller section (one scroll length per part), so the film holds for the whole scene.
- **Film layers:** the front matte layer, the HD, desktop and phone frame sets, and the AI disclosure keep working.
- **Tests:** the existing regression tests keep passing. In particular:
  - landing CSS never styles `.light` or `.dark`;
  - landing classes never collide with global CSS;
  - nothing scrolls past the footer;
  - the light has no node drift.

## Left to the builder

- **How a scene is held,** for example a tall section with a sticky stage, and how many viewport heights each part takes. The demos assumed about 80svh per part on desktop.
- **Light geometry:** how the rail and the gap S-curve join, how marks are drawn, and how this fits `lightCurve.ts`.
- **Thresholds:** exact part positions and any hysteresis, so a reader resting near a threshold doesn't flicker between parts.
- **Data shape:** how parts and per-size splits are declared in `points.ts`.
- **Final tuning:** easing, durations and type sizes, within the decided options and the limits above.

## Verification

- **Unit tests (pure functions):**
  - scroll position → current part, both directions;
  - part scroll positions for deep links;
  - the reduced-motion and motion-off branches.
- **Headless captures** (the `shots.cjs` pattern) at 1920×1080, 1440×900, 1280×600, 390×844 and with reduced motion: every part of every stop.
- **Probes:**
  - every part fits its stage;
  - the text zone at each stop has no tower behind the text;
  - the light stays attached to the text;
  - deep links land on the right part;
  - nothing scrolls past the footer.
- **Performance:** no long tasks during a roll on a mid-range laptop. The roll and wipe stay on the compositor apart from the mask edge.

## Decisions log

- 2026-10-18: stops become scenes made of parts; all detail stays on the Cinematic page.
- 2026-10-19: larger text; arrival is the light wipe (C); parts change with a credits roll (D).
- 2026-10-19: everything that was behind "More" gets its own parts (option 1 of 3; the alternatives were keeping "More" inside parts, or moving that content to the Read page).
