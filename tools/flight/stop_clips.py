"""Builds the arrival and departure clips for one info stop of flight v2.

Arrival: LTX-2.5 animates the camera pulling back from the stop still; played in reverse, the camera flies in
and settles exactly on the composed stop frame (the pull-back starts from rest, so the arrival eases in).
Departure: a forward burst from the same still. Both share the stop frame, so the hover between them is seamless.

Usage (embedded Python):
  python stop_clips.py <stop_id> <still_in_input> "<arrive prompt>" "<depart prompt>"
Writes ComfyUI/output/video/flight/stops/<stop_id>_stop.mp4 (arrival reversed + departure) and prints the
frame index of the stop frame.
"""
import os
import sys

import av

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # the embedded Python doesn't add the script's folder
from heal_chain import COMFY, frames_of, run, video_graph  # noqa: E402

# Gentle wording barely moves the camera; the pull-back must be fast so the reversed arrival reads as a fly-in.
PULL_BACK = ('Use the provided image as the first frame. FPV drone footage: the camera accelerates and flies fast '
             'backward and upward away from the scene, everything rapidly shrinks into the distance as the view opens '
             'up wide, strong parallax, motion blur, no cuts, calm still water, crisp clean architecture. ')
FORWARD = ('Use the provided image as the first frame. The camera starts gently and accelerates smoothly forward, '
           'stabilized FPV flight, no cuts, crisp clean architecture with straight edges, realistic reflections. ')


def clip(still, prompt, seed, prefix):
    out = run(video_graph(still, prompt, seed, prefix))
    vid = next(v for o in out.values() for v in o.get('images', []) + o.get('videos', []) + o.get('gifs', []))
    return frames_of(os.path.join(COMFY, 'output', vid.get('subfolder', ''), vid['filename']))


def main():
    stop_id, still, arrive, depart = sys.argv[1:5]   # pass '-' to skip the departure (last stop)
    seed = int(sys.argv[5]) if len(sys.argv) > 5 else 7100  # a new seed re-rolls a messy arrival
    pull = sys.argv[6] if len(sys.argv) > 6 else PULL_BACK  # per-stop pull-back wording (open water needs its own)
    arrival = clip(still, pull + arrive, seed, f'video/flight/stops/{stop_id}_pullback')[::-1]
    departure = clip(still, FORWARD + depart, 7200, f'video/flight/stops/{stop_id}_depart') if depart != '-' else [arrival[-1]]
    frames = arrival + departure[1:]  # both clips start on the stop still; keep it once
    h, w = frames[0].shape[:2]
    path = os.path.join(COMFY, 'output', 'video', 'flight', 'stops', f'{stop_id}_stop.mp4')
    container = av.open(path, mode='w')
    stream = container.add_stream('libx264', rate=30)
    stream.width, stream.height, stream.pix_fmt = w, h, 'yuv420p'
    stream.options = {'crf': '16', 'preset': 'slow'}
    for f in frames:
        for packet in stream.encode(av.VideoFrame.from_ndarray(f, format='rgb24')):
            container.mux(packet)
    for packet in stream.encode():
        container.mux(packet)
    container.close()
    print(f'STOP_CLIP {path} {len(frames)} frames, stop frame {len(arrival) - 1}', flush=True)


if __name__ == '__main__':
    main()
