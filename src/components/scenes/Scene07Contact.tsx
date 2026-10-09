import { Mail, ArrowUpRight, FileDown, FolderGit2, Briefcase, MapPin } from 'lucide-react';
import { useLenis } from '@/components/motion/SmoothScroll';
import { mailto, profile } from '@/data/profile';

function LinkedInIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export default function Scene07Contact() {
  const lenis = useLenis();
  const baseUrl = import.meta.env.BASE_URL;

  const scrollTo = (hash: string) => {
    if (lenis) {
      lenis.scrollTo(hash, { offset: -64 });
    } else {
      const el = document.querySelector(hash);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="contact"
      className="relative z-10 py-24 sm:py-32 bg-[var(--bg)] text-[var(--text-primary)] border-t border-[var(--border)]"
      aria-label="Final Scene: Professional Contact and Actions"
    >
      <div className="max-w-5xl mx-auto px-6 sm:px-12">
        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
          <span className="font-mono text-xs font-semibold tracking-widest text-[var(--accent)] uppercase">
            FINAL SCENE // PROFESSIONAL CONTACT &middot; GET IN TOUCH
          </span>
        </div>

        {/* Identity & Status */}
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-6 mb-12 pb-8 border-b border-[var(--border)]">
          <div>
            <h2 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
              Jose Garcia
            </h2>
            <p className="font-mono text-base sm:text-lg text-[var(--accent)] font-semibold">
              {profile.title} &middot; {profile.focus}
            </p>
            <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)] mt-1">
              <MapPin size={13} className="text-[var(--accent)]" />
              <span>Boca Raton, South Florida &middot; Open to Remote, Hybrid, &amp; National Travel</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Open to Opportunities</span>
          </div>
        </div>

        {/* Primary Five Professional Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {/* Action 1: View Experience */}
          <button
            type="button"
            onClick={() => scrollTo('#experience')}
            className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:shadow-[var(--shadow-low)] transition-all flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                <Briefcase size={18} />
              </div>
              <div>
                <span className="font-serif font-bold text-sm sm:text-base text-[var(--text-primary)] block group-hover:text-[var(--accent)] transition-colors">
                  View Experience
                </span>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  Career Chronology &amp; Roles
                </span>
              </div>
            </div>
            <ArrowUpRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          {/* Action 2: View Projects */}
          <button
            type="button"
            onClick={() => scrollTo('#projects')}
            className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:shadow-[var(--shadow-low)] transition-all flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                <FolderGit2 size={18} />
              </div>
              <div>
                <span className="font-serif font-bold text-sm sm:text-base text-[var(--text-primary)] block group-hover:text-[var(--accent)] transition-colors">
                  View Projects
                </span>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  Case Study Exhibits
                </span>
              </div>
            </div>
            <ArrowUpRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          {/* Action 3: Download Resume */}
          <a
            href={`${baseUrl}Jose-Garcia-Resume.pdf`}
            download="Jose-Garcia-Resume.pdf"
            className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:shadow-[var(--shadow-low)] transition-all flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                <FileDown size={18} />
              </div>
              <div>
                <span className="font-serif font-bold text-sm sm:text-base text-[var(--text-primary)] block group-hover:text-[var(--accent)] transition-colors">
                  Download Résumé
                </span>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  PDF Portfolio Overview
                </span>
              </div>
            </div>
            <ArrowUpRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>

          {/* Action 4: LinkedIn */}
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:shadow-[var(--shadow-low)] transition-all flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                <LinkedInIcon size={18} />
              </div>
              <div>
                <span className="font-serif font-bold text-sm sm:text-base text-[var(--text-primary)] block group-hover:text-[var(--accent)] transition-colors">
                  LinkedIn Network
                </span>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  Connect &amp; Recommendations
                </span>
              </div>
            </div>
            <ArrowUpRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>

          {/* Action 5: Contact Email */}
          <a
            href={mailto}
            className="p-5 rounded-xl border border-[var(--accent)] bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-all flex items-center justify-between text-left cursor-pointer group shadow-[var(--shadow-blue)] sm:col-span-2 lg:col-span-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/20 text-white flex items-center justify-center">
                <Mail size={18} />
              </div>
              <div>
                <span className="font-serif font-bold text-sm sm:text-base block">
                  Get in Touch &middot; {profile.email}
                </span>
                <span className="text-[11px] font-mono text-white/80">
                  Direct inquiry for hiring, technical consulting, and partnerships
                </span>
              </div>
            </div>
            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* Footer Note */}
        <div className="pt-8 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--text-muted)]">
          <span>&copy; {new Date().getFullYear()} Jose Garcia &middot; South Florida</span>
          <span>B.S. Computer Science &amp; Engineering &middot; AWS Cloud Practitioner</span>
        </div>
      </div>
    </section>
  );
}
