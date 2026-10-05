import { useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Activity, ChevronLeft, ChevronRight } from 'lucide-react';

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

interface Stage {
  id: string;
  step: string;
  name: string;
  subtitle: string;
  description: string;
  deliverables: string[];
  impactMetric: string;
}

const stages: Stage[] = [
  {
    id: 'discover',
    step: '01',
    name: 'DISCOVER',
    subtitle: 'Requirements & Constraints Discovery',
    description:
      'Uncover customer operational constraints, legacy infrastructure realities, workflow bottlenecks, and stakeholder requirements before proposing a technical architecture.',
    deliverables: ['Technical Environment Scoping', 'Constraints & Security Mapping', 'Success Criteria Matrix'],
    impactMetric: 'Eliminates downstream architectural rework',
  },
  {
    id: 'design',
    step: '02',
    name: 'DESIGN',
    subtitle: 'Solution Blueprint & System Architecture',
    description:
      'Translate customer needs into practical hardware configurations, software topologies, network protocols, integration schemas, and deployment timelines.',
    deliverables: ['Architecture Specification', 'Hardware/Software Compatibility Matrix', 'Rollout Timeline'],
    impactMetric: 'Guarantees reliable multi-vendor interoperability',
  },
  {
    id: 'demonstrate',
    step: '03',
    name: 'DEMONSTRATE',
    subtitle: 'Tailored Demonstrations & Proof of Concept',
    description:
      "Deliver tailored, interactive technical demonstrations that directly validate the customer's high-value workflows, proving capability and building executive credibility.",
    deliverables: ['Custom Proof of Concept', 'Live Technical Demo Sessions', 'RFP Technical Validations'],
    impactMetric: 'Converts technical skepticism into executive conviction',
  },
  {
    id: 'deploy',
    step: '04',
    name: 'DEPLOY',
    subtitle: 'Onsite & Remote Systems Implementation',
    description:
      'Execute hardware integration, Windows OS configurations, network routing, sensor calibration, licensing, and formal customer sign-off with zero operational disruption.',
    deliverables: ['Hardware/Software Integration', 'Driver & Network Calibration', 'Production Validation Sign-Off'],
    impactMetric: '100% first-time deployment success rate',
  },
  {
    id: 'adopt',
    step: '05',
    name: 'ADOPT',
    subtitle: 'Enablement, Training & Technical Support',
    description:
      'Empower system administrators and end-users with targeted operational training, clear technical runbooks, proactive maintenance schedules, and rapid escalation support.',
    deliverables: ['Admin & End-User Training', 'Operational Runbooks & Guides', 'Proactive Maintenance Routines'],
    impactMetric: 'Ensures sustained long-term customer adoption',
  },
];

