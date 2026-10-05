import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { projects } from '@/data/projects';
import { ArrowUpRight, Box, Cpu, Printer, Sparkles, Layers } from 'lucide-react';
import { GarageVisual } from '@/components/GarageVisual';

export default function ScaleGarageFeature() {
  const project = projects.find((p) => p.slug === 'scale-garage-studio')!;
  const sectionRef = useRef<HTMLElement>(null);
  const baseUrl = import.meta.env.BASE_URL;
  const [viewMode, setViewMode] = useState<'render' | 'interactive'>('render');

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
      id="scale-garage-studio"
      ref={sectionRef}
      className="relative z-10 bg-[var(--bg)] text-[var(--text-primary)] transition-all duration-700 opacity-0 translate-y-8 py-24 sm:py-32 border-b border-[var(--border)]"
      aria-labelledby="scale-garage-heading"
    >
      <div className="section-container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-8 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
              <span className="font-mono text-xs font-semibold tracking-widest text-cyan-500 uppercase">
                Client Product // Real-Time 3D &amp; Digital Manufacturing
              </span>
            </div>
            <h2 id="scale-garage-heading" className="text-3xl sm:text-5xl font-serif font-bold tracking-tight">
              Scale Garage <span className="italic font-normal text-cyan-600 dark:text-cyan-400">Studio.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm sm:text-base text-[var(--text-secondary)] font-sans leading-relaxed">
            A browser-based 3D configurator built for a custom scale-model garage business, connecting architectural customization, material finishes, and production-ready manufacturing exports.
          </p>
        </div>

        {/* View Mode Switcher Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('render')}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-semibold transition-all ${
                viewMode === 'render'
                  ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] hover:text-[var(--text-primary)]'
              }`}
            >
              Photorealistic 3D Render
            </button>
            <button
              type="button"
              onClick={() => setViewMode('interactive')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono text-xs font-semibold transition-all ${
                viewMode === 'interactive'
                  ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Layers size={13} />
              <span>Interactive 3D Stage</span>
            </button>
          </div>

          <span className="hidden sm:inline font-mono text-xs text-[var(--text-muted)]">
            {viewMode === 'render' ? 'PBR Materials · Dual 5000K Lighting' : 'Real-time WebGL · Explode Assembly'}
          </span>
        </div>

        {/* Featured Visual Panel */}
        <div className="relative rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[var(--shadow-floating)] mb-16 group">
          {viewMode === 'render' ? (
            <div className="relative">
              <picture>
                <source srcSet={`${baseUrl}images/hero_garage_diorama.jpg`} type="image/jpeg" />
                <img
                  src={`${baseUrl}images/hero_garage_diorama.jpg`}
                  alt="Scale Garage Studio interactive 3D model diorama showing concrete architecture and dual LED illumination"
                  width="1440"
                  height="810"
                  className="w-full h-auto object-cover max-h-[640px] transition-transform duration-700 group-hover:scale-[1.01]"
                  loading="lazy"
                />
              </picture>

              {/* Status Overlay Badge */}
              <div className="absolute top-5 left-5 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-sky-950/85 text-sky-300 border border-sky-500/30 shadow-md backdrop-blur-md">
                  <Sparkles size={13} />
                  <span>In Development · Client Engagement</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-black/60 text-slate-200 border border-white/10 backdrop-blur-md">
                  1:18 Scale Baseline
                </span>
              </div>

              {/* Overlay Status Bar */}
              <div className="p-6 sm:p-8 bg-gradient-to-t from-black/90 via-black/60 to-transparent absolute bottom-0 inset-x-0 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-xs tracking-widest uppercase text-cyan-300 mb-1">
                    Parametric Architecture &amp; STL Mesh Generation
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Custom Scale Diorama 3D Configurator
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 text-xs font-mono">
                    {project.statusLabel || 'Client Engagement'}
                  </span>
                  <span className="text-xs font-mono text-white/70">{project.year}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-6 bg-[#080d0d]">
              <GarageVisual />
            </div>
          )}
        </div>

        {/* Grid Content: Problem, Contribution, Solution & CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Context & Action */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold leading-tight">
              Design in browser.<br />
              <span className="italic font-normal text-cyan-600 dark:text-cyan-400">Fabricate on build plate.</span>
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
                to="/projects/scale-garage-studio"
                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold tracking-wide transition-all shadow-md group"
              >
                <span>Read Full 3D Case Study</span>
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
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Box size={20} />
              </div>
              <h4 className="text-sm font-mono uppercase tracking-wider font-semibold text-[var(--text-primary)]">
                The Physical Production Challenge
              </h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Collector dioramas traditionally required manual design consults, bespoke sketches, and tedious drafting before physical fabrication or CNC machining could even begin.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-low)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Cpu size={20} />
              </div>
              <h4 className="text-sm font-mono uppercase tracking-wider font-semibold text-[var(--text-primary)]">
                My Direct Contribution
              </h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {project.role}: Engineered a real-time browser 3D configurator with parametric room geometry, realistic PBR materials, lighting rigs, and direct-to-machine STL export.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-low)] space-y-3 sm:col-span-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Printer size={20} />
              </div>
              <h4 className="text-sm font-mono uppercase tracking-wider font-semibold text-[var(--text-primary)]">
                The Delivered Value &amp; Manufacturing Loop
              </h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Direct parametric geometry generation in browser memory eliminates the error-prone translation layer between customer configuration and Bambu Lab 3D printer build envelope (256mm³).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
