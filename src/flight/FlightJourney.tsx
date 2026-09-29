import { useEffect, useMemo, useRef, useState, type FocusEvent, type MouseEvent } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLenis } from '@/components/motion/SmoothScroll';
import FlightCanvas from './FlightCanvas';
import StagePanel from './StagePanel';
import IntroBeat from './beats/IntroBeat';
import ServiceMapBeat from './beats/ServiceMapBeat';
import { FrameStore } from './FrameStore';
import { M1 } from './generated/m1';
import { frameUrl, stillUrl, totalScrollVh } from './manifest';
import { progressToFrame, segmentRanges } from './scrollMap';
import { M1_BEATS, beatFocusProgress, beatOpacity, resolveBeat, type BeatId } from './beats';
import { useFlightMode } from './useFlightMode';

gsap.registerPlugin(ScrollTrigger);

function loadImage(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.decoding = 'async';
  image.src = url;
  return image.decode().then(() => image);
}

// The top band keeps the transparent navbar legible over bright sky in either theme.
const NAV_BAND = 'linear-gradient(180deg, color-mix(in srgb, var(--bg) 88%, transparent) 0, transparent 140px)';
const SCRIM = {
  desktop: `${NAV_BAND}, linear-gradient(90deg, color-mix(in srgb, var(--bg) 55%, transparent) 0%, transparent 60%)`,
  mobile: `${NAV_BAND}, linear-gradient(0deg, color-mix(in srgb, var(--bg) 55%, transparent) 0%, transparent 55%)`,
};

export default function FlightJourney() {
  const mode = useFlightMode();
  const lenis = useLenis();
  const baseUrl = import.meta.env.BASE_URL;
  const size = mode === 'mobile' ? 'mobile' : 'desktop';

  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef(0);
  const panels = useRef(new Map<BeatId, HTMLDivElement>());
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const [store, setStore] = useState<FrameStore<HTMLImageElement> | null>(null);

  const ranges = useMemo(() => segmentRanges(M1.segments, size), [size]);
  const windows = useMemo(() => new Map(M1_BEATS.map((beat) => [beat.id, resolveBeat(ranges, beat)])), [ranges]);

  const registerPanel = (id: BeatId) => (element: HTMLDivElement | null) => {
    if (element) panels.current.set(id, element);
    else panels.current.delete(id);
  };

  // One frame store per mode/size; StrictMode's double effect creates and disposes cleanly.
  useEffect(() => {
    if (mode === 'static') return;
    const next = new FrameStore<HTMLImageElement>({
      frameCount: M1.frameCount,
      load: (index) => loadImage(frameUrl(baseUrl, M1.id, size, index)),
    });
    next.start();
    setStore(next);
    return () => next.dispose();
  }, [mode, size, baseUrl]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section || mode === 'static') return;

      const apply = (progress: number) => {
        const frame = progressToFrame(M1.segments, size, progress);
        frameRef.current = frame;
        store?.setPlayhead(frame);
        for (const beat of M1_BEATS) {
          const element = panels.current.get(beat.id);
          const beatWindow = windows.get(beat.id);
          if (!element || !beatWindow) continue;
          const opacity = beatOpacity(progress, beatWindow);
          element.style.opacity = String(opacity);
          element.style.transform = `translate3d(0, ${((1 - opacity) * 24).toFixed(1)}px, 0)`;
          element.style.pointerEvents = opacity < 0.05 ? 'none' : '';
        }
      };

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: `+=${totalScrollVh(M1, size)}%`,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => apply(self.progress),
        onRefresh: (self) => apply(self.progress),
      });
      triggerRef.current = trigger;
      apply(trigger.progress);

      return () => {
        triggerRef.current = null;
      };
    },
    { scope: sectionRef, dependencies: [mode, size, store, windows], revertOnUpdate: true },
  );

  // Let the global Atmosphere background sleep while the opaque flight covers it.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || mode === 'static') return;
    const announce = (visible: boolean) =>
      window.dispatchEvent(new CustomEvent<boolean>('flight-visibility', { detail: visible }));
    const observer = new IntersectionObserver(([entry]) => announce(entry?.isIntersecting ?? false));
    observer.observe(section);
    return () => {
      observer.disconnect();
      announce(false);
    };
  }, [mode]);

  const scrollToProgress = (progress: number, immediate: boolean) => {
    const trigger = triggerRef.current;
    if (!trigger) return false;
    const top = trigger.start + (trigger.end - trigger.start) * progress;
    if (lenis) lenis.scrollTo(top, { immediate });
    else window.scrollTo({ top, behavior: immediate ? 'auto' : 'smooth' });
    return true;
  };

  const scrollToBeat = (id: BeatId) => {
    const beat = M1_BEATS.find((candidate) => candidate.id === id);
    if (beat && scrollToProgress(beatFocusProgress(ranges, beat), false)) return;
    panels.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // SmoothScroll intercepts plain "#id" links only while Lenis runs. Without it
  // (reduced motion) HashRouter would treat "#work" as a route, so scroll and
  // move focus here instead.
  const onInPageLink = (event: MouseEvent<HTMLAnchorElement>) => {
    if (lenis) return;
    const target = document.getElementById(decodeURIComponent(event.currentTarget.hash.slice(1)));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ block: 'start' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  };

  // Keyboard users tabbing into a beat that is not on screen yet: fly there.
  const onFocusCapture = (event: FocusEvent<HTMLElement>) => {
    for (const beat of M1_BEATS) {
      const element = panels.current.get(beat.id);
      if (!element?.contains(event.target as Node)) continue;
      if (Number(element.style.opacity || '1') < 0.5) scrollToProgress(beatFocusProgress(ranges, beat), true);
      return;
    }
  };

  const skipLink = (
    <a
      href="#work"
      onClick={onInPageLink}
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-24 focus:z-20 focus:rounded-lg focus:bg-[var(--surface)] focus:px-4 focus:py-2 focus:text-[var(--text-primary)]"
    >
      Skip flight
    </a>
  );

  if (mode === 'static') {
    return (
      <section ref={sectionRef} className="relative overflow-hidden" data-contour-section="hero" aria-label="Introduction">
        {skipLink}
        <picture>
          <source media="(max-width: 767px)" srcSet={stillUrl(baseUrl, M1.id, 'mobile')} />
          <img
            src={stillUrl(baseUrl, M1.id, 'desktop')}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-bottom"
          />
        </picture>
        <div className="relative flex flex-col gap-16 pt-28 pb-16 lg:pt-36">
          <StagePanel mode={mode} panelRef={registerPanel('intro')}>
            <IntroBeat onExploreWork={() => scrollToBeat('service-map')} onInPageLink={onInPageLink} />
          </StagePanel>
          <StagePanel mode={mode} panelRef={registerPanel('service-map')}>
            <ServiceMapBeat />
          </StagePanel>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative h-[100svh] overflow-hidden"
      data-contour-section="hero"
      aria-label="Introduction"
      onFocusCapture={onFocusCapture}
    >
      {skipLink}
      <FlightCanvas store={store} frameRef={frameRef} poster={M1.poster} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: SCRIM[size] }} aria-hidden="true" />
      <StagePanel mode={mode} panelRef={registerPanel('intro')}>
        <IntroBeat onExploreWork={() => scrollToBeat('service-map')} onInPageLink={onInPageLink} />
      </StagePanel>
      <StagePanel mode={mode} panelRef={registerPanel('service-map')}>
        <ServiceMapBeat />
      </StagePanel>
    </section>
  );
}
