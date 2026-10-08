"""Contact sheet of the candidate stills for one or more stops (A-D = seeds), with a dashed card zone.

Usage: python stop_board.py <out.jpg> <stop_id> [stop_id ...]
"""
import glob
import os
import sys

from PIL import Image, ImageDraw

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
        if not stop.startswith('s6'):
            d.rectangle([int(TW * 0.04), int(TH * 0.25), int(TW * 0.40), int(TH * 0.8)], outline=(255, 255, 255), width=1)
        d.rectangle([0, 0, 28, 24], fill=(0, 0, 0))
        d.text((9, 5), 'ABCD'[c], fill='white')
        sheet.paste(im, (c * TW, y + 30))
sheet.save(out, quality=82)
print('ok')
