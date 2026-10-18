"""Fetches SegFormer-B5 (ADE20K) from NVIDIA's official Hugging Face commit and converts it to a local safetensors model.

The official repo has only a pickle checkpoint (pytorch_model.bin). It is downloaded pinned to one commit, checked
against that commit's sha256, loaded with torch's restricted unpickler (weights_only=True, so no code in the file can
run), and saved once as model.safetensors. matte.py loads only the local safetensors copy, offline.

Usage: python fetch_segformer.py
Writes C:/Users/abel/AI/models/segformer-b5-ade/{config.json, preprocessor_config.json, model.safetensors}.
"""
import hashlib
import os
import shutil

import torch
from huggingface_hub import hf_hub_download
from safetensors.torch import save_file

REPO = 'nvidia/segformer-b5-finetuned-ade-640-640'
REVISION = '739f5d4692954e4a185eac280dec1ba5a7d52f1d'
BIN_SHA256 = 'a3dbf2d7a9912203078f304d88df8cfee9fd752ca2d2413f82036bdb02c5e7df'
OUT = r'C:\Users\abel\AI\models\segformer-b5-ade'
DOWNLOAD = os.path.join(OUT, 'download')


def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for block in iter(lambda: f.read(1 << 20), b''):
            h.update(block)
    return h.hexdigest()


def main():
    os.makedirs(DOWNLOAD, exist_ok=True)
    files = {name: hf_hub_download(REPO, name, revision=REVISION, local_dir=DOWNLOAD)
             for name in ('config.json', 'preprocessor_config.json', 'pytorch_model.bin')}
    got = sha256(files['pytorch_model.bin'])
    if got != BIN_SHA256:
        raise SystemExit(f'checksum mismatch: {got}')
    state = torch.load(files['pytorch_model.bin'], map_location='cpu', weights_only=True)
    state = {k: v.contiguous() for k, v in state.items()}
    save_file(state, os.path.join(OUT, 'model.safetensors'), metadata={'format': 'pt', 'source': f'{REPO}@{REVISION}'})
    for name in ('config.json', 'preprocessor_config.json'):
        shutil.copy(files[name], os.path.join(OUT, name))
    shutil.rmtree(DOWNLOAD)  # only the safetensors copy is ever loaded
    print(f'SEGFORMER_READY {len(state)} tensors -> {OUT}')


if __name__ == '__main__':
    main()
