import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { projects } from '@/data/projects';
import { ArrowUpRight, Database, MapPin, Wrench, ShieldCheck } from 'lucide-react';

export default function ServiceMapFeature() {
  const project = projects.find((p) => p.slug === 'service-map-planner')!;
  const sectionRef = useRef<HTMLElement>(null);
  const baseUrl = import.meta.env.BASE_URL;

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

  return (
    <section
      id="work"
      ref={sectionRef}
      className="relative z-10 bg-[var(--bg)] text-[var(--text-primary)] transition-all duration-700 opacity-0 translate-y-8 py-24 sm:py-32 border-b border-[var(--border)] scroll-mt-16"
      aria-labelledby="service-map-heading"
    >
      <div className="section-container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-8 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="font-mono text-xs font-semibold tracking-widest text-blue-500 uppercase">
                Signature Internal Tool // Daily Field Operations
              </span>
            </div>
            <h2 id="service-map-heading" className="text-3xl sm:text-5xl font-serif font-bold tracking-tight">
              Service Map <span className="italic font-normal text-blue-600 dark:text-blue-400">Planner.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm sm:text-base text-[var(--text-secondary)] font-sans leading-relaxed">
            An operations platform designed to connect customer equipment, nationwide service routing, maintenance
            records, and field logistics into one interface.
          </p>
        </div>

        {/* Featured Visual Panel */}
        <div className="relative rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[var(--shadow-floating)] mb-16 group">
          <picture>
            <source srcSet={`${baseUrl}images/service_map_tablet.jpg`} type="image/jpeg" />
            <img
              src={`${baseUrl}images/service_map_tablet.jpg`}
              alt="Service Map Planner operations tablet interface showing institutional map view and customer site metrics"
              width="1440"
              height="810"
              className="w-full h-auto object-cover max-h-[680px] transition-transform duration-700 group-hover:scale-[1.01]"
              loading="lazy"
            />
          </picture>

          {/* Overlay Status Bar */}
          <div className="p-6 sm:p-8 bg-gradient-to-t from-black/90 via-black/60 to-transparent absolute bottom-0 inset-x-0 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs tracking-widest uppercase text-blue-300 mb-1">
                Institutional Hardware &amp; Account Intelligence
              </p>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                Unified Field Service Command Center
              </h3>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-mono">
                {project.statusLabel || 'Active Internal Tool'}
              </span>
              <span className="text-xs font-mono text-white/70">{project.year}</span>
            </div>
          </div>
        </div>

        {/* Grid Content: Problem, Contribution, Solution & CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Context & Action */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold leading-tight">
              Less fragmentation.<br />
              <span className="italic font-normal text-[var(--accent)]">More operational clarity.</span>
            </h3>
            <p className="text-base text-[var(--text-secondary)] leading-relaxed">
              {project.description}
            </p>

            {/* Tech Chips */}
            <div className="pt-2">
              <span className="block font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] mb-3">
                Core Technologies
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
                to="/projects/service-map-planner"
                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold tracking-wide hover:bg-[var(--accent-hover)] transition-all shadow-[var(--shadow-blue)] group"
              >
                <span>Read Full Technical Case Study</span>
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
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Wrench size={20} />
              </div>
              <h4 className="text-sm font-mono uppercase tracking-wider font-semibold text-[var(--text-primary)]">
                The Operational Problem
              </h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Nationwide hardware installations across universities and libraries relied on disconnected
                spreadsheets, leading to scheduling friction and outdated hardware records.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-low)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Database size={20} />
              </div>
              <h4 className="text-sm font-mono uppercase tracking-wider font-semibold text-[var(--text-primary)]">
                My Direct Contribution
              </h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {project.role}: Researched technician workflow patterns, designed high-density map layouts, and built
                the full-stack application using Next.js, TypeScript, and Firebase.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-low)] space-y-3 sm:col-span-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h4 className="text-sm font-mono uppercase tracking-wider font-semibold text-[var(--text-primary)]">
                The Outcome &amp; Measured Value
              </h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Replaced manual coordination with a unified registry of 100+ accounts, scanner inventories, and
                software versions, integrated with geographic travel routing and automated preventive maintenance flags.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
