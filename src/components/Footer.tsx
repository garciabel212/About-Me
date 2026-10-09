import { Link } from 'react-router-dom';
import { ExternalLink, Mail, ArrowUp } from 'lucide-react';
import { mailto, profile, resumeUrl } from '@/data/profile';
import { homeSectionLinks } from '@/data/navigation';

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

const footerLinks = [...homeSectionLinks, { label: 'RÉSUMÉ PDF', href: resumeUrl }];

const socialLinks = [
  {
    icon: GithubIcon,
    href: 'https://github.com/garciabel212',
    label: 'GitHub',
  },
  {
    icon: ExternalLink,
    href: profile.linkedin,
    label: 'LinkedIn',
  },
  {
    icon: Mail,
    href: mailto,
    label: 'Email',
  },
];

export default function Footer() {
  return (
    <footer className="relative z-[1] border-t border-[var(--border)] bg-[var(--surface-warm)] transition-colors duration-250">
      <div className="section-container py-14 lg:py-18">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-2.5">
            <Link
              to="/"
              className="flex items-baseline gap-2.5"
              aria-label="Home"
            >
              <span className="font-serif font-bold text-2xl text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
                Jose Garcia
              </span>
              <span className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">
                Portfolio
              </span>
            </Link>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm text-center md:text-left leading-relaxed">
              Solutions Engineer &middot; Enterprise Software Solutions
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2.5">
            {footerLinks.map((link) =>
              link.href.startsWith('/') ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="font-mono text-xs font-medium tracking-wider text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-mono text-xs font-medium tracking-wider text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                >
                  {link.label}
                </a>
              ),
            )}
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2.5">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('mailto') ? undefined : '_blank'}
                rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                aria-label={label}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-low)] transition-all"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs text-[var(--text-muted)]">
          <p>
            &copy; {new Date().getFullYear()} Jose Garcia. Designed with precision &amp; craft.
            {' '}The Home flight is AI-generated imagery, not real footage.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors group"
          >
            <span className="uppercase tracking-widest text-[10px]">Back to top</span>
            <span className="w-6 h-6 rounded-full border border-[var(--border)] flex items-center justify-center group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all duration-200">
              <ArrowUp size={11} />
            </span>
          </button>
          <p>
            South Florida &middot; B.S. Computer Science &amp; Engineering, FAU
          </p>
        </div>
      </div>
    </footer>
  );
}
