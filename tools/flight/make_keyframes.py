"""Generates candidate keyframe stills for the Miami flight with Z-Image-Turbo via the local ComfyUI API.

Usage: python make_keyframes.py [stop_id ...]   (no args = all stops)
Outputs land in ComfyUI/output/keyframes/<stop>_<seed>.png
"""
import json
import sys
import time
import urllib.request
import uuid

API = 'http://127.0.0.1:8188'
WIDTH, HEIGHT = 1920, 1088  # ~2 MP, 16:9, multiple of 16
SEEDS = [1101, 2202, 3303, 4404]

# One shared look so every stop reads as the same flight on the same evening.
LOOK = (
    'Photorealistic aerial cinematography still, point-of-view from a camera moving forward, 24mm lens, '
    'crisp architectural detail, clean straight building edges, realistic glass curtain walls with clear '
    'reflections, natural color grading, high dynamic range, no aircraft in the sky, no people in focus, '
    'no text, no watermark.'
)

STOPS = {
    'k1_dusk': (
        'FPV aerial point-of-view photograph skimming just a few meters above the calm Miami River at dusk, '
        'looking straight ahead toward the Brickell skyline, tall modern glass residential towers on both banks '
        'with warm lit windows, silhouetted palm trees, a deep purple and orange sunset sky with pink clouds, the '
        'last sunlight glowing on the horizon between the towers, glowing reflections streaking across the dark '
        'water. Cinematic, moody, high contrast. ' + LOOK
    ),
    'k2_entering_brickell': (
        'Aerial point-of-view photograph from 40 meters above the Miami River at golden hour, looking straight '
        'ahead down the river toward the Brickell skyline. Modern glass residential towers rise on both '
        'riverbanks just ahead, palm-lined riverwalk, a low bridge in the middle distance. Warm low sun on the '
        'left casting long golden light across the towers and a shimmering path on the calm water. ' + LOOK
    ),
    'k3_between_towers': (
        'Aerial point-of-view photograph from mid-height between tall modern glass skyscrapers in Brickell, '
        'Miami, looking straight ahead down a canyon of towers that fill the left and right edges of the frame, '
        'a palm-lined boulevard far below leading toward a glimpse of blue bay water at the end. Golden-hour '
        'sunlight streams between the towers and reflects off the glass facades, warm orange highlights and '
        'deep blue shadows. ' + LOOK
    ),
    'k4_over_biscayne_bay': (
        'Aerial point-of-view photograph from 60 meters above Biscayne Bay, looking east across open turquoise '
        'water toward the low skyline of Miami Beach on the horizon, a long causeway bridge crossing the bay on '
        'the right, a few small sailboats. The sun is low behind the camera, warm orange light glittering on '
        'small waves and the sky turning soft orange and pink. ' + LOOK
    ),
    'k5_approaching_shore': (
        'Aerial point-of-view photograph from 50 meters above, approaching the Miami Beach shoreline at sunset, '
        'looking ahead at rows of palm trees, pastel art deco hotels along the beach, white sand and the '
        'Atlantic Ocean beyond. The sky glows orange, pink and violet, soft clouds lit from below, warm sunset '
        'light on the building fronts. ' + LOOK
    ),
    'k6_beach_sunset': (
        'Aerial point-of-view photograph from 30 meters above Miami Beach at sunset, a calm wide view of gentle '
        'turquoise waves rolling onto white sand, a colorful lifeguard tower, palm trees along the dunes, the '
        'sky a glowing gradient of orange, pink and violet with soft clouds, golden reflections on the wet sand, '
        'serene and peaceful. ' + LOOK
    ),
}


