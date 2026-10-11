import { Fragment, useEffect, useLayoutEffect, useRef } from 'react';
import { useLenis } from '@/components/motion/SmoothScroll';
import { useViewMode } from '@/components/view/ViewMode';
import { About, Contact, Experience, Expertise, Overview, Projects } from '@/components/home/Sections';
import { saveHomeReturn } from '@/components/home/homeReturn';
import EvidenceWindow from '@/components/home/EvidenceWindow';
import FlightBackdrop from '@/flight/FlightBackdrop';
import { sectionIds } from '@/data/routes';

const SECTIONS = [Overview, Experience, Expertise, Projects, About, Contact];
/** Where the reader's place is read from when the mode switches: the upper third of the viewport. */
const READ_LINE = 0.3;

/** Which section the reader is in, and how far through it. */
function readingPlace(): { id: string; ratio: number } | null {
  const line = window.innerHeight * READ_LINE;
  for (const id of sectionIds) {
    const r = document.getElementById(id)?.getBoundingClientRect();
    if (!r) continue;
    if (line < r.top) return { id, ratio: 0 };
    if (line <= r.bottom) return { id, ratio: (line - r.top) / Math.max(1, r.height) };
  }
  return null;
}

/**
 * Home: six sections in one order. Cinematic mode puts the Miami flight behind
 * them, with empty gaps where the camera flies between stops; Read mode is the
 * same content as a compact, plain page.
 */
export default function Home() {
  const { mode, motion } = useViewMode();
  const lenis = useLenis();
  const cinematic = mode === 'cinematic';
  const place = useRef<{ id: string; ratio: number } | null>(null);
  const modeRef = useRef(mode);

  // Track the reader's place so switching modes keeps them on the same passage.
  useEffect(() => {
    let frame = 0;
    const record = () => {
      frame = 0;
      place.current = readingPlace();
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
    const el = at && document.getElementById(at.id);
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
    <>
      {cinematic && <FlightBackdrop motion={motion} />}
      {cinematic && <EvidenceWindow />}
      <main
        id="main"
        tabIndex={-1}
        className={`home ${cinematic ? 'home--cinematic' : 'home--read'}`}
        onClickCapture={onClickCapture}
      >
        {SECTIONS.map((Section, i) => (
          <Fragment key={sectionIds[i]}>
            {cinematic && i > 0 && <div className="cine-gap" aria-hidden="true" />}
            <Section />
          </Fragment>
        ))}
      </main>
    </>
  );
}
