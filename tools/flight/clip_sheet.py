"""Contact sheet of a clip at fixed frame picks. Usage: python clip_sheet.py in.mp4 out.jpg [f1,f2,...]"""
import sys

import av
from PIL import Image, ImageDraw

fr = [f.to_image() for f in av.open(sys.argv[1]).decode(video=0)]
picks = [int(x) for x in sys.argv[3].split(',')] if len(sys.argv) > 3 else [round(i * (len(fr) - 1) / 11) for i in range(12)]
tw, th = 480, 264
s = Image.new('RGB', (tw * 4, th * ((len(picks) + 3) // 4)))
for k, p in enumerate(picks):
    im = fr[min(p, len(fr) - 1)].resize((tw, th))
    ImageDraw.Draw(im).text((8, 8), f'f{p}', fill='white')
    s.paste(im, ((k % 4) * tw, (k // 4) * th))
s.save(sys.argv[2], quality=85)
print(len(fr), 'frames')
