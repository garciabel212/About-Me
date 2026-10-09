import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Compass,
  Cpu,
  MonitorPlay,
  Wrench,
  Headset,
  CheckCircle2,
  Users,
  Network,
  Code2,
  Server,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { SpotlightCard, ShinyText, DecryptedText } from '@/components/bits';

gsap.registerPlugin(ScrollTrigger);

interface StageData {
  step: string;
  name: string;
  subtitle: string;
  icon: typeof Compass;
  accent: string;
  description: string;
  activeResponsibilities: string[];
  deliverables: string[];
  impactMetric: string;
}

const stages: StageData[] = [
  {
    step: '01',
    name: 'DISCOVER',
    subtitle: 'Requirements & Operational Constraints',
    icon: Compass,
    accent: '#3B82F6',
    description:
      'Uncovering infrastructure constraints, existing security policies, and stakeholder objectives before proposing an architectural blueprint.',
    activeResponsibilities: ['Customer Communication', 'Technical Problem Solving'],
    deliverables: ['Technical Environment Audit', 'Security & Firewall Mapping', 'Success Criteria Matrix'],
    impactMetric: 'Eliminates downstream architectural rework',
  },
  {
    step: '02',
    name: 'DESIGN',
    subtitle: 'System Architecture & Compatibility',
    icon: Cpu,
    accent: '#06B6D4',
    description:
      'Translating customer constraints into reliable hardware configurations, OS images, network schemas, and reproducible deployment blueprints.',
    activeResponsibilities: ['Software', 'Networking', 'Hardware', 'Technical Problem Solving'],
    deliverables: ['Hardware/OS Specification', 'VLAN & Protocol Schemas', 'Deployment Playbook'],
    impactMetric: 'Guarantees reliable multi-vendor interoperability',
  },
  {
    step: '03',
    name: 'DEMONSTRATE',
    subtitle: 'Interactive Proof of Concept & Demos',
    icon: MonitorPlay,
    accent: '#8B5CF6',
    description:
      'Conducting customized, hands-on demonstrations that validate high-value customer workflows, addressing technical skepticism and proving concrete value.',
    activeResponsibilities: ['Solution Demonstrations', 'Customer Communication', 'Technical Problem Solving'],
    deliverables: ['Tailored Workflow Prototypes', 'Executive RFP Presentations', 'Live Feasibility Testing'],
    impactMetric: 'Converts technical skepticism into executive conviction',
  },
  {
    step: '04',
    name: 'IMPLEMENT',
    subtitle: 'Hardware Integration & Production Rollout',
    icon: Wrench,
    accent: '#10B981',
    description:
      'Deploying high-precision hardware onsite and remotely, configuring Windows OS environments, calibrating sensors, and completing formal sign-offs.',
    activeResponsibilities: ['Implementation', 'Hardware', 'Networking', 'Technical Problem Solving'],
    deliverables: ['Optical Scanner Integration', 'Driver & Network Provisioning', 'Production Acceptance Sign-Off'],
    impactMetric: 'Formal production acceptance sign-off',
  },
  {
    step: '05',
    name: 'SUPPORT',
    subtitle: 'Customer Enablement & Preventive Care',
    icon: Headset,
    accent: '#F59E0B',
    description:
      'Training IT administrators and staff, publishing operational runbooks, managing proactive maintenance schedules, and providing rapid root-cause escalation.',
    activeResponsibilities: ['Training', 'Post-Sale Support', 'Customer Communication'],
    deliverables: ['Administrator Runbooks', 'Staff Certification Sessions', 'Proactive Maintenance Routines'],
    impactMetric: 'Ensures long-term adoption and customer trust',
  },
];

const allResponsibilities = [
  { name: 'Customer Communication', icon: Users },
  { name: 'Technical Problem Solving', icon: Cpu },
  { name: 'Software', icon: Code2 },
  { name: 'Networking', icon: Network },
  { name: 'Hardware', icon: Server },
  { name: 'Implementation', icon: Wrench },
  { name: 'Training', icon: GraduationCap },
  { name: 'Solution Demonstrations', icon: MonitorPlay },
  { name: 'Post-Sale Support', icon: Headset },
];

