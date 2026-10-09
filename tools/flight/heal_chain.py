"""Short-burst + heal flight builder.

Each step: LTX-2.5 image-to-video for a short burst (clean motion), then Z-Image re-renders the burst's
last frame at 2K with light denoise ("heal") so the next burst starts from crisp architecture.
Bursts are stitched with a short crossfade at each join.

Run with ComfyUI's embedded Python (needs av + PIL):
  python_embeded\\python.exe C:\\Users\\abel\\AI\\flight\\heal_chain.py <run_name> <start_image_in_input>
"""
import json
import os
import shutil
import sys
import time
import urllib.request
import uuid

import av
import numpy as np
from PIL import Image

COMFY = r'C:\Users\abel\AI\ComfyUI_windows_portable\ComfyUI'
API = 'http://127.0.0.1:8188'
BURST_FRAMES = 81          # 8n+1 -> 2.7 s at 30 fps; the model stays clean for about this long
FADE = 6                   # frames crossfaded at each join
HEAL_DENOISE = 0.32
ANCHOR_RESTORE = 0.6       # how far each healed anchor's black point/saturation is pulled back toward the start image
LOOK = ('Photorealistic aerial cinematography still, crisp architectural detail, clean straight building edges, '
        'realistic glass curtain walls with clear reflections, natural color grading, no aircraft, no text.')
MOVE = ('Smooth continuous forward camera motion, stabilized gimbal, constant speed, no cuts, crisp clean '
        'architecture with straight edges, realistic reflections.')
NEG = ('warping buildings, melting architecture, honeycomb texture, rubble, bending towers, morphing, dissolve, '
       'double exposure, ghosting, flicker, jitter, camera shake, cut, text, watermark, aircraft, drone, people, '
       'cartoon, video game, low quality, blurry')

# (video prompt for the burst, heal prompt describing where the camera now is)
STEPS = [
    ('Use the provided image as the first frame. The camera flies steadily forward low along the Miami River at '
     'golden hour toward the bridge, the glass towers on the riverbanks slide past the edges of the frame with '
     'strong parallax. ' + MOVE,
     'Aerial view low over the Miami River at golden hour, modern glass towers on both riverbanks, a bridge ahead, '
     'warm low sun on the left, shimmering light on calm water. ' + LOOK),
    ('Use the provided image as the first frame. The camera keeps flying forward and gently banks right while '
     'rising slightly, heading into the narrow gap between two tall glass towers. ' + MOVE,
     'Aerial view entering the gap between tall modern glass towers in Brickell, Miami at golden hour, towers close '
     'on the left and right, golden light reflecting on the glass. ' + LOOK),
    ('Use the provided image as the first frame. The camera flies straight forward through the canyon between tall '
     'glass skyscrapers, the towers on both sides sliding past close to the camera. ' + MOVE,
     'Aerial view from mid-height flying through a canyon of tall modern glass skyscrapers in Brickell, Miami, towers '
     'filling the left and right edges, a palm-lined boulevard far below, golden-hour light between the buildings. '
     + LOOK),
]


def post(path, payload):
    req = urllib.request.Request(API + path, data=json.dumps(payload).encode(), headers={'Content-Type': 'application/json'})
    return json.load(urllib.request.urlopen(req))


def run(graph):
    resp = post('/prompt', {'prompt': graph, 'client_id': str(uuid.uuid4())})
    if resp.get('node_errors'):
        raise RuntimeError(resp['node_errors'])
    pid = resp['prompt_id']
    while True:
        hist = json.load(urllib.request.urlopen(f'{API}/history/{pid}'))
        if pid in hist:
            if hist[pid]['status'].get('status_str') == 'error':
                raise RuntimeError(json.dumps(hist[pid]['status'])[:600])
            return hist[pid]['outputs']
        time.sleep(2)


def video_graph(image_rel, prompt, seed, prefix):
    g = json.load(open(os.path.join(COMFY, 'user', 'default', 'flight_i2v_api.json'), encoding='utf8'))
    g['395']['inputs']['image'] = image_rel
    g['398:364']['inputs']['text'] = prompt
    g['398:373']['inputs']['text'] = NEG
    g['398:378']['inputs']['expression'] = str(BURST_FRAMES)
    g['398:339']['inputs']['noise_seed'] = seed
    g['75']['inputs']['filename_prefix'] = prefix
    return g


def heal_graph(image_rel, prompt, seed, prefix, denoise=HEAL_DENOISE):
    return {
        '28': {'class_type': 'UNETLoader', 'inputs': {'unet_name': 'z_image_turbo_int8_convrot.safetensors', 'weight_dtype': 'default'}},
        '30': {'class_type': 'CLIPLoader', 'inputs': {'clip_name': 'qwen_3_4b_fp8_mixed.safetensors', 'type': 'lumina2', 'device': 'default'}},
        '29': {'class_type': 'VAELoader', 'inputs': {'vae_name': 'ae.safetensors'}},
        '11': {'class_type': 'ModelSamplingAuraFlow', 'inputs': {'shift': 3, 'model': ['28', 0]}},
        '27': {'class_type': 'CLIPTextEncode', 'inputs': {'text': prompt, 'clip': ['30', 0]}},
        '33': {'class_type': 'ConditioningZeroOut', 'inputs': {'conditioning': ['27', 0]}},
        '40': {'class_type': 'LoadImage', 'inputs': {'image': image_rel}},
        '41': {'class_type': 'ImageScale', 'inputs': {'upscale_method': 'lanczos', 'width': 1920, 'height': 1088, 'crop': 'center', 'image': ['40', 0]}},
        '42': {'class_type': 'VAEEncode', 'inputs': {'pixels': ['41', 0], 'vae': ['29', 0]}},
        '3': {'class_type': 'KSampler', 'inputs': {
            'seed': seed, 'steps': 8, 'cfg': 1, 'sampler_name': 'res_multistep', 'scheduler': 'simple',
            'denoise': denoise, 'model': ['11', 0], 'positive': ['27', 0], 'negative': ['33', 0], 'latent_image': ['42', 0]}},
        '8': {'class_type': 'VAEDecode', 'inputs': {'samples': ['3', 0], 'vae': ['29', 0]}},
        '9': {'class_type': 'SaveImage', 'inputs': {'filename_prefix': prefix, 'images': ['8', 0]}},
    }


