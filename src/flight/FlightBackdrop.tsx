import { useEffect, useRef, useState } from 'react';
import { sectionIds } from '@/data/routes';
import { coverDraw, type DrawRect } from './crop';
import { flight } from './flightData';
import { FrameStore } from './FrameStore';
import { flightTarget } from './flightTarget';
import './flight.css';

const base = import.meta.env.BASE_URL;
const pad = (n: number) => String(n).padStart(3, '0');
const STOP_FRAMES = flight.stops.map((s) => s.frame);
const PHONE = '(max-width: 767px)';
const REDUCED = '(prefers-reduced-motion: reduce)';
/** Seconds for the drawn frame to catch up with the scroll position. */
const LAG = 0.12;

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

/**
 * Cinematic mode's backdrop: the dusk flight over Miami, fixed behind the page.
 * Each Home section holds still at its stop; the camera only flies across the
 * empty gaps between sections, driven by scroll, so it never moves on its own
 * and never delays or covers content. With motion off it shows one still per
 * section instead (and loads only those six frames).
 */
export default function FlightBackdrop({ motion }: { motion: boolean }) {
  const phone = useMatches(PHONE);
  const root = useRef<HTMLDivElement>(null);
  const [stop, setStop] = useState(0);
  const set = phone ? 'phone' : 'desktop';

  useEffect(() => {
    const el = root.current!;
    const canvas = el.querySelector('canvas')!;
    const poster = el.querySelector('img')!;
    const ctx = canvas.getContext('2d')!;
    const srcW = phone ? flight.phoneWidth : flight.width;
    const url = (i: number) => `${base}flight/${set}/f${pad(i)}.webp`;
    let rect: DrawRect = { dx: 0, dy: 0, dw: 0, dh: 0 };
    let raf = 0;
    let last = 0;
    let shown = -1;
    let drawn = -1;
    let currentStop = -1;
    let disposed = false;

    const paint = (img: HTMLImageElement, alpha = 1) => {
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, rect.dx, rect.dy, rect.dw, rect.dh);
      ctx.globalAlpha = 1;
      poster.style.visibility = 'hidden';
    };

    const measure = () => sectionIds.map((id) => {
      const r = document.getElementById(id)?.getBoundingClientRect();
      return r ? { top: r.top, bottom: r.bottom } : null;
    });

    // Motion on: the whole film, loaded coarse to fine, scrubbed across the gaps.
    const store = motion
      ? new FrameStore<HTMLImageElement>({
          frameCount: flight.frames,
          load: (i) => loadImage(url(i)),
          onLoad: (i) => {
            if (Math.abs(i - shown) < 6) {
              drawn = -1;
              schedule();
            }
          },
        })
      : null;

    // Motion off: one still per stop, cross-faded (instantly under reduced motion).
    const stills = new Map<number, Promise<HTMLImageElement>>();
    const still = (i: number) => {
      if (!stills.has(i)) stills.set(i, loadImage(url(STOP_FRAMES[i])));
      return stills.get(i)!;
    };
    let fade = 0;
    let onScreen: HTMLImageElement | null = null;
    const showStill = (i: number) => {
      still(i).then((img) => {
        if (disposed || i !== currentStop) return;
        cancelAnimationFrame(fade);
        const from = onScreen;
        onScreen = img;
        if (!from || window.matchMedia(REDUCED).matches) {
          paint(img);
          return;
        }
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / 450);
          paint(from);
          paint(img, t);
          if (t < 1) fade = requestAnimationFrame(step);
        };
        fade = requestAnimationFrame(step);
      }, () => {});
    };

    function tick(now: number) {
      raf = 0;
      const target = flightTarget(measure(), window.innerHeight, STOP_FRAMES);
      if (target.stop !== currentStop) {
        currentStop = target.stop;
        setStop(target.stop);
        if (!store) showStill(target.stop);
      }
      if (!store) return;
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 1;
      last = now;
      shown = shown < 0 ? target.frame : shown + (target.frame - shown) * (1 - Math.exp(-dt / LAG));
      if (Math.abs(target.frame - shown) < 0.3) shown = target.frame;
      const f = Math.round(shown);
      store.setPlayhead(f);
      const hit = store.nearest(f);
      if (hit && hit.index !== drawn) {
        drawn = hit.index;
        paint(hit.frame);
      }
      if (shown !== target.frame) schedule();
      else last = 0;
    }

    function schedule() {
      if (!raf && !disposed) raf = requestAnimationFrame(tick);
    }

    function layout() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingQuality = 'high';
      rect = coverDraw(srcW, flight.height, w, h);
      drawn = -1;
      if (!store && onScreen) paint(onScreen);
      schedule();
    }

    layout();
    if (store) {
      let started = false;
      const begin = () => { if (!started) { started = true; store.start(); } };
      poster.decode().then(begin, begin);
    }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', layout);
    // Sections change height when details open or images load; the flight follows.
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(fade);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', layout);
      ro.disconnect();
      store?.dispose();
    };
  }, [phone, set, motion]);

  const place = flight.stops[stop];
  return (
    <div ref={root} className="cine-backdrop" aria-hidden="true">
      <img className="cine-poster" src={`${base}flight/${set}/f${pad(STOP_FRAMES[0])}.webp`} alt="" fetchPriority="high" />
      <canvas className="cine-canvas" />
      <div className="cine-veil" />
      <p className="cine-place">
        <i />{place.place} · {place.coords}
      </p>
    </div>
  );
}
