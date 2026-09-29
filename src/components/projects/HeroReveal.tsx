/**
 * HeroReveal — Codrops "On-Scroll Expanding Image within Typography" adaptation
 * Reference: https://tympanus.net/codrops/2024/04/02/on-scroll-expanding-image-animation-within-typography/
 *
 * Layout:
 *   [ROW 1 TEXT]   "Service Map"
 *   [VISUAL]       ← clip-path expands on scroll, text rows push apart
 *   [ROW 2 TEXT]   "Planner"
 *
 * Animation owners:
 *   - GSAP + ScrollTrigger  → clip-path expand + row translate (desktop, via useGSAP)
 *   - Framer Motion         → word-by-word reveal on mobile/reduced-motion fallback
 *   - Lenis                 → smooth scroll (shared instance, ScrollTrigger.refresh synced)
 *
 * Mobile (< 768 px) and prefers-reduced-motion: static Framer Motion BlurReveal,
 * no scroll pinning, no GSAP.
 */

import { useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BlurReveal } from '@/components/motion/Primitives';
import ShinyText from '@/components/bits/ShinyText';
import SplitRevealText from '@/components/bits/SplitRevealText';

gsap.registerPlugin(ScrollTrigger);

interface HeroRevealProps {
  /** The dashboard visual — rendered inside the expanding container. */
  children: React.ReactNode;
}

