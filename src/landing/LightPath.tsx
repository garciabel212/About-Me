import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { lightFor, pathD, samplePath, type Node } from './lightCurve';

/** Centers of the points' light nodes, relative to the landing's top-left. */
export function measureNodes(root: Element): Node[] {
  const r = root.getBoundingClientRect();
  return [...root.querySelectorAll('[data-node]')].map((el) => {
    const b = el.getBoundingClientRect();
    return { x: b.left - r.left + b.width / 2, y: b.top - r.top + b.height / 2 };
  });
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

  // Measure the nodes now and whenever the landing changes size (fonts, images, opened details, resize).
  useLayoutEffect(() => {
    const root = svg.current?.parentElement;
    if (!root) return;
    const measure = () => {
      setNodes(measureNodes(root));
      setSize({ w: root.clientWidth, h: root.scrollHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    document.fonts?.ready.then(measure, () => {});
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = svg.current;
    if (!el || nodes.length < 2) return;
    const core = el.querySelector<SVGPathElement>('.light__core');
    const glow = el.querySelector<SVGPathElement>('.light__glow');
    const head = el.querySelector<SVGCircleElement>('.light__head');
    const dots = [...el.querySelectorAll<SVGCircleElement>('.light__node')];
    const update = () => {
      const top = (el.parentElement?.getBoundingClientRect().top ?? 0) + window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const l = lightFor(samples, nodes, { scrollY: window.scrollY, vh: window.innerHeight, maxScroll, top, motion });
      core?.setAttribute('stroke-dashoffset', String(1 - l.fraction));
      glow?.setAttribute('stroke-dashoffset', String(1 - l.fraction));
      head?.setAttribute('cx', l.head.x.toFixed(1));
      head?.setAttribute('cy', l.head.y.toFixed(1));
      dots.forEach((dot, i) => dot.toggleAttribute('data-lit', i < l.lit));
    };
    const trigger = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update, onRefresh: update });
    update();
    return () => trigger.kill();
  }, [nodes, samples, motion]);

  return (
    <svg ref={svg} className="light" aria-hidden="true" width={size.w} height={size.h} viewBox={`0 0 ${size.w || 1} ${size.h || 1}`}>
      {d && (
        <>
          <path className="light__route" d={d} />
          <path className="light__glow" d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={motion ? 1 : 0} />
          <path className="light__core" d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={motion ? 1 : 0} />
          {nodes.map((n, i) => (
            <circle key={i} className="light__node" cx={n.x} cy={n.y} r={6} />
          ))}
          {motion && <circle className="light__head" cx={nodes[0].x} cy={nodes[0].y} r={5} />}
        </>
      )}
    </svg>
  );
}
