import { useEffect, useRef, useState } from 'react';
import { sectionIds } from '@/data/routes';
import { flight } from './flightData';
import { FrameStore } from './FrameStore';
import { flightTarget } from './flightTarget';
import { coverSource, lerpRect, type Rect } from './windowRect';
import './flight.css';

const base = import.meta.env.BASE_URL;
const pad = (n: number) => String(n).padStart(3, '0');
const STOP_FRAMES = flight.stops.map((s) => s.frame);
const PHONE = '(max-width: 767px)';
const SPLIT = '(min-width: 1024px)';
const REDUCED = '(prefers-reduced-motion: reduce)';
/** Seconds for the drawn frame to catch up with the scroll position. */
const LAG = 0.12;
/** Corner radius of the film window, in px. */
const RADIUS = 18;

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

const ease = (t: number) => t * t * (3 - 2 * t);

/**
 * Cinematic mode's film: the dusk flight over Miami. The Overview shows it
 * full-bleed; on wide screens it then settles into a framed window beside the
 * reading column (split screen), and on narrow ones it stays behind the page
 * and shows between sections. Each section holds still at its stop; the camera
 * only flies across the gaps between sections, driven by scroll. With motion
 * off it shows one still per section and changes layout without animating.
 */
export default function FlightBackdrop({ motion }: { motion: boolean }) {
  const phone = useMatches(PHONE);
  const split = useMatches(SPLIT);
  const root = useRef<HTMLDivElement>(null);
  const [stop, setStop] = useState(0);
  const set = phone ? 'phone' : 'desktop';

  useEffect(() => {
    const el = root.current!;
    const canvas = el.querySelector('canvas')!;
    const poster = el.querySelector<HTMLImageElement>('.cine-poster')!;
    const veil = el.querySelector<HTMLElement>('.cine-veil')!;
    const hud = el.querySelector<HTMLElement>('.cine-hud')!;
    const slot = el.querySelector<HTMLElement>('.cine-window')!;
    const ctx = canvas.getContext('2d')!;
    const srcW = phone ? flight.phoneWidth : flight.width;
    const srcH = flight.height;
    const focus = flight.stops.map((s) => (phone ? s.phoneX : s.x));
    const url = (i: number) => `${base}flight/${set}/f${pad(i)}.webp`;
    const reduce = () => window.matchMedia(REDUCED).matches;
    let full: Rect = { x: 0, y: 0, w: 0, h: 0 };
    let windowRect: Rect = full;
    let raf = 0;
    let last = 0;
    let shown = -1;
    let drawnKey = '';
    let currentStop = -1;
    let morph = 0;
    let disposed = false;

    /** How far the film has settled from full-bleed into the window (0–1), from the first gap's progress. */
    const morphFor = (frame: number, stopIndex: number) => {
      if (!split) return 0;
      if (!motion) return stopIndex >= 1 ? 1 : 0;
      return Math.min(1, Math.max(0, (frame - STOP_FRAMES[0]) / (STOP_FRAMES[1] - STOP_FRAMES[0])));
    };

    /** Horizontal focus of the crop: the landmark of the stop the camera is nearest. */
    const focusAt = (frame: number) => {
      for (let i = 0; i < STOP_FRAMES.length - 1; i += 1) {
        if (frame <= STOP_FRAMES[i + 1]) {
          const t = (frame - STOP_FRAMES[i]) / (STOP_FRAMES[i + 1] - STOP_FRAMES[i]);
          return focus[i] + (focus[i + 1] - focus[i]) * Math.max(0, t);
        }
      }
      return focus[focus.length - 1];
    };

    const paint = (img: HTMLImageElement, frame: number, alpha = 1) => {
      const m = ease(morph);
      const r = lerpRect(full, windowRect, m);
      const s = coverSource(srcW, srcH, r.w, r.h, m > 0 ? focusAt(frame) : 0.5);
      ctx.save();
      if (alpha === 1) ctx.clearRect(0, 0, full.w, full.h);
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.roundRect(r.x, r.y, r.w, r.h, RADIUS * m);
      ctx.clip();
      ctx.drawImage(img, s.x, s.y, s.w, s.h, r.x, r.y, r.w, r.h);
      ctx.restore();
      poster.style.visibility = 'hidden';
      // The overview's scrim belongs to the full-bleed film only.
      veil.style.opacity = String(1 - m);
      slot.style.opacity = String(m);
      // The heads-up line (place, coordinates, route) rides the bottom edge of the film.
      hud.style.transform = `translate3d(${Math.round(r.x)}px, ${Math.round(r.y + r.h)}px, 0) translateY(-100%)`;
      hud.style.width = `${Math.round(r.w)}px`;
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
              drawnKey = '';
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
    let onScreen: { img: HTMLImageElement; stop: number } | null = null;
    const showStill = (i: number) => {
      still(i).then((img) => {
        if (disposed || i !== currentStop) return;
        cancelAnimationFrame(fade);
        const from = onScreen;
        onScreen = { img, stop: i };
        morph = morphFor(STOP_FRAMES[i], i);
        if (!from || from.stop === 0 || i === 0 || reduce()) {
          paint(img, STOP_FRAMES[i]);
          return;
        }
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / 450);
          paint(from.img, STOP_FRAMES[from.stop]);
          paint(img, STOP_FRAMES[i], t);
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
      morph = morphFor(shown, target.stop);
      const f = Math.round(shown);
      store.setPlayhead(f);
      const hit = store.nearest(f);
      const key = hit ? `${hit.index}:${morph.toFixed(3)}` : '';
      if (hit && key !== drawnKey) {
        drawnKey = key;
        paint(hit.frame, shown);
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
      full = { x: 0, y: 0, w, h };
      const s = slot.getBoundingClientRect();
      windowRect = split && s.width > 0 ? { x: s.left, y: s.top, w: s.width, h: s.height } : full;
      drawnKey = '';
      if (!store && onScreen) paint(onScreen.img, STOP_FRAMES[onScreen.stop]);
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
  }, [phone, split, set, motion]);

  const place = flight.stops[stop];
  return (
    <div ref={root} className="cine-backdrop" aria-hidden="true">
      <img className="cine-poster" src={`${base}flight/${set}/f${pad(STOP_FRAMES[0])}.webp`} alt="" fetchPriority="high" />
      <canvas className="cine-canvas" />
      <div className="cine-veil" />
      <div className="cine-window" />
      <div className="cine-hud">
        <p className="cine-hud__place">
          <i />
          <b>{place.place}</b>
          <span>{place.coords}</span>
        </p>
        <ol className="cine-hud__route">
          {flight.stops.map((s, i) => (
            <li key={s.id} className={i < stop ? 'is-passed' : i === stop ? 'is-here' : undefined} />
          ))}
        </ol>
      </div>
    </div>
  );
}
