# Flight v2 video pipeline

Builds the dusk drone flight behind the Home page: six stops (River, Brickell, Downtown, The Bay, The Beach,
Sunset), each a composed shot with calm space on the left for an info card. Everything runs locally in
ComfyUI on an RTX 4080 (LTX-2.5 22B distilled for video, Z-Image-Turbo for stills). The footage is
AI-generated; the LTX-2 license requires the site to say so ("AI-rendered flight").

Run each script with ComfyUI's embedded Python (it has `av`, `numpy`, `PIL`) while ComfyUI listens on
127.0.0.1:8188. Paths in `heal_chain.py` (`COMFY`) point at the local ComfyUI install.

| Step | Script | Output |
|---|---|---|
| 1. Stop stills, 4 seeds per stop | `make_stops.py` | `output/keyframes/stops/` |
| 2. Pick one per stop | `stop_board.py out.jpg s1_river …` | contact sheet with the card zone drawn |
| 3. Arrival + departure per stop | `render_stops.py stops_v2.json [--only id,…]` | `output/video/flight/stops/<id>_stop.mp4` |
| 4. Join, speed-ramp, assemble | `assemble_v2.py stops_v2.json` | `flight_v2.mp4` + `flight_v2.json` (stop frames) |
| 5. Frames + stop data for the page | `export_web.py <page_dir> [stride] [quality]` | `frames/fNNN.webp`, data block in `index.html` |

How the shots connect smoothly:

- **Arrival** is the camera pulling back from the stop still, played in reverse, so every stop lands
  exactly on its composed frame and eases in.
- **Departure** is a forward burst from the same still, so the hover at a stop is seamless.
- **Joins** sit where both sides move fastest: the outgoing shot pushes in, the incoming one settles out
  of the same push under a radial blur, and the colour is matched across the cut.
- **Speed ramp** (`assemble_v2.ramp`) resamples each hop to an ease-out / full speed / ease-in profile,
  so the model's stalls are skipped and its bursts evened out.

`stops_v2.json` holds the per-stop prompts (and a `seed` / `pullback` override where a shot needed a
re-roll); `pins.json` holds each landmark's position in the frame and the label coordinates.
Older experiments: `heal_chain.py` (burst + heal chaining), `grade_restore.py`, `retime_constant_speed.py`.
