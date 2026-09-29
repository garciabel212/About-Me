#!/usr/bin/env node
// Builds a flight's committed WebP frames and generated manifest.
//
//   npm run frames -- --config flight/m1.config.json --placeholder
//   npm run frames -- --config flight/m1.config.json --raw flight/raw/m1 [--mobile-raw flight/raw/m1-portrait]
//
// --raw        Earth Studio landscape export (PNG/JPEG, sorted by filename).
// --mobile-raw Optional portrait render of the same path; otherwise mobile frames are
//              a center 9:16 crop of the landscape export.
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import sharp from 'sharp';

const SIZES = {
  desktop: { width: 1920, height: 1080, quality: 70 },
  mobile: { width: 720, height: 1280, quality: 68 },
};

const { values } = parseArgs({
  options: {
    config: { type: 'string' },
    raw: { type: 'string' },
    'mobile-raw': { type: 'string' },
    placeholder: { type: 'boolean', default: false },
  },
});

if (!values.config || (!values.raw && !values.placeholder)) {
  console.error('usage: build-frames --config <file> (--placeholder | --raw <dir> [--mobile-raw <dir>])');
  process.exit(1);
}

const config = JSON.parse(await readFile(values.config, 'utf8'));
const outDir = path.join('public', 'flight', config.id);
const generatedFile = path.join('src', 'flight', 'generated', `${config.id}.ts`);

async function listFrames(dir) {
  const names = (await readdir(dir)).filter((name) => /\.(png|jpe?g)$/i.test(name));
  names.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (names.length < config.rawFrameCount) {
    throw new Error(`${dir} has ${names.length} frames; config expects ${config.rawFrameCount}`);
  }
  return names.map((name) => path.join(dir, name));
}

function placeholderSvg(rawNumber, { width, height }) {
  const t = (rawNumber - 1) / (config.rawFrameCount - 1);
  const horizon = height * (0.74 - 0.18 * t);
  const drift = -t * width * 0.6;
  const towers = Array.from({ length: 14 }, (_, i) => {
    const x = drift + i * width * 0.11 + width * 0.25;
    const h = height * (0.12 + ((i * 37) % 23) / 60) * (0.6 + t * 0.6);
    return `<rect x="${x.toFixed(1)}" y="${(horizon - h).toFixed(1)}" width="${(width * 0.05).toFixed(1)}" height="${h.toFixed(1)}" fill="#3d4a5c" opacity="0.85"/>`;
  }).join('');
  const fontSize = Math.round(height * 0.12);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f3c77e"/><stop offset="0.7" stop-color="#f7e3c0"/><stop offset="1" stop-color="#e8a86a"/>
  </linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#sky)"/>
  ${towers}
  <rect y="${horizon.toFixed(1)}" width="100%" height="${(height - horizon).toFixed(1)}" fill="#1f5f7a"/>
  <text x="50%" y="42%" font-family="monospace" font-size="${fontSize}" text-anchor="middle" fill="#ffffff" opacity="0.8">${rawNumber}</text>
  <text x="50%" y="${height - 14}" font-family="sans-serif" font-size="${Math.max(12, Math.round(height * 0.018))}" text-anchor="middle" fill="#ffffff">Google Earth · placeholder attribution</text>
</svg>`);
}

async function renderFrame(rawNumber, size, sources) {
  const spec = SIZES[size];
  if (!sources) return sharp(placeholderSvg(rawNumber, spec));
  const file = size === 'mobile' && sources.mobile ? sources.mobile[rawNumber - 1] : sources.landscape[rawNumber - 1];
  if (size === 'desktop' || sources.mobile) {
    return sharp(file).resize(spec.width, spec.height, { fit: 'cover', position: 'south' });
  }
  const { width, height } = await sharp(file).metadata();
  const cropWidth = Math.round((height * 9) / 16);
  return sharp(file)
    .extract({ left: Math.round((width - cropWidth) / 2), top: 0, width: cropWidth, height })
    .resize(spec.width, spec.height);
}

const sources = values.placeholder
  ? null
  : {
      landscape: await listFrames(values.raw),
      mobile: values['mobile-raw'] ? await listFrames(values['mobile-raw']) : null,
    };

// Raw frame numbers to keep, in order, and the committed index range of each segment.
const kept = [];
const segments = config.segments.map((segment) => {
  const first = kept.length;
  for (let raw = segment.raw[0]; raw <= segment.raw[1]; raw += segment.stride) kept.push(raw);
  return { id: segment.id, kind: segment.kind, frames: [first, kept.length - 1], scrollVh: segment.scrollVh };
});

await rm(outDir, { recursive: true, force: true });
const bytes = { desktop: 0, mobile: 0 };
for (const size of Object.keys(SIZES)) {
  await mkdir(path.join(outDir, size), { recursive: true });
  for (let start = 0; start < kept.length; start += 8) {
    await Promise.all(
      kept.slice(start, start + 8).map(async (raw, offset) => {
        const file = path.join(outDir, size, `${String(start + offset + 1).padStart(4, '0')}.webp`);
        await (await renderFrame(raw, size, sources)).webp({ quality: SIZES[size].quality }).toFile(file);
        bytes[size] += (await stat(file)).size;
      }),
    );
  }
  const still = path.join(outDir, `still-${size}.webp`);
  await (await renderFrame(config.stillRawFrame, size, sources)).webp({ quality: 78 }).toFile(still);
}

const posterBuffer = await (await renderFrame(kept[0], 'desktop', sources))
  .resize(32)
  .blur(1.2)
  .webp({ quality: 40 })
  .toBuffer();

const manifest = {
  id: config.id,
  frameCount: kept.length,
  segments,
  poster: `data:image/webp;base64,${posterBuffer.toString('base64')}`,
};

await mkdir(path.dirname(generatedFile), { recursive: true });
await writeFile(
  generatedFile,
  `// Generated by scripts/build-frames.mjs from ${values.config.replaceAll('\\', '/')}. Do not edit by hand.\n` +
    `import type { FlightManifest } from '../manifest';\n\n` +
    `export const ${config.id.toUpperCase()}: FlightManifest = ${JSON.stringify(manifest, null, 2)};\n`,
);

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;
console.log(`${config.id}: ${kept.length} frames (${values.placeholder ? 'placeholder' : 'rendered'})`);
console.log(`  desktop ${mb(bytes.desktop)} · mobile ${mb(bytes.mobile)} · poster ${posterBuffer.length} B`);
