"""Where each stop's text sits on the film, and the export checks that keep it calm.

Text scrolls while the film holds, so most zones are full-height columns; River (first screen) and
Sunset Harbour (last) are corner boxes. Fractions of the frame: (x0, y0, x1, y1).
"""
import numpy as np

ZONES = {
    'river': (0.57, 0.08, 0.96, 0.55),
    'brickell': (0.04, 0.0, 0.43, 1.0),
    'downtown': (0.305, 0.0, 0.695, 1.0),
    'bay': (0.57, 0.0, 0.96, 1.0),
    'beach': (0.04, 0.0, 0.43, 1.0),
    'sunset': (0.04, 0.45, 0.43, 0.92),
}


def zone_px(stop_id, w, h):
    x0, y0, x1, y1 = ZONES[stop_id]
    return round(x0 * w), round(y0 * h), round(x1 * w), round(y1 * h)


def zone_coverage(matte, stop_id):
    """Share of the stop's text zone covered by foreground (matte > 128)."""
    x0, y0, x1, y1 = zone_px(stop_id, matte.shape[1], matte.shape[0])
    return float((matte[y0:y1, x0:x1] > 128).mean())


def sky_level(frame_rgb, matte):
    """Mean luma of the top 15% of the frame, sky and water only."""
    top = max(1, round(frame_rgb.shape[0] * 0.15))
    rgb = frame_rgb[:top].astype(np.float32)
    luma = 0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]
    clear = matte[:top] < 128
    return float(luma[clear].mean()) if clear.any() else float(luma.mean())


def check_light_forward(levels, slack=2.0):
    """Dusk only darkens: no stop's sky is brighter than the one before (beyond a little slack)."""
    return all(b <= a + slack for a, b in zip(levels, levels[1:]))
