import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, MapPin, CheckCircle2, Award, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { experience, education, certifications } from '@/data/experience';
import { ShinyText, DecryptedText } from '@/components/bits';

gsap.registerPlugin(ScrollTrigger);

export default function Scene03Experience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      itemsRef.current.forEach((el) => {
        if (!el) return;

        gsap.fromTo(
          el,
          {
            opacity: 0,
            y: 50,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 82%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="experience"
      className="relative z-10 py-28 sm:py-36 bg-[var(--bg)] text-[var(--text-primary)] border-t border-[var(--border)]"
      aria-label="Scene 03: Professional Experience and Positioning"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        {/* Section Header with Editorial Typography */}
        <div className="mb-20 sm:mb-28 border-b border-[var(--border)] pb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
            <span className="font-mono text-xs font-semibold tracking-widest text-[var(--accent)] uppercase">
              SCENE 03 // PROFESSIONAL RECORD &amp; POSITIONING
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <h2 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.05]">
                Solutions Consulting.{' '}
                <span className="italic font-normal text-[var(--accent)]">Enterprise Delivery.</span>
              </h2>
            </div>
            <div className="lg:col-span-4">
              <p className="text-sm sm:text-base text-[var(--text-secondary)] font-sans leading-relaxed">
                Positioned at the intersection of technical discovery, customer systems architecture, hands-on integration, and enterprise relationships.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Editorial Experience Entries ─── */}
        <div className="space-y-24 sm:space-y-32">
          {/* Entry 1: DLSG / Image Access */}
          <div
            ref={(el) => { itemsRef.current[0] = el; }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start will-change-transform"
          >
            {/* Left Column: Huge Year & Role Identity */}
            <div className="lg:col-span-4 sticky top-28 space-y-4">
              <div className="font-mono text-xs text-[var(--accent)] font-semibold tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>CURRENT ENGAGEMENT</span>
              </div>
              <div className="font-serif text-5xl sm:text-6xl font-bold text-[var(--text-primary)] tracking-tight">
                2022 &mdash;<br />
                <span className="text-[var(--accent)]">PRESENT</span>
              </div>
              <div className="pt-2 text-xs font-mono text-[var(--text-muted)] space-y-1">
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-[var(--accent)]" />
                  <span>South Florida &middot; Nationwide Deployments</span>
                </div>
              </div>
            </div>

            {/* Right Column: Narrative & Detailed Responsibilities */}
            <div className="lg:col-span-8 space-y-8">
              <div>
                <h3 className="text-2xl sm:text-4xl font-serif font-bold text-[var(--text-primary)] mb-2">
                  Service Engineer
                </h3>
                <p className="font-mono text-base text-[var(--accent)] font-semibold tracking-wide">
                  Digital Library Systems Group / Image Access
                </p>
              </div>

              <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed font-sans">
                Customer-facing engineering role spanning the entire product adoption lifecycle—from technical discovery and high-stakes executive demonstrations to nationwide deployments, system troubleshooting, and internal tool development. Trusted partner for sales teams across higher education, public research institutions, and government archives.
              </p>

              {/* Pillars Grid */}
              <div className="grid sm:grid-cols-2 gap-5 pt-4">
                <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-low)] space-y-2">
                  <span className="font-mono text-xs font-bold text-[var(--accent)] uppercase tracking-wider block">
                    Pre-Sales &amp; Discovery
                  </span>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Evaluate customer infrastructure requirements, deliver customized technical demonstrations, and address complex customer technical objections.
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-low)] space-y-2">
                  <span className="font-mono text-xs font-bold text-[var(--accent)] uppercase tracking-wider block">
                    Systems Deployment
                  </span>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Lead onsite and remote hardware and software integrations, calibrate optical equipment, configure Windows systems, and validate network security.
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-low)] space-y-2">
                  <span className="font-mono text-xs font-bold text-[var(--accent)] uppercase tracking-wider block">
                    Enablement &amp; Training
                  </span>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Train technical administrators and librarians, write operational procedures, and conduct root-cause troubleshooting for mission-critical anomalies.
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-low)] space-y-2">
                  <span className="font-mono text-xs font-bold text-[var(--accent)] uppercase tracking-wider block">
                    Software Development
                  </span>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Designed and built <strong className="text-[var(--text-primary)]">Service Map Planner</strong> to centralize customer records, equipment registries, and travel planning.
                  </p>
                </div>
              </div>

              {/* Competency Badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  'Solutions Engineering',
                  'Technical Discovery',
                  'Executive Demonstrations',
                  'Windows Administration',
                  'Hardware Integration',
                  'Network Diagnostics',
                  'Customer Training',
                  'Full-Stack Tooling',
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-3.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-warm)] text-xs font-mono font-medium text-[var(--text-secondary)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Entry 2: GlobeNet Telecom */}
          <div
            ref={(el) => { itemsRef.current[1] = el; }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start pt-16 border-t border-[var(--border-subtle)] will-change-transform"
          >
            {/* Left Column */}
            <div className="lg:col-span-4 sticky top-28 space-y-4">
              <div className="font-mono text-xs text-[var(--text-muted)] font-semibold tracking-widest uppercase">
                CRITICAL INFRASTRUCTURE
              </div>
              <div className="font-serif text-5xl sm:text-6xl font-bold text-[var(--text-primary)] tracking-tight">
                2021 &mdash;<br />
                <span>2022</span>
              </div>
              <div className="pt-2 text-xs font-mono text-[var(--text-muted)]">
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-[var(--text-muted)]" />
                  <span>South Florida</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-8 space-y-6">
              <div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text-primary)] mb-2">
                  Network Operations Center (NOC) Engineer
                </h3>
                <p className="font-mono text-base text-[var(--text-muted)] font-semibold tracking-wide">
                  GlobeNet Telecom
                </p>
              </div>

              <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed font-sans">
                Monitored carrier fiber routes, including subsea cables. Investigated connectivity incidents, performed root-cause analysis to support service restoration, and coordinated escalations during network events.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  'Subsea Fiber Optics',
                  'Carrier Network Monitoring',
                  'Incident Response',
                  'DWDM Telemetry',
                  'SLA Monitoring',
                  'Cross-Team Escalation',
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-3.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-warm)] text-xs font-mono font-medium text-[var(--text-secondary)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Entry 3: Education & Credentials */}
          <div
            ref={(el) => { itemsRef.current[2] = el; }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start pt-16 border-t border-[var(--border-subtle)] will-change-transform"
          >
            {/* Left Column */}
            <div className="lg:col-span-4 sticky top-28 space-y-4">
              <div className="font-mono text-xs text-[var(--text-muted)] font-semibold tracking-widest uppercase">
                ENGINEERING FOUNDATION
              </div>
              <div className="font-serif text-5xl sm:text-6xl font-bold text-[var(--text-primary)] tracking-tight">
                2018 &mdash;<br />
                <span>2022</span>
              </div>
              <div className="pt-2 text-xs font-mono text-[var(--text-muted)]">
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-[var(--text-muted)]" />
                  <span>Florida Atlantic University (FAU)</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-8 space-y-6">
              <div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text-primary)] mb-2">
                  B.S. in Computer Science &amp; Engineering
                </h3>
                <p className="font-mono text-base text-[var(--text-muted)] font-semibold tracking-wide">
                  Florida Atlantic University &middot; College of Engineering &amp; Computer Science
                </p>
              </div>

              <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed font-sans">
                Rigorous grounding in computer systems architecture, embedded logic, digital signal processing, networks, and data analytics. Equipped with hands-on hardware lab experience and modern software engineering practices.
              </p>

              {/* Accreditations row */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-start gap-3">
                  <Award size={18} className="text-[var(--accent)] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-sm text-[var(--text-primary)] block">
                      Data Science &amp; Analytics Certificate
                    </span>
                    <span className="text-xs text-[var(--text-muted)] font-mono">Florida Atlantic University</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-start gap-3">
                  <ShieldCheck size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-sm text-[var(--text-primary)] block">
                      AWS Certified Cloud Practitioner
                    </span>
                    <span className="text-xs text-[var(--text-muted)] font-mono">Amazon Web Services (AWS)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
