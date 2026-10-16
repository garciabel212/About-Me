import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { coverDraw } from '@/flight/crop';
import { flight } from '@/flight/flightData';
import { flightTarget, type Span } from '@/flight/flightTarget';
import { FrameStore } from '@/flight/FrameStore';
import { POSTER_FRAME } from '@/flight/poster';

const base = import.meta.env.BASE_URL;
const pad = (n: number) => String(n).padStart(3, '0');
const STOP_FRAMES = flight.stops.map((s) => s.frame);
const PHONE = '(max-width: 767px)';
/** Seconds for the drawn frame to catch up with the scroll position. */
const LAG = 0.12;

/**
 * Which stop the film is holding at, from the frame on screen: -1 while flying. A frame
 * of slack covers the eased catch-up landing one frame short of the stop.
 */
export function heldStop(frame: number, stopFrames: number[]): number {
  return frame < 0 ? -1 : stopFrames.findIndex((f) => Math.abs(frame - f) <= 1);
}

function useMatches(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = () => setMatches(list.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);
  return matches;
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
  const phone = useMatches(PHONE);
  const root = useRef<HTMLDivElement>(null);
  const set = phone ? 'phone' : 'desktop';

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = root.current!;
    const canvas = el.querySelector('canvas')!;
    const poster = el.querySelector('img')!;
    // Building cut-outs, one per stop, in their own layer over the light (see landing.css).
    const cutouts = [...(el.parentElement?.querySelectorAll<HTMLImageElement>('.film__occluder') ?? [])];
    const ctx = canvas.getContext('2d')!;
    const srcW = phone ? flight.phoneWidth : flight.width;
    const srcH = flight.height;
    const url = (i: number) => `${base}flight/${set}/f${pad(i)}.webp`;
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let shown = -1;
    let painted = -1;
    let current = -1;
    let still: HTMLImageElement | null = null;
    let disposed = false;

    const paint = (img: HTMLImageElement, frame: number) => {
      const r = coverDraw(srcW, srcH, w, h);
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, r.dx, r.dy, r.dw, r.dh);
      poster.style.visibility = 'hidden';
      painted = frame;
      // While the camera holds at a stop, that stop's buildings stand in front of the light.
      const held = heldStop(frame, STOP_FRAMES);
      cutouts.forEach((c, i) => c.toggleAttribute('data-on', i === held));
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

    const showStill = (i: number) => {
      loadImage(url(STOP_FRAMES[i])).then((img) => {
        if (disposed || i !== current) return;
        still = img;
        paint(img, STOP_FRAMES[i]);
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
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingQuality = 'high';
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
    };
  }, [phone, set, motion, pointIds]);

  return (
    <>
      <div ref={root} className="film" aria-hidden="true">
        <img className="film__poster" src={`${base}flight/${set}/f${pad(POSTER_FRAME)}.webp`} alt="" fetchPriority="high" />
        <canvas className="film__canvas" />
      </div>
      <div className="film-occluders" aria-hidden="true">
        {flight.stops.map((s) => (
          <img key={s.id} className="film__occluder" src={`${base}flight/occluders/${set}/${s.id}.webp`} alt="" decoding="async" />
        ))}
      </div>
    </>
  );
}
