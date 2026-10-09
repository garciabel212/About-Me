import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from '@/components/motion/SmoothScroll';
import { site } from '@/data/content';
import { mailto, resumeUrl } from '@/data/profile';
import { coverDraw, toScreen, type DrawRect } from './crop';
import { flight } from './flightData';
import { activeAt, glidePoint, panelHeight, threadPath, type Point } from './flow';
import { FrameStore } from './FrameStore';
import { puffLayout } from './mist';
import { resumeScroll } from './resumeScroll';
import StaticFlight from './StaticFlight';
import StopContent from './StopContent';
import { beachTabFor, STOP_LABEL, STOP_SECTIONS, type BeachTab } from './stops';
import { anchorTop, buildTimeline } from './timeline';
import { useFlightMode } from './useFlightMode';
import './flight.css';

gsap.registerPlugin(ScrollTrigger);

const base = import.meta.env.BASE_URL;
const pad = (n: number) => String(n).padStart(3, '0');
/** Scroll distance per timeline unit, in % of the viewport height. */
const VH_PER_UNIT = 4.2;
/** App's hash scroll lands 64 px above an anchor; anchors sit 64 px lower so a stop lands exactly. */
const HASH_OFFSET = 64;
const STOPS = flight.stops;
const LAST = STOPS.length - 1;
const PUFFS = puffLayout(9, 7);
const plan = buildTimeline(STOPS.map((s) => s.frame));
/** The intro glides over the last SETTLE frames into the River stop; the poster is its first frame. */
const SETTLE = 24;
const POSTER_FRAME = Math.max(0, STOPS[0].frame - SETTLE);
/** The reader's place when a Flight unmounts, so a phone rotating across the breakpoint resumes there. */
let carried: { start: number; end: number; y: number; at: number } | null = null;

function trackFor(vh: number) {
  return { height: Math.round((plan.total * VH_PER_UNIT * vh) / 100), vh };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  return img.decode().then(() => img);
}

export default function FlightHome() {
  const mode = useFlightMode();
  const { search, hash } = useLocation();
  const beachTab = beachTabFor(hash);
  if (mode === 'static' || search.includes('view=page')) {
    return <StaticFlight beachTab={beachTab} canFly={mode !== 'static'} />;
  }
  return <Flight key={mode} phone={mode === 'mobile'} beachTab={beachTab} />;
}

