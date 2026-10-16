"""Building cut-outs for the light path: one per flight stop.

The light passes BEHIND these: each cut-out is the stop frame itself with
alpha only where buildings stand, laid over the light while the camera holds
at that stop. Depth Anything V2 Small (Apache-2.0) marks what is near; near pixels above
the stop's waterline count as buildings (clouds and far water are far), and water
below the waterline is left clear so the light never dips "behind" the bay.

Usage (ComfyUI embedded Python): python occluders.py <repo_root> [--preview]
Writes public/flight/occluders/{desktop,phone}/<stop>.webp
(--preview also writes .impeccable/review/occ-<stop>.png overlays)
"""
import json, os, re, sys
import cv2
import numpy as np

root = sys.argv[1]
preview = '--preview' in sys.argv

# Waterline per stop (fraction of frame height): water below it is not an occluder.
# Read off the stop frames; Brickell's tower runs to the frame bottom on its own columns.
WATERLINE = {'river': 0.66, 'brickell': 0.64, 'downtown': 0.86, 'bay': 0.6, 'beach': 0.56, 'sunset': 0.62}
# Stops where structures stand in front of the water down to the frame bottom (no waterline cut).
FULL_HEIGHT = {'brickell', 'downtown'}

data_ts = open(os.path.join(root, 'src', 'flight', 'flightData.ts'), encoding='utf8').read()
flight = json.loads(data_ts[data_ts.index('= {') + 2:].rstrip().rstrip(';'))
W, H, PW = flight['width'], flight['height'], flight['phoneWidth']


_depth = None


def depth_of(img):
    """Relative closeness (0 far .. 1 near) from Depth Anything V2 Small, resized to the frame."""
    global _depth
    if _depth is None:
        from transformers import pipeline
        _depth = pipeline('depth-estimation', model='depth-anything/Depth-Anything-V2-Small-hf', device=0)
    from PIL import Image
    out = _depth(Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB)))['predicted_depth']
    d = out.squeeze().float().cpu().numpy()
    d = cv2.resize(d, (W, H), interpolation=cv2.INTER_CUBIC)
    return (d - d.min()) / max(1e-6, d.max() - d.min())


def mask_for(img, stop_id):
    """Buildings: near AND upright. Depth Anything returns relative disparity, which on a flat
    plane (water, streets, sand) rises steadily down the frame, while on an upright facade it
    barely changes down a column. So a pixel is an occluder when it sits in the near part of the
    scene above the waterline (Otsu) and its vertical disparity gradient is well below the plane's."""
    d = depth_of(img)
    wl = int(WATERLINE[stop_id] * H)
    ds = cv2.GaussianBlur(d.astype(np.float32), (9, 9), 0)
    gy = cv2.Sobel(ds, cv2.CV_32F, 0, 1, ksize=5) / 32.0  # disparity change per row, down the frame
    plane = float(np.percentile(gy[int(H * 0.88):], 75))  # the bottom of every stop is water or ground
    upright = gy < plane * 0.35
    above = d[:wl]
    d8 = (np.clip((d - above.min()) / max(1e-6, above.max() - above.min()), 0, 1) * 255).astype(np.uint8)
    t, _ = cv2.threshold(d8[:wl], 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    near = (d8 > t) & upright
    if stop_id not in FULL_HEIGHT:
        near[wl:, :] = False
    m = near.astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    n, labels, stats, _ = cv2.connectedComponentsWithStats(m)
    keep = np.zeros_like(m)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] > W * H * 0.004:
            keep[labels == i] = 255
    return cv2.GaussianBlur(keep, (5, 5), 0)  # soft 2px edge so the light fades, not clips


for stop in flight['stops']:
    sid, f = stop['id'], stop['frame']
    src = os.path.join(root, 'public', 'flight', 'desktop', f'f{f:03d}.webp')
    img = cv2.imread(src, cv2.IMREAD_COLOR)
    m = mask_for(img, sid)
    rgba = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
    rgba[:, :, 3] = m
    for kind in ('desktop', 'phone'):
        os.makedirs(os.path.join(root, 'public', 'flight', 'occluders', kind), exist_ok=True)
    cv2.imwrite(os.path.join(root, 'public', 'flight', 'occluders', 'desktop', f'{sid}.webp'), rgba, [cv2.IMWRITE_WEBP_QUALITY, 80])
    left = int(round(stop['x'] * W - stop['phoneX'] * PW))
    left = max(0, min(W - PW, left))
    cv2.imwrite(os.path.join(root, 'public', 'flight', 'occluders', 'phone', f'{sid}.webp'), rgba[:, left:left + PW], [cv2.IMWRITE_WEBP_QUALITY, 80])
    if preview:
        over = img.copy()
        over[m > 128] = (0.45 * over[m > 128] + 0.55 * np.array([60, 60, 255])).astype(np.uint8)
        cv2.imwrite(os.path.join(root, '.impeccable', 'review', f'occ-{sid}.png'), over)
    print(sid, 'occluder coverage', round(float((m > 128).mean()) * 100, 1), '%')
