import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Mail, FileDown, GitBranch } from 'lucide-react';

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

export default function HomeContactCta() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="contact"
      className="section-py-xl border-t border-[var(--border)] relative scroll-mt-20 bg-[var(--surface-warm-translucent)]"
      data-contour-section="contact"
    >
      <div className="section-container relative z-10 text-left">
        
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-6">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
            CONVERSION // LET&apos;S TALK
          </span>
          <div className="h-[1px] flex-1 bg-[var(--border)]" />
        </div>

        {/* Editorial Headline */}
        <div className="max-w-4xl mb-12">
          <motion.h2
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE_EXPO }}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] leading-[1.12] mb-5"
          >
            Ready to turn complex technology into intuitive, high-impact solutions.
          </motion.h2>

          <p className="text-base sm:text-xl text-[var(--text-secondary)] font-normal leading-relaxed">
            Open to Solutions Engineer, Sales Engineer, Technical Consultant, and Customer Engineering opportunities.
          </p>
          <p className="mt-2 font-mono text-xs text-[var(--text-muted)] tracking-wide">
            Based in Boca Raton, FL &middot; Open to remote, hybrid, and nationwide-travel roles (up to 40%)
          </p>
        </div>

        {/* Direct Contact Options Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-14">
          
          {/* Email Card */}
          <a
            href="mailto:joseabelgarcia99@gmail.com"
            className="card p-6 sm:p-7 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-low)] hover:border-[var(--accent)] group flex flex-col justify-between transition-all"
          >
            <div>
              <span className="meta-label block mb-2">DIRECT INQUIRY</span>
              <h3 className="font-serif font-bold text-lg text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors mb-2">
                joseabelgarcia99@gmail.com
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Send an email directly for hiring discussions, technical consultations, or enterprise inquiries.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-mono font-semibold text-[var(--accent)] group-hover:translate-x-1 transition-transform">
              <Mail size={14} />
              <span>Send Email Message</span>
              <ArrowUpRight size={13} />
            </div>
          </a>

          {/* LinkedIn Card */}
          <a
            href="https://www.linkedin.com/in/jose-abel-garcia-a5006616b/"
            target="_blank"
            rel="noopener noreferrer"
            className="card p-6 sm:p-7 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-low)] hover:border-[var(--accent)] group flex flex-col justify-between transition-all"
          >
            <div>
              <span className="meta-label block mb-2">PROFESSIONAL PROFILE</span>
              <h3 className="font-serif font-bold text-lg text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors mb-2">
                LinkedIn Network
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Connect on LinkedIn to review verified customer recommendations, credentials, and work history.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-mono font-semibold text-[var(--accent)] group-hover:translate-x-1 transition-transform">
              <span>View LinkedIn Profile</span>
              <ArrowUpRight size={14} />
            </div>
          </a>

          {/* Résumé Request Card */}
          <a
            href="mailto:joseabelgarcia99@gmail.com?subject=R%C3%A9sum%C3%A9%20Request%20-%20Jose%20Garcia&body=Hi%20Jose,%0D%0A%0D%0AI%20would%20like%20to%20request%20a%20copy%20of%20your%20current%20r%C3%A9sum%C3%A9.%0D%0A%0D%0AThanks!"
            title="Request current résumé via email"
            className="card p-6 sm:p-7 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-low)] hover:border-[var(--accent)] group flex flex-col justify-between transition-all"
          >
            <div>
              <span className="meta-label block mb-2">CURRICULUM VITAE</span>
              <h3 className="font-serif font-bold text-lg text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors mb-2">
                Résumé on Request
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Receive an up-to-date PDF detailing project deployment metrics and verified professional references.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-mono font-semibold text-[var(--accent)] group-hover:translate-x-1 transition-transform">
              <FileDown size={14} />
              <span>Request PDF Copy</span>
              <ArrowUpRight size={13} />
            </div>
          </a>

          {/* GitHub Card */}
          <a
            href="https://github.com/garciabel212"
            target="_blank"
            rel="noopener noreferrer"
            className="card p-6 sm:p-7 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-low)] hover:border-[var(--accent)] group flex flex-col justify-between transition-all"
          >
            <div>
              <span className="meta-label block mb-2">OPEN SOURCE &amp; PROJECTS</span>
              <h3 className="font-serif font-bold text-lg text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors mb-2">
                GitHub Profile
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Browse source code for Service Map Planner, Scale Garage Studio, and other personal engineering projects.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-mono font-semibold text-[var(--accent)] group-hover:translate-x-1 transition-transform">
              <GitBranch size={14} />
              <span>View GitHub Repositories</span>
              <ArrowUpRight size={13} />
            </div>
          </a>

        </div>

      </div>
    </section>
  );
}
