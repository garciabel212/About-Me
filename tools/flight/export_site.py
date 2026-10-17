"""Exports flight v3 into the site: HD, desktop and phone frame sets, the occlusion mattes, and src/flight/flightData.ts.

Usage (ComfyUI embedded Python): python export_site.py <repo_root>
Reads ComfyUI/output/video/flight/hd_master (every second master frame = one site frame), matte_master,
flight_v3.json and tools/flight/pins.json. Every set is cut from the same HD master, so frames and mattes line up.
Phone frames are a PHONE_W-wide crop (at desktop scale) around the landmark, interpolated between stops.
Refuses to write anything if a check fails: frame counts, stop frames, a building behind a stop's text, or a
sky that brightens from one stop to the next.
"""
import json
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # the embedded Python doesn't add the script's folder
from heal_chain import COMFY  # noqa: E402
from retime import MASTER_FRAMES, MASTER_STOPS  # noqa: E402
from zones import check_light_forward, sky_level, zone_coverage  # noqa: E402

STRIDE = 2
HD = (1920, 1056)
DESKTOP = (1280, 704)
PHONE_W = 420
MATTE = (960, 528)
PHONE_MATTE_W = 315  # PHONE_W at matte scale (0.75)
SITE_STOPS = [40, 114, 189, 264, 338, 412]
MAX_ZONE_COVERAGE = 0.15  # distant horizon structures cross full-height text columns; a near tower is far above this
QUALITY = {'hd': 78, 'desktop': 72, 'phone': 74}

here = os.path.dirname(os.path.abspath(__file__))
FLIGHT = os.path.join(COMFY, 'output', 'video', 'flight')


def focal_x(i, stops):
    if i <= stops[0]['frame']:
        return stops[0]['x']
    for a, b in zip(stops, stops[1:]):
        if i <= b['frame']:
            t = (i - a['frame']) / (b['frame'] - a['frame'])
            return a['x'] + (b['x'] - a['x']) * t
    return stops[-1]['x']


def fail(msg):
    sys.exit(f'EXPORT REFUSED: {msg}')


