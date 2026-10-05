import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

interface Tech {
  name: string;
  category: string;
  icon: string;
  color: string;
}

const techStack: Tech[] = [
  { name: 'TypeScript', category: 'Language', icon: 'TS', color: '#3178C6' },
  { name: 'JavaScript', category: 'Language', icon: 'JS', color: '#F7DF1E' },
  { name: 'Python', category: 'Language', icon: 'PY', color: '#3572A5' },
  { name: 'SQL', category: 'Language', icon: 'SQL', color: '#00758F' },
  { name: 'React', category: 'Frontend', icon: 'REA', color: '#61DAFB' },
  { name: 'Next.js', category: 'Frontend', icon: 'NXT', color: '#AAAAAA' },
  { name: 'Three.js', category: 'Frontend', icon: '3D', color: '#049EF4' },
  { name: 'Tailwind CSS', category: 'Frontend', icon: 'TW', color: '#38BDF8' },
  { name: 'Firebase', category: 'Backend', icon: 'FB', color: '#FFCA28' },
  { name: 'Node.js', category: 'Backend', icon: 'NODE', color: '#68A063' },
  { name: 'AWS', category: 'Cloud', icon: 'AWS', color: '#FF9900' },
  { name: 'Google Maps', category: 'APIs', icon: 'MAP', color: '#4285F4' },
  { name: 'Git', category: 'Tools', icon: 'GIT', color: '#F05032' },
  { name: 'Figma', category: 'Tools', icon: 'FIG', color: '#A259FF' },
  { name: 'Vite', category: 'Tools', icon: 'VTE', color: '#646CFF' },
  { name: 'WebGL', category: 'Graphics', icon: 'GL', color: '#990000' },
];

const categories = ['All', 'Language', 'Frontend', 'Backend', 'Cloud', 'APIs', 'Tools', 'Graphics'];

function TechChip({ tech, index }: { tech: Tech; index: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: EASE_EXPO, delay: index * 0.04 }}
      whileHover={reduceMotion ? {} : { y: -4, scale: 1.04 }}
      className="group relative flex flex-col items-center gap-2 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-low)] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-medium)] transition-all duration-300 cursor-default"
    >
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 40%, ${tech.color}18 0%, transparent 70%)` }}
        aria-hidden="true"
      />
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center font-mono font-bold text-xs transition-transform duration-300 group-hover:scale-110 relative z-10"
        style={{ background: `${tech.color}18`, border: `1.5px solid ${tech.color}35`, color: tech.color }}
      >
        {tech.icon}
      </div>
      <span className="relative z-10 font-sans text-xs font-semibold text-[var(--text-primary)] text-center leading-tight">
        {tech.name}
      </span>
      <span className="relative z-10 font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
        {tech.category}
      </span>
    </motion.div>
  );
}

export default function TechStackSection() {
  const [activeCategory, setActiveCategory] = useState('All');
  const reduceMotion = useReducedMotion();
  const filtered = activeCategory === 'All' ? techStack : techStack.filter((t) => t.category === activeCategory);

  return (
    <section id="tech-stack" className="section-py border-t border-[var(--border)] relative scroll-mt-20" data-contour-section="quiet">
      <div className="section-container">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div className="max-w-lg">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <span className="font-mono text-xs font-semibold tracking-widest text-[var(--accent)] uppercase">
                TOOLS &amp; TECHNOLOGIES
              </span>
            </div>
            <motion.h2
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE_EXPO }}
              className="font-serif text-3xl sm:text-4xl font-bold text-[var(--text-primary)] leading-[1.12]"
            >
              Technical Toolkit
            </motion.h2>
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE_EXPO, delay: 0.08 }}
              className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed"
            >
              From hardware diagnostics to browser-based 3D — the stack I reach for to ship reliable solutions.
            </motion.p>
          </div>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE_EXPO, delay: 0.1 }}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-low)]"
          >
            <span className="text-[#FF9900] font-bold font-mono text-sm">AWS</span>
            <div className="h-4 w-px bg-[var(--border)]" />
            <div className="flex flex-col">
              <span className="font-mono text-[10px] font-semibold text-[var(--text-primary)] uppercase tracking-wider">Certified</span>
              <span className="font-mono text-[9px] text-[var(--text-muted)]">Cloud Practitioner · 2022</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE_EXPO, delay: 0.12 }}
          className="flex flex-wrap gap-2 mb-8"
          role="tablist"
          aria-label="Filter by category"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full font-mono text-[10px] font-semibold uppercase tracking-wider transition-all duration-200 border ${
                activeCategory === cat
                  ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-[var(--shadow-blue)]'
                  : 'bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
          {filtered.map((tech, i) => (
            <TechChip key={tech.name} tech={tech} index={i} />
          ))}
        </div>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE_EXPO, delay: 0.3 }}
          className="mt-8 font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] text-center"
        >
          Hardware · Optical Systems · Network Infrastructure · Windows Environments · Enterprise Software
        </motion.p>
      </div>
    </section>
  );
}
