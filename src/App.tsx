import { lazy, Suspense, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Atmosphere from '@/components/background/Atmosphere';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import SmoothScroll, { useLenis } from '@/components/motion/SmoothScroll';
import { PageTransition, ScrollProgress } from '@/components/motion';
import Home from '@/pages/Home';

const Projects = lazy(() => import('@/pages/Projects'));
const Experience = lazy(() => import('@/pages/Experience'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const ServiceMapPlanner = lazy(() => import('@/pages/projects/ServiceMapPlanner'));
const ScaleGarageStudio = lazy(() => import('@/pages/projects/ScaleGarageStudio'));
const EnterpriseDeployment = lazy(() => import('@/pages/projects/EnterpriseDeployment'));

function RouteFallback() {
  return (
    <div className="flex min-h-[55vh] items-center justify-center" role="status" aria-live="polite">
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
        LOADING VIEW&hellip;
      </span>
    </div>
  );
}

function Loadable({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

function AppRoutes() {
  const location = useLocation();
  const lenis = useLenis();
  // mode="sync" keeps the outgoing page mounted until its exit animation ends,
  // which inflates the document and leaves Lenis with the old page's scroll
  // limit. Hash targets are only measured once the outgoing page is gone.
  const [layoutSettled, setLayoutSettled] = useState(true);
  const [renderedPath, setRenderedPath] = useState(location.pathname);
  if (renderedPath !== location.pathname) {
    setRenderedPath(location.pathname);
    setLayoutSettled(false);
  }

  useEffect(() => {
    if (location.hash) return;
    lenis?.scrollTo(0, { immediate: true });
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [lenis, location.pathname, location.hash]);

  useEffect(() => {
    if (!location.hash || !layoutSettled) return;
    const targetId = decodeURIComponent(location.hash.slice(1));
    let attempts = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const scrollToTarget = () => {
      const target = document.getElementById(targetId);
      if (target) {
        if (lenis) {
          lenis.resize();
          lenis.scrollTo(target, { offset: -72 });
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }
      attempts += 1;
      if (attempts < 20) retryTimer = setTimeout(scrollToTarget, 50);
    };
    scrollToTarget();
    return () => clearTimeout(retryTimer);
  }, [lenis, location.pathname, location.hash, layoutSettled]);

  return (
    <AnimatePresence
      mode="sync"
      initial={false}
      onExitComplete={() => setLayoutSettled(true)}
    >
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          }
        />
        <Route
          path="/projects"
          element={
            <PageTransition>
              <Loadable><Projects /></Loadable>
            </PageTransition>
          }
        />
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
          path="/projects/enterprise-deployment"
          element={
            <PageTransition>
              <Loadable><EnterpriseDeployment /></Loadable>
            </PageTransition>
          }
        />
        <Route
          path="/experience"
          element={
            <PageTransition>
              <Loadable><Experience /></Loadable>
            </PageTransition>
          }
        />
        <Route
          path="/about"
          element={
            <PageTransition>
              <Loadable><About /></Loadable>
            </PageTransition>
          }
        />
        <Route
          path="/contact"
          element={
            <PageTransition>
              <Loadable><Contact /></Loadable>
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SmoothScroll>
        <HashRouter>
          <MotionConfig reducedMotion="user">
            <div className="site-shell isolate min-h-screen flex flex-col relative">
              {/* Global Editorial Atmosphere Background */}
              <Atmosphere />

              <ScrollProgress />
              <Navbar />

              <div className="relative z-[1] flex-1">
                <AppRoutes />
              </div>

              <Footer />
            </div>
          </MotionConfig>
        </HashRouter>
      </SmoothScroll>
    </ThemeProvider>
  );
}
