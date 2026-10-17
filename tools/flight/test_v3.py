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
import assemble_v3  # noqa: E402
import grade  # noqa: E402
import upscale_hd  # noqa: E402
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

    def test_from_occluders_ignores_ground(self):
        probs = np.zeros((4, 2, 2), np.float32)
        probs[0], probs[1], probs[2], probs[3] = 0.5, 0.2, 0.2, 0.1  # sand, building, palm, sky
        np.testing.assert_allclose(matte_core.from_occluders(probs, [1, 2]), 0.4, atol=1e-6)

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


class Grade(unittest.TestCase):
    def gray(self, v):
        return np.full((40, 40, 3), v, np.uint8)

    def test_grade_to_hits_target(self):
        out, k = grade.grade_to(self.gray(120), 100)
        self.assertGreaterEqual(k, 0.6)
        self.assertAlmostEqual(zones.sky_level(out, np.zeros((40, 40), np.uint8)), 100, delta=1)

    def test_grade_to_never_stronger_than_floor(self):
        out, k = grade.grade_to(self.gray(120), 30)
        self.assertAlmostEqual(k, 0.6, places=3)
        self.assertGreater(zones.sky_level(out, np.zeros((40, 40), np.uint8)), 30)

    def test_grade_to_never_brightens(self):
        out, k = grade.grade_to(self.gray(120), 200)
        self.assertEqual(k, 1.0)
        self.assertTrue(np.array_equal(out, self.gray(120)))


class Assemble(unittest.TestCase):
    def test_assemble_marks(self):
        lengths = [100, 160, 90, 170, 140, 160]
        hops, prev = [], None
        for k, n in enumerate(lengths):
            seg = [flat((i * 7) % 180) for i in range(n)]
            if prev is not None:
                seg[0] = prev  # consecutive hops share the stop frame between them
            seg[-1] = flat(200 + k)  # each stop frame is marked
            prev = seg[-1]
            hops.append(seg)
        film = assemble_v3.place(hops)
        self.assertEqual(len(film), retime.MASTER_FRAMES)
        for k, f in enumerate(retime.MASTER_STOPS):
            self.assertTrue(np.array_equal(film[f], flat(200 + k)), f'stop {k} at frame {f}')


class Chunks(unittest.TestCase):
    def test_chunks_cover_every_frame_once(self):
        kept = []
        for start, end, skip in upscale_hd.chunks(825, size=99, lead=8):
            self.assertLessEqual(end - start, 99 + 8)
            kept.extend(range(start + skip, end))
        self.assertEqual(kept, list(range(825)))

    def test_chunks_lead_in_except_first(self):
        spans = upscale_hd.chunks(300, size=99, lead=8)
        self.assertEqual(spans[0], (0, 99, 0))
        self.assertEqual(spans[1], (91, 198, 8))

    def test_place_frame_moves_full_size_and_resizes_others(self):
        import tempfile
        from PIL import Image
        with tempfile.TemporaryDirectory() as d:
            ok, off = os.path.join(d, 'ok.png'), os.path.join(d, 'off.png')
            Image.new('RGB', (upscale_hd.W, upscale_hd.H)).save(ok)
            Image.new('RGB', (1918, 1056)).save(off)
            upscale_hd.place_frame(ok, os.path.join(d, 'a.png'))
            upscale_hd.place_frame(off, os.path.join(d, 'b.png'))
            self.assertFalse(os.path.exists(ok))
            with Image.open(os.path.join(d, 'b.png')) as b:
                self.assertEqual(b.size, (upscale_hd.W, upscale_hd.H))


if __name__ == '__main__':
    unittest.main()
