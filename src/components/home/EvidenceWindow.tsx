import { useEffect, useState } from 'react';
import { projects } from '@/data/content';
import CareerTimeline from './CareerTimeline';
import ServiceWorkflow from './ServiceWorkflow';

const base = import.meta.env.BASE_URL;
const SPLIT = '(min-width: 1024px)';
/** The reading line: the block under the middle of the viewport is the one being read. */
const LINE = 0.5;

/**
 * Cinematic split screen: while a block marked `data-evidence` is being read,
 * the film window shows its evidence (the career timeline, a project's diagram
 * or screenshot) instead of the film. It changes only as the reader scrolls
 * from one block to the next. The same content is in the reading column for
 * screen readers and narrow screens, so this layer is decorative.
 */
export default function EvidenceWindow() {
  const [active, setActive] = useState<string | null>(null);
  const [split, setSplit] = useState(() => window.matchMedia(SPLIT).matches);

  useEffect(() => {
    const list = window.matchMedia(SPLIT);
    const onChange = () => setSplit(list.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!split) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      const line = window.innerHeight * LINE;
      let key: string | null = null;
      document.querySelectorAll<HTMLElement>('[data-evidence]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= line && r.bottom >= line) key = el.dataset.evidence ?? null;
      });
      setActive(key);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [split]);

  if (!split) return null;
  return (
    <div className={`evidence-window ${active ? 'is-showing' : ''}`} aria-hidden="true">
      <figure className={`evidence-window__item ${active === 'timeline' ? 'is-active' : ''}`}>
        <CareerTimeline />
      </figure>
      {projects.map((p) => p.image && (
        <figure key={p.slug} className={`evidence-window__item ${active === p.slug ? 'is-active' : ''}`}>
          {p.image.kind === 'diagram' ? (
            <ServiceWorkflow label={p.image.alt} />
          ) : (
            <img src={`${base}${p.image.src}`} alt="" decoding="async" />
          )}
          <figcaption>
            <span className={`image-kind image-kind--${p.image.kind}`}>{p.image.kind[0].toUpperCase() + p.image.kind.slice(1)}</span>
            {p.title}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
