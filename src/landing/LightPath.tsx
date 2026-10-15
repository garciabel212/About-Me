import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { lightFor, pathD, reached, samplePath, type Node } from './lightCurve';

/** Centers of the points' light nodes, relative to the landing's top-left. */
export function measureNodes(root: Element): Node[] {
  const r = root.getBoundingClientRect();
  return [...root.querySelectorAll('[data-node]')].map((el) => {
    const b = el.getBoundingClientRect();
    const node: Node = { x: b.left - r.left + b.width / 2, y: b.top - r.top + b.height / 2 };
    if (el.getAttribute?.('data-node') === 'exit') node.exit = true;
    return node;
  });
}

/** The light's drawing area: the landing's own box. Never scrollHeight, which counts the SVG itself and only ever grows. */
export function landingSize(root: HTMLElement): { w: number; h: number } {
  return { w: root.clientWidth, h: root.offsetHeight };
}

/**
 * The one glowing light that joins the points. It is drawn over the whole
 * landing, so it scrolls with the text; scroll sets how much is lit and where
 * the bright head is, by writing attributes directly (no React render per frame).
 */
export default function LightPath({ motion }: { motion: boolean }) {
  const svg = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const d = useMemo(() => pathD(nodes), [nodes]);
  const samples = useMemo(() => samplePath(nodes), [nodes]);
  const stops = useMemo(() => nodes.filter((n) => !n.exit), [nodes]);

  // Measure the nodes now and whenever the landing changes size (fonts, images, opened details, resize).
  useLayoutEffect(() => {
    const root = svg.current?.parentElement;
    if (!root) return;
    const measure = () => {
      setNodes(measureNodes(root));
      setSize(landingSize(root));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    // A text block can grow (an opened "More") inside a section with spare height, without resizing the landing.
    root.querySelectorAll('.point__body').forEach((body) => ro.observe(body));
    document.fonts?.ready.then(measure, () => {});
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = svg.current;
    if (!el || nodes.length < 2) return;
    const core = el.querySelector<SVGPathElement>('.light-path__core');
    const glow = el.querySelector<SVGPathElement>('.light-path__glow');
    const halo = el.querySelector<SVGPathElement>('.light-path__halo');
    const head = el.querySelector<SVGGElement>('.light-path__head');
    const dots = [...el.querySelectorAll<SVGCircleElement>('.light-path__node')];
    const root = el.parentElement;
    // Each point's section, in the same order as its entry node: text arrives when the light does.
    const sections = [...(root?.querySelectorAll('[data-node="true"]') ?? [])].map((n) => n.closest('[data-point]'));
    // Points wait for the light only once it is measured and running; without JS nothing is hidden.
    root?.setAttribute('data-arrive', motion ? 'on' : 'fade');
    const update = () => {
      const top = (el.parentElement?.getBoundingClientRect().top ?? 0) + window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const l = lightFor(samples, nodes, { scrollY: window.scrollY, vh: window.innerHeight, maxScroll, top, motion });
      core?.setAttribute('stroke-dashoffset', String(1 - l.fraction));
      glow?.setAttribute('stroke-dashoffset', String(1 - l.fraction));
      halo?.setAttribute('stroke-dashoffset', String(1 - l.fraction));
      head?.setAttribute('transform', `translate(${l.head.x.toFixed(1)} ${l.head.y.toFixed(1)})`);
      const hit = reached(stops, l);
      dots.forEach((dot, i) => dot.toggleAttribute('data-lit', hit[i]));
      // Arrival is one-way: text that has arrived stays put when the reader scrolls back up.
      sections.forEach((section, i) => {
        if (hit[i]) section?.setAttribute('data-arrived', '');
      });
    };
    const trigger = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update, onRefresh: update });
    update();
    return () => {
      trigger.kill();
      root?.removeAttribute('data-arrive');
    };
  }, [nodes, samples, stops, motion]);

  return (
    <svg ref={svg} className="light-path" aria-hidden="true" width={size.w} height={size.h} viewBox={`0 0 ${size.w || 1} ${size.h || 1}`}>
      {d && (
        <>
          <defs>
            <radialGradient id="light-path-bloom">
              <stop offset="0" stopColor="#eaf6ff" stopOpacity="0.95" />
              <stop offset="0.35" stopColor="#4aa8ff" stopOpacity="0.45" />
              <stop offset="1" stopColor="#4aa8ff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path className="light-path__route" d={d} />
          <path className="light-path__halo" d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={motion ? 1 : 0} />
          <path className="light-path__glow" d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={motion ? 1 : 0} />
          <path className="light-path__core" d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={motion ? 1 : 0} />
          {stops.map((n, i) => (
            <circle key={i} className="light-path__node" cx={n.x} cy={n.y} r={6} />
          ))}
          {motion && (
            <g className="light-path__head" transform={`translate(${nodes[0].x} ${nodes[0].y})`}>
              <circle className="light-path__head-bloom" r={22} />
              <circle className="light-path__head-core" r={3.5} />
            </g>
          )}
        </>
      )}
    </svg>
  );
}
