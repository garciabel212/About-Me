"""Contact sheet of the candidate stills for one or more stops (A-D = seeds), with the text zone drawn.

v3 stops (ids v3_<zone>) draw their landing text zone from zones.py; older stops keep the v2 card box.

Usage: python stop_board.py <out.jpg> <stop_id> [stop_id ...]
"""
import glob
import os
import sys

from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # the embedded Python doesn't add the script's folder
from zones import ZONES  # noqa: E402

SRC = r'C:\Users\abel\AI\ComfyUI_windows_portable\ComfyUI\output\keyframes\stops'
TW, TH = 720, 408

out, stops = sys.argv[1], sys.argv[2:]
rows = []
for stop in stops:
    files = sorted(glob.glob(os.path.join(SRC, f'{stop}_*.png')))
    rows.append((stop, files))
sheet = Image.new('RGB', (TW * 4, (TH + 30) * len(rows)), (17, 17, 17))
draw = ImageDraw.Draw(sheet)
for r, (stop, files) in enumerate(rows):
    y = r * (TH + 30)
    draw.text((8, y + 8), stop, fill='white')
    for c, f in enumerate(files[:4]):
        im = Image.open(f).convert('RGB').resize((TW, TH))
        d = ImageDraw.Draw(im)
        x0, y0, x1, y1 = ZONES.get(stop.removeprefix('v3_'), (0.04, 0.25, 0.40, 0.8)) if stop.startswith('v3_') else (0.04, 0.25, 0.40, 0.8)
        d.rectangle([int(TW * x0), int(TH * y0), int(TW * x1) - 1, int(TH * y1) - 1], outline=(255, 255, 255), width=2)
        d.rectangle([0, 0, 28, 24], fill=(0, 0, 0))
        d.text((9, 5), 'ABCD'[c], fill='white')
        sheet.paste(im, (c * TW, y + 30))
sheet.save(out, quality=82)
print('ok')
