"""Candidate stills for the six flight v3 stops, composed for the light path landing's text zones.

Prompts live in stops_v3.json ("still"); each gets the shared look from make_stops.LOOK.
Usage: python make_stops_v3.py [stop_id ...] [--seeds 5505,6606]   (no ids = all stops; ids like v3_river)
Outputs land in ComfyUI/output/keyframes/stops/<id>_<seed>.png
"""
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # the embedded Python doesn't add the script's folder
from make_keyframes import SEEDS, graph, submit, wait  # noqa: E402
from make_stops import LOOK  # noqa: E402

here = os.path.dirname(os.path.abspath(__file__))
route = {s['id']: s for s in json.load(open(os.path.join(here, 'stops_v3.json'), encoding='utf8'))}

SEED_ARG = '--seeds'

if __name__ == '__main__':
    seeds = [int(x) for x in sys.argv[sys.argv.index(SEED_ARG) + 1].split(',')] if SEED_ARG in sys.argv else SEEDS
    if SEED_ARG in sys.argv:
        i = sys.argv.index(SEED_ARG)
        del sys.argv[i:i + 2]
    for stop in sys.argv[1:] or route:
        for seed in seeds:
            t = time.time()
            name = wait(submit(graph(route[stop]['still'] + ' ' + LOOK, seed, f'keyframes/stops/{stop}_{seed}')))
            print(f'{stop} seed {seed} -> {name} ({time.time() - t:.0f}s)', flush=True)
    print('ALL_DONE', flush=True)