export default function Scene02WhoIAm() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinSectionRef = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const cardContentRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  const [motionReduced, setMotionReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = (e: MediaQueryListEvent) => setMotionReduced(e.matches);
    reducedQuery.addEventListener('change', onMotionChange);
    return () => reducedQuery.removeEventListener('change', onMotionChange);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !pinSectionRef.current) return;
    if (motionReduced) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px) and (min-height: 700px)', () => {
      const st = ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: '+=180%',
        pin: pinSectionRef.current,
        scrub: 0.4,
        anticipatePin: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          if (progressLineRef.current) {
            progressLineRef.current.style.width = `${progress * 100}%`;
          }
          const stageIndex = Math.min(
            stages.length - 1,
            Math.floor(progress * stages.length)
          );
          setActiveStageIndex(stageIndex);
        },
      });

      scrollTriggerRef.current = st;

      return () => {
        st.kill();
        scrollTriggerRef.current = null;
      };
    });

    return () => mm.revert();
  }, [motionReduced]);

  const handleStageClick = (idx: number) => {
    if (scrollTriggerRef.current) {
      const st = scrollTriggerRef.current;
      const progressTarget = (idx + 0.15) / stages.length;
      const targetY = st.start + progressTarget * (st.end - st.start);
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    } else {
      setActiveStageIndex(idx);
    }
  };

  const currentStage = stages[activeStageIndex];
  const IconComponent = currentStage.icon;

  return (
    <section
      ref={containerRef}
      id="who-i-am"
      className="relative w-full bg-[var(--bg)] text-[var(--text-primary)] border-t border-[var(--border)]"
      aria-label="Scene 02: Who I Am — The Customer Technology Lifecycle"
    >
      <div
        ref={pinSectionRef}
        className="relative w-full min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-center px-6 sm:px-12 py-10 lg:py-8 max-w-7xl mx-auto overflow-hidden"
      >
        {/* Section Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="font-mono text-xs font-semibold tracking-widest text-[var(--accent)] uppercase">
              SCENE 02 // WHO I AM &middot; THE SOLUTIONS LIFECYCLE
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
                Operating across the full{' '}
                <span className="italic font-normal text-[var(--accent)]">customer lifecycle.</span>
              </h2>
            </div>
            <p className="max-w-md text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
              Bridging engineering complexity and executive outcomes. Not a disconnected set of bullet points, but a unified methodology connecting pre-sales to long-term adoption.
            </p>
          </div>
        </div>

        {/* ─── Top Stage Selector & Scrubbed Progress Bar ─── */}
        <div className="relative mb-6 lg:mb-8">
          {/* Background track */}
          <div className="absolute top-5 inset-x-0 h-1 bg-[var(--border)] rounded-full" />
          {/* Active progress fill */}
          <div
            ref={progressLineRef}
            className="absolute top-5 left-0 h-1 bg-[var(--accent)] rounded-full transition-all duration-150"
            style={{ width: `${((activeStageIndex + 0.5) / stages.length) * 100}%` }}
          />

          {/* Pipeline Stage Buttons */}
          <div className="grid grid-cols-5 gap-2 relative z-10">
            {stages.map((st, idx) => {
              const isActive = idx === activeStageIndex;
              const isPast = idx < activeStageIndex;
              const StageIcon = st.icon;

              return (
                <button
                  key={st.step}
                  type="button"
                  onClick={() => handleStageClick(idx)}
                  className="flex flex-col items-center group cursor-pointer focus:outline-none"
                  aria-label={`Switch to Stage ${st.step}: ${st.name}`}
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
                      isActive
                        ? 'bg-[var(--accent)] text-white shadow-[var(--shadow-blue)] scale-110 ring-4 ring-[var(--accent)]/20'
                        : isPast
                        ? 'bg-[var(--surface-elevated)] border-2 border-[var(--accent)] text-[var(--accent)]'
                        : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] group-hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <StageIcon size={16} />
                  </div>
                  <span
                    className={`mt-2 font-mono text-[10px] sm:text-xs font-bold tracking-wider uppercase transition-colors ${
                      isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {st.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Main Content Grid: Stage Exhibit + Connected Capabilities Matrix ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch flex-1 min-h-0">
          {/* Left Column: Active Stage Exhibit Card */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <SpotlightCard
              className="p-6 sm:p-8 flex-1 flex flex-col justify-between border-[var(--border)] shadow-[var(--shadow-medium)] bg-[var(--surface)]"
              spotlightColor="rgba(59, 130, 246, 0.15)"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                      PHASE {currentStage.step}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                      {currentStage.subtitle}
                    </span>
                  </div>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${currentStage.accent}15`, color: currentStage.accent }}
                  >
                    <IconComponent size={18} />
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[var(--text-primary)] mb-2">
                  {currentStage.name}
                </h3>

                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed mb-4">
                  {currentStage.description}
                </p>
              </div>

              <div>
                <div className="p-3.5 sm:p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-warm)] mb-4">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-2">
                    KEY DELIVERABLES &amp; ARTIFACTS
                  </span>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {currentStage.deliverables.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <CheckCircle2 size={13} className="text-[var(--accent)] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)] text-xs font-mono">
                  <span className="text-[var(--text-muted)]">OUTCOME:</span>
                  <span className="font-bold text-[var(--accent)]">
                    <DecryptedText text={currentStage.impactMetric} speed={35} maxIterations={8} />
                  </span>
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* Right Column: Connected Responsibilities Matrix */}
          <div className="lg:col-span-5 flex flex-col justify-between p-5 sm:p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[var(--shadow-low)]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold tracking-wider text-[var(--text-primary)] uppercase">
                  RESPONSIBILITIES MATRIX
                </span>
                <span className="text-[10px] font-mono text-[var(--accent)]">Active for Phase {currentStage.step}</span>
              </div>
              <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                Dynamic cross-discipline alignment connecting pre-sales technical consultation to production deployment:
              </p>

              {/* Responsibilities list */}
              <div className="space-y-1.5">
                {allResponsibilities.map((resp) => {
                  const isHighlighted = currentStage.activeResponsibilities.includes(resp.name);
                  const RespIcon = resp.icon;

                  return (
                    <div
                      key={resp.name}
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all duration-300 ${
                        isHighlighted
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text-primary)] shadow-sm'
                          : 'border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-muted)] opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            isHighlighted
                              ? 'bg-[var(--accent)] text-white'
                              : 'bg-[var(--border-subtle)] text-[var(--text-muted)]'
                          }`}
                        >
                          <RespIcon size={14} />
                        </div>
                        <span className={`text-xs sm:text-sm font-medium ${isHighlighted ? 'font-semibold text-[var(--text-primary)]' : ''}`}>
                          {resp.name}
                        </span>
                      </div>

                      {isHighlighted && (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[var(--accent)] font-bold uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-ping" />
                          ENGAGED
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] font-mono text-[11px] text-[var(--text-muted)] flex items-center justify-between">
              <span>Cross-Discipline Alignment</span>
              <span className="text-[var(--text-primary)] font-semibold">Discovery &rarr; Adoption</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
