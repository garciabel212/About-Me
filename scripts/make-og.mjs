// Builds public/images/og-preview.png (1200x630) from the site portrait.
// Run: node scripts/make-og.mjs
import sharp from 'sharp';

const W = 1200;
const H = 630;
const SIZE = 420;

const portrait = await sharp('public/images/jose_garcia_portrait.png')
  .resize(SIZE, SIZE, { fit: 'cover', position: 'top' })
  .composite([
    {
      input: Buffer.from(`<svg width="${SIZE}" height="${SIZE}"><rect width="${SIZE}" height="${SIZE}" rx="28" ry="28"/></svg>`),
      blend: 'dest-in',
    },
  ])
  .png()
  .toBuffer();

const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#06080d"/>
  <rect x="0" y="0" width="12" height="${H}" fill="#3b82f6"/>
  <text x="80" y="250" font-family="Georgia, serif" font-size="88" font-weight="700" fill="#ffffff">Jose Garcia</text>
  <text x="80" y="326" font-family="Arial, sans-serif" font-size="32" fill="#93c5fd">Customer Solutions</text>
  <text x="80" y="372" font-family="Arial, sans-serif" font-size="32" fill="#93c5fd">Implementation | Technical Consulting</text>
  <text x="80" y="540" font-family="Arial, sans-serif" font-size="24" fill="#94a3b8">garciabel212.github.io/About-Me</text>
</svg>`;

await sharp(Buffer.from(svg))
  .composite([{ input: portrait, left: W - SIZE - 80, top: Math.round((H - SIZE) / 2) }])
  .png()
  .toFile('public/images/og-preview.png');

console.log('wrote public/images/og-preview.png');
