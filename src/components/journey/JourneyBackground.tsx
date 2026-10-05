import { useEffect, useRef, useState } from 'react';
import { chapterTime, journeyChapters, journeyMedia } from './journeyConfig';

export default function JourneyBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [still, setStill] = useState(() => {
    try { return localStorage.getItem('miami-still') === 'true'; } catch { return false; }
  });
  const [limited, setLimited] = useState(true);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [chapter, setChapter] = useState(0);
  const canMove = Boolean(journeyMedia.video) && !still && !limited && !failed;
  const base = import.meta.env.BASE_URL;

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const narrow = matchMedia('(max-width: 767px)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const update = () => setLimited(reduced.matches || narrow.matches || Boolean(connection?.saveData));
    update();
    reduced.addEventListener('change', update);
    narrow.addEventListener('change', update);
    return () => { reduced.removeEventListener('change', update); narrow.removeEventListener('change', update); };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    let frame = 0;
    let seekTimeout: ReturnType<typeof setTimeout> | undefined;
    let target = 0;
    let bounds: number[] = [];
    const seek = () => {
      if (!video || !canMove || video.readyState < 2 || video.seeking || !Number.isFinite(video.duration)) return;
      const time = Math.min(target, Math.max(0, video.duration - .05));
      if (Math.abs(video.currentTime - time) > 1 / 30) {
        video.currentTime = time;
        clearTimeout(seekTimeout);
        seekTimeout = setTimeout(() => setFailed(true), 2500);
      }
    };
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      let index = 0;
      bounds.forEach((top, i) => { if (y >= top - 1) index = i; });
      setChapter(index);
      const span = (bounds[index + 1] ?? bounds[index] + 1) - bounds[index];
      target = chapterTime(index, (y - bounds[index]) / Math.max(1, span));
      seek();
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const measure = () => {
      bounds = journeyChapters.map(({ id }) => Math.max(0, (document.getElementById(id)?.getBoundingClientRect().top ?? 0) + window.scrollY - 110));
      schedule();
    };
    const seeked = () => { clearTimeout(seekTimeout); setReady(true); seek(); };
    video?.addEventListener('seeked', seeked);
    video?.addEventListener('loadeddata', schedule);
    const observer = new ResizeObserver(measure);
    const main = document.getElementById('journey');
    if (main) observer.observe(main);
    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(seekTimeout);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', measure);
      video?.removeEventListener('seeked', seeked);
      video?.removeEventListener('loadeddata', schedule);
    };
  }, [canMove]);

  return <>
    <div className="journey-background" aria-hidden="true" data-media={canMove && ready ? 'video' : 'poster'}>
      <picture>
        <source media="(max-width: 767px)" srcSet={base + journeyMedia.mobilePoster} />
        <img src={base + journeyMedia.poster} alt="" width="1024" height="576" fetchPriority="high" />
      </picture>
      {canMove && <video ref={videoRef} src={base + journeyMedia.video} muted playsInline preload="auto"
        className={ready ? 'is-ready' : ''} onLoadedData={() => setReady(true)} onError={() => setFailed(true)} />}
    </div>
    <aside className="journey-control" aria-label="Journey settings">
      <span><span className="journey-dot" /> {String(chapter + 1).padStart(2, '0')} / 06 <span className="journey-location">— {journeyChapters[chapter].place}</span></span>
      <button type="button" aria-pressed={still} onClick={() => {
        setStill(!still);
        try { localStorage.setItem('miami-still', String(!still)); } catch { /* Preference is still applied for this visit. */ }
      }}>{still ? 'Still mode: on' : 'Reduce motion'}</button>
      {!canMove && <span className="journey-static">Still Miami view</span>}
    </aside>
  </>;
}