export default function HeroReveal({ children }: HeroRevealProps) {
  const reduceMotion = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  // ─── GSAP scroll-driven reveal (desktop + motion-ok only) ───────────────
  useGSAP(
    () => {
      const section = sectionRef.current;
      const row1 = row1Ref.current;
      const row2 = row2Ref.current;
      const visual = visualRef.current;

      // Skip on mobile or reduced motion
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      if (!section || !row1 || !row2 || !visual || reduceMotion || isMobile) return;

      // Initial state: visual is clipped narrow, rows are at rest
      gsap.set(visual, {
        clipPath: 'inset(0% 38% 0% 38% round 16px)',
        scale: 0.84,
        transformOrigin: 'center center',
      });
      gsap.set([row1, row2], { y: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=140%',
          scrub: 1.2,
          pin: true,
          anticipatePin: 1,
        },
      });

      // Step 1: Expand clip-path + scale up the visual
      tl.to(
        visual,
        {
          clipPath: 'inset(0% 0% 0% 0% round 12px)',
          scale: 1,
          duration: 1,
          ease: 'power2.inOut',
        },
        0,
      );

      // Step 2: Push text rows apart as image fills the space
      tl.to(
        row1,
        {
          y: -48,
          opacity: 0.35,
          duration: 0.7,
          ease: 'power2.inOut',
        },
        0.3,
      );
      tl.to(
        row2,
        {
          y: 48,
          opacity: 0.35,
          duration: 0.7,
          ease: 'power2.inOut',
        },
        0.3,
      );

      // Refresh once after the timeline is complete; never refresh from onRefresh.
      const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        window.cancelAnimationFrame(refreshFrame);
      };
    },
    // Re-run if reduceMotion changes
    { scope: sectionRef, dependencies: [reduceMotion] },
  );

  // ─── Mobile / reduced-motion: plain stacked layout ──────────────────────
  const isReducedOrMobile =
    reduceMotion ||
    (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches);

  // ─── Shared meta row (back link + tags) ─────────────────────────────────
  const MetaRow = () => (
    <BlurReveal className="mb-8 flex flex-wrap items-center gap-4">
      <Link to="/projects" className="text-sm text-white/80 hover:text-white transition-colors inline-flex items-center gap-2">
        <ArrowLeft size={15} /> Back to Projects
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs text-white/75">Platform</span>
        <span className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs text-white/75">Internal Tool</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
          <span className="h-1 w-1 rounded-full bg-emerald-400" />
          Active
        </span>
      </div>
    </BlurReveal>
  );

  // ─── Reduced-motion / mobile fallback ───────────────────────────────────
  if (isReducedOrMobile) {
    return (
      <section className="relative overflow-hidden py-20 lg:py-28" style={{ background: 'linear-gradient(135deg, #050A14 0%, #0A1428 100%)' }}>
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, #94A3B8 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        {/* Glow orb */}
        <div className="hero-orb absolute -top-20 right-0 h-[500px] w-[500px] opacity-10" style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)' }} />

        <div className="section-container relative z-10">
          <MetaRow />

          {/* Eyebrow */}
          <BlurReveal transition={{ delay: 0.05, duration: 0.55 }} className="mb-3">
            <ShinyText text="Field-Service Operations Platform" className="text-base sm:text-lg" />
          </BlurReveal>

          {/* Title */}
          <h1 className="mb-4 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Service Map Planner
          </h1>

          {/* Description */}
          <BlurReveal transition={{ delay: 0.1, duration: 0.55 }} className="mb-8">
            <p className="max-w-2xl text-lg leading-relaxed text-slate-400">
              An internal operations platform I designed and built to centralize customer institution
              data, equipment tracking, maintenance scheduling, service history, and technician
              workflows — giving the entire service team a single source of truth.
            </p>
          </BlurReveal>

          {/* Meta stats */}
          <BlurReveal transition={{ delay: 0.14, duration: 0.55 }} className="mb-12 flex flex-wrap gap-6 text-sm">
            <div>
              <span className="mb-1 block text-xs uppercase tracking-widest text-slate-500">Role</span>
              <span className="font-medium text-white">Designer &amp; Developer</span>
            </div>
            <div>
              <span className="mb-1 block text-xs uppercase tracking-widest text-slate-500">Timeline</span>
              <span className="font-medium text-white">2023 – Present</span>
            </div>
            <div>
              <span className="mb-1 block text-xs uppercase tracking-widest text-slate-500">Context</span>
              <span className="font-medium text-white">DLSG / Image Access</span>
            </div>
          </BlurReveal>

          {/* Visual */}
          <BlurReveal transition={{ delay: 0.18, duration: 0.55 }} className="max-w-5xl">
            {children}
          </BlurReveal>
        </div>
      </section>
    );
  }

  // ─── Desktop: Codrops scroll-expand hero ────────────────────────────────
  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #050A14 0%, #0A1428 100%)' }}
    >
      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: 'radial-gradient(circle, #94A3B8 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />
      {/* Glow orb */}
      <div
        className="hero-orb pointer-events-none absolute -top-20 right-0 h-[500px] w-[500px] opacity-10"
        style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)' }}
      />

      <div className="section-container relative z-10 flex min-h-screen flex-col justify-center pb-24 pt-28">
        <MetaRow />

        {/* Eyebrow shimmer */}
        <BlurReveal className="mb-5">
          <ShinyText
            text="Field-Service Operations Platform"
            className="text-base tracking-wide sm:text-lg"
          />
        </BlurReveal>

        {/* ─── Row 1: "Service Map" ─────────────────────────────── */}
        <div ref={row1Ref} className="will-change-transform">
          <SplitRevealText
            text="Service Map"
            as="h1"
            distance={56}
            duration={0.75}
            className="block text-[clamp(3rem,8vw,7rem)] font-black uppercase leading-[0.9] tracking-tight text-white"
          />
        </div>

        {/* ─── Expanding visual ─────────────────────────────────── */}
        <div
          ref={visualRef}
          className="relative my-4 w-full max-w-5xl overflow-hidden will-change-transform"
          style={{
            /* initial narrow clip set by GSAP; this is just for pre-paint sizing */
            aspectRatio: '16 / 9',
            borderRadius: '16px',
          }}
        >
          {children}
        </div>

        {/* ─── Row 2: "Planner" ─────────────────────────────────── */}
        <div ref={row2Ref} className="will-change-transform">
          <SplitRevealText
            text="Planner"
            as="span"
            distance={56}
            duration={0.75}
            viewportMargin="-120px"
            className="block text-[clamp(3rem,8vw,7rem)] font-black uppercase leading-[0.9] tracking-tight text-white"
          />
        </div>

        {/* Meta stats — below the expanding title */}
        <BlurReveal transition={{ delay: 0.2, duration: 0.55 }} className="mt-10 flex flex-wrap gap-6 text-sm">
          <div>
            <span className="mb-1 block text-xs uppercase tracking-widest text-slate-500">Role</span>
            <span className="font-medium text-white">Designer &amp; Developer</span>
          </div>
          <div>
            <span className="mb-1 block text-xs uppercase tracking-widest text-slate-500">Timeline</span>
            <span className="font-medium text-white">2023 – Present</span>
          </div>
          <div>
            <span className="mb-1 block text-xs uppercase tracking-widest text-slate-500">Context</span>
            <span className="font-medium text-white">DLSG / Image Access</span>
          </div>
          <BlurReveal transition={{ delay: 0.25, duration: 0.55 }} className="max-w-2xl">
            <p className="text-base leading-relaxed text-slate-400">
              An internal operations platform I designed and built to centralize customer institution
              data, equipment tracking, maintenance scheduling, service history, and technician
              workflows — giving the entire service team a single source of truth.
            </p>
          </BlurReveal>
        </BlurReveal>
      </div>
    </section>
  );
}
