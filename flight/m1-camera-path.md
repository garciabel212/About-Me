# Milestone 1 camera path — Google Earth Studio

Storyboard chapters 1–2: the dive from the sky into the Miami River, the river run with the
skyline reveal, and the glide between the Brickell towers. **16.5 s at 30 fps = 495 frames.**
Storyboard: https://claude.ai/artifact/KSRnjU1GbSHQz4fcCZeGzT (this path is its keyframes K0–K4).

| Frames | Time | Shot | On screen |
|---|---|---|---|
| 1–240 | 0–8 s | Dive from ~1,500 m onto the river, tilt easing toward the horizon | Intro (fades out over the last 20%) |
| 241–420 | 8–14 s | River run, skyline reveal at the Brickell Ave bridge, bank right onto Brickell Ave | Nothing until the last 30%, then Service Map Planner fades in |
| 421–495 | 14–16.5 s | Slow drift south between the towers | Service Map Planner |

## 1. Project settings

1. Open https://earth.google.com/studio in Chrome and sign in.
2. **New Project → Blank Project.**
3. Project settings: **Frame rate 30**, **Duration 16.5 s** (495 frames), **Dimensions 2560 × 1440**.
4. Date & time: a clear day at about **1:30 pm** local time. Keep it fixed for the whole render; later
   milestones look west at the skyline, and the full flight must match this light.
5. Field of view: if the Camera Field of View attribute is available, set one value (about 50°) for the
   whole render and do not keyframe it. A constant, slightly wide lens reads like a drone and gives the
   towers parallax as they pass.

## 2. Keyframes

Set each keyframe on **Camera Position** (longitude, latitude, altitude) and **Camera Rotation**
(pan = heading, tilt). Roll 0.

| Key | Time | Latitude | Longitude | Altitude (m) | Heading / pan (°) | Tilt (°) | Where |
|---|---|---|---|---|---|---|---|
| K0 | 0.0 s | 25.78000 | -80.21600 | 1500 | 112 | 40 | High above the river, west of downtown; river winds toward the skyline |
| K1 | 8.0 s | 25.77245 | -80.20020 | 110 | 98 | 76 | Level on the river, west of the SW 2nd Ave bridge |
| K2 | 11.0 s | 25.77100 | -80.19120 | 140 | 112 | 76 | Approaching the Brickell Ave bridge; skyline reveal |
| K3 | 14.0 s | 25.76880 | -80.19030 | 150 | 160 | 78 | Banked south onto Brickell Ave, towers on both sides |
| K4 | 16.5 s | 25.76650 | -80.19060 | 155 | 180 | 77 | Drifting south between the towers |

Tilt convention: 0° looks straight down, 90° looks at the horizon.
Heading convention: 0° = north, 90° = east. If the preview faces west at 0 s, the pan field uses the
opposite sign — enter `360 − heading` instead.

## 3. Make it cinematic

The scroll can only replay what the render contains, so the feel is decided here.

- **Ease every keyframe** (Earth Studio's default auto-ease). Never linear: linear keys make the camera
  jolt at each keyframe, and scrolling amplifies it.
- **The dive should breathe.** In the curve editor, give K0 a slow start and K1 a long landing so the
  camera drifts down at first, falls through the middle, and settles softly onto the river. Altitude
  and tilt should arrive at K1 together; if the tilt finishes early the camera stares at the water.
- **One continuous move.** Speed should never drop to zero between K1 and K4. If the camera visibly
  pauses at a keyframe, smooth that key's handles rather than adding keys.
- **Turns:** K2 → K3 is 48° in 3 s (16°/s), at the comfort limit. If it feels quick, move K2 to 10.5 s
  so the bank starts earlier. Keep every other turn under ~15°/s.
- **Clearance:** Brickell Ave towers are roughly 150–260 m tall, so 150 m is mid-height. Stay about
  40 m clear of facades; Earth Studio smears glass up close. If the towers look melted, raise K3–K4 to
  180 m before changing anything else.
- **Reveal:** the skyline should rise into frame between K1 and K2 and fill the frame at the bridge.
  If buildings block it, nudge K2 a little north over the water.

**Coordinates are approximate.** Scrub the full timeline before rendering and adjust any keyframe
that clips a building or drifts off the river. Then update this table to match, so the path stays
reproducible.

## 4. Render

1. **Render → Local.** Format **JPEG** (or PNG), full 2560 × 1440.
2. **Attribution:** choose a **bottom-center** placement if offered. If only corner placements exist,
   also do a second render at **1080 × 1920** with the same keyframes for mobile (step 5b).
3. Render, download the zip, and extract its footage folder to `flight/raw/m1/` (git-ignored).

## 5. Build frames

The site keeps every 2nd frame on moves and every 3rd during the reading stop, cross-fading between
them (set in `flight/m1.config.json`). The render itself stays 30 fps.

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
