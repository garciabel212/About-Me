"""Stop frames (frame 80 of each stop clip) with a 10% grid, for placing pins. Usage: python pin_grid.py out.jpg id [id...]"""
import os
import sys

import av
from PIL import Image, ImageDraw

D = r'C:\Users\abel\AI\ComfyUI_windows_portable\ComfyUI\output\video\flight\stops'
ims = []
for sid in sys.argv[2:]:
    for k, f in enumerate(av.open(os.path.join(D, f'{sid}_stop.mp4')).decode(video=0)):
        if k == 80:
            im = f.to_image().resize((960, 528))
            break
    d = ImageDraw.Draw(im)
    for i in range(1, 10):
        d.line([(i * 96, 0), (i * 96, 528)], fill=(0, 255, 255), width=1)
        d.line([(0, i * 52.8), (960, i * 52.8)], fill=(0, 255, 255), width=1)
        d.text((i * 96 + 3, 3), f'.{i}', fill=(255, 255, 0))
        d.text((3, i * 52.8 + 3), f'.{i}', fill=(255, 255, 0))
    d.text((40, 20), sid, fill='white')
    ims.append(im)
sheet = Image.new('RGB', (960 * 2, 528 * ((len(ims) + 1) // 2)))
for k, im in enumerate(ims):
    sheet.paste(im, ((k % 2) * 960, (k // 2) * 528))
sheet.save(sys.argv[1], quality=85)
