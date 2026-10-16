"""Exposure grade that keeps dusk moving forward: each stop's sky is no brighter than the stop before.

The still model ignores the timeline (its Bay sky came out brighter than River's), so each chosen still is
darkened in linear light toward a target sky level, never by more than FLOOR (the owner's cap: x0.6), so lit
windows keep their glow.
"""
import numpy as np

from zones import sky_level

FLOOR = 0.6


def _apply(lin, k):
    return (np.clip(lin * k, 0.0, 1.0) ** (1 / 2.2) * 255 + 0.5).astype(np.uint8)


def grade_to(rgb, target, floor=FLOOR):
    """Returns (graded uint8 RGB, gain k). k is in [floor, 1]; never brightens."""
    clear = np.zeros(rgb.shape[:2], np.uint8)
    if sky_level(rgb, clear) <= target:
        return rgb, 1.0
    lin = (rgb.astype(np.float32) / 255.0) ** 2.2
    if sky_level(_apply(lin, floor), clear) >= target:
        return _apply(lin, floor), floor
    lo, hi = floor, 1.0
    for _ in range(30):
        k = (lo + hi) / 2
        if sky_level(_apply(lin, k), clear) < target:
            lo = k
        else:
            hi = k
    return _apply(lin, hi), hi
