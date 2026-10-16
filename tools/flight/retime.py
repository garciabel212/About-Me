"""Exact-length speed ramp for one hop of the flight.

The v3 film has fixed stop frames (site frame i = master frame 2i), so every hop is resampled to an exact
length with the v2 profile: ease out of the stop, full speed, ease into the next. Stalls (the model hovering)
are skipped and bursts spread out. First and last frames are kept exactly.
"""
import numpy as np

MASTER_STOPS = [80, 228, 378, 528, 676, 824]
MASTER_FRAMES = 825

RAMP_POWER = 0.6   # <1 softens motion equalising (close walls change pixels fast even at normal speed)
RAMP_FLOOR = 0.4   # speed at a stop, as a fraction of the hop's average (1 = no easing)
STALL_FLOOR = 0.03  # a stall still costs this fraction of the median motion (v2 used 0.15, which played a full stall as ~6 frozen frames)


def retime(seg, n):
    m = len(seg)
    small = [f[::4, ::4].mean(axis=2).astype(np.float32) for f in seg]
    d = np.array([np.abs(small[i + 1] - small[i]).mean() for i in range(m - 1)])
    # A median (not v2's box filter) evens out noise without smearing motion into a stall's edges,
    # which left the camera frozen for several frames where a stall met real motion.
    padded = np.pad(d, 2, mode='edge')
    d = np.array([np.median(padded[i:i + 5]) for i in range(m - 1)])
    d = np.maximum(d, max(np.median(d), 1e-6) * STALL_FLOOR) ** RAMP_POWER
    cumulative = np.concatenate([[0.0], np.cumsum(d)])
    t = np.linspace(0, 1, n)
    eased = RAMP_FLOOR * t + (1 - RAMP_FLOOR) * (t - np.sin(2 * np.pi * t) / (2 * np.pi))
    positions = np.interp(eased * cumulative[-1], cumulative, np.arange(m))
    out = []
    for p in positions:
        i = min(int(p), m - 2)
        f = p - i
        out.append(seg[i] if f < 1e-3 else (seg[i].astype(np.float32) * (1 - f) + seg[i + 1].astype(np.float32) * f).astype(np.uint8))
    out[0], out[-1] = seg[0], seg[-1]
    return out
