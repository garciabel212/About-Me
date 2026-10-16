import { lazy, Suspense, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigationType, Navigate } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import SmoothScroll, { useLenis } from '@/components/motion/SmoothScroll';
import { PageTransition, ScrollProgress } from '@/components/motion';
import { ViewModeProvider, useViewMode } from '@/components/view/ViewMode';
import { takeHomeReturn } from '@/components/home/homeReturn';
import Home from '@/pages/Home';
import { hashAliases, legacyRoutes } from '@/data/routes';
import { focusTarget } from '@/lib/focusTarget';

const ServiceMapPlanner = lazy(() => import('@/pages/projects/ServiceMapPlanner'));
const ScaleGarageStudio = lazy(() => import('@/pages/projects/ScaleGarageStudio'));
const AacCommunicationApp = lazy(() => import('@/pages/projects/AacCommunicationApp'));
const Lab = lazy(() => import('@/pages/Lab'));

function RouteFallback() {
  return (
    <div className="flex min-h-[55vh] items-center justify-center" role="status" aria-live="polite">
      <span className="text-sm text-[var(--text-muted)]">Loading&hellip;</span>
    </div>
  );
}

function Loadable({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

function AppRoutes() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const lenis = useLenis();
  const { mode, motion } = useViewMode();
  // mode="sync" keeps the outgoing page mounted until its exit animation ends,
  // which inflates the document and leaves Lenis with the old page's scroll
  // limit. Scroll targets are only measured once the outgoing page is gone.
  const [layoutSettled, setLayoutSettled] = useState(true);
  const [renderedPath, setRenderedPath] = useState(location.pathname);
  if (renderedPath !== location.pathname) {
    setRenderedPath(location.pathname);
    setLayoutSettled(false);
  }

  useEffect(() => {
    if (!layoutSettled) return;
    ScrollTrigger.refresh();
    lenis?.resize();
    const jumpTo = (y: number) => {
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo({ top: y, left: 0, behavior: 'auto' });
    };

    // Back from a case study: return to the same place on Home, in the same mode.
    const restoring = (location.state as { restore?: boolean } | null)?.restore || navigationType === 'POP';
    if (location.pathname === '/' && restoring) {
      const y = takeHomeReturn(mode);
      if (y !== null) {
        jumpTo(y);
        return;
      }
    }

    if (!location.hash) {
      jumpTo(0);
      return;
    }

    const raw = decodeURIComponent(location.hash.slice(1));
    const targetId = hashAliases[raw] ?? raw;
    let attempts = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const scrollToTarget = () => {
      const target = document.getElementById(targetId);
      if (target) {
        // Sections set scroll-margin-top for the fixed header; Lenis and scrollIntoView both honour it.
        if (lenis) lenis.scrollTo(target, { immediate: !motion, force: true });
        else target.scrollIntoView({ behavior: 'instant', block: 'start' });
        // Keyboard and screen-reader users continue from the section they asked for.
        focusTarget(target)?.focus({ preventScroll: true });
        return;
      }
      attempts += 1;
      if (attempts < 20) retryTimer = setTimeout(scrollToTarget, 50);
    };
    scrollToTarget();
    return () => clearTimeout(retryTimer);
    // location.key: clicking the same section link twice scrolls there again.
  }, [lenis, location.pathname, location.hash, location.key, layoutSettled]);

  return (
    <AnimatePresence mode="sync" initial={false} onExitComplete={() => setLayoutSettled(true)}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        {legacyRoutes.map((r) => (
          <Route
            key={r.from}
            path={r.from}
            element={<Navigate to={{ pathname: '/', hash: `#${r.hash}` }} replace />}
          />
        ))}
        <Route
          path="/projects/service-map-planner"
          element={
            <PageTransition>
              <Loadable><ServiceMapPlanner /></Loadable>
            </PageTransition>
          }
        />
        <Route
          path="/projects/scale-garage-studio"
          element={
            <PageTransition>
              <Loadable><ScaleGarageStudio /></Loadable>
            </PageTransition>
          }
        />
        <Route
          path="/projects/aac-communication-app"
          element={
            <PageTransition>
              <Loadable><AacCommunicationApp /></Loadable>
            </PageTransition>
          }
        />
        <Route
          path="/lab"
          element={
            <PageTransition>
              <Loadable><Lab /></Loadable>
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function SiteLayout() {
  const home = useLocation().pathname === '/';
  const { mode, motion } = useViewMode();
  const film = home && mode === 'cinematic';

  // Lenis' eased wheel scrolling is motion too: the motion control turns it off.
  const lenis = useLenis();
  useEffect(() => {
    if (lenis) lenis.options.smoothWheel = motion && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, [lenis, motion]);

  return (
    <MotionConfig reducedMotion={motion ? 'user' : 'always'}>
      <div className={`site-shell min-h-screen flex flex-col relative ${film ? 'is-film' : ''}`} data-motion={motion ? 'on' : 'off'}>
        {!home && <ScrollProgress />}
        <Navbar />
        <div className="relative z-[1] flex-1"><AppRoutes /></div>
        <Footer />
      </div>
    </MotionConfig>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <SmoothScroll>
          <ViewModeProvider>
            <SiteLayout />
          </ViewModeProvider>
        </SmoothScroll>
      </HashRouter>
    </ThemeProvider>
  );
}
