import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLenis } from '@/components/motion/SmoothScroll';
import { useViewMode } from '@/components/view/ViewMode';
import { About, Contact, Experience, Expertise, Overview, Projects } from '@/components/home/Sections';
import { saveHomeReturn } from '@/components/home/homeReturn';
import { placeTarget, readingPlaceFrom, type PlaceRect } from '@/components/home/readingPlace';
import { sectionIds } from '@/data/routes';
import FlightLanding from '@/landing/FlightLanding';
import { points } from '@/landing/points';

const SECTIONS = [Overview, Experience, Expertise, Projects, About, Contact];
/** Where the reader's place is read from when the mode switches: the upper third of the viewport. */
const READ_LINE = 0.3;

function placeRects(cinematic: boolean): PlaceRect[] {
  const entries = cinematic
    ? points.map((p) => ({ id: p.anchors[0], el: document.querySelector(`[data-point="${p.id}"]`) }))
    : sectionIds.map((id) => ({ id, el: document.getElementById(id) }));
  return entries.flatMap(({ id, el }) => {
    const r = el?.getBoundingClientRect();
    return r ? [{ id, top: r.top, bottom: r.bottom }] : [];
  });
}

/**
 * Home. Cinematic mode is the site survey over the Miami flight; Read mode is
 * the same content as a compact, plain page.
 */
export default function Home() {
  const { mode, motion } = useViewMode();
  const lenis = useLenis();
  const cinematic = mode === 'cinematic';
  const place = useRef<{ id: string; ratio: number } | null>(null);
  const modeRef = useRef(mode);

  // Track the reader's place so switching modes keeps them on the same topic.
  useEffect(() => {
    let frame = 0;
    const record = () => {
      frame = 0;
      place.current = readingPlaceFrom(window.innerHeight * READ_LINE, placeRects(modeRef.current === 'cinematic'));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(record);
    };
    record();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useLayoutEffect(() => {
    if (modeRef.current === mode) return;
    modeRef.current = mode;
    const at = place.current;
    const el = at && document.querySelector(placeTarget(at.id, mode));
    if (!at || !el) return;
    const r = el.getBoundingClientRect();
    const y = window.scrollY + r.top + at.ratio * r.height - window.innerHeight * READ_LINE;
    if (lenis) {
      lenis.resize();
      lenis.scrollTo(Math.max(0, y), { immediate: true, force: true });
    } else {
      window.scrollTo(0, Math.max(0, y));
    }
  }, [mode, lenis]);

  // Opening a case study remembers this place, so "Back to Projects" returns here.
  const onClickCapture = (e: React.MouseEvent) => {
    const href = (e.target as HTMLElement).closest('a')?.getAttribute('href') ?? '';
    if (href.startsWith('#/projects/') || href.startsWith('#/lab')) saveHomeReturn(mode);
  };

  return (
    <main id="main" tabIndex={-1} className={`home ${cinematic ? 'home--cinematic' : 'home--read'}`} onClickCapture={onClickCapture}>
      {cinematic ? <FlightLanding motion={motion} /> : SECTIONS.map((Section, i) => <Section key={sectionIds[i]} />)}
    </main>
  );
}
