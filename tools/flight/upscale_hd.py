"""Upscales flight_v3.mp4 (1280x704) to the HD master (1920x1056 PNGs) with SeedVR2 3B through ComfyUI.

The film goes through in chunks (an 825-frame HD image tensor would not fit in RAM). Every chunk after the first
starts LEAD frames early and drops those outputs, so SeedVR2's temporal context runs across chunk joins.
Models are the local ones in models/SEEDVR2; nothing downloads.

Usage: python upscale_hd.py [--sample START COUNT]
Writes ComfyUI/output/video/flight/hd_master/fNNNN.png (index = master frame), or hd_sample/ with --sample.
"""
import os
import shutil
import sys

import av
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # the embedded Python doesn't add the script's folder
from heal_chain import COMFY, run  # noqa: E402

W, H = 1920, 1056
SIZE, LEAD, BATCH = 99, 8, 33
FILM = os.path.join(COMFY, 'output', 'video', 'flight', 'flight_v3.mp4')


def chunks(n, size=SIZE, lead=LEAD):
    """(start, end, skip) per chunk: decode frames start..end-1, keep outputs from start+skip on."""
    spans = []
    for a in range(0, n, size):
        start = max(0, a - lead)
        spans.append((start, min(n, a + size), a - start))
    return spans


def graph(video_name, prefix):
    return {
        '1': {'class_type': 'LoadVideo', 'inputs': {'file': video_name}},
        '2': {'class_type': 'GetVideoComponents', 'inputs': {'video': ['1', 0]}},
        '3': {'class_type': 'SeedVR2LoadDiTModel', 'inputs': {
            'model': 'seedvr2_ema_3b_fp16.safetensors', 'device': 'cuda:0', 'blocks_to_swap': 32,
            'swap_io_components': False, 'offload_device': 'cpu', 'cache_model': True, 'attention_mode': 'sdpa'}},
        '4': {'class_type': 'SeedVR2LoadVAEModel', 'inputs': {
            'model': 'ema_vae_fp16.safetensors', 'device': 'cuda:0', 'encode_tiled': True, 'encode_tile_size': 1024,
            'encode_tile_overlap': 128, 'decode_tiled': True, 'decode_tile_size': 768, 'decode_tile_overlap': 128,
            'tile_debug': 'false', 'offload_device': 'cpu', 'cache_model': True}},
        '5': {'class_type': 'SeedVR2VideoUpscaler', 'inputs': {
            'image': ['2', 0], 'dit': ['3', 0], 'vae': ['4', 0], 'seed': 42, 'resolution': H, 'max_resolution': 0,
            'batch_size': BATCH, 'uniform_batch_size': True, 'color_correction': 'lab', 'temporal_overlap': 3,
            'prepend_frames': 0, 'input_noise_scale': 0.0, 'latent_noise_scale': 0.0, 'offload_device': 'cpu',
            'enable_debug': False}},
        '6': {'class_type': 'SaveImage', 'inputs': {'images': ['5', 0], 'filename_prefix': prefix}},
    }


def write_chunk(frames, path):
    """Lossless RGB mp4, so the upscaler sees exactly the assembled frames."""
    c = av.open(path, mode='w')
    s = c.add_stream('libx264rgb', rate=30)
    s.width, s.height, s.pix_fmt = frames[0].shape[1], frames[0].shape[0], 'rgb24'
    s.options = {'crf': '0', 'preset': 'veryfast'}
    for f in frames:
        for p in s.encode(av.VideoFrame.from_ndarray(f, format='rgb24')):
            c.mux(p)
    for p in s.encode():
        c.mux(p)
    c.close()


def main():
    sample = '--sample' in sys.argv
    frames = [f.to_ndarray(format='rgb24') for f in av.open(FILM).decode(video=0)]
    first = int(sys.argv[sys.argv.index('--sample') + 1]) if sample else 0
    count = int(sys.argv[sys.argv.index('--sample') + 2]) if sample else len(frames)
    frames = frames[first:first + count]
    out_dir = os.path.join(COMFY, 'output', 'video', 'flight', 'hd_sample' if sample else 'hd_master')
    os.makedirs(out_dir, exist_ok=True)
    for k, (start, end, skip) in enumerate(chunks(len(frames))):
        name = f'v3hd_c{k:02d}.mp4'
        write_chunk(frames[start:end], os.path.join(COMFY, 'input', name))
        outputs = run(graph(name, f'video/flight/hd_tmp/c{k:02d}'))
        images = sorted(outputs['6']['images'], key=lambda i: i['filename'])
        assert len(images) == end - start, (len(images), end - start)
        for j, img in enumerate(images[skip:]):
            src = os.path.join(COMFY, 'output', img['subfolder'], img['filename'])
            dst = os.path.join(out_dir, f'f{first + start + skip + j:04d}.png')
            im = Image.open(src)
            if im.size != (W, H):
                im.convert('RGB').resize((W, H), Image.LANCZOS).save(dst)
            else:
                shutil.move(src, dst)
        os.remove(os.path.join(COMFY, 'input', name))
        print(f'chunk {k}: frames {start + skip}..{end - 1} done', flush=True)
    shutil.rmtree(os.path.join(COMFY, 'output', 'video', 'flight', 'hd_tmp'), ignore_errors=True)
    print('HD_DONE', flush=True)


if __name__ == '__main__':
    main()
