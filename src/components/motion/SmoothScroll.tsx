import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
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
    // Check for reduced motion preference
    if (typeof window === 'undefined') return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Initialize Lenis with subtle, refined smoothing
    const lenisInstance = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential out
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenisInstance;

    // Keep every ScrollTrigger in step with Lenis's smoothed scroll position.
    lenisInstance.on('scroll', ScrollTrigger.update);
    setLenis(lenisInstance);

    // Connect requestAnimationFrame loop
    let rafId: number;
    function raf(time: number) {
      lenisInstance.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Support internal hash anchor navigation
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      // HashRouter routes also begin with "#" (for example #/projects/...).
      // Only plain fragment IDs belong to the in-page scrolling system.
      if (!href || !href.startsWith('#') || href.startsWith('#/') || href.length <= 1) return;

      const targetId = decodeURIComponent(href.slice(1));
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        e.preventDefault();
        lenisInstance.scrollTo(targetElement, { offset: -72 });
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('click', handleAnchorClick);
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
