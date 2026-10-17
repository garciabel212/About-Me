"""Grades the chosen still of every v3 stop so dusk only moves forward, and installs it as the hop input.

Each stop in stops_v3.json names its chosen seed ("pick") and a target sky level ("sky", mean luma of the
top 15% of the frame). grade.grade_to darkens toward it, never stronger than x0.6. The result goes to
ComfyUI/input/flight/stops/<id>.png, which render_stops.py reads. Fails if the light would go backwards.

Usage: python grade_stills.py
"""
import json
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # the embedded Python doesn't add the script's folder
from grade import grade_to  # noqa: E402
from heal_chain import COMFY  # noqa: E402
from zones import check_light_forward, sky_level  # noqa: E402

here = os.path.dirname(os.path.abspath(__file__))
route = json.load(open(os.path.join(here, 'stops_v3.json'), encoding='utf8'))
levels = []
for s in route:
    src = os.path.join(COMFY, 'output', 'keyframes', 'stops', f"{s['id']}_{s['pick']}_00001_.png")
    rgb = np.asarray(Image.open(src).convert('RGB'))
    out, k = grade_to(rgb, s['sky'])
    level = sky_level(out, np.zeros(out.shape[:2], np.uint8))
    levels.append(level)
    Image.fromarray(out).save(os.path.join(COMFY, 'input', 'flight', 'stops', f"{s['id']}.png"))
    print(f"{s['id']}: seed {s['pick']} x{k:.2f} sky {level:.1f} (target {s['sky']})", flush=True)
if not check_light_forward(levels):
    sys.exit(f'light goes backwards: {[round(v, 1) for v in levels]}')
print('LIGHT_FORWARD_OK')
