"""Assembles flight v2: six stop clips joined by forward zoom-blur transitions.

Each stop clip is arrival (reversed pull-back, ends slow on the composed stop frame) + departure (starts slow,
ends fast). Consecutive clips meet where both are moving fastest: the departure's end and the next arrival's
start. There the outgoing shot pushes in and the incoming one settles out of the same push, both under a radial
blur that peaks at the cut, the way FPV editors hide a join inside a speed burst. Colour is matched across the
join so the hop reads as one flight.

Usage: python assemble_v2.py stops_v2.json
Writes ComfyUI/output/video/flight/flight_v2.mp4 and flight_v2.json (the frame index of every stop).
"""
import json
import os
import sys

import av
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # the embedded Python doesn't add the script's folder
from heal_chain import COMFY, frames_of  # noqa: E402

JOIN = 12          # frames the two shots overlap at each join
PUSH = 0.22        # how far the shots punch in at the cut (fraction of frame)
BLUR = 0.14        # radial blur length at the peak (fraction of frame)
TAPS = 9           # samples in the radial blur
RAMP_POWER = 0.6   # <1 softens motion equalising (close walls change pixels fast even at normal speed)
RAMP_FLOOR = 0.4   # speed at a stop, as a fraction of the hop's average (1 = no easing)

here = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(COMFY, 'output', 'video', 'flight')


def zoom(rgb, scale, blur):
    """Scales about the centre (scale >= 1) and smears along radial lines by `blur`."""
    h, w = rgb.shape[:2]
    img = Image.fromarray(rgb)
    acc = np.zeros((h, w, 3), np.float32)
    for j in range(TAPS):
        s = scale * (1 + blur * j / max(TAPS - 1, 1))
        sw, sh = round(w * s), round(h * s)
        big = img.resize((sw, sh), Image.BILINEAR)
        x, y = (sw - w) // 2, (sh - h) // 2
        acc += np.asarray(big.crop((x, y, x + w, y + h)), np.float32)
    return acc / TAPS


def match_colour(src, ref):
    """Per-channel mean/std transfer, so the incoming shot starts in the outgoing shot's grade."""
    s, r = src.reshape(-1, 3), ref.reshape(-1, 3)
    out = (src - s.mean(0)) / (s.std(0) + 1e-3) * r.std(0) + r.mean(0)
    return out


def join(tail, head):
    frames = []
    for k in range(JOIN):
        t = (k + 0.5) / JOIN
        u = min(max((t - 0.3) / 0.4, 0.0), 1.0)
        w = u * u * (3 - 2 * u)                 # crossfade only in the blurred middle, so it never reads as a double exposure
        peak = np.sin(np.pi * t)                # blur peaks at the cut
        a = zoom(tail[k], 1 + PUSH * t, BLUR * peak)
        b = zoom(head[k], 1 + PUSH * (1 - t), BLUR * peak)
        b = b * w + match_colour(b, a) * (1 - w)  # the incoming grade eases from matched to its own
        frames.append((a * (1 - w) + b * w).clip(0, 255).astype(np.uint8))
    return frames


def ramp(seg):
    """Speed-ramps one hop between two stops so the camera eases out, flies at full speed, and eases in.

    Measures how much the picture moves per frame, then resamples so the motion follows an ease-in-out profile:
    stalls (the model hovering) are skipped and bursts are spread out. First and last frames are kept exactly.
    """
    n = len(seg)
    small = [f[::4, ::4].mean(axis=2).astype(np.float32) for f in seg]
    d = np.array([np.abs(small[i + 1] - small[i]).mean() for i in range(n - 1)])
    d = np.convolve(d, np.ones(5) / 5, mode='same')
    d = np.maximum(d, np.median(d) * 0.15) ** RAMP_POWER
    cumulative = np.concatenate([[0.0], np.cumsum(d)])
    t = np.linspace(0, 1, n)
    eased = RAMP_FLOOR * t + (1 - RAMP_FLOOR) * (t - np.sin(2 * np.pi * t) / (2 * np.pi))
    positions = np.interp(eased * cumulative[-1], cumulative, np.arange(n))
    out = []
    for p in positions:
        i = min(int(p), n - 2)
        f = p - i
        out.append(seg[i] if f < 1e-3 else (seg[i].astype(np.float32) * (1 - f) + seg[i + 1].astype(np.float32) * f).astype(np.uint8))
    out[0], out[-1] = seg[0], seg[-1]
    return out


def main():
    route = json.load(open(os.path.join(here, sys.argv[1]), encoding='utf8'))
    clips = [frames_of(os.path.join(OUT, 'stops', f"{s['id']}_stop.mp4")) for s in route]
    film, stops = [], []
    for i, clip in enumerate(clips):
        body = clip[JOIN:] if i > 0 else clip
        if i < len(clips) - 1:
            body = body[:-JOIN]
        stop_in_clip = 80  # arrival length - 1
        stops.append({'id': route[i]['id'], 'frame': len(film) + stop_in_clip - (JOIN if i > 0 else 0)})
        film.extend(body)
        if i < len(clips) - 1:
            film.extend(join(clip[-JOIN:], clips[i + 1][:JOIN]))
            print(f'joined {route[i]["id"]} -> {route[i + 1]["id"]}', flush=True)

    marks = [0] + [s['frame'] for s in stops]
    for a, b in zip(marks, marks[1:]):
        film[a:b + 1] = ramp(film[a:b + 1])
    print('speed-ramped', len(marks) - 1, 'hops', flush=True)

    h, w = film[0].shape[:2]
    path = os.path.join(OUT, 'flight_v2.mp4')
    container = av.open(path, mode='w')
    stream = container.add_stream('libx264', rate=30)
    stream.width, stream.height, stream.pix_fmt = w, h, 'yuv420p'
    stream.options = {'crf': '16', 'preset': 'slow'}
    for f in film:
        for packet in stream.encode(av.VideoFrame.from_ndarray(f, format='rgb24')):
            container.mux(packet)
    for packet in stream.encode():
        container.mux(packet)
    container.close()
    json.dump({'fps': 30, 'frames': len(film), 'stops': stops}, open(os.path.join(OUT, 'flight_v2.json'), 'w'), indent=2)
    print(f'FILM {path} {len(film)} frames ({len(film) / 30:.1f}s); stops at {[s["frame"] for s in stops]}', flush=True)


if __name__ == '__main__':
    main()
