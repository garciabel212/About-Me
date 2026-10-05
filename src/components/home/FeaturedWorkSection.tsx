import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

interface ProjectPanelData {
  num: string;
  title: string;
  category: string;
  problem: string;
  outcome: string;
  role: string;
  techs: string[];
  image: string;
  alt: string;
  badge: string;
  badgeType: 'active' | 'dev';
  href: string;
}

export default function FeaturedWorkSection({ projectSlug }: { projectSlug?: string }) {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.BASE_URL;

  const projects: ProjectPanelData[] = [
    {
      num: '01',
      title: 'SERVICE MAP PLANNER',
      category: 'Field Service Operations & Asset Intelligence',
      problem:
        'Managing nationwide hardware installations across research universities and public libraries relied on fragmented spreadsheets, causing scheduling conflicts and version drift.',
      outcome:
        'Unified 100+ accounts, scanner inventories, and nationwide routing into an active daily internal tool with proactive compliance flags.',
      role: 'Architecture · Product Design · Frontend Engineering',
      techs: ['Next.js', 'Firebase Firestore', 'TypeScript', 'Google Maps API'],
      image: `${baseUrl}images/service_map_tablet.jpg`,
      alt: 'Service Map Planner operational interface displayed on a field tablet',
      badge: 'Active Internal Tool &middot; Daily Field Use',
      badgeType: 'active',
      href: '/projects/service-map-planner',
    },
    {
      num: '02',
      title: 'SCALE GARAGE STUDIO',
      category: 'Client Product · Interactive 3D Configurator',
      problem:
        'Custom scale diorama builds required tedious manual drafting, repeated back-and-forth sketches, and slow fabrication setup.',
      outcome:
        'Engineered a real-time browser 3D configurator with parametric room geometry, realistic PBR materials, lighting rigs, and direct-to-machine STL export.',
      role: 'Product Design · 3D Frontend Engineering · WebGL',
      techs: ['React', 'Three.js', 'React Three Fiber', 'WebGL', 'STL Generation'],
      image: `${baseUrl}images/hero_garage_diorama.jpg`,
      alt: 'Scale Garage Studio 3D interactive diorama rendering',
      badge: 'In Development &middot; Client Engagement',
      badgeType: 'dev',
      href: '/projects/scale-garage-studio',
    },
  ];

  const handleProjectClick = (href: string) => {
    // Premium View Transition when supported
    if ('startViewTransition' in document && typeof (document as any).startViewTransition === 'function') {
      (document as any).startViewTransition(() => {
        navigate(href);
      });
    } else {
      navigate(href);
    }
  };

  return (
    <section
      id={projectSlug ? 'more-work' : 'work'}
      className="section-py border-t border-[var(--border)] relative scroll-mt-20"
      data-contour-section="work"
    >
      <div className="section-container">
        
        {/* Section Title Header */}
        {!projectSlug && <div className="max-w-3xl mb-14 lg:mb-20">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            <span className="font-mono text-xs font-semibold tracking-widest text-[var(--accent)] uppercase">
              FEATURED ENGINEERING SYSTEMS // PROOF OF WORK
            </span>
          </div>
          <h2 className="text-editorial-title font-serif text-[var(--text-primary)] mb-4">
            Selected Work
          </h2>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
            Real enterprise software, internal operational platforms, and client 3D applications built from requirements to deployment.
          </p>
        </div>}

        {/* Cinematic Panels Stack */}
        <div className="space-y-20 lg:space-y-28">
          {projects.filter(proj => !projectSlug || proj.href.endsWith(projectSlug)).map((proj, idx) => {
            const isReversed = idx % 2 === 1;

            return (
              <motion.div
                key={proj.num}
                initial={reduceMotion ? false : { opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.75, ease: EASE_EXPO }}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center ${
                  isReversed ? 'lg:grid-flow-dense' : ''
                }`}
              >
                {/* ─── TEXT SPECIFICATION COLUMN (5 COLS) ─── */}
                <div className={`lg:col-span-5 flex flex-col items-start text-left ${isReversed ? 'lg:col-start-8' : ''}`}>
                  
                  {/* Number & Category */}
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="font-mono text-xl sm:text-2xl font-black text-[var(--accent)] tracking-wider">
                      {proj.num}
                    </span>
                    <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                      {proj.category}
                    </span>
                  </div>

                  {/* Project Title */}
                  <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight leading-tight mb-6">
                    {proj.title}
                  </h3>

                  {/* Problem & Outcome Statements */}
                  <div className="space-y-4 mb-6 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                    <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-warm-translucent)]">
                      <span className="meta-label block text-[10px] text-[var(--text-muted)] mb-1">
                        THE OPERATIONAL CHALLENGE
                      </span>
                      <p className="text-xs sm:text-sm text-[var(--text-primary)]">
                        {proj.problem}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-warm-translucent)]">
                      <span className="meta-label block text-[10px] text-[var(--accent)] mb-1">
                        DELIVERED OUTCOME &amp; VALUE
                      </span>
                      <p className="text-xs sm:text-sm text-[var(--text-primary)]">
                        {proj.outcome}
                      </p>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="mb-4">
                    <span className="meta-label block mb-1">ENGINEERING ROLE</span>
                    <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                      {proj.role}
                    </span>
                  </div>

                  {/* Technology Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-8">
                    {proj.techs.map((t) => (
                      <span key={t} className="tech-chip text-xs hover:border-[var(--accent)] transition-colors">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Case Study CTA Button */}
                  <button
                    type="button"
                    onClick={() => handleProjectClick(proj.href)}
                    className="btn-primary inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider cursor-pointer shadow-[var(--shadow-blue)] group"
                  >
                    <span>EXPLORE SYSTEM</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                </div>

                {/* ─── CINEMATIC VISUAL PANEL (7 COLS) ─── */}
                <div
                  className={`lg:col-span-7 cursor-pointer group ${
                    isReversed ? 'lg:col-start-1' : ''
                  }`}
                  onClick={() => handleProjectClick(proj.href)}
                >
                  <div className="card p-3 sm:p-4 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-floating)] transition-all duration-500 group-hover:border-[var(--border-strong)] group-hover:shadow-[var(--shadow-high)]">
                    
                    <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                      <img
                        src={proj.image}
                        alt={proj.alt}
                        className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                        loading="lazy"
                      />

                      {/* Moving Specular Sheen on Hover */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 60%)',
                        }}
                        aria-hidden="true"
                      />

                      {/* Status Badge */}
                      <div className="absolute top-4 left-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold shadow-md backdrop-blur-md ${
                            proj.badgeType === 'active'
                              ? 'bg-emerald-950/85 text-emerald-300 border border-emerald-500/30'
                              : 'bg-sky-950/85 text-sky-300 border border-sky-500/30'
                          }`}
                        >
                          {proj.badgeType === 'active' ? (
                            <ShieldCheck size={13} />
                          ) : (
                            <Sparkles size={13} />
                          )}
                          <span dangerouslySetInnerHTML={{ __html: proj.badge }} />
                        </span>
                      </div>

                      {/* Quick Case Study Pill */}
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/75 text-white font-mono text-xs font-semibold backdrop-blur-md">
                          <span>View Detail Case Study</span>
                          <ArrowUpRight size={13} />
                        </span>
                      </div>
                    </div>

                    {/* Bottom Micro-Caption */}
                    <div className="pt-3 px-2 flex items-center justify-between font-mono text-[11px] text-[var(--text-muted)]">
                      <span>Click to open full architectural case study</span>
                      <span className="text-[var(--accent)] font-semibold flex items-center gap-1">
                        <span>Interactive Case Study</span>
                        <ArrowRight size={11} />
                      </span>
                    </div>

                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