def levels(rgb):
    small = rgb[::4, ::4].astype(np.float32)
    y = small.mean(axis=2)
    return np.percentile(y, 1), np.percentile(y, 99.5), (small.max(axis=2) - small.min(axis=2)).mean()


def restore(rgb, ref, strength=ANCHOR_RESTORE):
    """Pulls an anchor's black point and saturation back toward the start image so haze can't compound burst to burst."""
    black, white, sat = levels(rgb)
    ref_black, _, ref_sat = ref
    img = rgb.astype(np.float32)
    new_black = black + strength * (min(ref_black, black) - black)
    img = (img - black) / max(white - black, 1.0) * (white - new_black) + new_black
    gain = 1 + strength * (np.clip(ref_sat / max(sat, 1.0), 1.0, 1.3) - 1)
    luma = img.mean(axis=2, keepdims=True)
    return (luma + (img - luma) * gain).clip(0, 255).astype(np.uint8)


def frames_of(mp4):
    return [f.to_ndarray(format='rgb24') for f in av.open(mp4).decode(video=0)]


def main():
    name, start = sys.argv[1], sys.argv[2]
    steps = STEPS
    if len(sys.argv) > 3:  # optional route file: [{video, heal, denoise}, ...]
        route = json.load(open(sys.argv[3], encoding='utf8'))
        steps = [('Use the provided image as the first frame. ' + r['video'] + ' ' + MOVE, r['heal'] + ' ' + LOOK, r['denoise']) for r in route]
    else:
        steps = [(v, h, HEAL_DENOISE) for v, h in STEPS]
    work = os.path.join(COMFY, 'input', 'flight', name)
    os.makedirs(work, exist_ok=True)
    anchor = start
    ref = levels(np.asarray(Image.open(os.path.join(COMFY, 'input', start)).convert('RGB')))
    segments = []
    for i, (vprompt, hprompt, denoise) in enumerate(steps, 1):
        t = time.time()
        out = run(video_graph(anchor, vprompt, 7000 + i, f'video/flight/{name}/burst{i:02d}'))
        vid = next(v for o in out.values() for v in o.get('images', []) + o.get('videos', []) + o.get('gifs', []))
        mp4 = os.path.join(COMFY, 'output', vid.get('subfolder', ''), vid['filename'])
        frames = frames_of(mp4)
        segments.append(frames)
        last = os.path.join(work, f'last{i:02d}.png')
        Image.fromarray(frames[-1]).save(last)
        print(f'burst {i}: {len(frames)} frames ({time.time() - t:.0f}s)', flush=True)
        if i == len(steps):
            break
        t = time.time()
        out = run(heal_graph(f'flight/{name}/last{i:02d}.png', hprompt, 9000 + i, f'flight_heal/{name}/heal{i:02d}', denoise))
        img = next(v for o in out.values() for v in o.get('images', []))
        healed = os.path.join(work, f'heal{i:02d}.png')
        shutil.copy(os.path.join(COMFY, 'output', img['subfolder'], img['filename']), healed)
        Image.fromarray(restore(np.asarray(Image.open(healed).convert('RGB')), ref)).save(healed)
        anchor = f'flight/{name}/heal{i:02d}.png'
        print(f'heal {i}: done ({time.time() - t:.0f}s)', flush=True)

    # Stitch: crossfade FADE frames at each join.
    h, w = segments[0][0].shape[:2]
    out_path = os.path.join(COMFY, 'output', 'video', 'flight', f'{name}_stitched.mp4')
    container = av.open(out_path, mode='w')
    stream = container.add_stream('libx264', rate=30)
    stream.width, stream.height, stream.pix_fmt = w, h, 'yuv420p'
    stream.options = {'crf': '16', 'preset': 'slow'}
    total = 0

    def emit(arr):
        nonlocal total
        for packet in stream.encode(av.VideoFrame.from_ndarray(arr, format='rgb24')):
            container.mux(packet)
        total += 1

    for s, seg in enumerate(segments):
        body = seg[FADE:] if s > 0 else seg
        if s < len(segments) - 1:
            body = body[:-FADE]
        for fr in body:
            emit(fr)
        if s < len(segments) - 1:
            nxt = segments[s + 1]
            for k in range(FADE):
                a = (k + 1) / (FADE + 1)
                mix = (seg[len(seg) - FADE + k].astype(np.float32) * (1 - a) + nxt[k].astype(np.float32) * a)
                emit(mix.clip(0, 255).astype(np.uint8))
    for packet in stream.encode():
        container.mux(packet)
    container.close()
    print(f'STITCHED {out_path} {total} frames ({total / 30:.1f}s)', flush=True)


if __name__ == '__main__':
    main()
