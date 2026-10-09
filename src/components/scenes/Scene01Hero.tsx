import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown, FileDown, Mail, MapPin, Sparkles, Terminal } from 'lucide-react';
import { ShinyText, DecryptedText } from '@/components/bits';
import { credentials, mailto, profile, resumeUrl } from '@/data/profile';

gsap.registerPlugin(ScrollTrigger);

export default function Scene01Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const skylineRef = useRef<HTMLDivElement>(null);
  const midgroundRef = useRef<HTMLDivElement>(null);
  const waterRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const titleLeftRef = useRef<HTMLSpanElement>(null);
  const titleRightRef = useRef<HTMLSpanElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const [motionReduced, setMotionReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const baseUrl = import.meta.env.BASE_URL;
  const skylineUrl = `${baseUrl}images/brickell_skyline_hero.webp`;

  useEffect(() => {
    const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = (e: MediaQueryListEvent) => setMotionReduced(e.matches);
    reducedQuery.addEventListener('change', onMotionChange);
    return () => reducedQuery.removeEventListener('change', onMotionChange);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !stageRef.current) return;
    if (motionReduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=140%',
          pin: stageRef.current,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });

      // ─── 0.0 - 0.4: Foreground text and badges lift & dissolve into depth ───
      tl.to(
        [roleRef.current, metaRef.current, hintRef.current],
        {
          y: -40,
          opacity: 0,
          stagger: 0.03,
          ease: 'power2.in',
        },
        0
      );

      // Hero Title splits horizontally and dissolves with scale
      tl.to(
        titleLeftRef.current,
        {
          x: -80,
          y: -30,
          opacity: 0,
          scale: 1.06,
          ease: 'power2.inOut',
        },
        0.05
      );

      tl.to(
        titleRightRef.current,
        {
          x: 80,
          y: -30,
          opacity: 0,
          scale: 1.06,
          ease: 'power2.inOut',
        },
        0.05
      );

      // Water sheen expands and deepens
      tl.to(
        waterRef.current,
        {
          y: -60,
          opacity: 0.3,
          scaleY: 1.25,
          ease: 'none',
        },
        0
      );

      // Foreground mist drifts upward
      tl.to(
        mistRef.current,
        {
          y: -100,
          opacity: 0,
          ease: 'none',
        },
        0
      );

      // Midground architectural accents slide forward
      tl.to(
        midgroundRef.current,
        {
          y: -45,
          scale: 1.12,
          opacity: 0.7,
          ease: 'none',
        },
        0.1
      );

      // Distant Brickell skyline zooms gently and atmospheric blur deepens
      tl.to(
        skylineRef.current,
        {
          y: -30,
          scale: 1.1,
          filter: 'blur(3px) brightness(0.6)',
          ease: 'none',
        },
        0.1
      );

      // Distant sky shifts
      tl.to(
        skyRef.current,
        {
          y: -15,
          scale: 1.04,
          opacity: 0.5,
          ease: 'none',
        },
        0.15
      );

      // Smooth dissolve into next scene (Scene 02)
      tl.to(
        stageRef.current,
        {
          opacity: 0,
          scale: 0.98,
          ease: 'power2.in',
        },
        0.85
      );
    }, containerRef);

    return () => ctx.revert();
  }, [motionReduced]);

  return (
    <div
      ref={containerRef}
      id="intro"
      className="relative w-full bg-[#06080d] text-white"
      aria-label="Scene 01: South Florida Cinematic Opening"
    >
      <div
        ref={stageRef}
        className="relative w-full h-screen overflow-hidden flex flex-col justify-between"
      >
        {/* Layer 1: Sky & Atmospheric Gradient (Slowest) */}
        <div
          ref={skyRef}
          className="absolute inset-0 pointer-events-none will-change-transform"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#03060c] via-[#071322] to-[#040810]" />
          <div className="absolute top-0 inset-x-0 h-96 bg-[radial-gradient(ellipse_at_50%_0%,rgba(37,99,235,0.22)_0%,transparent_70%)]" />
          <div className="absolute bottom-1/3 inset-x-0 h-80 bg-[radial-gradient(ellipse_at_50%_100%,rgba(6,182,212,0.14)_0%,transparent_60%)]" />
        </div>

        {/* Layer 2: Distant Skyline Photo Layer */}
        <div
          ref={skylineRef}
          className="absolute inset-0 pointer-events-none will-change-transform"
          aria-hidden="true"
        >
          <div
            className="absolute inset-0 bg-cover bg-center opacity-85 transition-opacity"
            style={{
              backgroundImage: `url("${skylineUrl}")`,
              transformOrigin: '50% 65%',
            }}
          />
          {/* Subtle cinematic color grade */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06080d] via-transparent to-[#03060c]/60" />
        </div>

        {/* Layer 3: Architectural Depth Slices & Light Accents */}
        <div
          ref={midgroundRef}
          className="absolute inset-0 pointer-events-none will-change-transform"
          aria-hidden="true"
        >
          {/* Vertical architectural grid lines reminiscent of Miami bridges */}
          <svg className="absolute inset-0 w-full h-full opacity-15" preserveAspectRatio="none">
            <line x1="20%" y1="0" x2="20%" y2="100%" stroke="rgba(96,165,250,0.4)" strokeWidth="1" strokeDasharray="4 8" />
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(96,165,250,0.3)" strokeWidth="1" strokeDasharray="6 12" />
            <line x1="80%" y1="0" x2="80%" y2="100%" stroke="rgba(96,165,250,0.4)" strokeWidth="1" strokeDasharray="4 8" />
          </svg>
        </div>

        {/* Layer 4: Water Surface Sheen (Miami River / Biscayne Bay) */}
        <div
          ref={waterRef}
          className="absolute bottom-0 inset-x-0 h-48 pointer-events-none will-change-transform"
          aria-hidden="true"
        >
          <div className="w-full h-full bg-gradient-to-t from-[#06080d] via-[rgba(6,182,212,0.12)] to-transparent" />
          <div className="absolute bottom-12 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent blur-[1px]" />
        </div>

        {/* Layer 5: Foreground Atmospheric Mist / Haze (Fastest) */}
        <div
          ref={mistRef}
          className="absolute inset-0 pointer-events-none will-change-transform bg-[radial-gradient(circle_at_50%_70%,rgba(15,23,42,0.4)_0%,transparent_75%)]"
          aria-hidden="true"
        />

        {/* Vignette & Grain */}
        <div
          className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.8)]"
          aria-hidden="true"
        />

        {/* ─── Hero Content Foreground ─── */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 pt-28 sm:pt-[min(8rem,14vh)] flex flex-col justify-start">
          {/* Eyebrow badge */}
          <div ref={metaRef} className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.07] border border-white/15 backdrop-blur-md text-[11px] font-mono tracking-wider text-cyan-300 uppercase">
              <MapPin size={12} className="text-cyan-400" />
              <span>South Florida // Miami &middot; Boca Raton</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-[11px] font-mono text-blue-300">
              <Terminal size={12} />
              <span>Enterprise Systems &middot; Pre-Sales to Scale</span>
            </span>
          </div>

          {/* Large Editorial Headline */}
          <h1 className="font-serif tracking-tight text-white select-none leading-[0.88] mb-6 sm:mb-8">
            <span
              ref={titleLeftRef}
              className="block text-6xl sm:text-8xl md:text-9xl lg:text-[min(10.5rem,15vh)] font-bold tracking-tighter drop-shadow-2xl will-change-transform"
            >
              JOSE
            </span>
            <span
              ref={titleRightRef}
              className="block text-6xl sm:text-8xl md:text-9xl lg:text-[min(10.5rem,15vh)] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-cyan-200 to-blue-400 drop-shadow-2xl will-change-transform"
            >
              GARCIA
            </span>
          </h1>

          {/* Role Positioning Subtitle */}
          <div ref={roleRef} className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-sm sm:text-base md:text-lg font-medium text-slate-200 tracking-wide">
              <ShinyText text={profile.title} baseColor="#93C5FD" shineColor="#FFFFFF" speed={2.5} />
              <span className="text-slate-400" aria-hidden="true">&middot;</span>
              <span>{profile.focus}</span>
            </div>

            <p className="text-sm sm:text-base text-slate-300/80 font-sans leading-relaxed max-w-xl [@media(max-height:700px)]:hidden">
              Connecting technical depth with customer execution. Architecting solutions, proving capability with high-stakes demonstrations, and delivering nationwide deployments.
            </p>

            {/* Recruiter essentials: who, where, credentials, and the two actions they came for. */}
            <ul className="flex flex-wrap gap-x-5 gap-y-1.5 pt-1 text-[13px] sm:text-sm text-slate-200 font-sans" aria-label="Credentials">
              {credentials.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-cyan-300/80" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <a
                href={resumeUrl}
                download={profile.resumeFile}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#06080d] transition-colors hover:bg-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
              >
                <FileDown size={16} aria-hidden="true" />
                Download résumé
              </a>
              <a
                href={mailto}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
              >
                <Mail size={16} aria-hidden="true" />
                Email me
              </a>
            </div>
          </div>
        </div>

        {/* ─── Bottom HUD / Scroll Indicator ─── */}
        <div
          ref={hintRef}
          className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 pb-10 flex items-end justify-between text-xs font-mono text-slate-400"
        >
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="tracking-widest uppercase">
              <DecryptedText text="SCROLL TO ENTER EXPERIENCE" speed={40} maxIterations={8} />
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="hidden sm:inline tracking-wider uppercase text-[10px]">INERTIAL PARALLAX</span>
            <ChevronDown size={16} className="animate-bounce text-cyan-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
