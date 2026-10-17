# Flight v3 video pipeline

Builds the dusk drone flight behind the Cinematic landing: six stops (River, Brickell, Downtown, The Bay, The Beach,
Sunset Harbour), each composed so its point's text sits on calm sky or water (`zones.py` holds every stop's text
zone). Everything runs locally in ComfyUI on an RTX 4080 (LTX-2.5 22B distilled for video, Z-Image-Turbo for stills,
SeedVR2 3B for the HD master, SegFormer-B5 for the occlusion matte). The footage is AI-generated; the LTX-2 license
requires the site to say so ("AI-rendered flight").

Run each script with ComfyUI's embedded Python, always with `-I` (it has `av`, `numpy`, `cv2`, `PIL`, `torch`,
`transformers`), while ComfyUI listens on 127.0.0.1:8188. `heal_chain.COMFY` points at the local ComfyUI install.
Tests: `python -I -m unittest discover -s tools/flight -p test_v3.py`.

| Step | Script | Output |
|---|---|---|
| 1. Stop stills, 4 seeds per stop | `make_stops_v3.py [ids] [--seeds a,b]` | `output/keyframes/stops/v3_<stop>_<seed>.png` |
| 2. Pick one per stop | `stop_board.py out.jpg v3_river …` | contact sheet with the stop's text zone drawn |
| 3. Grade the picks so dusk only moves forward, install them | `grade_stills.py` | `input/flight/stops/<id>.png` |
| 4. Arrival + departure per stop | `render_stops.py stops_v3.json [--only id,…]` | `output/video/flight/stops/<id>_stop.mp4` |
| 5. Join and retime to exact stop frames | `assemble_v3.py stops_v3.json` | `flight_v3.mp4` (825 frames) + `flight_v3.json` |
| 6. HD master | `upscale_hd.py [--sample START COUNT]` | `hd_master/fNNNN.png`, 1920x1056 |
| 7. Matte model (once) | `fetch_segformer.py` | `C:/Users/abel/AI/models/segformer-b5-ade/model.safetensors` |
| 8. Occlusion matte | `matte.py` | `matte_master/fNNN.png` + `matte_preview.mp4` |
| 9. Frames, mattes and stop data for the site | `export_site.py <repo_root>` | `public/flight/{hd,desktop,phone,matte/wide,matte/phone}`, `src/flight/flightData.ts` |

How it fits together:

- **Stops are fixed frames.** The site takes every second master frame; stops sit at site frames 40, 114, 189, 264,
  338 and 412 (master 80 … 824). `assemble_v3` retimes each hop to an exact length with an ease-out / full speed /
  ease-in profile (`retime.py`) that skips the model's stalls.
- **Arrival** is the camera pulling back from the stop still, played in reverse, so every stop lands exactly on its
  composed frame. **Departure** is a forward burst from the same still. `seed` re-rolls an arrival, `depart_seed` a
  departure (both in `stops_v3.json`).
- **Light only moves forward** (afterglow → twilight → blue hour). The still model ignores that, so `grade_stills`
  darkens each pick toward a falling sky target (never stronger than x0.6). No sun disk, and never the words "sun" or
  "sunset" in a prompt (the model paints a sun disk).
- **The matte** is 1 − P(sky + water + sea + river + lake) from SegFormer, smoothed across neighbouring frames (stop
  frames keep their own), so the landing can draw each frame's buildings over the light path and the light passes
  behind them. The model comes from NVIDIA's official commit, loaded with `weights_only=True` and converted to a local
  safetensors file; matte.py never loads a pickle. Ask the owner before downloading any new model.
- **Export checks** refuse to write anything if a frame count or stop frame is off, if buildings cover 2% or more of
  a stop's text zone, or if the sky brightens from one stop to the next.

v2 scripts (`make_stops.py`, `stops_v2.json`, `assemble_v2.py`) stay for reference; older experiments:
`heal_chain.py`, `grade_restore.py`, `retime_constant_speed.py`.
