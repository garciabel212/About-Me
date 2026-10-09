import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Box,
  RotateCcw,
  Palette,
  Printer,
  DollarSign,
  Eye,
  Layers,
  Columns,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import TechStack from '@/components/TechStack';
import ArchitectureDiagram from '@/components/ArchitectureDiagram';
import CTA from '@/components/CTA';
import { GarageVisual } from '@/components/GarageVisual';
import { projects } from '@/data/projects';

const project = projects.find((item) => item.slug === 'scale-garage-studio');

const techStack = [
  { name: 'React', category: 'frontend' as const },
  { name: 'TypeScript', category: 'frontend' as const },
  { name: 'Three.js', category: 'frontend' as const },
  { name: 'React Three Fiber', category: 'frontend' as const },
  { name: '@react-three/drei', category: 'frontend' as const },
  { name: 'WebGL', category: 'frontend' as const },
  { name: 'Vite', category: 'frontend' as const },
  { name: 'Parametric Geometry', category: 'default' as const },
  { name: 'STL Export', category: 'default' as const },
];

const architectureNodes = [
  { label: 'Configurator UI', sublabel: 'React + Tailwind controls', accent: true },
  { label: 'Scene State', sublabel: 'Reactive parameter store' },
  { label: 'React Three Fiber / WebGL', sublabel: 'Real-time 3D scene rendering' },
  { label: 'Parametric Geometry', sublabel: 'Procedural mesh generation' },
  { label: 'Printability Validation', sublabel: 'Bambu Lab P2S build constraints' },
  { label: 'STL & Production Prep', sublabel: 'Direct manufacturing export', accent: true },
];

const supportedScales = [
  { scale: '1:18', desc: 'Primary focus — detailed 1:18 dioramas and garages', active: true },
  { scale: '1:24', desc: 'Classic display scale for die-cast collections', active: false },
  { scale: '1:43', desc: 'Compact European collector scale', active: false },
  { scale: '1:64', desc: 'Hot Wheels and Matchbox scale', active: false },
];

const capabilities = [
  {
    icon: Box,
    color: '#06B6D4',
    title: 'Interactive 3D Viewport',
    desc: 'Interactive 3D viewport with orbit, pan, and zoom controls for spatial inspection.',
  },
  {
    icon: Eye,
    color: '#3B82F6',
    title: 'Multi-Angle Camera Views',
    desc: 'Perspective, front, side, and overhead camera views to inspect proportions accurately.',
  },
  {
    icon: Palette,
    color: '#8B5CF6',
    title: 'Real-Time Customization',
    desc: 'Real-time customization of dimensions, materials, and colors updating live in WebGL.',
  },
  {
    icon: Layers,
    color: '#EC4899',
    title: 'Architectural Finishes',
    desc: 'Wall finish options, floor pattern configurations, and varied ceiling styles.',
  },
  {
    icon: Columns,
    color: '#6366F1',
    title: 'Structural Element Placement',
    desc: 'Pillar designs and structural element placement adapting procedurally to dimensions.',
  },
  {
    icon: RotateCcw,
    color: '#14B8A6',
    title: 'Parametric Geometry Engine',
    desc: 'Parametric geometry engine that adapts meshes dynamically without manual CAD modeling.',
  },
  {
    icon: ShieldCheck,
    color: '#10B981',
    title: 'Build Constraint Validation',
    desc: 'Bambu Lab P2S build volume constraint validation (256×256×256 mm) prior to export.',
  },
  {
    icon: Printer,
    color: '#F59E0B',
    title: 'Print-Ready STL Export',
    desc: 'Print-ready STL geometry export directly from browser memory for 3D printing.',
  },
  {
    icon: Sliders,
    color: '#06B6D4',
    title: 'Multi-Scale Architecture',
    desc: 'Multi-scale architecture with 1:18 as primary baseline; 1:24, 1:43, and 1:64 planned.',
  },
  {
    icon: DollarSign,
    color: '#EF4444',
    title: 'Production Cost Estimation',
    desc: 'Planned: real-time material volume and production cost estimation as the design changes.',
  },
];

