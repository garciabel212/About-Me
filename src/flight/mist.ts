/** Small deterministic PRNG (mulberry32) so mist looks organic but renders identically on every visit. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Mist puffs spread around the card's perimeter, as fractions of the card box. */
export function puffLayout(count: number, seed: number): { x: number; y: number; r: number; delay: number }[] {
  const next = rng(seed);
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + next() * 0.6;
    return {
      x: 0.5 + Math.cos(angle) * (0.45 + next() * 0.2),
      y: 0.5 + Math.sin(angle) * (0.45 + next() * 0.2),
      r: 90 + next() * 130,
      delay: next() * 0.6,
    };
  });
}