def graph(prompt: str, seed: int, prefix: str) -> dict:
    return {
        '28': {'class_type': 'UNETLoader', 'inputs': {'unet_name': 'z_image_turbo_int8_convrot.safetensors', 'weight_dtype': 'default'}},
        '30': {'class_type': 'CLIPLoader', 'inputs': {'clip_name': 'qwen_3_4b_fp8_mixed.safetensors', 'type': 'lumina2', 'device': 'default'}},
        '29': {'class_type': 'VAELoader', 'inputs': {'vae_name': 'ae.safetensors'}},
        '11': {'class_type': 'ModelSamplingAuraFlow', 'inputs': {'shift': 3, 'model': ['28', 0]}},
        '27': {'class_type': 'CLIPTextEncode', 'inputs': {'text': prompt, 'clip': ['30', 0]}},
        '33': {'class_type': 'ConditioningZeroOut', 'inputs': {'conditioning': ['27', 0]}},
        '13': {'class_type': 'EmptySD3LatentImage', 'inputs': {'width': WIDTH, 'height': HEIGHT, 'batch_size': 1}},
        '3': {'class_type': 'KSampler', 'inputs': {
            'seed': seed, 'steps': 8, 'cfg': 1, 'sampler_name': 'res_multistep', 'scheduler': 'simple', 'denoise': 1,
            'model': ['11', 0], 'positive': ['27', 0], 'negative': ['33', 0], 'latent_image': ['13', 0]}},
        '8': {'class_type': 'VAEDecode', 'inputs': {'samples': ['3', 0], 'vae': ['29', 0]}},
        '9': {'class_type': 'SaveImage', 'inputs': {'filename_prefix': prefix, 'images': ['8', 0]}},
    }


K1_PROMPT = (
    'Miami River at golden hour, modern glass residential towers along the right riverbank, palm-lined '
    'riverwalk, a low bridge in the middle distance, the Brickell skyline beyond, warm low sun on the left '
    'and a shimmering golden path on calm water. ' + LOOK
)


def sharpen_graph(image_name: str, denoise: float, seed: int, prefix: str) -> dict:
    """Re-renders an existing still at 2K with light denoise: adds detail, keeps the composition."""
    g = graph(K1_PROMPT, seed, prefix)
    del g['13']
    g['40'] = {'class_type': 'LoadImage', 'inputs': {'image': image_name}}
    g['41'] = {'class_type': 'ImageScale', 'inputs': {'upscale_method': 'lanczos', 'width': WIDTH, 'height': HEIGHT, 'crop': 'center', 'image': ['40', 0]}}
    g['42'] = {'class_type': 'VAEEncode', 'inputs': {'pixels': ['41', 0], 'vae': ['29', 0]}}
    g['3']['inputs'].update({'denoise': denoise, 'latent_image': ['42', 0]})
    return g


def submit(g: dict) -> str:
    body = json.dumps({'prompt': g, 'client_id': str(uuid.uuid4())}).encode()
    req = urllib.request.Request(f'{API}/prompt', data=body, headers={'Content-Type': 'application/json'})
    resp = json.load(urllib.request.urlopen(req))
    if resp.get('node_errors'):
        raise RuntimeError(resp['node_errors'])
    return resp['prompt_id']


def wait(prompt_id: str) -> str:
    while True:
        hist = json.load(urllib.request.urlopen(f'{API}/history/{prompt_id}'))
        if prompt_id in hist:
            status = hist[prompt_id]['status']
            if status.get('status_str') == 'error':
                raise RuntimeError(json.dumps(status)[:500])
            imgs = [i for out in hist[prompt_id]['outputs'].values() for i in out.get('images', [])]
            return imgs[0]['filename'] if imgs else '?'
        time.sleep(1)


if __name__ == '__main__':
    wanted = sys.argv[1:] or ['k1_river', *STOPS]
    if 'k1_river' in wanted:
        for denoise in (0.25, 0.35):
            t = time.time()
            name = wait(submit(sharpen_graph('brickell_skyline_hero.jpg', denoise, 1101, f'keyframes/k1_river_d{int(denoise * 100)}')))
            print(f'k1_river denoise {denoise} -> {name} ({time.time() - t:.0f}s)', flush=True)
        wanted = [w for w in wanted if w != 'k1_river']
    for stop in wanted:
        for seed in SEEDS:
            t = time.time()
            name = wait(submit(graph(STOPS[stop], seed, f'keyframes/{stop}_{seed}')))
            print(f'{stop} seed {seed} -> {name} ({time.time() - t:.0f}s)', flush=True)
    print('ALL_DONE', flush=True)
