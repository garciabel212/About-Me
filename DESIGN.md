---
name: Jose Garcia, Cinematic
description: Detailed text points over a full-bleed dusk flight, joined by one glowing light that runs ahead of the reader.
colors:
  text: "#f3f4f6"
  text-2: "rgba(243, 244, 246, 0.84)"
  text-meta: "rgba(243, 244, 246, 0.92)"
  accent: "#4aa8ff"
  core: "#eaf6ff"
  dusk: "#0b0d18"
  falloff: "rgba(11, 13, 24, 0.66)"
  falloff-phone: "rgba(11, 13, 24, 0.6)"
  veil-corner: "rgba(11, 13, 24, 0.92)"
  veil-phone: "rgba(11, 13, 24, 0.94)"
  text-halo: "rgba(11, 13, 24, 0.7)"
  hairline: "rgba(243, 244, 246, 0.16)"
  route: "rgba(74, 168, 255, 0.14)"
  halo: "rgba(74, 168, 255, 0.1)"
  glow: "rgba(74, 168, 255, 0.32)"
  node-fill: "rgba(74, 168, 255, 0.25)"
  node-stroke: "rgba(234, 246, 255, 0.4)"
typography:
  display:
    fontFamily: "Bodoni Moda, Times New Roman, serif"
    fontSize: "clamp(52px, 6.4vw, 92px)"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Bodoni Moda, Times New Roman, serif"
    fontSize: "clamp(32px, 3.2vw, 46px)"
    fontWeight: 500
    lineHeight: 1.08
  title:
    fontFamily: "Bodoni Moda, Times New Roman, serif"
    fontSize: "23px"
    fontWeight: 500
    lineHeight: 1.2
  role:
    fontFamily: "Bodoni Moda, Times New Roman, serif"
    fontSize: "clamp(19px, 1.6vw, 24px)"
    fontWeight: 400
    lineHeight: 1.25
  brand:
    fontFamily: "Bodoni Moda, Times New Roman, serif"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0"
  body-lead:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  body-sm:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
  meta:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    letterSpacing: "0.02em"
  action:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.2
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.16em"
  caption:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
  disclosure:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.04em"
rounded:
  image: "10px"
spacing:
  gutter: "clamp(16px, 4vw, 56px)"
  header-h: "68px"
  column-gap: "24px"
  block-max: "560px"
  point-pad: "16svh"
  point-gap: "40svh"
  point-gap-phone: "28svh"
  exit-offset: "clamp(140px, 18vw, 320px)"
  falloff-inset: "-56px -96px"
  falloff-feather: "140px"
  actions-gap: "10px 22px"
  facts-gap: "12px 24px"
  note-gap: "34px"
components:
  link-primary:
    textColor: "{colors.accent}"
    typography: "{typography.action}"
  link-secondary:
    textColor: "{colors.text}"
    typography: "{typography.action}"
  header-email:
    textColor: "{colors.accent}"
    height: "38px"
    padding: "0 12px"
  point-block:
    textColor: "{colors.text}"
    width: "{spacing.block-max}"
  work-shot:
    rounded: "{rounded.image}"
    width: "100%"
  portrait:
    rounded: "{rounded.image}"
    size: "120px"
  ai-disclosure:
    textColor: "{colors.text-2}"
    typography: "{typography.disclosure}"
---

# Design System: Jose Garcia, Cinematic

Scope: the Cinematic landing (`src/landing/`, `src/pages/Home.tsx`) and the header and footer rules that apply over it (`.site-header.is-film`, `.site-shell.is-film` in `src/styles/site.css`). Read mode (`src/components/home/Sections.tsx`, `src/styles/site.css`, `src/styles/evidence.css`) is a separate incumbent surface with its own type (Playfair Display, Inter) and is not described or redesigned here.

## Overview

**Creative North Star: "The Light Ahead"**

The ground is a clean, full-bleed aerial of Miami at dusk, fixed behind everything and never framed. Detailed text points sit on it in a zig-zag down the page, and a single glowing line of light joins them, its bright head running ahead of the reader to the next point. The light is the only thing drawn on the footage; the film is not annotated, ringed, boxed, or tinted.

Type does the structural work that panels would do elsewhere. A high-contrast Bodoni Moda display carries names and headlines like title cards; Archivo carries every reading line and action. Legibility comes from a feathered dusk falloff that sits behind each text block with no readable edge, plus a soft text halo, so the film stays continuous right up to the letters.

Motion is tied to the light: a point's text arrives when the light reaches its node, once, and stays. With motion off the film shows one still per point, the light is fully drawn, and text only fades.

**Key Characteristics:**
- Full-bleed dusk footage as the only ground; no panels, cards, glass, rings, or red.
- One blue (accent) for the light, its nodes, focus rings, links, and Email me.
- Bodoni Moda display over Archivo text, ivory-white on dusk.
- Points placed on a 12-column grid in a zig-zag, each a 560px reading block.
- Text arrives with the light; reduced motion gets a fade only.
- The AI disclosure is always on screen with the film.

