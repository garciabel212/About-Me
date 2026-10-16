"""Unit tests for the flight v3 helpers.

Run: python -I -m unittest discover -s tools/flight -p "test_v3.py" -v
"""
import os
import sys
import unittest

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import matte_core  # noqa: E402
import retime  # noqa: E402
import zones  # noqa: E402


def flat(value, size=16):
    return np.full((size, size, 3), value, np.uint8)


class Zones(unittest.TestCase):
    def test_zone_px_downtown(self):
        self.assertEqual(zones.zone_px('downtown', 1920, 1056), (586, 0, 1334, 1056))

    def test_zone_coverage(self):
        m = np.zeros((100, 100), np.uint8)
        m[:, :50] = 255
        self.assertAlmostEqual(zones.zone_coverage(m, 'beach'), 1.0)
        self.assertEqual(zones.zone_coverage(m, 'bay'), 0.0)

    def test_light_forward(self):
        self.assertTrue(zones.check_light_forward([90, 80, 81, 60]))
        self.assertFalse(zones.check_light_forward([90, 80, 85]))


class Retime(unittest.TestCase):
    def test_retime_length_and_ends(self):
        seg = [flat(i * 5) for i in range(40)]
        out = retime.retime(seg, 75)
        self.assertEqual(len(out), 75)
        self.assertTrue(np.array_equal(out[0], seg[0]))
        self.assertTrue(np.array_equal(out[-1], seg[-1]))

    def test_retime_stall_skipped(self):
        seg = [flat(i * 5) for i in range(10)] + [flat(50)] * 20 + [flat(55 + i * 5) for i in range(10)]
        out = retime.retime(seg, 40)
        run = longest = 1
        for a, b in zip(out, out[1:]):
            run = run + 1 if np.array_equal(a, b) else 1
            longest = max(longest, run)
        self.assertLess(longest, 5)


class Matte(unittest.TestCase):
    def test_from_probs(self):
        probs = np.zeros((3, 2, 2), np.float32)
        probs[0], probs[1], probs[2] = 0.7, 0.2, 0.1
        np.testing.assert_allclose(matte_core.from_probs(probs, [0, 1]), 0.1, atol=1e-6)

    def test_stops_unsmoothed(self):
        mattes = [np.full((4, 4), v, np.float32) for v in (0, 1, 0, 1, 0)]
        out = matte_core.smooth(mattes, stops=[2])
        np.testing.assert_allclose(out[2], 0.0)
        np.testing.assert_allclose(out[1], 0.5)

    def test_drop_specks(self):
        m = np.zeros((100, 100), np.float32)
        m[5:8, 5:8] = 1
        m[50:70, 50:70] = 1
        out = matte_core.drop_specks(m)
        self.assertEqual(out[6, 6], 0)
        self.assertEqual(out[60, 60], 1)


if __name__ == '__main__':
    unittest.main()
