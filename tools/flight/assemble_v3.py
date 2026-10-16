"""Assembles flight v3: six stop clips joined as in v2, then every hop retimed so the stops land on fixed frames.

The site takes every second frame and its stops sit at 40, 114, 189, 264, 338 and 412, so the master film is
825 frames with stops at retime.MASTER_STOPS. Joins (push-in under a radial blur, colour matched) come from v2.

Usage: python assemble_v3.py stops_v3.json
Writes ComfyUI/output/video/flight/flight_v3.mp4 and flight_v3.json (the frame index of every stop).
"""
import json
import os
import sys

import av

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # the embedded Python doesn't add the script's folder
from retime import MASTER_FRAMES, MASTER_STOPS, retime  # noqa: E402

here = os.path.dirname(os.path.abspath(__file__))
STOP_IN_CLIP = 80  # arrival length - 1: the stop frame's index in each stop clip


def place(hops):
    """Retimes hop k (previous stop, or the film's first frame, to stop k, inclusive) so stop k lands on
    MASTER_STOPS[k]. Consecutive hops share their stop frame, which is kept once."""
    film = []
    for k, hop in enumerate(hops):
        start = MASTER_STOPS[k - 1] if k else 0
        seg = retime(hop, MASTER_STOPS[k] - start + 1)
        film.extend(seg if k == 0 else seg[1:])
    assert len(film) == MASTER_FRAMES, len(film)
    return film


def main():
    from assemble_v2 import JOIN, OUT, join
    from heal_chain import frames_of

    route = json.load(open(os.path.join(here, sys.argv[1]), encoding='utf8'))
    clips = [frames_of(os.path.join(OUT, 'stops', f"{s['id']}_stop.mp4")) for s in route]
    film, marks = [], []
    for i, clip in enumerate(clips):
        body = clip[JOIN:] if i > 0 else clip
        if i < len(clips) - 1:
            body = body[:-JOIN]
        marks.append(len(film) + STOP_IN_CLIP - (JOIN if i > 0 else 0))
        film.extend(body)
        if i < len(clips) - 1:
            film.extend(join(clip[-JOIN:], clips[i + 1][:JOIN]))
            print(f'joined {route[i]["id"]} -> {route[i + 1]["id"]}', flush=True)

    bounds = [0] + marks
    film = place([film[a:b + 1] for a, b in zip(bounds, bounds[1:])])
    print('placed', len(film), 'frames; stops', MASTER_STOPS, flush=True)

    h, w = film[0].shape[:2]
    container = av.open(os.path.join(OUT, 'flight_v3.mp4'), mode='w')
    stream = container.add_stream('libx264', rate=30)
    stream.width, stream.height, stream.pix_fmt = w, h, 'yuv420p'
    stream.options = {'crf': '16', 'preset': 'slow'}
    for f in film:
        for packet in stream.encode(av.VideoFrame.from_ndarray(f, format='rgb24')):
            container.mux(packet)
    for packet in stream.encode():
        container.mux(packet)
    container.close()
    stops = [{'id': s['id'], 'frame': f} for s, f in zip(route, MASTER_STOPS)]
    json.dump({'fps': 30, 'frames': len(film), 'stops': stops}, open(os.path.join(OUT, 'flight_v3.json'), 'w'), indent=2)
    print('ASSEMBLED', flush=True)


if __name__ == '__main__':
    main()
