/** Opacity of the page-background veil behind flight text. Tested against theme tokens in contrast.test.ts. */
export const VEIL_ALPHA = 0.84;

export const veilStyle = {
  backgroundColor: `color-mix(in srgb, var(--bg) ${Math.round(VEIL_ALPHA * 100)}%, transparent)`,
} as const;
