"""Renders the arrival + departure clip for every stop in a route file (skips ids given with --skip).

Usage: python render_stops.py stops_v2.json [--skip s2_towers,...]
"""
import json
import os
import subprocess
import sys

here = os.path.dirname(os.path.abspath(__file__))
route = json.load(open(os.path.join(here, sys.argv[1]), encoding='utf8'))
only = set(sys.argv[sys.argv.index('--only') + 1].split(',')) if '--only' in sys.argv else None
skip = set(sys.argv[sys.argv.index('--skip') + 1].split(',')) if '--skip' in sys.argv else set()
for stop in route:
    if stop['id'] in skip or (only and stop['id'] not in only):
        continue
    print(f"rendering {stop['id']}", flush=True)
    subprocess.run([sys.executable, os.path.join(here, 'stop_clips.py'), stop['id'], f"flight/stops/{stop['id']}.png",
                    stop['arrive'], stop['depart'], str(stop.get('seed', 7100)), *([stop['pullback']] if 'pullback' in stop else [])],
                   check=True)
print('ALL_STOPS_DONE', flush=True)