// --- Mobile Swipe Carousel -----------------------------------------------
function MobileCarousel({ activeIdx, setActiveIdx }: { activeIdx: number; setActiveIdx: (i: number) => void }) {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const currentStage = stages[activeIdx];

  const goTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(stages.length - 1, idx));
    setActiveIdx(clamped);
  };

  return (
    <div className="space-y-4">
      {/* Carousel header with nav arrows */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-white font-mono text-[10px] font-bold flex items-center justify-center">
            {currentStage.step}
          </span>
          <span className="font-mono text-sm font-bold text-[var(--accent)] tracking-wider uppercase">
            {currentStage.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous stage"
            onClick={() => goTo(activeIdx - 1)}
            disabled={activeIdx === 0}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-[var(--border)] text-[var(--text-muted)] disabled:opacity-30 hover:border-[var(--accent)] hover:text-[var(--accent)] active:scale-90 transition-all duration-200"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            aria-label="Next stage"
            onClick={() => goTo(activeIdx + 1)}
            disabled={activeIdx === stages.length - 1}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-[var(--border)] text-[var(--text-muted)] disabled:opacity-30 hover:border-[var(--accent)] hover:text-[var(--accent)] active:scale-90 transition-all duration-200"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Slide area - overflow hidden for peek effect */}
      <div className="relative overflow-hidden" ref={constraintsRef}>
        <motion.div
          className="flex"
          animate={{ x: `${-activeIdx * 100}%` }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.38, ease: EASE_EXPO }}
          drag={reduceMotion ? false : 'x'}
          dragConstraints={constraintsRef}
          dragElastic={0.12}
          onDragEnd={(_, info) => {
            const threshold = 60;
            if (info.offset.x < -threshold) goTo(activeIdx + 1);
            else if (info.offset.x > threshold) goTo(activeIdx - 1);
          }}
        >
          {stages.map((st) => (
            <div
              key={st.id}
              className="min-w-full px-1 select-none"
              aria-hidden={st.id !== currentStage.id}
            >
              <div className="p-5 rounded-2xl border border-[var(--accent)] bg-[var(--surface)] shadow-[var(--shadow-medium)]">
                {/* Subtitle */}
                <p className="text-[10px] font-mono text-[var(--text-muted)] mb-3 tracking-wider uppercase">
                  {st.subtitle}
                </p>

                {/* Description */}
                <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-4 font-serif">
                  {st.description}
                </p>

                {/* Impact metric */}
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--accent)] font-semibold mb-4">
                  <Activity size={12} />
                  <span>IMPACT: {st.impactMetric}</span>
                </div>

                {/* Deliverables */}
                <div className="space-y-1.5 pt-3 border-t border-[var(--border-subtle)]">
                  {st.deliverables.map((d) => (
                    <div key={d} className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                      <CheckCircle2 size={12} className="text-[var(--accent)] shrink-0" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 pt-1" role="tablist" aria-label="Pipeline stages">
        {stages.map((st, idx) => (
          <button
            key={st.id}
            type="button"
            role="tab"
            aria-selected={idx === activeIdx}
            aria-label={`Go to stage ${st.step}: ${st.name}`}
            onClick={() => goTo(idx)}
            className={`transition-all duration-300 rounded-full ${
              idx === activeIdx
                ? 'w-6 h-2 bg-[var(--accent)]'
                : 'w-2 h-2 bg-[var(--border)] hover:bg-[var(--border-strong)]'
            }`}
          />
        ))}
      </div>

      {/* Swipe hint */}
      <motion.p
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="text-center text-[10px] font-mono text-[var(--text-muted)] tracking-widest uppercase pointer-events-none"
        aria-hidden
      >
        Swipe to explore
      </motion.p>
    </div>
  );
}

// --- Main Section ---------------------------------------------------------
export default function MethodologySection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const reduceMotion = useReducedMotion();
  const currentStage = stages[activeIdx];

  return (
    <section
      id="methodology"
      className="section-py border-t border-[var(--border)] relative scroll-mt-20 bg-[var(--surface-warm-translucent)]"
      data-contour-section="methodology"
    >
      <div className="section-container">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 lg:mb-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            <span className="font-mono text-xs font-semibold tracking-widest text-[var(--accent)] uppercase">
              SYSTEMS METHODOLOGY // HOW I WORK
            </span>
          </div>
          <h2 className="text-editorial-title font-serif text-[var(--text-primary)] mb-4">
            End-to-End Solutions Lifecycle
          </h2>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
            Connecting initial discovery and demonstration to nationwide delivery, customer enablement, and long-term operational stability.
          </p>
        </div>

        {/* --- DESKTOP CONNECTED SYSTEMS FLOW (>= 1024px) --- */}
        <div className="hidden lg:block mb-8">
          
          {/* Signal Pipeline Bar */}
          <div className="relative pt-4 pb-8">
            
            {/* Background Track Line */}
            <div className="absolute top-8 left-[10%] right-[10%] h-[2px] bg-[var(--border)] z-0" />

            {/* Dynamic Signal Trace Line */}
            <motion.div
              className="absolute top-8 left-[10%] h-[2px] bg-[var(--accent)] shadow-[var(--shadow-blue)] z-0"
              initial={false}
              animate={{
                width: `${(activeIdx / (stages.length - 1)) * 80}%`,
              }}
              transition={{ duration: 0.4, ease: EASE_EXPO }}
            />

            {/* Stage Nodes */}
            <div className="grid grid-cols-5 gap-4 relative z-10">
              {stages.map((st, idx) => {
                const isActive = idx === activeIdx;
                const isPassed = idx <= activeIdx;

                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    onMouseEnter={() => setActiveIdx(idx)}
                    className="flex flex-col items-center group cursor-pointer focus-visible:outline-none"
                    aria-label={`Select stage ${st.step}: ${st.name}`}
                  >
                    {/* Node Pip */}
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
                        isActive
                          ? 'bg-[var(--accent)] text-white shadow-[var(--shadow-blue)] scale-110 ring-4 ring-[var(--accent)]/20'
                          : isPassed
                            ? 'bg-[var(--surface-elevated)] border-2 border-[var(--accent)] text-[var(--accent)]'
                            : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] group-hover:border-[var(--border-strong)]'
                      }`}
                    >
                      {st.step}
                    </div>

                    {/* Stage Name */}
                    <span
                      className={`mt-3 font-mono text-xs font-bold tracking-wider uppercase transition-colors duration-200 ${
                        isActive
                          ? 'text-[var(--accent)]'
                          : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {st.name}
                    </span>

                    {/* Short Subtitle */}
                    <span className="mt-0.5 text-[11px] font-sans text-[var(--text-muted)] text-center line-clamp-1 px-2">
                      {st.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Interactive Stage Detail Display Card */}
          <div className="card p-8 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-medium)] min-h-[220px] relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: EASE_EXPO }}
                className="grid grid-cols-12 gap-8 items-center"
              >
                {/* Left Description (7 Cols) */}
                <div className="col-span-7 flex flex-col text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-[var(--accent)]">
                      STAGE {currentStage.step} // {currentStage.name}
                    </span>
                    <span className="text-[var(--text-muted)]">&middot;</span>
                    <span className="text-xs font-sans text-[var(--text-muted)]">
                      {currentStage.subtitle}
                    </span>
                  </div>

                  <p className="text-base sm:text-lg text-[var(--text-primary)] leading-relaxed mb-6 font-serif">
                    {currentStage.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold">
                    <Activity size={15} />
                    <span>STRATEGIC IMPACT: {currentStage.impactMetric}</span>
                  </div>
                </div>

                {/* Right Deliverables Pill Box (5 Cols) */}
                <div className="col-span-5 p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-warm)]">
                  <span className="meta-label block mb-3 text-[10px]">
                    KEY DELIVERABLES &amp; ARTIFACTS
                  </span>
                  <div className="space-y-2.5">
                    {currentStage.deliverables.map((d) => (
                      <div key={d} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <CheckCircle2 size={14} className="text-[var(--accent)] shrink-0" />
                        <span className="font-medium">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* --- MOBILE SWIPE CAROUSEL (< 1024px) --- */}
        <div className="lg:hidden">
          <MobileCarousel activeIdx={activeIdx} setActiveIdx={setActiveIdx} />
        </div>

      </div>
    </section>
  );
}
