import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { coverDraw } from '@/flight/crop';
import { flight } from '@/flight/flightData';
import { flightTarget } from '@/flight/flightTarget';
import { FrameStore } from '@/flight/FrameStore';
import { POSTER_FRAME } from '@/flight/poster';
import { siteSpans, useMatches } from './dom';
import { setDrawnFrame } from './filmState';
import { PHONE_QUERY } from './geometry';

const base = import.meta.env.BASE_URL;
const pad = (n: number) => String(n).padStart(3, '0');
const STOP_FRAMES = flight.stops.map((s) => s.frame);
/** Seconds for the drawn frame to catch up with the scroll position. */
const LAG = 0.12;

function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  return img.decode().then(() => img);
}

/**
 * The flight, full-bleed behind the survey. It holds still while a site's
 * section covers the reading line and flies across the gaps between sites,
 * driven by scroll. With motion off it shows one still per site.
 */
export default function SurveyFilm({ motion, siteIds }: { motion: boolean; siteIds: string[] }) {
  const phone = useMatches(PHONE_QUERY);
  const root = useRef<HTMLDivElement>(null);
  const set = phone ? 'phone' : 'desktop';

  useEffect(() => {
    // Registered here, not at import, so node tests can import this module without a DOM.
    gsap.registerPlugin(ScrollTrigger);
    const el = root.current!;
    const canvas = el.querySelector('canvas')!;
    const poster = el.querySelector('img')!;
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
    let still: { img: HTMLImageElement; frame: number } | null = null;
    let disposed = false;

    const paint = (img: HTMLImageElement, frame: number) => {
      const r = coverDraw(srcW, srcH, w, h);
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, r.dx, r.dy, r.dw, r.dh);
      poster.style.visibility = 'hidden';
      painted = frame;
      setDrawnFrame(frame);
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
        still = { img, frame: STOP_FRAMES[i] };
        paint(img, STOP_FRAMES[i]);
      }, () => {});
    };

    function tick(now: number) {
      raf = 0;
      const target = flightTarget(siteSpans(siteIds), window.innerHeight, STOP_FRAMES);
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
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingQuality = 'high';
      painted = -1;
      if (still) paint(still.img, still.frame);
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
      setDrawnFrame(-1);
    };
  }, [phone, set, motion, siteIds]);

  return (
    <div ref={root} className="survey-film" aria-hidden="true">
      <img className="survey-film__poster" src={`${base}flight/${set}/f${pad(POSTER_FRAME)}.webp`} alt="" fetchPriority="high" />
      <canvas className="survey-film__canvas" />
    </div>
  );
}
