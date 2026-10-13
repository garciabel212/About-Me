import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { measureAnchors, siteSpans } from './dom';
import { useFilmStop } from './filmState';
import { PHONE_QUERY, type Viewport } from './geometry';
import { inkStyle, sitePhase } from './progress';
import RedlineLayer, { type Anchors } from './RedlineLayer';
import SiteSection from './SiteSection';
import { sites } from './sites';
import SurveyFilm from './SurveyFilm';
import TitleBlock from './TitleBlock';
import './survey.css';

const SITE_IDS = sites.map((s) => s.id);
const readViewport = (): Viewport => ({ w: window.innerWidth, h: window.innerHeight, phone: window.matchMedia(PHONE_QUERY).matches });

/**
 * The Cinematic landing: the flight full-bleed, each stop a site visit marked
 * up in redline ink, and a fixed title block. Scroll sets --ink, --lift and
 * --focus on the root; React renders again only when the site changes.
 */
export default function SurveyLanding({ motion }: { motion: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const stopRef = useRef(0);
  const [stop, setStop] = useState(0);
  const [vp, setVp] = useState<Viewport>(readViewport);
  const [anchors, setAnchors] = useState<Anchors>({});
  const filmStop = useFilmStop();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = root.current!;
    const update = () => {
      const p = sitePhase(siteSpans(SITE_IDS), window.innerHeight);
      const s = inkStyle(p, motion);
      el.style.setProperty('--ink', s.ink.toFixed(4));
      el.style.setProperty('--lift', s.lift.toFixed(4));
      el.style.setProperty('--focus', s.focus.toFixed(4));
      el.dataset.phase = p.phase;
      if (p.stop !== stopRef.current) {
        stopRef.current = p.stop;
        setStop(p.stop);
      }
    };
    const trigger = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update, onRefresh: update });
    update();
    return () => trigger.kill();
  }, [motion]);

  useEffect(() => {
    const onResize = () => setVp(readViewport());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Notes sit above the title block, whose height changes with its values (wrapping Status, phone strip).
  useEffect(() => {
    const el = root.current!;
    const block = el.querySelector('.title-block');
    if (!block) return;
    const reserve = () => el.style.setProperty('--tb-h', `${Math.ceil(window.innerHeight - block.getBoundingClientRect().top)}px`);
    reserve();
    const ro = new ResizeObserver(reserve);
    ro.observe(block);
    window.addEventListener('resize', reserve);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', reserve);
    };
  }, []);

  // Re-measure the current site's note anchors whenever its notes change size (flip, fonts, resize).
  useLayoutEffect(() => {
    const section = document.querySelector(`[data-site="${sites[stop].id}"]`);
    const notes = section?.querySelector('.site__notes');
    if (!section || !notes) return;
    const measure = () => setAnchors(measureAnchors(section, vp.phone));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(notes);
    document.fonts?.ready.then(measure, () => {});
    return () => ro.disconnect();
  }, [stop, vp]);

  return (
    <div ref={root} className={`survey${motion ? '' : ' survey--still'}`}>
      <SurveyFilm motion={motion} siteIds={SITE_IDS} />
      <div className="survey__falloff" aria-hidden="true" />
      <RedlineLayer site={sites[stop]} index={stop} anchors={anchors} vp={vp} ready={filmStop === stop} />
      <TitleBlock sites={sites} current={stop} />
      {sites.map((s, i) => (
        <Fragment key={s.id}>
          {i > 0 && <div className="survey__gap" aria-hidden="true" />}
          <SiteSection site={s} />
        </Fragment>
      ))}
    </div>
  );
}