## Colors

A dusk-and-ivory world with one cool blue that belongs to the light.

### Primary
- **Flight Blue** (accent): the light's glow, halo and route, the nodes, the Email me link and header button, the active nav and view underline, focus outlines, and the details caret. Nothing else is colored.
- **Light Core** (core): the white-hot center of the light, the head, and a node once the light has reached it.

### Neutral
- **Ivory Ink** (text): names, headlines, leads, strong text, and secondary links.
- **Soft Ivory** (text-2): body paragraphs, lists, fact labels, captions, and the AI disclosure.
- **Meta Ivory** (text-meta): dates, locations, status lines.
- **Dusk** (dusk): the film's ground before frames load, the opaque header bar, the page background under Cinematic, and the base of every falloff and veil.
- **Dusk Falloff** (falloff, falloff-phone, text-halo): the feathered backing behind each text block and the text halo for bright skies.
- **Veils** (veil-corner, veil-phone): the soft patch behind the AI disclosure only.
- **Hairline** (hairline): the 1px edge on work screenshots, so bright UI captures do not bleed into the film.

### Named Rules
**The One Blue Rule.** Flight Blue and its core belong to the light and to the things the light points at (Email me, links in focus, the current place). No second accent, and never red.

**The Feathered Falloff Rule.** Text never sits on a shape with an edge. Its backing is a horizontal dusk gradient (0 to 66% to 66% to 0) masked by a 140px vertical feather; on phones it collapses to a flat 60% dusk.

## Typography

**Display Font:** Bodoni Moda (with Times New Roman, serif)
**Body Font:** Archivo (with system-ui, sans-serif)

**Character:** A Didone with sharp hairlines reads like a film title against the footage; a sturdy grotesque keeps every detail line plain and readable over moving light.

### Hierarchy
- **Display** (500, clamp(52px, 6.4vw, 92px), 0.98, -0.01em): the name on the first point only.
- **Headline** (500, clamp(32px, 3.2vw, 46px), 1.08, balanced): each later point's headline.
- **Role** (400, clamp(19px, 1.6vw, 24px), 1.25): the role line under the name.
- **Title** (500, 23px, 1.2; 21px for method steps): organizations, project titles, method steps.
- **Brand** (500, 22px, 1): the site name in the header over the film.
- **Body lead** (400, 17px, 1.55, max 44ch): the intro statement and the closing invitation.
- **Body** (400, 15px, 1.55): summaries and paragraphs in Soft Ivory.
- **Body small** (400, 14px, 1.4 to 1.5): lists, tools, details content.
- **Meta** (500, 14px, 0.02em): dates, places, status.
- **Action** (600, 15px, 1.2): Email me, Résumé, LinkedIn, GitHub; case-study links at 14px.
- **Label** (600, 11px, 0.16em, uppercase): quick-fact terms only (Current role, Open to).
- **Caption** (400, 12px, 1.4): screenshot captions.
- **Disclosure** (400, 11px, 0.04em): the AI disclosure.

### Named Rules
**The Title Card Rule.** The name and each headline rise from behind their own baseline (clipped, translateY 105% to 0 over 750ms); no other type moves that way.

**The Plain Words Rule.** No em dashes in copy. Date ranges and separators read as words ("October 2022 to Present"); the landing converts dashes with `plain()`.

## Layout

Each point is a section on a 12-column grid (24px column gap) inside the shared gutter (clamp(16px, 4vw, 56px)), at least 110svh tall with 16svh vertical padding. Its text block is at most 560px wide and placed in a zig-zag: top-right (columns 7 to 13, top aligned, cleared below the 68px header plus 9svh), left (1 to 7), center (4 to 10), right (7 to 13), bottom-left (1 to 7, bottom aligned, 34svh of room below so the footer arrives after it is read). Points are separated by 40svh gaps of open film, a moment of flight rather than a wait.

Tablets (to 1023px) drop the center: center joins the left (1 to 9), left placements widen to 1 to 10, right placements to 4 to 13. Phones (to 767px) go to one column, padded 12svh 16px 12svh 52px so the light runs down the left margin; gaps shrink to 28svh; fact and tool grids go single column.

The header shares the gutter and runs edge to edge over the film. The footer under Cinematic also drops its max width and sits on solid dusk.

## Elevation & Depth

Depth is light, not lift. The film is the back plane, the light path floats above it (z 2), text points above that (z 3), and the veils and disclosure on top (z 5 and 6). There are no box shadows and no raised surfaces. Two soft effects exist only for legibility: the feathered falloff behind each block and a text halo (0 1px 14px, text-halo) for bright skies. The light itself carries the glow: a 28px halo stroke, a 9px glow stroke, a 1.8px core, and a 22px radial bloom at the head.

### Named Rules
**The Only Ink Is Light Rule.** Nothing is drawn on the film except the light path: its dim route, glow, core, nodes, and head. No rings, callouts, markup, panels, cards, or glass over the footage.

