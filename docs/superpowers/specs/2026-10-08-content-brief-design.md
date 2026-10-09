# Content brief → portfolio site (content-first)

Date: 2026-10-08 · Source: `Jose_Garcia_Website_Content_Brief.docx` (prepared 2026-10-08) · Base: `origin/main` b91496e

## Intent

Reposition the site from "Solutions Engineer" to **Customer Solutions | Implementation | Technical Consulting**, using the copy, structure, and evidence rules in the brief. Every public claim must be one Jose can back up. Content lands on the **current 7-scene Home** first; the flight-v2 Home will later read the same data (decision 2026-10-08: "content first").

Out of scope: the flight-v2 Home, new animation, the optional supporting content (video, recommendations, technical notes), the verified customer case study (added when Jose supplies approved material).

## Architecture

1. **Single source of truth.** Copy lives in `src/data/` (`profile.ts` extended; new `content.ts`; `experience.ts` and `projects.ts` rewritten to the brief). Scenes render from data; no prose hard-coded in scene files except layout labels.
2. **Scene mapping** (Home order changes to match the brief: hero → capabilities → work → experience → approach → tools/education/bio → resume → contact):

| Brief section | Component |
|---|---|
| Positioning headline, hero copy, details line, buttons, evidence strip, availability badge | `Scene01Hero` |
| Five capability cards (each links to an experience example or case study) | `Scene05Capabilities` (moved to position 2) |
| Selected work: Service Map Planner, AAC, garage (fallback third) with status labels | `Scene04ProjectUniverse` |
| DLSG / Image Access, GlobeNet | `Scene03Experience` |
| How I work (5 steps, one tied to a real example) | `Scene02WhoIAm` |
| Tools (professional vs project), education, languages, short bio | `Scene06Philosophy` |
| Resume section: master + 3 role PDFs, "Download PDF", last-updated date | new `SceneResume` |
| "Let us talk about your team" | `Scene07Contact` |
| Nav: Work, Experience, About, Resume, Contact | `Navbar`, `Footer`, `EditorialNav` |
| Title, meta description, OG/Twitter, social image | `index.html` |

3. **Case study pages** (`/projects/*`): Service Map Planner and garage rewritten, AAC added, all on the brief's 8-question template (problem, who, role, constraints, what/why, what to inspect, current result, what remains) ending with a related project and contact. Agent Trading OS moves to a secondary `/lab` page. Existing routes keep working (redirects where paths change).
4. **Status labels** per card: Personal project, Working prototype, Demo with sample data, or Deployed tool, plus a last-updated month on the detail page.

## Claims register (Phase 0 — needs Jose's decision)

Default if undecided: **drop or soften** to what is evidenced. "Where" is current `origin/main`.

| Claim | Where | Default |
|---|---|---|
| AWS Certified Cloud Practitioner | `profile.ts`, `experience.ts`, Scene03 | Remove unless credential verified (issuer + status) |
| "100+ institutional accounts" | Scene03, Scene04, Scene05 | Remove, or define scope (personal vs employer reach vs sample data) |
| 99.999% SLA | Scene03, Scene05 | Remove; describe NOC monitoring without attributing the SLA as a result |
| SMP "active in daily operations", routing optimization | `projects.ts`, Scene04 | "Personal project / working prototype"; map-based visit planning only |
| AAC "Offline Ready", "AA Compliant" | Scene04 | Remove both; say "large touch targets, bilingual presentation" |
| Garage "200+ assets", 1:10 & 1:24, direct STL | `GarageVisual`, Scene04, `ScaleGarageStudio` | 1:18 only; STL export only if verified; no asset count |
| "Sustained client retention", low tickets, certified admins, RFP scoring | Scene05 | Remove |
| Location "Boca Raton" | Navbar, Footer, Scenes 01/03/07, Contact | "South Florida" |
| Degree wording | Footer, profile | "B.S. Computer Science & Engineering, FAU" (matches resume) |
| Title | profile, index.html | Public headline = positioning line; employment title stays "Service Engineer" |
| Certificate in Data Science & Analytics | experience | Keep only with issuer and completion date |
| Contact email | Scene07, Contact | `garciabel212@gmail.com`; LinkedIn `/in/jose-abel-garcia/` |

## Assets needed from Jose

Portrait; master PDF plus Implementation / Solutions Engineering / Technical Accounts PDFs and their last-updated dates; 3 Service Map Planner screenshots (sample data); 2 AAC screens; 1 garage screenshot or build photo; optionally one professional work sample and a walkthrough. Until supplied, cards use existing images with an explicit "concept"/"sample" label — never a fabricated screenshot. Each asset records title, caption, alt text, date, status, sample-data flag, and employer/personal/demo.

## Delivery (one PR each, squash-merged)

1. `docs`: this spec.
2. `refactor`: data layer + claims scrubbed (no visible redesign).
3. `feat`: Hero, capabilities, scene reorder, nav, SEO.
4. `feat`: Experience, How I work, tools/education/bio, Resume section, Contact.
5. `feat`: case study pages + Lab + redirects.

## Verification

`npm run lint`, `npm test`, `npm run build`; keyboard and mobile (375px) pass; reduced-motion pass; essential text visible with animation disabled; every link and PDF opens under `/About-Me/`; a grep for each retired claim string returns nothing.
