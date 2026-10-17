import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { coverDraw } from '@/flight/crop';
import { flight } from '@/flight/flightData';
import { flightTarget, type Span } from '@/flight/flightTarget';
import { FrameStore } from '@/flight/FrameStore';
import { pickSet, SET_QUERIES, type FrameSet } from '@/flight/frameSet';
import { POSTER_FRAME } from '@/flight/poster';
import { frameUrl, matteUrl, pairFront, srcSize } from './filmAssets';
import { drawFront } from './front';

const base = import.meta.env.BASE_URL;
const STOP_FRAMES = flight.stops.map((s) => s.frame);
/** Seconds for the drawn frame to catch up with the scroll position. */
const LAG = 0.12;

function currentSet(): FrameSet {
  const width = typeof document === 'undefined' ? window.innerWidth : document.documentElement.clientWidth;
  const nav = typeof navigator === 'undefined' ? undefined : (navigator as Navigator & { connection?: { saveData?: boolean } });
  return pickSet(width, window.devicePixelRatio || 1, nav?.connection?.saveData ?? false);
}

/** The frame set for this screen, re-picked whenever one of its breakpoints flips. */
function useFrameSet(): FrameSet {
  const [set, setSet] = useState(currentSet);
  useEffect(() => {
    const lists = SET_QUERIES.map((q) => window.matchMedia(q));
    const onChange = () => setSet(currentSet());
    lists.forEach((l) => l.addEventListener('change', onChange));
    return () => lists.forEach((l) => l.removeEventListener('change', onChange));
  }, []);
  return set;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  return img.decode().then(() => img);
}

/** Viewport rects of the point sections, in order (null when one is missing). */
function pointSpans(ids: string[]): (Span | null)[] {
  return ids.map((id) => {
    const r = document.querySelector(`[data-point="${id}"]`)?.getBoundingClientRect();
    return r ? { top: r.top, bottom: r.bottom } : null;
  });
}

/**
 * The flight, full-bleed behind the landing. It holds still while a point's
 * section covers the middle of the screen and flies across the gaps between
 * points, driven by scroll. With motion off it shows one still per point.
 */
export default function Film({ motion, pointIds }: { motion: boolean; pointIds: string[] }) {
  const set = useFrameSet();
  const root = useRef<HTMLDivElement>(null);
  const front = useRef<HTMLCanvasElement>(null);
  // The poster stays a desktop or phone frame: index.html preloads exactly those.
  const posterSet = set === 'phone' ? 'phone' : 'desktop';

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = root.current!;
    const canvas = el.querySelector('canvas')!;
    const poster = el.querySelector('img')!;
    // The building layer over the light (see landing.css): each painted frame cut to its own matte.
    const frontCanvas = front.current!;
    const ctx = canvas.getContext('2d')!;
    const fctx = frontCanvas.getContext('2d')!;
    const src = srcSize(set);
    const url = (i: number) => frameUrl(base, set, i);
    const stillMattes = new Map<number, HTMLImageElement>();
    let lastImg: HTMLImageElement | null = null;
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let shown = -1;
    let painted = -1;
    let current = -1;
    let still: HTMLImageElement | null = null;
    let disposed = false;

    const paintFront = () => {
      if (lastImg) drawFront(fctx, lastImg, pairFront(painted, mattes ?? stillMattes), src, { w, h });
    };

    const paint = (img: HTMLImageElement, frame: number) => {
      const r = coverDraw(src.w, src.h, w, h);
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, r.dx, r.dy, r.dw, r.dh);
      poster.style.visibility = 'hidden';
      painted = frame;
      lastImg = img;
      paintFront();
    };

    const store = motion
      ? new FrameStore<HTMLImageElement>({
          frameCount: flight.frames,
          load: (i) => loadImage(url(i)),
          onLoad: (i) => {
            if (Math.abs(i - shown) < 6) {
              painted = -1;
              schedule();
            }
          },
        })
      : null;
    // Mattes stream alongside the frames; a matte that lands for the frame on screen repaints the building layer.
    const mattes = motion
      ? new FrameStore<HTMLImageElement>({
          frameCount: flight.frames,
          load: (i) => loadImage(matteUrl(base, set, i)),
          onLoad: (i) => {
            if (!disposed && i === painted) paintFront();
          },
        })
      : null;

    const showStill = (i: number) => {
      const f = STOP_FRAMES[i];
      const matte = loadImage(matteUrl(base, set, f)).then((m) => stillMattes.set(f, m), () => {});
      Promise.all([loadImage(url(f)), matte]).then(([img]) => {
        if (disposed || i !== current) return;
        still = img;
        paint(img, f);
      }, () => {});
    };

    function tick(now: number) {
      raf = 0;
      const target = flightTarget(pointSpans(pointIds), window.innerHeight, STOP_FRAMES);
      if (!store) {
        if (target.stop !== current) {
          current = target.stop;
          showStill(current);
        }
        return;
      }
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 1;
      last = now;
      shown = shown < 0 ? target.frame : shown + (target.frame - shown) * (1 - Math.exp(-dt / LAG));
      if (Math.abs(target.frame - shown) < 0.3) shown = target.frame;
      const f = Math.round(shown);
      store.setPlayhead(f);
      mattes?.setPlayhead(f);
      const hit = store.nearest(f);
      if (hit && hit.index !== painted) paint(hit.frame, hit.index);
      if (shown !== target.frame) schedule();
      else last = 0;
    }

    function schedule() {
      if (!raf && !disposed) raf = requestAnimationFrame(tick);
    }

    function layout() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = document.documentElement.clientWidth;
      h = window.innerHeight;
      for (const [c, x] of [[canvas, ctx], [frontCanvas, fctx]] as const) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
        x.setTransform(dpr, 0, 0, dpr, 0, 0);
        x.imageSmoothingQuality = 'high';
      }
      painted = -1;
      if (still) paint(still, STOP_FRAMES[current]);
      schedule();
    }

    layout();
    if (store) {
      let started = false;
      const begin = () => {
        if (!started) {
          started = true;
          store.start();
          mattes?.start();
        }
      };
      poster.decode().then(begin, begin);
    }
    const trigger = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: schedule, onRefresh: schedule });
    window.addEventListener('resize', layout);
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      trigger.kill();
      window.removeEventListener('resize', layout);
      ro.disconnect();
      store?.dispose();
      mattes?.dispose();
      // A new set brings its own frames and mattes; never leave this set's buildings over them.
      fctx.clearRect(0, 0, w, h);
    };
  }, [set, motion, pointIds]);

  return (
    <>
      <div ref={root} className="film" aria-hidden="true">
        <img className="film__poster" src={frameUrl(base, posterSet, POSTER_FRAME)} alt="" fetchPriority="high" />
        <canvas className="film__canvas" />
      </div>
      <div className="film-front" aria-hidden="true">
        <canvas ref={front} className="film__front" />
      </div>
    </>
  );
}
