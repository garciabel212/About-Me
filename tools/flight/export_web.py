"""Exports flight v2 for the web page: every STRIDE-th frame as WebP, plus the stop data injected into the page.

Usage: python export_web.py <page_dir> [stride] [quality]
Reads output/video/flight/flight_v2.mp4 + flight_v2.json and flight/pins.json (landmark per stop, as a fraction
of the frame), writes <page_dir>/frames/fNNN.webp and replaces the /*DATA*/…/*END*/ block in <page_dir>/index.html.
"""
import json
import os
import re
import sys

import av

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # the embedded Python doesn't add the script's folder
from heal_chain import COMFY  # noqa: E402

here = os.path.dirname(os.path.abspath(__file__))
page = sys.argv[1]
STRIDE = int(sys.argv[2]) if len(sys.argv) > 2 else 2
QUALITY = int(sys.argv[3]) if len(sys.argv) > 3 else 72

film = os.path.join(COMFY, 'output', 'video', 'flight', 'flight_v2.mp4')
meta = json.load(open(os.path.join(COMFY, 'output', 'video', 'flight', 'flight_v2.json')))
pins = json.load(open(os.path.join(here, 'pins.json'), encoding='utf8'))

out = os.path.join(page, 'frames')
os.makedirs(out, exist_ok=True)
for old in os.listdir(out):
    os.remove(os.path.join(out, old))
n = 0
for k, frame in enumerate(av.open(film).decode(video=0)):
    if k % STRIDE:
        continue
    frame.to_image().save(os.path.join(out, f'f{n:03d}.webp'), quality=QUALITY, method=6)
    n += 1

stops = []
for s in meta['stops']:
    p = pins[s['id']]
    stops.append({'id': s['id'], 'frame': round(s['frame'] / STRIDE), **p})
data = json.dumps({'frames': n, 'stride': STRIDE, 'stops': stops}, ensure_ascii=False)
html_path = os.path.join(page, 'index.html')
html = open(html_path, encoding='utf8').read()
html = re.sub(r'/\*DATA\*/.*?/\*END\*/', lambda _: f'/*DATA*/{data}/*END*/', html, flags=re.S)
open(html_path, 'w', encoding='utf8').write(html)
size = sum(os.path.getsize(os.path.join(out, f)) for f in os.listdir(out))
print(f'EXPORTED {n} frames ({size / 1e6:.1f} MB), stops at {[s["frame"] for s in stops]}')
