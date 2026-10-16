"""Occlusion matte for every site frame of flight v3: 1 where buildings and foreground stand, 0 over sky and water.

SegFormer-B5 (ADE20K) labels every pixel of the HD master; the matte is 1 - P(sky + water + sea + river + lake),
smoothed across neighbouring frames (stop frames keep their own), cleaned of specks and feathered by 1px.
The landing draws each frame cut to its matte over the light path, so the light passes behind buildings.

Usage: python matte.py
Reads ComfyUI/output/video/flight/hd_master/fNNNN.png (every second master frame = one site frame).
Writes matte_master/fNNN.png (8-bit, 1920x1056) and matte_preview.mp4 (buildings tinted red).
"""
import os
import sys

import av
import numpy as np
import torch
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # the embedded Python doesn't add the script's folder
from heal_chain import COMFY  # noqa: E402
from matte_core import drop_specks, feather, from_probs, smooth, to_alpha8  # noqa: E402
from retime import MASTER_FRAMES, MASTER_STOPS  # noqa: E402
from zones import zone_coverage  # noqa: E402

MODEL = 'nvidia/segformer-b5-finetuned-ade-640-640'
REVISION = ''  # commit sha pinned when the owner approves the download
CLEAR = {'sky', 'water', 'sea', 'river', 'lake'}
INFER = (1280, 704)  # SegFormer runs at film resolution (multiple of 32); logits are upsampled to HD
SITE_STOPS = [f // 2 for f in MASTER_STOPS]
STOP_IDS = ['river', 'brickell', 'downtown', 'bay', 'beach', 'sunset']
FLIGHT = os.path.join(COMFY, 'output', 'video', 'flight')


def load_model():
    from transformers import SegformerForSemanticSegmentation, SegformerImageProcessor
    assert REVISION, 'pin REVISION to the model commit sha first'
    processor = SegformerImageProcessor.from_pretrained(MODEL, revision=REVISION, do_resize=False)
    model = SegformerForSemanticSegmentation.from_pretrained(MODEL, revision=REVISION, use_safetensors=True)
    model = model.to('cuda', torch.float16).eval()
    names = {v.lower(): int(k) for k, v in model.config.id2label.items()}
    missing = CLEAR - set(names)
    assert not missing, f'ADE20K labels not found: {missing}'
    return processor, model, [names[n] for n in sorted(CLEAR)]


@torch.no_grad()
def clear_matte(img, processor, model, clear_ids):
    small = img.resize(INFER, Image.BICUBIC)
    pixels = processor(images=small, return_tensors='pt')['pixel_values'].to('cuda', torch.float16)
    logits = model(pixel_values=pixels).logits.float()
    logits = torch.nn.functional.interpolate(logits, size=(img.height, img.width), mode='bilinear', align_corners=False)
    probs = logits.softmax(dim=1)[0, clear_ids]
    return from_probs(probs.cpu().numpy(), list(range(len(clear_ids))))


def main():
    processor, model, clear_ids = load_model()
    src = os.path.join(FLIGHT, 'hd_master')
    frames = [os.path.join(src, f'f{m:04d}.png') for m in range(0, MASTER_FRAMES, 2)]
    mattes = []
    for i, path in enumerate(frames):
        mattes.append(clear_matte(Image.open(path).convert('RGB'), processor, model, clear_ids))
        if i % 50 == 0:
            print(f'segmented {i}/{len(frames)}', flush=True)
    mattes = [to_alpha8(feather(drop_specks(m))) for m in smooth(mattes, SITE_STOPS)]

    out = os.path.join(FLIGHT, 'matte_master')
    os.makedirs(out, exist_ok=True)
    for i, m in enumerate(mattes):
        Image.fromarray(m).save(os.path.join(out, f'f{i:03d}.png'))
    for sid, f in zip(STOP_IDS, SITE_STOPS):
        print(f'{sid} (frame {f}) zone coverage {zone_coverage(mattes[f], sid) * 100:.2f}%', flush=True)

    c = av.open(os.path.join(FLIGHT, 'matte_preview.mp4'), mode='w')
    s = c.add_stream('libx264', rate=15)
    s.width, s.height, s.pix_fmt = 960, 528, 'yuv420p'
    s.options = {'crf': '20'}
    for path, m in zip(frames, mattes):
        rgb = np.asarray(Image.open(path).convert('RGB').resize((960, 528)), np.float32)
        a = np.asarray(Image.fromarray(m).resize((960, 528)), np.float32)[..., None] / 255 * 0.55
        tinted = (rgb * (1 - a) + np.array([255, 40, 40], np.float32) * a).astype(np.uint8)
        for p in s.encode(av.VideoFrame.from_ndarray(tinted, format='rgb24')):
            c.mux(p)
    for p in s.encode():
        c.mux(p)
    c.close()
    print('MATTE_DONE', flush=True)


if __name__ == '__main__':
    main()
