"""Restores contrast and colour that drift out of a chained flight video.

Each I2V burst lifts the blacks and drains saturation a little, and the chain compounds it, so
later shots look hazy and grey. This measures each frame's black point, white point and
saturation, smooths them over time (no flicker), and pulls every frame back toward the
reference levels of the first frame.

Usage: python grade_restore.py in.mp4 out.mp4 [strength]   (strength 0..1, default 0.85)
"""
import sys

import av
import numpy as np

src, dst = sys.argv[1], sys.argv[2]
STRENGTH = float(sys.argv[3]) if len(sys.argv) > 3 else 0.85
SMOOTH = 31  # frames; a ~1 s window so the grade breathes slowly instead of flickering


def stats(rgb):
    small = rgb[::4, ::4].astype(np.float32)
    y = small.mean(axis=2)
    return np.percentile(y, 1), np.percentile(y, 99.5), (small.max(axis=2) - small.min(axis=2)).mean()


measured = np.array([stats(f.to_ndarray(format='rgb24')) for f in av.open(src).decode(video=0)])
pad = SMOOTH // 2
kernel = np.ones(SMOOTH) / SMOOTH
smooth = np.stack([np.convolve(np.pad(measured[:, c], pad, mode='edge'), kernel, mode='valid') for c in range(3)], axis=1)

ref_black, ref_white, ref_sat = smooth[0]
print(f'reference: black {ref_black:.1f}, white {ref_white:.1f}, saturation {ref_sat:.1f}')

inp = av.open(src)
fps = inp.streams.video[0].average_rate
container = av.open(dst, mode='w')
stream = container.add_stream('libx264', rate=fps)
stream.pix_fmt = 'yuv420p'
stream.options = {'crf': '16', 'preset': 'slow'}

for k, frame in enumerate(inp.decode(video=0)):
    img = frame.to_ndarray(format='rgb24').astype(np.float32)
    if k == 0:
        stream.width, stream.height = img.shape[1], img.shape[0]
    black, white, sat = smooth[k]
    # Levels: map this frame's black/white points toward the reference ones (only ever darken blacks).
    new_black = black + STRENGTH * (min(ref_black, black) - black)
    new_white = white + STRENGTH * (max(ref_white, white) - white)
    img = (img - black) / max(white - black, 1.0) * (new_white - new_black) + new_black
    # Saturation: scale chroma around luma toward the reference, capped so it never turns garish.
    gain = 1 + STRENGTH * (np.clip(ref_sat / max(sat, 1.0), 1.0, 1.3) - 1)
    luma = img.mean(axis=2, keepdims=True)
    img = luma + (img - luma) * gain
    out = av.VideoFrame.from_ndarray(img.clip(0, 255).astype(np.uint8), format='rgb24')
    for packet in stream.encode(out):
        container.mux(packet)
for packet in stream.encode():
    container.mux(packet)
container.close()

before = measured[:, 0]
print(f'{len(measured)} frames; black point before: {before.min():.1f}..{before.max():.1f}')
