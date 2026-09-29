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