export default function ScaleGarageStudio() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="pt-20">
      {/* Hero */}
      <section
        className="relative overflow-hidden py-20 lg:py-28"
        style={{ background: 'linear-gradient(135deg, #020D08 0%, #071812 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, #94A3B8 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div
          className="hero-orb w-[600px] h-[600px] -top-32 -right-32 opacity-10"
          style={{ background: 'radial-gradient(circle, #06B6D4 0%, transparent 70%)' }}
        />

        <div className="section-container relative z-10">
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Link to="/projects" className="btn-ghost text-sm mb-8 inline-flex">
              <ArrowLeft size={15} /> Back to Projects
            </Link>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="tag-cyan font-mono text-xs uppercase tracking-wider">
                CLIENT PRODUCT · IN DEVELOPMENT
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Active Client Project
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-3 leading-tight">
              Scale Garage Studio
            </h1>
            <p className="text-xl font-medium mb-6" style={{ color: '#22D3EE' }}>
              Browser-Based 3D Configurator &amp; Manufacturing Tool
            </p>
            <p className="text-lg text-slate-300 leading-relaxed max-w-3xl mb-8">
              A browser-based 3D configurator for custom scale-model garages and dioramas. Customers
              design their miniature garage visually before manufacturing — customizing dimensions,
              materials, wall finishes, floor patterns, ceiling configurations, and architectural
              features with real-time 3D preview, then exporting STL files for 3D printing production.
            </p>

            <div className="flex flex-wrap gap-8 text-sm">
              <div>
                <span className="text-slate-500 block text-xs tracking-widest uppercase mb-1">Role</span>
                <span className="text-white font-medium">Product Designer &amp; Frontend Engineer</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs tracking-widest uppercase mb-1">Status</span>
                <span className="text-amber-300 font-medium">In Development (Client Product)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs tracking-widest uppercase mb-1">Primary Scale</span>
                <span className="text-white font-medium">1:18 (1:24 · 1:43 · 1:64 planned)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs tracking-widest uppercase mb-1">Target Production</span>
                <span className="text-white font-medium">Bambu Lab P2S (256 × 256 × 256 mm build volume)</span>
              </div>
            </div>
          </motion.div>

          {/* Interactive 3D Configurator */}
          <div className="mt-12 max-w-5xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-xs text-accent-cyan uppercase tracking-[0.25em]">
                Interactive Configurator Prototype
              </span>
              <span className="font-mono text-xs text-slate-400">
                REAL-TIME THREE.JS / WEBGL VIEWPORT
              </span>
            </div>
            <GarageVisual />
          </div>
        </div>
      </section>

      {/* Editorial Statement */}
      <section className="py-14 bg-navy-950 border-y border-white/[0.06] text-center">
        <div className="section-container">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">
            The Fabrication Philosophy
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan via-white to-accent-blue-light tracking-tight">
            DESIGN IT. SEE IT. BUILD IT.
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Direct parametric geometry generation in browser memory with build-volume validation for Bambu Lab 3D printing.
          </p>
        </div>
      </section>

      {/* Product Concept & The Problem Worth Solving */}
      <section className="section-py bg-navy-800/40">
        <div className="section-container">
          <div className="max-w-3xl">
            <SectionHeader eyebrow="The Concept" title="The Problem Worth Solving" className="mb-8" />
            <div className="space-y-4 text-slate-300 text-base leading-relaxed">
              <p>
                Scale-model collectors — particularly 1:18 die-cast car enthusiasts — want custom display
                environments that match their collection's theme. Custom miniature garages and dioramas
                are desirable, but ordering one traditionally means describing a vision in a text order form
                and hoping the manufacturer interprets it correctly.
              </p>
              <p>
                Scale Garage Studio removes that ambiguity. Instead of describing what you want, you configure
                it visually in 3D — selecting exact dimensions, wall finishes, floor patterns, ceiling styles,
                pillar designs, and lighting configurations. What you see is what gets manufactured.
              </p>
              <p>
                On the production side, the same parametric model that powers the configurator generates
                the STL geometry for manufacturing — eliminating the translation layer between customer
                design and production files entirely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Scales */}
      <section className="section-py">
        <div className="section-container">
          <SectionHeader eyebrow="Product Scope" title="Supported Scales" className="mb-10" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl">
            {supportedScales.map((s) => (
              <div
                key={s.scale}
                className={`card p-5 text-center ${s.active ? 'border-accent-cyan/30 bg-accent-cyan/5' : 'opacity-60'}`}
              >
                <p className={`text-2xl font-black mb-2 ${s.active ? 'text-accent-cyan-light' : 'text-slate-500'}`}>
                  {s.scale}
                </p>
                <p className="text-xs text-slate-500">{s.desc}</p>
                {s.active && (
                  <span className="inline-block mt-2 text-xs text-emerald-400 font-medium">Primary Focus</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="section-py bg-navy-800/40">
        <div className="section-container">
          <SectionHeader eyebrow="Technology" title="The Tech Stack" className="mb-8" />
          <TechStack technologies={techStack} size="md" />
        </div>
      </section>

      {/* Architecture */}
      <section className="section-py">
        <div className="section-container">
          <SectionHeader
            eyebrow="Architecture"
            title="From customer idea to manufacturable design"
            description="How the application translates interactive browser controls directly into validated manufacturing files."
            className="mb-10"
          />
          <div className="max-w-md">
            <ArchitectureDiagram
              title="Configurator &amp; Manufacturing Pipeline"
              nodes={architectureNodes}
            />
          </div>
        </div>
      </section>

      {/* 10 Capabilities */}
      <section className="section-py bg-navy-800/40">
        <div className="section-container">
          <SectionHeader
            eyebrow="Features"
            title="Product Capabilities"
            description="Ten core functional capabilities built into the 3D configurator and production pipeline."
            className="mb-12"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className="card p-6"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ background: `${f.color}15`, border: `1px solid ${f.color}25` }}
                  >
                    <Icon size={18} style={{ color: f.color }} />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Manufacturing angle */}
      <section className="section-py">
        <div className="section-container max-w-3xl">
          <SectionHeader eyebrow="Manufacturing" title="From Browser to Build Plate" className="mb-8" />
          <div className="space-y-4 text-slate-300 text-base leading-relaxed">
            <p>
              The most technically interesting aspect of this project is the manufacturing pipeline.
              The same parametric geometry that renders in the browser is the geometry that gets exported
              as an STL file — there's no separate CAD process for production.
            </p>
            <p>
              The system validates configurations against the Bambu Lab P2S's build volume before export,
              catching configurations that would require splitting or reprinting. This closes the loop
              between customer customization and physical production.
            </p>
          </div>
        </div>
      </section>

      {/* Development & Milestone Status (replaces empty screenshot placeholders) */}
      <section className="section-py bg-navy-800/40">
        <div className="section-container max-w-4xl">
          <SectionHeader
            eyebrow="Development Status"
            title="Current Milestone &amp; Engineering Progress"
            description="Scale Garage Studio is an active client engagement currently in development, not a finished SaaS product."
            className="mb-8"
          />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6 border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center gap-2 mb-4 text-emerald-400 font-semibold text-sm">
                <CheckCircle2 size={16} /> Operational in Current Build
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                  <span>Interactive 3D configurator core with orbit, pan, and zoom</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                  <span>Parametric geometry mesh generation for walls, floors, and pillars</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                  <span>Real-time color, material finish, and camera perspective switching</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                  <span>Bambu Lab P2S (256 × 256 × 256 mm) build volume constraint verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                  <span>Direct browser-memory STL geometry export pipeline</span>
                </li>
              </ul>
            </div>

            <div className="card p-6 border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center gap-2 mb-4 text-amber-400 font-semibold text-sm">
                <Clock size={16} /> In Active Development
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5 font-bold">→</span>
                  <span>Multi-part interlocking assembly splits for larger garage dioramas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5 font-bold">→</span>
                  <span>Customer design save/load session state persistence</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5 font-bold">→</span>
                  <span>Automated material cost and 3D print time estimation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5 font-bold">→</span>
                  <span>Full customer ordering and quote checkout flow</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5 font-bold">→</span>
                  <span>Expansion from 1:18 to 1:24, 1:43, and 1:64 scale presets</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Future Roadmap */}
      <section className="section-py">
        <div className="section-container max-w-3xl">
          <SectionHeader eyebrow="Roadmap" title="Next Engineering Releases" className="mb-8" />
          <ul className="space-y-3">
            {[
              'Complete 1:18 garage configurator with modular wall and ceiling light systems',
              'Customer ordering workflow — design → parametric validation → quote → order',
              'Material cost estimation integrated directly into the configurator telemetry',
              'Lighting configuration with real-time lumen preview in 3D WebGL viewport',
              'Graffiti and decal placement panel with projected texture mapping',
              'Expand to 1:24 and 1:64 scale configurations',
              'Customer design save/load and collaborative sharing links',
            ].map((item) => (
              <li key={item} className="flex gap-3 text-slate-400 text-sm">
                <span className="text-accent-cyan flex-shrink-0 mt-0.5">›</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTA
        title="Interested in the 3D configurator or manufacturing pipeline?"
        description="Happy to discuss parametric geometry generation, WebGL rendering architecture, or physical manufacturing integration."
      />
    </main>
  );
}

