// The light path's geometry and progress (named apart from LightPath.tsx: Windows paths ignore case).
export interface Node {
  x: number;
  y: number;
  /** The bottom of a point's text: shapes the path (the light runs beside the text) but draws no dot. */
  exit?: boolean;
}

export interface Sample {
  x: number;
  y: number;
  len: number;
}

export interface Light {
  /** Share of the path drawn, 0 to 1. */
  fraction: number;
  /** Where the bright head is. */
  head: Node;
}

/** The head sits this far down the screen: ahead of the reader, so the light reaches the next point first. */
export const HEAD_LINE = 0.65;

const f = (n: number) => n.toFixed(1);

/** Control points for the segment a to b: vertical tangents at both ends. */
function controls(a: Node, b: Node): [Node, Node] {
  const d = (b.y - a.y) / 2;
  return [{ x: a.x, y: a.y + d }, { x: b.x, y: b.y - d }];
}

function cubic(a: Node, c1: Node, c2: Node, b: Node, t: number): Node {
  const u = 1 - t;
  const w0 = u * u * u;
  const w1 = 3 * u * u * t;
  const w2 = 3 * u * t * t;
  const w3 = t * t * t;
  return { x: w0 * a.x + w1 * c1.x + w2 * c2.x + w3 * b.x, y: w0 * a.y + w1 * c1.y + w2 * c2.y + w3 * b.y };
}

/** One smooth S-curve through the nodes, top to bottom. */
export function pathD(nodes: Node[]): string {
  if (nodes.length < 2) return '';
  let d = `M${f(nodes[0].x)} ${f(nodes[0].y)}`;
  for (let i = 0; i + 1 < nodes.length; i += 1) {
    const [c1, c2] = controls(nodes[i], nodes[i + 1]);
    d += `C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(nodes[i + 1].x)} ${f(nodes[i + 1].y)}`;
  }
  return d;
}

/** The path as points with running length, for finding how much is drawn at a given height. */
export function samplePath(nodes: Node[], steps = 32): Sample[] {
  if (nodes.length === 0) return [];
  const out: Sample[] = [{ ...nodes[0], len: 0 }];
  for (let i = 0; i + 1 < nodes.length; i += 1) {
    const [c1, c2] = controls(nodes[i], nodes[i + 1]);
    for (let s = 1; s <= steps; s += 1) {
      const p = cubic(nodes[i], c1, c2, nodes[i + 1], s / steps);
      const prev = out[out.length - 1];
      out.push({ ...p, len: prev.len + Math.hypot(p.x - prev.x, p.y - prev.y) });
    }
  }
  return out;
}

/** How much of the light is drawn for a scroll position. */
export function lightFor(samples: Sample[], nodes: Node[], view: { scrollY: number; vh: number; maxScroll: number; top: number; motion: boolean }): Light {
  const last = nodes[nodes.length - 1];
  if (!last || samples.length === 0) return { fraction: 0, head: { x: 0, y: 0 } };
  if (!view.motion || view.scrollY >= view.maxScroll - 1) return { fraction: 1, head: last };
  const y = view.scrollY + view.vh * HEAD_LINE - view.top;
  const total = samples[samples.length - 1].len || 1;
  if (y <= samples[0].y) return { fraction: 0, head: { x: samples[0].x, y: samples[0].y } };
  const i = samples.findIndex((s) => s.y >= y);
  if (i < 0) return { fraction: 1, head: last };
  const a = samples[i - 1];
  const b = samples[i];
  const t = b.y === a.y ? 1 : (y - a.y) / (b.y - a.y);
  const head = { x: a.x + (b.x - a.x) * t, y };
  return { fraction: (a.len + (b.len - a.len) * t) / total, head };
}

/** Which stops (points' entry nodes) the light has reached: all of them once it is complete. */
export function reached(stops: Node[], light: Light): boolean[] {
  return stops.map((n) => light.fraction >= 1 || n.y <= light.head.y + 0.5);
}
