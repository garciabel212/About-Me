# Light path landing: the information flows, the light leads

Date: 2026-10-14. Status: written for review.
Branch: `feat/survey-landing` (worktree `Documents/Code/About-Me-survey`). This revision replaces the Site Survey Redlines design in `2026-10-12-survey-landing-design.md` for the Cinematic landing; that file stays as history.

## Why the change

The user reviewed the redline build and decided, in their words:
- "i really dont like those orange circle. what is suppose to flow is the information."
- They sent a reference image (night aerial of Miami, text points zig-zagging across the screen, one glowing blue light path snaking between them) and said: "i want the layout of the page kinda flow like this and as i go the light leads you to the next point while the cinematic plays in the background".
- Choices made on 2026-10-14: text rolls like credits; remove the title block; serif headlines like the reference; projects show name, one line, and a real screenshot where one exists.

## Goal

The Miami dusk flight plays full-screen behind the whole landing. The information is a sequence of points laid out in a zig-zag (left, center, right) like the reference. One glowing light path connects the points; as the visitor scrolls, the light draws forward and its bright head reaches the next point just before the visitor does. Nothing else is drawn on the film. A recruiter sees name, role, and contact on the first screen without scrolling.

## What stays from the current build

- The flight frames, `FrameStore`, and the scroll-scrubbed full-screen film (`SurveyFilm`, with its ink/ready reporting removed). The film holds at a stop while that point is read and flies across the gaps between points (`flightTarget` with the point sections as spans).
- Read mode, unchanged.
- Header behavior in Cinematic: no glass band, one accent (now the light's blue), nav in page order.
- Copy sources: `content.ts` and `caseStudies.ts`. No em or en dashes in visible text.
- Fixes already landed: `useActiveSection` picks the nearest passed section; `readingPlace` maps between modes; the AI disclosure is always visible with the film.

## What goes

Red ink rings, leaders, check marks, edge arrows, the title block, the pulse, the rack-focus blur, and the modules that only served them (`RedlineLayer`, `TitleBlock`, `geometry.ts` ring code, `progress.ts` ink phases, `filmState.ts`, `measureAnchors`). Sticky holds and fading notes go too: text scrolls naturally and is always visible.

## The points

The user asked for detailed information (2026-10-14: "the information will be detailed"), so each point carries the full content from `content.ts` and `caseStudies.ts`, not the reference's one-liners. The reference's headline at each point opens it; the detail follows. Six points on the six flight stops; desktop placement follows the reference and each stop's calm space (checked on the stop frames).

| Stop | Point | Placement | Content (all from existing data) |
|---|---|---|---|
| River | Intro | top right | "Jose Garcia" (display serif), "Customer Solutions & Implementation", `overview.statement`, the four quick facts from `glance` (current role, open to, work setup, travel), **Email me** and **Résumé** |
| Brickell | 01 / Experience | left | Headline "Technology. People. Results." Then each role from `experience`: organization, title, period (dashes as words), location, the summary, and its three contributions (label and text). "Full responsibilities from my résumé" opens each role's `details` list in place |
| Downtown | 02 / Expertise | center | Headline "Understand. Implement. Support." The five steps from `method`, each with where it shows at work and in a project (source and text, linking as today). Then the four `toolGroups` (Applications and systems, Deployment and support, Customer operations, Project tools) as compact lists |
| Biscayne Bay | 03 / Selected work | right | Headline "Built for real needs." Service Map Planner and AAC communication app, each with: focus, problem, my contribution, status and status note, screenshot where one exists (AAC: `images/projects/aac-yes-no-800.webp`; Service Map Planner has none, so its workflow steps show as text), and a case study link |
| The Beach | 04 / More work | left | Headline "Built to learn by doing." Miniature Garage Configurator (same fields as above, screenshot `images/projects/garage-configurator-800.webp`) and Agent Trading OS (subtitle, summary, status "Experiment, paper trading only", link to the Lab; no screenshot exists, text only) |
| Sunset Harbour | 05 / Let's connect | bottom left | Headline "Let's make technology work for people." The `about.bio` paragraphs with the portrait (`images/jose-portrait-320.webp`), education (both FAU items), languages, `contact.body`, contact details (South Florida, English and Spanish, remote or on-site up to 40% travel), and **Email me**, LinkedIn, GitHub, **Résumé** |

The four reference headlines are plain, true statements; they can be swapped later without code changes. Long lists inside a point (role details) open in place with a disclosure, so each point stays readable at a glance and goes deep on demand.

Each point is a section with `tabIndex={-1}`, an accessible heading, and the existing deep-link ids: `overview` (Intro), `experience`, `exp-dlsg`, `exp-globenet` (01), `expertise` (02), `projects` (03), `more-projects` (04), `about` and `contact` (05).

## The light path

- One SVG path drawn over the document (it scrolls with the text, not fixed to the screen). It passes through a node at each point's inner edge: the side facing the middle of the page, as in the reference (Intro: left of the name; left points: right of the text; center and right points: left of the text).
- Between nodes the path is a smooth S-curve (cubic Bézier segments with vertical tangents, so it sweeps across the page rather than cutting diagonally).
- Look: a thin white-blue core (`#eaf6ff`) with a soft blue glow (`#4aa8ff`), and round glowing nodes. This blue is the page's single accent (links, **Email me**, header active rule).
- Scroll drives it: the drawn length ends at the "head", which sits ahead of the reading line (about 65% down the screen), so the light arrives at the next node shortly before the visitor's eye does. Nodes the light has passed glow bright; nodes ahead are dim.
- Motion off or reduced motion: the whole path is drawn and every node is lit; no head animation. The film shows one still per point (existing behavior).

## Layout

- Desktop (768px and up): points sit in normal page flow on a 12-column grid and are aligned by placement (`top-right`, `left`, `center`, `right`, `bottom-left`), each text block up to 560px wide (detailed points), so a section always grows with its content. A section is as tall as its content plus breathing room (at least 110svh), so the film holds while the block scrolls past the middle of the screen; a 60svh gap between points is where the film flies.
- Readability: a soft dark radial falloff behind each text block (a background on the block's own box, no border, no panel edges), plus a light top gradient under the header.
- Phone (under 768px): one column. Points stack with the same order; the light path runs down the left margin, swinging gently (between 14px and 34px from the edge), with nodes at each point's heading.
- Header: brand in the display serif, nav in page order (Overview, Experience, Expertise, Projects, Contact), aligned to the same left gutter as the page instead of a centered 1520px bar.
- AI disclosure: one small fixed line, bottom right, "AI-rendered flight · not real footage".

## Type and color

- Display serif for names and headlines: **Bodoni Moda** (Google Fonts, variable optical size), chosen to match the reference's high-contrast serif without reaching for Playfair or Newsreader. Text and labels: **Archivo** (already loaded). Numbered labels ("01 / EXPERIENCE") in Archivo, small caps spacing, light-blue numbers, as in the reference.
- Colors: film as ground; text `#f3f4f6`, secondary `rgba(243, 244, 246, 0.74)`; accent light blue `#4aa8ff` with core `#eaf6ff`. Red is removed everywhere on the landing.

## Architecture

New folder `src/landing/` replaces `src/survey/`:
- `points.ts`: the six points as data (stop, anchors, number, label, headline, placement, body), built from `content.ts` and `caseStudies.ts`.
- `lightPath.ts` (pure, unit-tested): node positions in document coordinates in, SVG path `d` out (smooth S-curves); scroll position in, drawn length and lit-node count out; the phone variant.
- `LightPath.tsx`: the SVG layer; measures nodes from the DOM (on layout, resize, fonts, image load) and sets the drawn length from scroll through a CSS custom property (no React render per frame).
- `Point.tsx`: one point's section and text block.
- `FlightLanding.tsx`: film + light path + points + disclosure; replaces `SurveyLanding`.
- `SurveyFilm.tsx` moves to `src/landing/Film.tsx` with the `filmState` reporting removed.
- `Home.tsx` renders `FlightLanding` in Cinematic mode. `navigation.ts` derives Cinematic links from `points.ts`.
- `App.tsx` hash focus: when the hash target is a zero-size anchor inside a point, focus its section.

## Errors and edge cases

- Frames not loaded: the poster frame shows; text and light path are unaffected.
- A screenshot fails to load: its image box keeps its size (width and height attributes) and the alt text stands in.
- Resize, rotation, fonts loading, images loading: the path re-measures its nodes.
- Deep links land with the point's heading below the header.

## Testing

- Unit: `points.ts` (six points in stop order, every deep link once, no dashes, copy from content), `lightPath.ts` (path passes through every node, curves stay inside the page width, drawn length grows with scroll and is complete at the bottom, lit count, phone path stays in the margin, reduced motion draws everything), `Point.tsx` and `FlightLanding.tsx` server render (sections, headings, tabIndex, screenshots with alt text and dimensions, disclosure, one h1).
- Browser: captures at 1440x900, 1920x1080, 1280x600, 390x844, and reduced motion, with the light caught mid-way between two points.
- Impeccable detector, then the finish reviewer against an updated direction contract, then the documenter writes DESIGN.md.
- Gates: `npm test`, `npm run lint`, `npm run build`.

## Out of scope

The HD frame set (needs a new GPU upscale of the current film), the Read page with the original reactive background (next task), multi-page structure.
