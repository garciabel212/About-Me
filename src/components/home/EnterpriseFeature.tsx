import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { projects } from '@/data/projects';
import { ArrowUpRight, ShieldCheck, Server, Users, Award, CheckCircle2, Laptop } from 'lucide-react';

export default function EnterpriseFeature() {
  const project = projects.find((p) => p.slug === 'enterprise-deployment')!;
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const stages = [
    { num: '01', title: 'Technical Discovery', desc: 'Environment assessment, network topology review, and security requirements.' },
    { num: '02', title: 'Solution Design', desc: 'Hardware & OS configuration plans, driver compatibility, and rollout timelines.' },
    { num: '03', title: 'Technical Demonstration', desc: 'Hands-on workflow validation and Q&A with institutional stakeholders.' },
    { num: '04', title: 'Deployment & Calibration', desc: 'Onsite optical scanner installation, sensor alignment, and network integration.' },
    { num: '05', title: 'Administrator Training', desc: 'Custom documentation, operational runbooks, and staff onboarding.' },
    { num: '06', title: 'Long-Term Support', desc: 'Root-cause diagnostic analysis, proactive firmware updates, and escalations.' },
  ];

  return (
    <section
      id="enterprise-deployment"
      ref={sectionRef}
      className="relative z-10 bg-[var(--bg)] text-[var(--text-primary)] transition-all duration-700 opacity-0 translate-y-8 py-24 sm:py-32 border-b border-[var(--border)]"
      aria-labelledby="enterprise-heading"
    >
      <div className="section-container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-8 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
              <span className="font-mono text-xs font-semibold tracking-widest text-violet-500 uppercase">
                Field Engineering &amp; Solutions Delivery // 100+ Accounts
              </span>
            </div>
            <h2 id="enterprise-heading" className="text-3xl sm:text-5xl font-serif font-bold tracking-tight">
              Enterprise Technical <span className="italic font-normal text-violet-600 dark:text-violet-400">Deployment.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm sm:text-base text-[var(--text-secondary)] font-sans leading-relaxed">
            High-resolution optical scanners, Windows systems, network integration, and technical enablement deployed across research universities and public libraries nationwide.
          </p>
        </div>

        {/* Featured Visual Panel: Systems Topology Board */}
        <div className="relative rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[var(--shadow-floating)] mb-16 p-6 sm:p-10">
          <div className="flex flex-col lg:flex-row items-stretch justify-between gap-8">
            {/* Left Hero Metric Block */}
            <div className="lg:w-1/3 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] pb-6 lg:pb-0 lg:pr-8">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-violet-950/80 text-violet-300 border border-violet-500/30 mb-4">
                  <ShieldCheck size={13} />
                  <span>DLSG / Image Access · 2022–Present</span>
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mb-3">
                  100+ Institutional Client Deployments
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  Leading technical customer engagements across Harvard, Stanford, nationwide university libraries, and government research archives.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-[var(--border-subtle)] font-mono text-xs">
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">Scope</span>
                  <span className="font-semibold text-[var(--text-primary)]">Nationwide U.S.</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">Specialty</span>
                  <span className="font-semibold text-[var(--text-primary)]">Hardware &amp; OS</span>
                </div>
              </div>
            </div>

            {/* Right Stages Pipeline Grid */}
            <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {stages.map((stage) => (
                <div
                  key={stage.num}
                  className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] hover:border-violet-500/30 transition-colors flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400">
                      {stage.num}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400/40" />
                  </div>
                  <h4 className="font-sans font-semibold text-xs sm:text-sm text-[var(--text-primary)] mb-1">
                    {stage.title}
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed font-sans">
                    {stage.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grid Content: Problem, Contribution, Solution & CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Context & Action */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold leading-tight">
              Where technical rigor.<br />
              <span className="italic font-normal text-violet-600 dark:text-violet-400">Meets operational trust.</span>
            </h3>
            <p className="text-base text-[var(--text-secondary)] leading-relaxed">
              Deploying high-precision imaging hardware into diverse university network topologies requires more than installation skills. It requires rigorous pre-deployment discovery, custom driver and network configuration, root-cause troubleshooting under pressure, and empathetic training of library directors and technical staff.
            </p>

            {/* Tech Chips */}
            <div className="pt-2">
              <span className="block font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] mb-3">
                Core Competencies &amp; Systems
              </span>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 rounded-md text-xs font-mono font-medium border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Deep-dive Link Button */}
            <div className="pt-4">
              <Link
                to="/projects/enterprise-deployment"
                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold tracking-wide transition-all shadow-md group"
              >
                <span>Read Full Enterprise Case Study</span>
                <ArrowUpRight
                  size={18}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>
          </div>

          {/* Right Column: Key Pillars */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-low)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <Server size={20} />
              </div>
              <h4 className="text-sm font-mono uppercase tracking-wider font-semibold text-[var(--text-primary)]">
                The Institutional Challenge
              </h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Heterogeneous campus networks, strict security firewalls, and legacy scanning workflows made modern hardware onboarding vulnerable to integration delays and user friction.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-low)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Laptop size={20} />
              </div>
              <h4 className="text-sm font-mono uppercase tracking-wider font-semibold text-[var(--text-primary)]">
                My Direct Contribution
              </h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {project.role}: Led end-to-end technical discovery, tailored stakeholder demonstrations, onsite and remote installations, optical calibration, network integration, and hands-on administrator enablement.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-low)] space-y-3 sm:col-span-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
              <h4 className="text-sm font-mono uppercase tracking-wider font-semibold text-[var(--text-primary)]">
                The Delivered Value &amp; Client Retention
              </h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Sustained 100+ active institutional accounts with zero-disruption cutovers, proactive preventive maintenance, and high end-user adoption across staff and patrons.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
