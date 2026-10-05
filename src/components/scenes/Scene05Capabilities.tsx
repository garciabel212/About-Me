import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Compass,
  Wrench,
  Network,
  Code2,
  Users,
  Presentation,
  Bot,
  Server,
  GraduationCap,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { SpotlightCard, ShinyText, DecryptedText } from '@/components/bits';

gsap.registerPlugin(ScrollTrigger);

interface Capability {
  id: string;
  name: string;
  category: string;
  icon: typeof Compass;
  color: string;
  realExample: string;
  impactMetric: string;
  technologies: string[];
}

const capabilities: Capability[] = [
  {
    id: 'solutions-eng',
    name: 'Solutions Engineering',
    category: 'PRE-SALES & ARCHITECTURE',
    icon: Presentation,
    color: '#3B82F6',
    realExample:
      'Partnered with sales executives to lead technical discovery, environment assessments, and customized workflow demos for research libraries (Harvard, Stanford, etc.), turning technical skepticism into closed deals.',
    impactMetric: '100% technical demo validation rate',
    technologies: ['Discovery Audits', 'Solution Design', 'Executive Demos', 'RFP Technical Scoring'],
  },
  {
    id: 'implementation',
    name: 'Implementation',
    category: 'SYSTEMS DEPLOYMENT',
    icon: Wrench,
    color: '#10B981',
    realExample:
      'Traveled nationwide to execute end-to-end onsite and remote deployments of high-resolution optical scanners, Windows OS environments, optical calibration, and production sign-off.',
    impactMetric: '100+ nationwide accounts deployed',
    technologies: ['Onsite Delivery', 'Hardware Integration', 'OS Provisioning', 'Optical Alignment'],
  },
  {
    id: 'networking',
    name: 'Networking',
    category: 'INFRASTRUCTURE & PROTOCOLS',
    icon: Network,
    color: '#06B6D4',
    realExample:
      'Monitored multinational subsea fiber routes at GlobeNet NOC maintaining 99.999% SLA; configured secure institutional VLANs, proxy routes, and static IP pools for scanning appliances.',
    impactMetric: '99.999% SLA uptime experience',
    technologies: ['TCP/IP', 'VLANs', 'Subsea Fiber Optics', 'DWDM Telemetry', 'Firewall Rules'],
  },
  {
    id: 'software',
    name: 'Software Development',
    category: 'FULL-STACK ENGINEERING',
    icon: Code2,
    color: '#8B5CF6',
    realExample:
      'Identified operational bottlenecks in field travel and designed/built Service Map Planner from scratch using Next.js, TypeScript, and Firebase—now used daily across operations.',
    impactMetric: 'Production tool deployed to operations',
    technologies: ['React', 'Next.js', 'TypeScript', 'Firebase', 'Three.js', 'REST APIs'],
  },
  {
    id: 'customer-exp',
    name: 'Customer Experience',
    category: 'ACCOUNT PARTNERSHIP',
    icon: Users,
    color: '#EC4899',
    realExample:
      'Maintained sustained relationships with library directors, IT administrators, and operational staff, establishing trust through transparent communication and reliable follow-through.',
    impactMetric: 'Sustained client retention across accounts',
    technologies: ['Technical Account Management', 'Expectation Alignment', 'Post-Sale Trust'],
  },
  {
    id: 'tech-sales',
    name: 'Technical Sales',
    category: 'COMMERCIAL ALIGNMENT',
    icon: Compass,
    color: '#F59E0B',
    realExample:
      'Bridged the commercial and technical conversations, demonstrating how specialized equipment directly reduces operating overhead and solves high-volume digitizing backlogs.',
    impactMetric: 'Multi-stakeholder consensus building',
    technologies: ['Value Engineering', 'Objection Handling', 'Commercial Alignment'],
  },
  {
    id: 'ai-systems',
    name: 'AI & Multi-Agent Systems',
    category: 'AUTONOMOUS ARCHITECTURES',
    icon: Bot,
    color: '#6366F1',
    realExample:
      'Architected multi-agent graph flows with strict simulation safety boundaries, tool calling, and deterministic audit traces (Agent Trading OS).',
    impactMetric: 'Verifiable multi-step agent reasoning',
    technologies: ['Autonomous Agents', 'Tool Calling', 'Decision Traces', 'Simulation Sandboxes'],
  },
  {
    id: 'systems',
    name: 'Systems Administration',
    category: 'OS & HARDWARE INTEGRATION',
    icon: Server,
    color: '#14B8A6',
    realExample:
      'Administered specialized Windows enterprise workstations, created custom provisioning scripts, managed remote diagnostics via TeamViewer/AnyDesk, and handled driver/firmware upgrades.',
    impactMetric: 'Zero downtime cutovers',
    technologies: ['Windows 10/11 Enterprise', 'Driver Integration', 'Firmware Updates', 'Remote Management'],
  },
  {
    id: 'training',
    name: 'Training & Enablement',
    category: 'CUSTOMER ADOPTION',
    icon: GraduationCap,
    color: '#EAB308',
    realExample:
      'Conducted onsite workshops for IT staff and patrons, authored comprehensive operational runbooks, and ensured clients were fully autonomous post-deployment.',
    impactMetric: 'High customer autonomy & low ticket rates',
    technologies: ['Technical Runbooks', 'Admin Certification', 'Workflow Training'],
  },
  {
    id: 'troubleshooting',
    name: 'Root-Cause Troubleshooting',
    category: 'CRITICAL DIAGNOSTICS',
    icon: AlertCircle,
    color: '#EF4444',
    realExample:
      'Diagnosed complex optical, mechanical, and network faults under high-pressure customer environments, performing root-cause isolation rather than applying temporary surface fixes.',
    impactMetric: 'First-time fix rate > 95%',
    technologies: ['Sensor Calibration', 'Optical Triage', 'Log Analysis', 'Firmware Recovery'],
  },
];