function Flight({ phone, beachTab }: { phone: boolean; beachTab?: BeachTab }) {
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);
  const root = useRef<HTMLElement>(null);
  const jump = useRef<(stop: number) => void>(() => {});
  // Anchors are placed on the first render, so a hash link from another page lands before any effect runs.
  const [track, setTrack] = useState(() => trackFor(window.innerHeight));
  const set = phone ? 'phone' : 'desktop';

  useEffect(() => {
    const el = root.current!;
    const q = <T extends Element>(sel: string) => el.querySelector(sel) as T;
    const qa = <T extends Element>(sel: string) => Array.from(el.querySelectorAll(sel)) as T[];
    const trackEl = q<HTMLElement>('.fl-track');
    const stage = q<HTMLElement>('.fl-stage');
    const canvas = q<HTMLCanvasElement>('.fl-canvas');
    const poster = q<HTMLImageElement>('.fl-poster');
    const wrap = q<HTMLElement>('.fl-cardwrap');
    const card = q<HTMLElement>('.fl-card');
    const eyebrowRow = q<HTMLElement>('.fl-eyebrows');
    const eyebrows = qa<HTMLElement>('.fl-eyebrow');
    const contents = qa<HTMLElement>('.fl-content');
    const inners = qa<HTMLElement>('.fl-inner');
    const puffs = qa<HTMLElement>('.fl-puff');
    const reticles = qa<HTMLElement>('.fl-reticle');
    const locks = qa<HTMLElement>('.fl-lock');
    const pin = q<HTMLElement>('.fl-pin');
    const stem = q<HTMLElement>('.fl-pin-stem');
    const ring = q<HTMLElement>('.fl-pin-ring');
    const threadLine = q<SVGPathElement>('.fl-thread-line');
    const threadFlow = q<SVGPathElement>('.fl-thread-flow');
    const threadEnd = q<SVGCircleElement>('.fl-thread-end');
    const routeFill = q<HTMLElement>('.fl-route-fill');
    const routeButtons = qa<HTMLButtonElement>('.fl-route button');
    const hint = q<HTMLElement>('.fl-hint');
    const ctx = canvas.getContext('2d')!;
    const items = (i: number) => Array.from(inners[i].children);

    const srcW = phone ? flight.phoneWidth : flight.width;
    const f0 = STOPS[0].frame;
    // Everything the timeline moves is plain state; render() turns it into pixels.
    const st = { frame: POSTER_FRAME, k: 0, open: 1, body: 0, x: 0 };
    const geo = {
      vw: 0, vh: 0, rect: { dx: 0, dy: 0, dw: 0, dh: 0 } as DrawRect, marks: [] as Point[],
      cardLeft: 0, cardW: 0, stripH: 64, contentH: [] as number[], maxH: [] as number[], lift: 0, trackH: 0,
    };
    let drawn = -1;
    let active = 0;
    let passed = -2;
    let current = -1;
    let tl: gsap.core.Timeline | null = null;

    const store = new FrameStore<HTMLImageElement>({
      frameCount: flight.frames,
      load: (i) => loadImage(`${base}flight/${set}/f${pad(i)}.webp`),
      onLoad: (i) => {
        if (Math.abs(i - st.frame) < 6) {
          drawn = -1;
          draw();
        }
        maybeSettle();
      },
    });

    /** Draws the nearest loaded frame, so a fast scrub never shows a blank canvas. */
    function draw() {
      const f = Math.round(st.frame);
      store.setPlayhead(f);
      const hit = store.nearest(f);
      if (!hit || hit.index === drawn) return;
      drawn = hit.index;
      ctx.drawImage(hit.frame, geo.rect.dx, geo.rect.dy, geo.rect.dw, geo.rect.dh);
      poster.style.visibility = 'hidden';
    }

    function render() {
      draw();
      const h = panelHeight(st.open, geo.contentH[st.body] ?? geo.stripH, geo.stripH, geo.maxH[st.body] ?? geo.vh * 0.5);
      const top = phone
        ? geo.vh - 56 - h
        : Math.max(96, Math.min(geo.vh * 0.5 - h * 0.46, geo.vh - 64 - h));
      const x = phone ? 0 : st.x;
      card.style.height = `${h}px`;
      card.classList.toggle('is-moving', st.open < 0.98);
      wrap.style.transform = `translate3d(${x}px, ${top}px, 0)`;

      const i = Math.min(Math.floor(st.k), LAST);
      const t = st.k - i;
      const p = t > 0 && i < LAST ? glidePoint(geo.marks[i], geo.marks[i + 1], t, geo.lift) : geo.marks[i];
      pin.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;

      const left = geo.cardLeft + x;
      const s = phone
        ? { x: Math.min(Math.max(p.x, left + 24), left + geo.cardW - 24), y: top }
        : { x: left + geo.cardW, y: top + 30 };
      const d = threadPath(s, p, phone ? 'sheet' : 'side');
      threadLine.setAttribute('d', d);
      threadFlow.setAttribute('d', d);
      threadEnd.setAttribute('cx', String(s.x));
      threadEnd.setAttribute('cy', String(s.y));

      routeFill.style.transform = `scaleX(${st.k / LAST})`;
      const near = Math.round(st.k);
      if (near !== current) {
        current = near;
        routeButtons.forEach((b, j) => (j === near ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')));
      }
      const reached = Math.floor(st.k + 0.001);
      if (reached !== passed) {
        passed = reached;
        routeButtons.forEach((b, j) => b.classList.toggle('is-passed', j <= reached));
      }
      // Only the stop on the card is reachable; the rest stay in the DOM for reading order but are inert.
      const now = activeAt(plan.segments, tl ? tl.time() : 0);
      if (now !== active) {
        active = now;
        contents.forEach((c, j) => {
          c.inert = j !== now;
          c.setAttribute('aria-hidden', String(j !== now));
        });
      }
    }

    function measure() {
      const cs = getComputedStyle(card);
      geo.stripH = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + eyebrowRow.offsetHeight;
      geo.contentH = inners.map((inner) => geo.stripH + inner.offsetHeight);
      geo.cardLeft = wrap.offsetLeft;
      geo.cardW = wrap.offsetWidth;
    }

    function layout() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      geo.vw = window.innerWidth;
      geo.vh = stage.clientHeight;
      canvas.width = Math.round(geo.vw * dpr);
      canvas.height = Math.round(geo.vh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingQuality = 'high';
      geo.rect = coverDraw(srcW, flight.height, geo.vw, geo.vh);
      geo.marks = STOPS.map((s) => toScreen(geo.rect, phone ? s.phoneX : s.x, s.y));
      geo.marks.forEach((m, i) => {
        for (const mark of [reticles[i], locks[i]]) {
          mark.style.left = `${m.x}px`;
          mark.style.top = `${m.y}px`;
        }
      });
      // The card never covers its own landmark: on phones the sheet stops short of the pin.
      geo.maxH = geo.marks.map((m) => (phone ? Math.max(geo.vh * 0.3, Math.min(geo.vh * 0.58, geo.vh - 56 - m.y - 70)) : geo.vh - 160));
      geo.lift = geo.vh * 0.12;
      geo.trackH = trackFor(geo.vh).height;
      trackEl.style.height = `${geo.trackH}px`;
      measure();
      drawn = -1;
      render();
      setTrack({ height: geo.trackH, vh: geo.vh });
    }

    // Initial state: stop 1 is open at first paint (the hero never waits for an animation).
    gsap.set(eyebrows.slice(1), { opacity: 0 });
    gsap.set([...reticles.slice(1), ...locks.slice(1)], { opacity: 0 });
    gsap.set([reticles[0], locks[0]], { opacity: 1, scale: 1 });
    gsap.set(puffs, { opacity: 0, xPercent: -50, yPercent: -50, scale: 0.4 });
    gsap.set(stem, { opacity: 1, scaleY: 1 });
    gsap.set(ring, { opacity: 0 });

    tl = gsap.timeline({ paused: true, defaults: { ease: 'none' }, onUpdate: render });
    const lazy = { immediateRender: false };
    for (const seg of plan.segments) {
      const at = seg.start;
      const d = seg.end - seg.start;
      const i = seg.stop;
      if (seg.kind === 'fold') {
        // The content mists out and the card narrows to the travel strip; it never leaves the screen.
        tl.to(items(i), { opacity: 0, y: -6, filter: 'blur(4px)', duration: 2, stagger: 0.08 }, at)
          .to(puffs, { opacity: 0.85, scale: 1.1, duration: 2, stagger: 0.05 }, at + 0.5)
          .to([reticles[i], locks[i]], { opacity: 0, duration: 2 }, at + 1)
          .to(stem, { opacity: 0, scaleY: 0, duration: 2 }, at + 1)
          .to(st, { open: 0, duration: 3, ease: 'power2.inOut' }, at + 1)
          .to(puffs, { opacity: 0, xPercent: -20, scale: 1.4, duration: 2.5, stagger: 0.04 }, at + 3.5);
      } else if (seg.kind === 'hop') {
        // The camera flies, the pin glides to the next landmark along the thread, the strip names the next stop.
        tl.fromTo(st, { frame: seg.fromFrame }, { frame: seg.toFrame, duration: d, ...lazy }, at)
          .fromTo(st, { k: i }, { k: i + 1, duration: d, ease: 'sine.inOut', ...lazy }, at)
          .to(eyebrows[i], { opacity: 0, y: -6, duration: d * 0.08 }, at + d * 0.42)
          .set(st, { body: i + 1 }, at + d * 0.5)
          .fromTo(eyebrows[i + 1], { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: d * 0.1 }, at + d * 0.48);
        if (!phone) {
          tl.to(st, { x: -14, duration: d / 2, ease: 'sine.out' }, at).to(st, { x: 0, duration: d / 2, ease: 'sine.in' }, at + d / 2);
        }
      } else if (seg.kind === 'reveal') {
        // Lock on, the pin lands, mist gathers at the card, the card opens and the content condenses.
        tl.fromTo(reticles[i], { opacity: 0, scale: 5 }, { opacity: 1, scale: 3.4, duration: 3, ease: 'power1.out' }, at)
          .to(reticles[i], { scale: 1, duration: 4, ease: 'power3.inOut' }, at + 3)
          .fromTo(locks[i], { opacity: 0 }, { opacity: 1, duration: 2 }, at + 6)
          .fromTo(stem, { opacity: 0, scaleY: 0 }, { opacity: 1, scaleY: 1, duration: 3, ease: 'power2.out', ...lazy }, at + 7)
          .fromTo(ring, { opacity: 0.9, scale: 0.2 }, { opacity: 0, scale: 2.4, duration: 3, ease: 'power2.out', ...lazy }, at + 9)
          .fromTo(puffs, { opacity: 0, scale: 0.5, xPercent: -80 }, { opacity: 1, scale: 1.15, xPercent: -50, duration: 5, stagger: 0.2, ease: 'power2.out', ...lazy }, at + 7)
          .to(st, { open: 1, duration: 5, ease: 'power2.inOut' }, at + 8)
          .fromTo(items(i), { opacity: 0, y: 8, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 3, stagger: 0.3, ease: 'power2.out' }, at + 10.5)
          .to(puffs, { opacity: 0, scale: 0.7, duration: 4, stagger: 0.15 }, at + 13)
          .to(reticles[i], { opacity: 0.45, duration: 2 }, at + 12);
      } else if (seg.kind === 'tail') {
        tl.to({}, { duration: d }, at);
      }
    }
    Object.assign(st, { frame: POSTER_FRAME, k: 0, open: 1, body: 0, x: 0 });

    layout();
    // The poster frame paints first; the rest of the film loads after it, coarse to fine.
    let started = false;
    const startLoading = () => { if (!started) { started = true; store.start(); } };
    poster.decode().then(startLoading, startLoading);
    // The reader's place, recorded outside refreshes so a resize can't skew it.
    let place = { start: 0, end: 1, y: 0 };
    let refreshing = false;
    const onRefreshInit = () => { refreshing = true; };
    const onRefreshed = () => { refreshing = false; };
    ScrollTrigger.addEventListener('refreshInit', onRefreshInit);
    ScrollTrigger.addEventListener('refresh', onRefreshed);
    const trigger = ScrollTrigger.create({
      trigger: trackEl, start: 'top top', end: 'bottom bottom', scrub: 0.7, animation: tl,
      onUpdate: (self) => { if (!refreshing) place = { start: self.start, end: self.end, y: window.scrollY }; },
    });
    /** The flight's scroll range from the layout itself (ScrollTrigger measures it lazily). */
    const range = () => {
      const top = trackEl.getBoundingClientRect().top + window.scrollY;
      return { start: top, end: top + Math.max(0, geo.trackH - geo.vh) };
    };
    place = { ...range(), y: window.scrollY };
    const scrollToY = (y: number) => {
      const l = lenisRef.current;
      if (l) {
        l.resize();
        l.scrollTo(y, { immediate: true, force: true });
      } else window.scrollTo(0, y);
    };
    // Rotated across the phone/desktop breakpoint: the previous Flight just unmounted; resume its place.
    let pendingResume: typeof carried = null;
    let resumeFrame = 0;
    if (carried && performance.now() - carried.at < 1500) {
      pendingResume = carried;
      carried = null;
      const y = resumeScroll(pendingResume, range());
      resumeFrame = requestAnimationFrame(() => {
        pendingResume = null;
        scrollToY(y);
      });
    }

    jump.current = (stop: number) => {
      const y = trackEl.getBoundingClientRect().top + window.scrollY + anchorTop(plan.readingAt[stop], plan.total, geo.trackH, geo.vh);
      if (lenisRef.current) lenisRef.current.scrollTo(y, { duration: 2.4 });
      else window.scrollTo({ top: y, behavior: 'smooth' });
    };

    // Intro: once the frames into the River are loaded, the camera glides from the poster frame onto the
    // stop. The hero card is readable from the first paint; scrolling first skips the glide.
    let settle: gsap.core.Tween | null = null;
    let settled = false;
    function maybeSettle() {
      if (settled || settle) return;
      for (let f = POSTER_FRAME; f <= f0; f += 2) if (!store.get(f)) return;
      settle = gsap.to(st, {
        frame: f0, duration: 3, ease: 'power2.out', onUpdate: render,
        onComplete: () => { settled = true; gsap.to(hint, { opacity: 1, duration: 0.6 }); },
      });
    }
    const onScroll = () => {
      if (window.scrollY <= 4) return;
      settled = true;
      settle?.progress(1, true);
      st.frame = Math.max(st.frame, f0);
      gsap.killTweensOf(hint);
      gsap.to(hint, { opacity: 0, duration: 0.3 });
      render();
      window.removeEventListener('scroll', onScroll);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Resize or rotate: re-measure, rebuild the track and keep the reader at the same place in the flight.
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const before = place;
        layout();
        ScrollTrigger.refresh();
        scrollToY(resumeScroll(before, range()));
      }, 120);
    };
    window.addEventListener('resize', onResize);
    // Tabs, "Show all" and late fonts change a stop's height; the card follows.
    const ro = new ResizeObserver(() => {
      measure();
      render();
    });
    inners.forEach((inner) => ro.observe(inner));

    // The flight fills the window edge to edge: no page scrollbar while it is on screen.
    document.documentElement.classList.add('fl-edge');

    return () => {
      // A resume that never ran (unmounted again at once, e.g. StrictMode) is handed on unchanged.
      cancelAnimationFrame(resumeFrame);
      carried = pendingResume ? { ...pendingResume, at: performance.now() } : { ...place, at: performance.now() };
      document.documentElement.classList.remove('fl-edge');
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      ScrollTrigger.removeEventListener('refreshInit', onRefreshInit);
      ScrollTrigger.removeEventListener('refresh', onRefreshed);
      clearTimeout(resizeTimer);
      ro.disconnect();
      settle?.kill();
      trigger.kill();
      tl?.kill();
      store.dispose();
    };
  }, [phone, set]);

  const anchorY = (i: number) => anchorTop(plan.readingAt[i], plan.total, track.height, track.vh) + HASH_OFFSET;

  return (
    <main ref={root} className="fl-root" aria-label={`${site.name}: portfolio`}>
      <div className="fl-track" style={{ height: track.height }}>
        {STOPS.map((stop, i) =>
          STOP_SECTIONS[stop.id].map((id) => (
            <span key={id} id={id} className="fl-anchor" style={{ top: i === 0 ? 0 : anchorY(i) }} />
          )),
        )}
        <div className="fl-stage">
          <img className="fl-poster" src={`${base}flight/${set}/f${pad(POSTER_FRAME)}.webp`} alt="" fetchPriority="high" />
          <canvas className="fl-canvas" aria-hidden="true" />
          <div className="fl-veil" aria-hidden="true" />
          <div className="fl-overlay" aria-hidden="true">
            <svg className="fl-thread">
              <path className="fl-thread-line" />
              <path className="fl-thread-flow" />
              <circle className="fl-thread-end" r="3" />
            </svg>
            {STOPS.map((stop) => (
              <div key={stop.id}>
                <div className="fl-reticle"><span /><span /><span /><span /></div>
                <div className="fl-lock">Lock · <em>{stop.place}</em><br />{stop.coords}</div>
              </div>
            ))}
            <div className="fl-pin">
              <div className="fl-pin-stem" />
              <div className="fl-pin-ring" />
              <div className="fl-pin-pulse" />
              <div className="fl-pin-dot" />
            </div>
          </div>

          <header className="fl-hud-top">
            <a className="fl-brand" href="#intro" onClick={(e) => { e.preventDefault(); jump.current(0); }}><i />{site.name}</a>
            <nav className="fl-route-nav" aria-label="Flight stops">
              <span className="fl-route-line" aria-hidden="true" />
              <span className="fl-route-fill" aria-hidden="true" />
              <ol className="fl-route">
                {STOPS.map((stop, i) => (
                  <li key={stop.id}>
                    <button type="button" onClick={() => jump.current(i)} aria-label={`${STOP_LABEL[stop.id]}: ${stop.place}`}>
                      <i /><span>{stop.place}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="fl-hud-actions">
              <a className="fl-hud-btn fl-hud-resume" href={resumeUrl} target="_blank" rel="noopener">Résumé</a>
              <a className="fl-hud-btn" href={mailto}>Email</a>
            </div>
          </header>

          <div className="fl-cardwrap">
            <div className="fl-puffs" aria-hidden="true">
              {PUFFS.map((p, i) => (
                <span key={i} className="fl-puff" style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, width: p.r * 2, height: p.r * 2 }} />
              ))}
            </div>
            <article className="fl-card" aria-label="Portfolio">
              <div className="fl-eyebrows" aria-hidden="true">
                {STOPS.map((stop) => (
                  <p key={stop.id} className="fl-eyebrow"><i />{STOP_LABEL[stop.id]} · {stop.place}</p>
                ))}
              </div>
              <div className="fl-contents">
                {STOPS.map((stop, i) => (
                  <section key={stop.id} className="fl-content" data-lenis-prevent inert={i !== 0} aria-hidden={i !== 0}
                    aria-label={`${STOP_LABEL[stop.id]}: ${stop.place}`}>
                    <div className="fl-inner"><StopContent id={stop.id} beachTab={beachTab} /></div>
                  </section>
                ))}
              </div>
            </article>
          </div>

          <div className="fl-hint" aria-hidden="true">Scroll to fly</div>
          <footer className="fl-hud-bottom">
            <Link to="/?view=page">Read as a page</Link>
          </footer>
        </div>
      </div>
    </main>
  );
}
