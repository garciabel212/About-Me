import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── Shared Lenis context ────────────────────────────────────────────────────
export const LenisContext = createContext<Lenis | null>(null);

/** Access the shared Lenis instance from any component. */
export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

interface SmoothScrollProps {
  children: React.ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Initialize Lenis with refined inertia easing
    const lenisInstance = new Lenis({
      duration: prefersReducedMotion ? 0 : 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !prefersReducedMotion,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
    });

    lenisRef.current = lenisInstance;
    setLenis(lenisInstance);

    // Synchronize Lenis with GSAP ScrollTrigger
    lenisInstance.on('scroll', ScrollTrigger.update);

    // Synchronize GSAP ticker with Lenis requestAnimationFrame
    const tickerCallback = (time: number) => {
      lenisInstance.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // Initial ScrollTrigger recalculation
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    // Support internal hash anchor navigation
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      // HashRouter routes begin with "#/".
      // Only fragment identifiers like "#work" or "#experience" belong to in-page smooth scrolling.
      if (!href || !href.startsWith('#') || href.startsWith('#/') || href.length <= 1) return;

      const targetId = decodeURIComponent(href.slice(1));
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        e.preventDefault();
        lenisInstance.scrollTo(targetElement, { offset: -64 });
      }
    };

    document.addEventListener('click', handleAnchorClick);

    // Resize observer to ensure ScrollTrigger updates when layouts settle
    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      gsap.ticker.remove(tickerCallback);
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('resize', handleResize);
      lenisInstance.off('scroll', ScrollTrigger.update);
      lenisInstance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>
      {children}
    </LenisContext.Provider>
  );
}
