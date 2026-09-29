export interface SourceRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

/**
 * Source rectangle that makes a srcW×srcH image cover a dstW×dstH box.
 * Vertical crops are anchored by `anchorY` (1 = keep the bottom, where the
 * Earth Studio attribution lives); horizontal crops are centered.
 */
export function coverRect(srcW: number, srcH: number, dstW: number, dstH: number, anchorY = 1): SourceRect {
  const srcAspect = srcW / srcH;
  const dstAspect = dstW / dstH;
  if (dstAspect > srcAspect) {
    const sh = srcW / dstAspect;
    return { sx: 0, sy: (srcH - sh) * anchorY, sw: srcW, sh };
  }
  const sw = srcH * dstAspect;
  return { sx: (srcW - sw) / 2, sy: 0, sw, sh: srcH };
}
