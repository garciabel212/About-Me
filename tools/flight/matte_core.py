"""Occlusion matte math: 1 where buildings and foreground stand, 0 over sky and water.

The landing draws each frame cut to its matte over the light path, so the light passes behind buildings.
"""
import cv2
import numpy as np


def from_probs(probs, clear_ids):
    """Per-pixel class probabilities (C, H, W) to a soft matte: 1 - P(any clear class)."""
    return np.clip(1.0 - probs[clear_ids].sum(axis=0), 0.0, 1.0).astype(np.float32)


def from_occluders(probs, occluder_ids):
    """Per-pixel class probabilities (C, H, W) to a soft matte: P(any upright occluder class).

    Ground (sand, shoreline, roads, grass) is not an occluder: the light runs over it, not behind it."""
    return np.clip(probs[occluder_ids].sum(axis=0), 0.0, 1.0).astype(np.float32)


def smooth(mattes, stops):
    """Averages each matte with its neighbours (0.25 / 0.5 / 0.25) so edges don't flicker in flight.

    Stop frames and the two ends keep their own matte: the film holds on a stop, and a neighbour's
    matte would ghost there.
    """
    keep = set(stops) | {0, len(mattes) - 1}
    return [m if i in keep else 0.25 * mattes[i - 1] + 0.5 * m + 0.25 * mattes[i + 1] for i, m in enumerate(mattes)]


def drop_specks(m, min_frac=0.001):
    """Removes foreground islands smaller than min_frac of the frame."""
    n, labels, stats, _ = cv2.connectedComponentsWithStats((m > 0.5).astype(np.uint8))
    small = [i for i in range(1, n) if stats[i, cv2.CC_STAT_AREA] < m.size * min_frac]
    out = m.copy()
    out[np.isin(labels, small)] = 0
    return out


def feather(m, px=1):
    return cv2.GaussianBlur(m, (0, 0), px)


def to_alpha8(m):
    return (np.clip(m, 0.0, 1.0) * 255 + 0.5).astype(np.uint8)
