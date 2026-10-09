import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Compass, Sparkles, ShieldCheck } from 'lucide-react';
import { BlurText } from '@/components/bits';

gsap.registerPlugin(ScrollTrigger);

export default function Scene06Philosophy() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        {
          opacity: 0.2,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
            end: 'center center',
            scrub: 0.5,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="philosophy"
      className="relative z-10 py-32 sm:py-44 bg-[var(--surface-warm)] text-[var(--text-primary)] border-t border-[var(--border)] overflow-hidden"
      aria-label="Scene 06: Engineering Philosophy and Perspective"
    >
      <div
        ref={contentRef}
        className="max-w-5xl mx-auto px-6 sm:px-12 text-center flex flex-col items-center will-change-transform"
      >
        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
          <span className="font-mono text-xs font-semibold tracking-widest text-[var(--accent)] uppercase">
            SCENE 06 // PERSPECTIVE &middot; ENGINEERING ETHOS
          </span>
        </div>

        {/* Large Editorial Headline */}
        <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.12] mb-8 max-w-4xl">
          <BlurText
            text="Technology is the tool. Solving the problem is the job."
            delay={35}
            animateBy="words"
            direction="top"
            className="text-[var(--text-primary)]"
          />
        </h2>

        {/* Core Narrative */}
        <p className="text-base sm:text-xl text-[var(--text-secondary)] font-sans leading-relaxed max-w-3xl mb-16">
          Enterprise technology rarely fails because of code alone. It fails when the bridge between capability and human comprehension was never built. Whether calibrating an optical sensor during an emergency field call or leading an RFP demonstration for university leadership, my standard is uncompromising: absolute clarity, dependable execution, and demonstrable value.
        </p>

        {/* Three Pillars of Practice */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-low)] space-y-2">
            <span className="font-mono text-xs font-bold text-[var(--accent)] block">
              01 // EMPATHY BEFORE ARCHITECTURE
            </span>
            <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
              Understand the Friction
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
              Listen deeply to the operators living with the problem before proposing technical architectures or software.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-low)] space-y-2">
            <span className="font-mono text-xs font-bold text-[var(--accent)] block">
              02 // PROOF OVER PROMISE
            </span>
            <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
              Live Working Systems
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
              Functioning prototypes, empirical telemetry, and live demonstrations earn more trust than speculative slide decks.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-low)] space-y-2">
            <span className="font-mono text-xs font-bold text-[var(--accent)] block">
              03 // AUTONOMOUS ENABLEMENT
            </span>
            <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
              Customer Autonomy
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
              True success means the customer and their administrators operate with complete confidence long after rollout.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
