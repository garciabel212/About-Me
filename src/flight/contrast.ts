export type RGB = readonly [number, number, number];

export function hexToRgb(hex: string): RGB {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16)) as unknown as RGB;
}

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance([r, g, b]: RGB): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: RGB, b: RGB): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** Contrast of `text` over a veil of `bg` at `veilAlpha`, against the worst possible footage (pure black or white). */
export function worstVeilContrast(text: RGB, bg: RGB, veilAlpha: number): number {
  const over = (backdrop: RGB): RGB =>
    bg.map((value, i) => value * veilAlpha + backdrop[i] * (1 - veilAlpha)) as unknown as RGB;
  return Math.min(contrastRatio(text, over([0, 0, 0])), contrastRatio(text, over([255, 255, 255])));
}
