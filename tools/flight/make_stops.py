"""Generates candidate stills for the 6 info stops of flight v2 (dusk look, negative space for the cards).

Every stop puts its landmark in the right third and leaves the left ~40% calm, so the site can pin the
landmark and unfold a card on the left, the last stop included.

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
    # v4 (2026-10-10): Miami Beach faces east, so an evening shot over the ocean has no sun in it. Light only moves
    # forward after stop 1 (afterglow, twilight, blue hour): blue hour, peach afterglow behind the palms to the west.
    # The words "sun" and "sunset" are kept out of the prompt; the model paints a sun disk when it sees them.
    's5_palms': (
        'Low aerial view of a wide empty white sand beach in Miami Beach in the blue hour, the sky already '
        'darkening, looking north along the shore. A pastel pink lifeguard tower with a warm glowing light '
        'stands raised in the upper right of the frame, tall palm silhouettes behind it on the right against '
        'a faint peach afterglow low in the western sky. The calm Atlantic Ocean on the left lies under a cool '
        'deep blue and violet sky with a soft pink band just above the sea horizon. Composition: the lifeguard '
        'tower and the palms sit in the upper half of the frame on the right; the lower half of the frame is '
        'smooth, empty sand softly lit by the tower light; the left 40 percent is calm ocean and soft cool '
        'twilight sky. ' + LOOK
    ),
    # v3 (2026-10-09): horizon raised so the phone bottom sheet leaves the sun and its light path visible.
    # v4 (2026-10-10): the old ocean sunset was really a sunrise (the ocean is east). The flight now ends on the
    # bayside of Miami Beach (Sunset Harbour) looking west at the downtown skyline in the deep blue hour, with
    # only a thin afterglow behind the towers. Id kept as s6_sunset so file names and site code don't change.
    's6_sunset': (
        'Hovering low over the calm dark water of Biscayne Bay just off the bayside shore of Miami Beach in '
        'the deep blue hour, looking west across the bay at the downtown Miami and Brickell skyline. A dense '
        'cluster of tall towers with warm lit windows rises on the right side of the horizon, long glowing '
        'reflections of the city lights stretch across the glassy water toward the camera, a low causeway '
        'with a string of lights crosses the water in the middle distance, and a thin band of ember-orange '
        'afterglow lies low on the horizon behind the towers, fading up into deep violet and blue sky. '
        'Composition: the waterline sits about 40 percent from the top of the frame with the towers rising '
        'above it on the right; the lower half of the frame is calm dark water with the reflections; the left '
        '40 percent is open water and soft twilight sky, uncluttered. ' + LOOK
    ),
}

if __name__ == '__main__':
    for stop in sys.argv[1:] or STOPS:
        for seed in SEEDS:
            t = time.time()
            name = wait(submit(graph(STOPS[stop], seed, f'keyframes/stops/{stop}_{seed}')))
            print(f'{stop} seed {seed} -> {name} ({time.time() - t:.0f}s)', flush=True)
    print('ALL_DONE', flush=True)
