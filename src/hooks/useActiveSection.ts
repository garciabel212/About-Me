import { useEffect, useState } from 'react';
import { sectionIds, type SectionId } from '@/data/routes';

/** The Home section under the upper third of the viewport, for the header's current-location mark. */
/**
 * The section that most recently passed the probe line: the one with the
 * greatest top at or above it. Works whatever order the ids are listed in
 * (Cinematic and Read modes order their sections differently).
 */
export function activeFrom<T extends string>(tops: readonly { id: T; top: number }[], probe: number): T | null {
  let best: { id: T; top: number } | null = null;
  for (const t of tops) if (t.top <= probe && (!best || t.top > best.top)) best = t;
  return best?.id ?? tops[0]?.id ?? null;
}

export function useActiveSection(enabled: boolean): SectionId | null {
  const [active, setActive] = useState<SectionId | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const tops = sectionIds.flatMap((id) => {
        const el = document.getElementById(id);
        return el ? [{ id, top: el.getBoundingClientRect().top }] : [];
      });
      setActive(activeFrom(tops, window.innerHeight * 0.35) ?? sectionIds[0]);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [enabled]);

  return enabled ? active : null;
}