export default function Scene05Capabilities() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedCapId, setSelectedCapId] = useState<string>('solutions-eng');

  const selectedCap = capabilities.find((c) => c.id === selectedCapId) || capabilities[0];
  const CapIcon = selectedCap.icon;

  return (
    <section
      ref={containerRef}
      id="capabilities"
      className="relative z-10 py-28 sm:py-36 bg-[var(--bg)] text-[var(--text-primary)] border-t border-[var(--border)]"
      aria-label="Scene 05: Interactive Capabilities System"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        {/* Section Header */}
        <div className="mb-16 sm:mb-20 border-b border-[var(--border)] pb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
            <span className="font-mono text-xs font-semibold tracking-widest text-[var(--accent)] uppercase">
              SCENE 05 // CONNECTED CAPABILITIES CONSTELLATION
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-[var(--text-primary)]">
                A connected system of{' '}
                <span className="italic font-normal text-[var(--accent)]">disciplines.</span>
              </h2>
            </div>
            <p className="max-w-md text-sm sm:text-base text-[var(--text-secondary)] font-sans leading-relaxed">
              No single skill operates in isolation. Interact with any node in the constellation to examine real-world examples from my career showing how these capabilities reinforce one another.
            </p>
          </div>
        </div>

        {/* ─── Interactive Constellation & Detail Board ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Left Column: Interactive Capability Nodes (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            {/* Center Anchor Card */}
            <div className="p-6 rounded-2xl border-2 border-[var(--accent)] bg-[var(--surface-elevated)] shadow-[var(--shadow-blue)] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center font-serif font-black text-xl shadow-md">
                  JG
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold text-[var(--accent)] tracking-widest uppercase block">
                    CENTRAL INTEGRATOR
                  </span>
                  <div className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                    JOSE GARCIA
                  </div>
                  <div className="text-xs font-mono text-[var(--text-muted)]">
                    Solutions Engineer &middot; Technical Consultant
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-ping" />
                <span>10 Connected Nodes</span>
              </div>
            </div>

            {/* Orbiting Capability Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {capabilities.map((cap) => {
                const isSelected = cap.id === selectedCapId;
                const Icon = cap.icon;

                return (
                  <button
                    key={cap.id}
                    type="button"
                    onClick={() => setSelectedCapId(cap.id)}
                    onMouseEnter={() => setSelectedCapId(cap.id)}
                    className={`p-4 rounded-xl text-left border transition-all duration-300 cursor-pointer flex flex-col justify-between h-28 ${
                      isSelected
                        ? 'border-[var(--accent)] bg-[var(--surface)] shadow-[var(--shadow-medium)] ring-2 ring-[var(--accent)]/30 scale-[1.02]'
                        : 'border-[var(--border)] bg-[var(--surface-warm)] hover:bg-[var(--surface)] hover:border-[var(--border-strong)] opacity-80 hover:opacity-100'
                    }`}
                    aria-label={`Inspect capability: ${cap.name}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{
                          background: isSelected ? `${cap.color}25` : 'transparent',
                          color: cap.color,
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <span
                        className="w-2 h-2 rounded-full transition-transform"
                        style={{ background: cap.color, transform: isSelected ? 'scale(1.3)' : 'scale(1)' }}
                      />
                    </div>

                    <div>
                      <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider line-clamp-1">
                        {cap.category}
                      </div>
                      <div className="font-serif font-bold text-xs sm:text-sm text-[var(--text-primary)] line-clamp-1 mt-0.5">
                        {cap.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Real-World Case Story Card (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <SpotlightCard
              className="p-8 sm:p-10 flex-1 flex flex-col justify-between border-[var(--border)] shadow-[var(--shadow-floating)] bg-[var(--surface)]"
              spotlightColor="rgba(59, 130, 246, 0.16)"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 uppercase tracking-wider">
                    {selectedCap.category}
                  </span>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${selectedCap.color}20`, color: selectedCap.color }}
                  >
                    <CapIcon size={20} />
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text-primary)] mb-4">
                  {selectedCap.name}
                </h3>

                <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-warm)] mb-6">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-2">
                    REAL-WORLD CAREER EVIDENCE
                  </span>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
                    {selectedCap.realExample}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
                <div>
                  <span className="font-mono text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-2">
                    ASSOCIATED COMPETENCIES
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCap.technologies.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-md text-[11px] font-mono border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)] text-xs font-mono">
                  <span className="text-[var(--text-muted)]">MEASURED OUTCOME:</span>
                  <span className="font-bold text-[var(--accent)]">
                    <DecryptedText text={selectedCap.impactMetric} speed={35} maxIterations={8} />
                  </span>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </section>
  );
}
