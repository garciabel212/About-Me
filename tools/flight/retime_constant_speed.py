"""Re-times a flight video so the camera moves at a constant visual speed.

Each burst in the chain starts from rest and accelerates, which reads as stop-and-go pulsing.
This measures per-frame motion (mean absolute frame change, smoothed), then resamples the
video so every output frame advances the same amount of motion, blending neighbours for
fractional positions.

Usage: python retime_constant_speed.py in.mp4 out.mp4 [seconds] [shutter] [power]
  power 1 = fully even speed; 0.5 = softened (close walls change pixels fast even at normal speed)
"""
import sys

import av
import numpy as np

src, dst = sys.argv[1], sys.argv[2]
frames = [f.to_ndarray(format='rgb24') for f in av.open(src).decode(video=0)]
n = len(frames)
seconds = float(sys.argv[3]) if len(sys.argv) > 3 else n / 30
out_count = int(round(seconds * 30))

small = [f[::4, ::4].mean(axis=2).astype(np.float32) for f in frames]
motion = np.array([np.abs(small[i + 1] - small[i]).mean() for i in range(n - 1)])
kernel = np.ones(9) / 9
motion = np.convolve(motion, kernel, mode='same')
motion = np.maximum(motion, np.median(motion) * 0.15)  # never treat a frame as fully still
POWER = float(sys.argv[5]) if len(sys.argv) > 5 else 1.0
motion = motion ** POWER
cumulative = np.concatenate([[0.0], np.cumsum(motion)])  # cumulative[i] = motion travelled at frame i

targets = np.linspace(0.0, cumulative[-1], out_count)
positions = np.interp(targets, cumulative, np.arange(n))  # fractional source frame for each output frame

h, w = frames[0].shape[:2]
container = av.open(dst, mode='w')
stream = container.add_stream('libx264', rate=30)
stream.width, stream.height, stream.pix_fmt = w, h, 'yuv420p'
stream.options = {'crf': '16', 'preset': 'slow'}
SHUTTER = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0  # 0 = sharp; 0.5 ~ a 180-degree film shutter


def sample(p):
    i = min(int(np.floor(p)), n - 1)
    t = p - i
    if i >= n - 1:
        return frames[-1].astype(np.float32)
    return frames[i].astype(np.float32) * (1 - t) + frames[i + 1].astype(np.float32) * t


spacing = np.gradient(positions)  # source frames advanced per output frame, locally
for k, p in enumerate(positions):
    if SHUTTER > 0:
        # Average a few samples across the shutter interval: natural blur where the camera moves fast.
        offsets = np.linspace(-SHUTTER / 2, SHUTTER / 2, 5) * spacing[k]
        img = np.mean([sample(float(np.clip(p + o, 0, n - 1))) for o in offsets], axis=0)
    else:
        img = sample(p)
    img = img.clip(0, 255).astype(np.uint8)
    for packet in stream.encode(av.VideoFrame.from_ndarray(img, format='rgb24')):
        container.mux(packet)
for packet in stream.encode():
    container.mux(packet)
container.close()

speed_before = motion / np.median(motion)
print(f'in {n} frames -> out {out_count} frames ({seconds:.1f}s)')
print(f'speed variation before: min {speed_before.min():.2f}x, max {speed_before.max():.2f}x of median')
