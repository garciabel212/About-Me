"""Generates candidate stills for the 6 info stops of flight v2 (dusk look, negative space for the cards).

Every stop puts its landmark in the right third and leaves the left ~40% calm, so the site can pin the
landmark and unfold a card on the left. The last stop is centred with calm water below for the contact card.

Usage: python make_stops.py [stop_id ...]   (no args = all stops)
Outputs land in ComfyUI/output/keyframes/stops/<stop>_<seed>.png
"""
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # the embedded Python doesn't add the script's folder
from make_keyframes import SEEDS, graph, submit, wait  # noqa: E402

LOOK = (
    'Photorealistic aerial cinematography still, point-of-view from a camera hovering in the air, 24mm lens, '
    'crisp architectural detail, clean straight building edges, warm lit windows, dusk color grade with deep '
    'purple, magenta and orange tones, rich contrast with deep shadows, no aircraft in the sky, no drone, '
    'no people in focus, no text, no watermark.'
)
SPACE = (
    ' Composition: the main subject sits in the right third of the frame; the left 40 percent of the frame is '
    'calm, uncluttered negative space of soft dusk sky and dark water. '
)

STOPS = {
    's1_river': (
        'Hovering a few meters above the calm Miami River at dusk, looking down the river toward the Brickell '
        'skyline, modern glass residential towers with warm lit windows rise along the right bank, a low distant '
        'skyline on the left horizon, the last orange sunset glow on the horizon, purple sky with pink clouds, '
        'long glowing reflections on the dark water.' + SPACE + LOOK
    ),
    's2_towers': (
        'Hovering at mid-height beside a tall modern glass residential tower in Brickell at dusk, the tower fills '
        'the right edge of the frame with warm lit windows and curved white balconies, beyond it the city skyline '
        'glows and the orange sun sits low on the horizon, deep purple sky.' + SPACE + LOOK
    ),
    # v3 (2026-10-09): the desktop card sat on a busy lit city grid; the left side is now open sky over dark water.
    's3_canyon': (
        'Hovering high above downtown Miami at dusk, a cluster of tall office towers with lit windows rises on the '
        'right, a glowing boulevard with palm trees and light trails runs between them far below on the right, '
        'the left half of the frame looks out over the dark, almost unlit bay under a wide soft violet sky with '
        'the orange sunset glow low on the horizon.' + SPACE + LOOK
    ),
    's4_bay': (
        'Hovering 60 meters above calm Biscayne Bay at dusk, looking across dark glassy water toward the lights of '
        'a long causeway bridge and a small island skyline on the right, a few anchored sailboats with tiny lights, '
        'soft pink and violet sky with the last orange glow on the horizon.' + SPACE + LOOK
    ),
    # v3 (2026-10-09): the phone bottom sheet covered the lifeguard tower; it now sits high, above smooth sand.
    's5_palms': (
        'Low aerial view at dusk of a wide empty white sand beach in Miami Beach, a pastel pink lifeguard tower with '
        'a warm light stands raised in the upper right of the frame with tall palm silhouettes behind it, the calm '
        'ocean on the left, pink, orange and violet sky. Composition: the lifeguard tower and the palms sit in the '
        'upper half of the frame on the right; the lower half of the frame is smooth, empty, softly lit sand; the '
        'left 40 percent is calm ocean and soft dusk sky. ' + LOOK
    ),
    # v3 (2026-10-09): horizon raised so the phone bottom sheet leaves the sun and its light path visible.
    's6_sunset': (
        'Hovering low over the calm open ocean at sunset, the sun touching the horizon in the center of the frame, '
        'a glowing orange path of light on the water leading toward the camera, soft pink and violet clouds, '
        'serene and minimal. Composition: the horizon sits high, one third from the top of the frame, the sun is '
        'centered on it, the lower two thirds are calm dark water, uncluttered, open sky above. ' + LOOK
    ),
}

if __name__ == '__main__':
    for stop in sys.argv[1:] or STOPS:
        for seed in SEEDS:
            t = time.time()
            name = wait(submit(graph(STOPS[stop], seed, f'keyframes/stops/{stop}_{seed}')))
            print(f'{stop} seed {seed} -> {name} ({time.time() - t:.0f}s)', flush=True)
    print('ALL_DONE', flush=True)
