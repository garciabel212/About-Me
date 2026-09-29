import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/components/theme/ThemeProvider';

type Scene = 'hero' | 'service' | 'garage' | 'quiet' | 'contact';
type ProjectVariant = 'service-ops' | 'garage';

interface ContourProfile {
  lineOpacity: number;
  wave: number;
  density: number;
  route: number;
  architecture: number;
  glow: number;
}

const MOTION_STORAGE_KEY = 'jose-garcia-contour-motion-paused';

const SCENE_PROFILES: Record<Scene, ContourProfile> = {
  hero: {
    lineOpacity: 0.135,
    wave: 0.78,
    density: 1,
    route: 0.18,
    architecture: 0.12,
    glow: 0.82,
  },
  service: {
    lineOpacity: 0.17,
    wave: 1,
    density: 1,
    route: 1,
    architecture: 0.08,
    glow: 1,
  },
  garage: {
    lineOpacity: 0.15,
    wave: 0.58,
    density: 0.9,
    route: 0.08,
    architecture: 1,
    glow: 0.9,
  },
  quiet: {
    lineOpacity: 0.085,
    wave: 0.45,
    density: 0.58,
    route: 0,
    architecture: 0.12,
    glow: 0.56,
  },
  contact: {
    lineOpacity: 0.125,
    wave: 0.7,
    density: 0.86,
    route: 0.16,
    architecture: 0.08,
    glow: 0.78,
  },
};

const getInitialReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const getInitialPausePreference = () => {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(MOTION_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

function sceneForPath(pathname: string): Scene {
  if (pathname.includes('service-map-planner')) return 'service';
  if (pathname.includes('scale-garage-studio')) return 'garage';
  if (pathname === '/experience' || pathname === '/about') return 'quiet';
  if (pathname === '/contact') return 'contact';
  return 'hero';
}

function copyProfile(profile: ContourProfile): ContourProfile {
  return { ...profile };
}

function profileForScene(scene: Scene, project: ProjectVariant): ContourProfile {
  const profile = copyProfile(SCENE_PROFILES[scene]);

  if (scene === 'hero' && project === 'garage') {
    profile.architecture = 0.72;
    profile.route = 0.04;
    profile.wave = 0.58;
    profile.lineOpacity = 0.15;
  } else if (scene === 'hero') {
    profile.route = 0.48;
  }

  return profile;
}

export default function Atmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { resolvedTheme } = useTheme();
  const [userPaused, setUserPaused] = useState(getInitialPausePreference);
  const [reduceMotion, setReduceMotion] = useState(getInitialReducedMotion);
  const isPaused = userPaused || reduceMotion;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event: MediaQueryListEvent) => setReduceMotion(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let animationFrame = 0;
    let registrationFrame = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    let pageVisible = document.visibilityState === 'visible';
    let regionVisible = true;
    let flightVisible = false;
    let scene = sceneForPath(location.pathname);
    let project: ProjectVariant = 'service-ops';

    const current = profileForScene(scene, project);
    let target = profileForScene(scene, project);
    const pointer = {
      x: window.innerWidth * 0.76,
      y: window.innerHeight * 0.44,
      targetX: window.innerWidth * 0.76,
      targetY: window.innerHeight * 0.44,
      presence: 0,
      targetPresence: 0,
    };

    const updateScene = (nextScene: Scene) => {
      scene = nextScene;
      target = profileForScene(scene, project);
      root.dataset.scene = nextScene;
      root.dataset.project = project;

      if (!pointer.targetPresence) {
        pointer.targetX = width * (nextScene === 'garage' ? 0.8 : 0.74);
        pointer.targetY = height * (nextScene === 'service' ? 0.56 : 0.44);
      }
    };

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.dataset.pixelRatio = pixelRatio.toFixed(2);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      if (!pointer.targetPresence) {
        pointer.x = pointer.targetX = width * (scene === 'garage' ? 0.8 : 0.74);
        pointer.y = pointer.targetY = height * (scene === 'service' ? 0.56 : 0.44);
      }
    };

    const drawPointerGlow = () => {
      if (pointer.presence < 0.008) return;

      const radius = Math.min(390, Math.max(270, width * 0.27));
      const gradient = context.createRadialGradient(
        pointer.x,
        pointer.y,
        0,
        pointer.x,
        pointer.y,
        radius,
      );
      const centerAlpha = (resolvedTheme === 'dark' ? 0.19 : 0.145) * pointer.presence * current.glow;
      gradient.addColorStop(0, `rgba(42, 125, 255, ${centerAlpha})`);
      gradient.addColorStop(0.42, `rgba(26, 188, 216, ${centerAlpha * 0.52})`);
      gradient.addColorStop(1, 'rgba(74, 164, 194, 0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    };

    const drawArchitecturalGuides = (time: number) => {
      if (current.architecture < 0.08) return;

      const alpha = current.lineOpacity * current.architecture * (resolvedTheme === 'dark' ? 0.72 : 0.55);
      const shift = Math.sin(time * 0.14) * 8;
      const left = width * 0.6 + shift;
      const top = height * 0.16;
      const guideWidth = width * 0.31;
      const guideHeight = height * 0.67;

      context.save();
      context.strokeStyle = `rgba(${resolvedTheme === 'dark' ? '107, 177, 214' : '36, 82, 198'}, ${alpha})`;
      context.lineWidth = 0.8;
      context.setLineDash([7, 12]);
      context.strokeRect(left, top, guideWidth, guideHeight);
      context.beginPath();
      context.moveTo(left, top + guideHeight * 0.25);
      context.lineTo(left + guideWidth, top + guideHeight * 0.25);
      context.moveTo(left + guideWidth * 0.22, top);
      context.lineTo(left + guideWidth * 0.22, top + guideHeight);
      context.stroke();
      context.restore();
    };

    const drawContours = (time: number) => {
      const mobile = width < 640;
      const tablet = width >= 640 && width < 1024;
      const lineCount = mobile ? 10 : tablet ? 15 : 22;
      const pointCount = mobile ? 28 : 52;
      const influenceRadius = Math.min(400, Math.max(260, width * 0.27));
      const displacement = mobile ? 0 : 22 * pointer.presence;
      const darkBoost = resolvedTheme === 'dark' ? 1.28 : 1;
      const baseRgb = resolvedTheme === 'dark' ? '92, 164, 255' : '30, 91, 224';
      const cyanRgb = resolvedTheme === 'dark' ? '66, 210, 225' : '19, 148, 181';

      for (let line = 0; line < lineCount; line += 1) {
        const densityFade = line % 2 === 0 ? current.density : current.density * current.density;
        if (densityFade < 0.16) continue;

        const points: Array<{ x: number; y: number }> = [];
        const normalizedLine = (line + 0.55) / lineCount;
        const phase = time * 0.14 + line * 0.67;
        const direction = line % 2 === 0 ? 1 : -1;

        for (let point = 0; point <= pointCount; point += 1) {
          const progress = point / pointCount;
          let x = progress * width;
          let y = normalizedLine * height;

          const broadWave = Math.sin(progress * Math.PI * 2.15 + phase) * (15 + 17 * current.wave);
          const fineWave = Math.sin(progress * Math.PI * 5.2 - phase * 0.72) * (4 + 7 * current.wave);
          const terrainFold = Math.sin(progress * Math.PI + line * 0.31 + time * 0.08) * 13 * current.wave;
          const routeBend =
            Math.sin(progress * Math.PI * 3.4 + line * 1.37 - time * 0.19) * 8 * current.route;
          const architecturalStep =
            Math.atan(Math.sin(progress * Math.PI * 4 + line * 0.54 + time * 0.08) * 4) *
            5.5 *
            current.architecture;

          y += (broadWave + fineWave + terrainFold + routeBend + architecturalStep) * direction;

          if (displacement > 0) {
            const deltaX = x - pointer.x;
            const deltaY = y - pointer.y;
            const distance = Math.hypot(deltaX, deltaY);
            if (distance < influenceRadius) {
              const force = Math.pow(1 - distance / influenceRadius, 2) * displacement;
              const safeDistance = Math.max(distance, 1);
              x += (deltaX / safeDistance) * force * 0.42;
              y += (deltaY / safeDistance) * force;
            }
          }

          points.push({ x, y });
        }

        const opacity = current.lineOpacity * densityFade * darkBoost * (line % 4 === 0 ? 1.14 : 1);
        const stroke = context.createLinearGradient(0, 0, width, 0);
        const color = line % 4 === 0 ? cyanRgb : baseRgb;
        stroke.addColorStop(0, `rgba(${color}, ${opacity * 0.9})`);
        stroke.addColorStop(0.22, `rgba(${color}, ${opacity * (mobile ? 0.72 : 0.42)})`);
        stroke.addColorStop(0.5, `rgba(${color}, ${opacity * (scene === 'quiet' ? 0.38 : 0.55)})`);
        stroke.addColorStop(0.72, `rgba(${color}, ${opacity * 0.88})`);
        stroke.addColorStop(1, `rgba(${color}, ${opacity})`);

        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        for (let point = 1; point < points.length - 1; point += 1) {
          const midpointX = (points[point].x + points[point + 1].x) * 0.5;
          const midpointY = (points[point].y + points[point + 1].y) * 0.5;
          context.quadraticCurveTo(points[point].x, points[point].y, midpointX, midpointY);
        }
        const last = points[points.length - 1];
        context.lineTo(last.x, last.y);
        context.strokeStyle = stroke;
        context.lineWidth = line % 5 === 0 ? 1.05 : 0.72;
        context.setLineDash(current.route > 0.7 && line % 6 === 0 ? [5, 9] : []);
        context.stroke();
      }

      context.setLineDash([]);
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      drawPointerGlow();
      drawContours(time);
      drawArchitecturalGuides(time);
    };

    const interpolate = (delta: number) => {
      const profileEase = 1 - Math.exp(-delta * 1.8);
      (Object.keys(current) as Array<keyof ContourProfile>).forEach((key) => {
        current[key] += (target[key] - current[key]) * profileEase;
      });

      const pointerEase = 1 - Math.exp(-delta * 7.2);
      const returnEase = 1 - Math.exp(-delta * 2.6);
      const ease = pointer.targetPresence ? pointerEase : returnEase;
      pointer.x += (pointer.targetX - pointer.x) * ease;
      pointer.y += (pointer.targetY - pointer.y) * ease;
      pointer.presence += (pointer.targetPresence - pointer.presence) * (1 - Math.exp(-delta * 4.2));
    };

    const frame = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      elapsed += delta;
      interpolate(delta);
      draw(elapsed);
      animationFrame = window.requestAnimationFrame(frame);
    };

    const stopLoop = () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    };

    const syncLoop = () => {
      const shouldAnimate = !isPaused && pageVisible && regionVisible && !flightVisible;
      if (shouldAnimate && !animationFrame) {
        lastTime = performance.now();
        animationFrame = window.requestAnimationFrame(frame);
      } else if (!shouldAnimate) {
        stopLoop();
        interpolate(1 / 60);
        draw(elapsed);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || window.innerWidth < 768) return;
      pointer.targetX = event.clientX;
      pointer.targetY = event.clientY;
      pointer.targetPresence = 1;
    };

    const releasePointer = () => {
      pointer.targetPresence = 0;
      pointer.targetX = width * (scene === 'garage' ? 0.8 : 0.74);
      pointer.targetY = height * (scene === 'service' ? 0.56 : 0.44);
    };

    const onVisibilityChange = () => {
      pageVisible = document.visibilityState === 'visible';
      syncLoop();
    };

    const onProjectChange = (event: Event) => {
      const detail = (event as CustomEvent<ProjectVariant>).detail;
      if (detail !== 'service-ops' && detail !== 'garage') return;
      project = detail;
      root.dataset.project = detail;
      target = profileForScene(scene, project);
    };

    const onFlightVisibility = (event: Event) => {
      flightVisible = (event as CustomEvent<boolean>).detail === true;
      syncLoop();
    };

    const pageObserver = new IntersectionObserver(([entry]) => {
      regionVisible = entry?.isIntersecting ?? true;
      syncLoop();
    });

    const sectionEntries = new Map<Element, IntersectionObserverEntry>();
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => sectionEntries.set(entry.target, entry));
        const active = [...sectionEntries.values()]
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top + a.boundingClientRect.height / 2 - height * 0.42) -
              Math.abs(b.boundingClientRect.top + b.boundingClientRect.height / 2 - height * 0.42),
          )[0];

        const nextScene = active?.target.getAttribute('data-contour-section') as Scene | null;
        if (nextScene && nextScene in SCENE_PROFILES) updateScene(nextScene);
      },
      { rootMargin: '-28% 0px -54% 0px', threshold: 0 },
    );

    resizeCanvas();
    updateScene(scene);
    pageObserver.observe(document.querySelector('.site-shell') ?? document.documentElement);

    registrationFrame = window.requestAnimationFrame(() => {
      if (location.pathname === '/') {
        document.querySelectorAll('[data-contour-section]').forEach((section) => sectionObserver.observe(section));
      }
    });

    window.addEventListener('resize', resizeCanvas, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('blur', releasePointer);
    document.documentElement.addEventListener('mouseleave', releasePointer);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('contour-project-change', onProjectChange);
    window.addEventListener('flight-visibility', onFlightVisibility);
    syncLoop();

    return () => {
      stopLoop();
      window.cancelAnimationFrame(registrationFrame);
      pageObserver.disconnect();
      sectionObserver.disconnect();
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('blur', releasePointer);
      document.documentElement.removeEventListener('mouseleave', releasePointer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('contour-project-change', onProjectChange);
      window.removeEventListener('flight-visibility', onFlightVisibility);
    };
  }, [isPaused, location.pathname, resolvedTheme]);

  const toggleMotion = () => {
    const next = !userPaused;
    setUserPaused(next);
    try {
      window.localStorage.setItem(MOTION_STORAGE_KEY, String(next));
    } catch {
      // Motion control remains functional even when storage is unavailable.
    }
  };

  const controlLabel = reduceMotion
    ? 'Decorative motion reduced by system preference'
    : userPaused
      ? 'Resume decorative motion'
      : 'Pause decorative motion';

  return (
    <>
      <div
        ref={rootRef}
        className={`contour-light fixed inset-0 z-0 overflow-hidden pointer-events-none ${isPaused ? 'is-paused' : ''}`}
        data-scene={sceneForPath(location.pathname)}
        data-project="service-ops"
        aria-hidden="true"
      >
        <div className="contour-light__base absolute inset-0" />
        <div className="contour-light__field contour-light__field--one" />
        <div className="contour-light__field contour-light__field--two" />
        <div className="contour-light__field contour-light__field--three" />
        <canvas ref={canvasRef} className="contour-light__canvas absolute inset-0 h-full w-full" />
        <div className="contour-light__grain absolute inset-0" />
      </div>

      <button
        type="button"
        onClick={toggleMotion}
        disabled={reduceMotion}
        className="motion-control fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full border px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] shadow-[var(--shadow-low)] transition-colors"
        aria-label={controlLabel}
        aria-pressed={isPaused}
        title={controlLabel}
      >
        {isPaused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
        <span className="hidden sm:inline">{reduceMotion ? 'Reduced motion' : userPaused ? 'Motion paused' : 'Pause motion'}</span>
      </button>
    </>
  );
}
