# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary: recruiters and hiring managers filling Customer Solutions, Implementation, and Solutions/Sales Engineer roles, deciding quickly whether to reach out. Secondary: technical peers, founders, and clients who want to see what Jose can build. (Confirmed 2026-10-12: "both, recruiters first".)

## Product Purpose
Personal portfolio of Jose Garcia (Customer Solutions & Implementation). It must get Jose contacted for solutions roles: a visitor should understand who he is, what he has done, and see his projects, then email him or download the résumé.

## Positioning
The site is itself the proof. Visitors should leave remembering both (confirmed, equally weighted): he turns technical things into experiences people can feel (the cinematic Miami flight shows craft), and he makes complex systems clear (calm, plain-language text shows solutions skill).

## Operating Context
Visitors arrive from a résumé, LinkedIn, or a job application link, usually on a laptop, sometimes on a phone. Deployed on GitHub Pages (HashRouter, base path /About-Me/).

## Capabilities and Constraints
- Existing stack: React 19 + TypeScript + Vite, Tailwind v3, GSAP/ScrollTrigger, Lenis, Framer Motion, vitest, oxlint.
- The Miami dusk FPV flight (six stops: River, Brickell towers, Downtown, Biscayne Bay, Beach, Sunset Harbour) is AI-generated with LTX-2; its license requires disclosing it as machine-generated wherever it is shown.
- Planned: a landing page where the flight is the full-screen background and text adapts to it; later a separate easy-reading "Read" page; multi-page structure later.
- Open (user gave no preference 2026-10-12): verified-claims policy, real-screenshots-only policy, mobile/reduced-motion parity. Treat as undecided, not waived.

## Brand Commitments
Name: Jose Garcia. Title: Customer Solutions & Implementation. Bilingual English/Spanish. Based in South Florida (Miami imagery is part of the identity).

## Evidence on Hand
- Roles: Service Engineer at Digital Library Systems Group / Image Access (Oct 2022 to present, Boca Raton); NOC Engineer at Globenet (Nov 2021 to Sep 2022). Source: src/data/content.ts, résumé PDF in public/.
- Education: B.S. Computer Science & Engineering and Certificate in Data Science & Analytics, Florida Atlantic University.
- Projects (working prototypes): Service Map Planner, AAC communication app (bilingual, accessible), Miniature Garage Configurator; Agent Trading OS in the Lab.
- Real screenshots exist for the AAC app and garage configurator. Missing: Service Map Planner screenshots with fictional data, Agent Trading OS event timeline.
- Flight frames and stop stills: public/ flight assets, produced by tools/flight/.
- Absent and must not be fabricated: AWS certification, "100+ accounts" claim, testimonials, metrics.

## Product Principles
1. The site is the demonstration: the experience proves the skill before the text claims it.
2. Clarity over spectacle when they conflict: a recruiter must always be able to find role, projects, and contact fast.
3. Only true claims, in plain language.
4. Immersion and reading are separate surfaces: the landing immerses, the Read page reads.