**The Veil Is Not a Band Rule.** The top veil is an opaque dusk bar exactly the header's height plus a 24px fade; the bottom veil is only a corner patch (min(420px, 100%) by 64px) behind the disclosure, full-width 64px fade on phones. The film is never framed in bands.

## Shapes

Almost no shapes: type on footage. The few hard objects are work screenshots and the portrait, gently rounded (10px), screenshots with a 1px hairline. Lines are round-capped strokes; nodes are circles (r 6, flaring to r 7 with a 10px soft stroke when lit). The details caret is a 7px rotated corner stroke in Flight Blue.

## Components

### Links and actions
Text links, not buttons. **Email me** is the primary action: Flight Blue, 600 weight, with a 2px underline in its own color. **Résumé**, LinkedIn, and GitHub are Ivory Ink links with a 3px underline offset. Actions wrap with a 10px by 22px gap. Focus is a 2px Flight Blue outline at 3px offset.

### Navigation (over the film)
The header carries no band of its own; the top veil sits under it. Brand in Bodoni Moda 500 22px; nav, tools, and view switch in Archivo. The current place gets a 2px Flight Blue underline that scales in (0.3s); the active view gets an inset 2px Flight Blue bottom line instead of a filled pill. The Email header button is outlined in Flight Blue, 700 weight.

### Point block
The repeated unit: a numbered label ("01 / EXPERIENCE": Archivo 600 12px, 0.28em tracking, uppercase, the number in #b9e0ff), then a display name or headline, then the point's content, on a feathered falloff. The intro has no label. The numbered labels come from the owner's reference image and were kept by the owner's explicit decision (2026-10-15), over the craft rule against kicker labels; the numbers also carry the light's order. An entry node sits 22px outside the block on the side facing the page's middle (34px from the top; 52px on the first point); an exit node sits at the block's bottom, pushed out into the open film by clamp(140px, 18vw, 320px), so the light arcs across the footage while a point is read. On phones every node moves to the left margin.

### Light path (signature)
One SVG over the whole landing, drawn through every node as cubic curves. Layers: route (1.5px, always visible), halo (28px), glow (9px), core (1.8px, Light Core), each drawn to the head by dash offset. The head is a 22px radial bloom (core 0.95, blue 0.45 at 35%, clear at the edge) around a 3.5px core, held at 65% of viewport height. Nodes flare when reached (fill 0.4s, stroke-width 0.6s). With motion off the full path is drawn and the head is hidden.

### Quick facts
A two-column definition list (12px by 24px gap): Label-style terms in Soft Ivory, 14px values in Ivory Ink.

### Disclosure details
"More" content opens in place: a 600-weight Ivory Ink summary with a Flight Blue caret that turns from right to down (0.2s), and where supported the body grows open (height and opacity, 250ms, ease-arrive).

### Work screenshot
Full block width, 10px radius, hairline edge, 12px caption below. Settles in as it scrolls into view (scale 0.97 to 1 and fade, linked to scroll from 5% to 60% of entry) when motion is allowed.

### AI disclosure
"AI-rendered flight · not real footage", fixed bottom right (16px, 12px), 11px Soft Ivory, on its corner veil. Always visible while the film is.

### Motion
All entrances use ease-arrive (cubic-bezier(0.16, 1, 0.3, 1)). When the light reaches a point, its children fade and rise 14px over 600ms, staggered 70, 140, then 210ms down the block; the name and headline rise from their baseline over 750ms. Arrival is one-way. Nothing is hidden until the light is measured. Reduced motion or motion off: a 200ms opacity fade only, nothing moves.

## Do's and Don'ts

### Do:
- **Do** keep the film full-bleed, fixed, and clean, with dusk (#0b0d18) behind it.
- **Do** put every text block on the feathered falloff with a 140px feather and no visible edge.
- **Do** reserve Flight Blue for the light, nodes, focus, the current place, and Email me.
- **Do** set names and headlines in Bodoni Moda 500 and everything else in Archivo.
- **Do** keep reading blocks to 560px on the 12-column grid, separated by 40svh of open film (28svh on phones).
- **Do** place exit nodes out in the film by clamp(140px, 18vw, 320px) so the light crosses the footage.
- **Do** let text arrive with the light on ease-arrive, and fall back to a 200ms fade for reduced motion.
- **Do** keep the AI disclosure visible whenever the film is on screen.
- **Do** write date ranges and separators as words.

### Don't:
- **Don't** draw anything on the film but the light: no rings, markup, callouts, or redlines.
- **Don't** put text in panels, cards, or glass, and don't add box shadows.
- **Don't** introduce red or a second accent color.
- **Don't** frame the film in solid bands top and bottom; only the header bar and the disclosure patch are veiled.
- **Don't** use em dashes in copy.
- **Don't** hide or shrink away the AI disclosure.
- **Do** give a new point the same numbered label as the others ("0N / NAME"); the sequence is the light's order. **Don't** add any other eyebrow or kicker text above headlines.
