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


def apply_sky_gain(rgb, matte, k):
    """Darkens only sky and water (where the occlusion matte is clear) by gain k in linear light."""
    if k >= 1.0:
        return rgb
    lin = (rgb.astype(np.float32) / 255.0) ** 2.2
    m = matte.astype(np.float32)[..., None] / 255.0
    return _apply(lin * (m + (1 - m) * k), 1.0)


def sky_gain_to(rgb, matte, target, floor=FLOOR):
    """Sky-only gain in [floor, 1] that brings sky_level(rgb, matte) down to target; never brightens."""
    if sky_level(rgb, matte) <= target:
        return 1.0
    if sky_level(apply_sky_gain(rgb, matte, floor), matte) >= target:
        return floor
    lo, hi = floor, 1.0
    for _ in range(30):
        k = (lo + hi) / 2
        if sky_level(apply_sky_gain(rgb, matte, k), matte) < target:
            lo = k
        else:
            hi = k
    return hi


def gain_curve(stop_frames, gains, n):
    """Per-frame gain: each stop's gain held at the stop, eased linearly across the hops, held past the ends."""
    return [float(g) for g in np.interp(np.arange(n), stop_frames, gains)]