def main():
    root = sys.argv[1]
    meta = json.load(open(os.path.join(FLIGHT, 'flight_v3.json')))
    pins = json.load(open(os.path.join(here, 'pins.json'), encoding='utf8'))
    stops = [{'id': pins[s['id']]['key'], 'frame': s['frame'] // STRIDE, 'x': pins[s['id']]['x'], 'y': pins[s['id']]['y'],
              'place': pins[s['id']]['place'], 'coords': pins[s['id']]['coords']} for s in meta['stops']]

    # Checks first: nothing is written unless the film and mattes are what the landing expects.
    if meta['frames'] != MASTER_FRAMES or [s['frame'] for s in meta['stops']] != MASTER_STOPS:
        fail(f"master is {meta['frames']} frames with stops {[s['frame'] for s in meta['stops']]}")
    if [s['frame'] for s in stops] != SITE_STOPS:
        fail(f'site stops {[s["frame"] for s in stops]}')
    n = MASTER_FRAMES // STRIDE + 1
    hd_paths = [os.path.join(FLIGHT, 'hd_master', f'f{i * STRIDE:04d}.png') for i in range(n)]
    matte_paths = [os.path.join(FLIGHT, 'matte_master', f'f{i:03d}.png') for i in range(n)]
    missing = [p for p in hd_paths + matte_paths if not os.path.exists(p)]
    if missing:
        fail(f'{len(missing)} missing inputs, first {missing[0]}')
    levels = []
    for s in stops:
        rgb = np.asarray(Image.open(hd_paths[s['frame']]).convert('RGB'))
        m = np.asarray(Image.open(matte_paths[s['frame']]))
        if rgb.shape[1::-1] != HD or m.shape[::-1] != HD:
            fail(f"{s['id']}: frame {rgb.shape[1::-1]} / matte {m.shape[::-1]}, expected {HD}")
        cover = zone_coverage(m, s['id'])
        if cover >= MAX_ZONE_COVERAGE:
            fail(f"{s['id']}: buildings cover {cover * 100:.1f}% of its text zone (limit {MAX_ZONE_COVERAGE * 100:.0f}%)")
        levels.append(sky_level(rgb, m))
    if not check_light_forward(levels):
        fail(f'the sky brightens between stops: {[round(v, 1) for v in levels]}')

    dirs = {k: os.path.join(root, 'public', 'flight', *k.split('/')) for k in ('hd', 'desktop', 'phone', 'matte/wide', 'matte/phone')}
    for d in dirs.values():
        os.makedirs(d, exist_ok=True)
        for old in os.listdir(d):
            os.remove(os.path.join(d, old))

    crops = []
    for i, (fp, mp) in enumerate(zip(hd_paths, matte_paths)):
        hd = Image.open(fp).convert('RGB')
        hd.save(os.path.join(dirs['hd'], f'f{i:03d}.webp'), quality=QUALITY['hd'], method=6)
        desk = hd.resize(DESKTOP, Image.LANCZOS)
        desk.save(os.path.join(dirs['desktop'], f'f{i:03d}.webp'), quality=QUALITY['desktop'], method=6)
        left = int(min(max(focal_x(i, stops) * DESKTOP[0] - PHONE_W / 2, 0), DESKTOP[0] - PHONE_W))
        desk.crop((left, 0, left + PHONE_W, DESKTOP[1])).save(os.path.join(dirs['phone'], f'f{i:03d}.webp'), quality=QUALITY['phone'], method=6)
        crops.append(left)
        alpha = Image.open(mp).convert('L').resize(MATTE, Image.LANCZOS)
        matte = Image.merge('RGBA', (*Image.new('RGB', MATTE, (255, 255, 255)).split(), alpha))
        matte.save(os.path.join(dirs['matte/wide'], f'f{i:03d}.webp'), quality=80, alpha_quality=80, method=6)
        ml = round(left * MATTE[0] / DESKTOP[0])
        matte.crop((ml, 0, ml + PHONE_MATTE_W, MATTE[1])).save(os.path.join(dirs['matte/phone'], f'f{i:03d}.webp'), quality=80, alpha_quality=80, method=6)

    for s in stops:
        s['phoneX'] = round((s['x'] * DESKTOP[0] - crops[s['frame']]) / PHONE_W, 4)

    data = {'frames': n, 'width': DESKTOP[0], 'height': DESKTOP[1], 'phoneWidth': PHONE_W, 'hdWidth': HD[0], 'hdHeight': HD[1],
            'matteWidth': MATTE[0], 'matteHeight': MATTE[1], 'phoneMatteWidth': PHONE_MATTE_W, 'stops': stops}
    ts = (
        '// GENERATED by tools/flight/export_site.py from flight_v3 and tools/flight/pins.json. Do not edit.\n'
        "export type StopId = 'river' | 'brickell' | 'downtown' | 'bay' | 'beach' | 'sunset';\n\n"
        'export interface FlightStop {\n  id: StopId;\n  frame: number;\n  x: number;\n  y: number;\n'
        '  phoneX: number;\n  place: string;\n  coords: string;\n}\n\n'
        'export const flight: {\n  frames: number;\n  width: number;\n  height: number;\n  phoneWidth: number;\n'
        '  hdWidth: number;\n  hdHeight: number;\n  matteWidth: number;\n  matteHeight: number;\n  phoneMatteWidth: number;\n'
        '  stops: FlightStop[];\n} = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n'
    )
    open(os.path.join(root, 'src', 'flight', 'flightData.ts'), 'w', encoding='utf8').write(ts)
    sizes = {k: sum(os.path.getsize(os.path.join(d, f)) for f in os.listdir(d)) / 1e6 for k, d in dirs.items()}
    print(f'EXPORTED {n} frames: ' + ', '.join(f'{k} {v:.1f} MB' for k, v in sizes.items()) + f'; stops {SITE_STOPS}')
    print('sky levels at stops', [round(v, 1) for v in levels])


if __name__ == '__main__':
    main()
