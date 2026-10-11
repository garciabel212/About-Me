import { Link } from 'react-router-dom';
import { ExternalLink, Mail, FileDown } from 'lucide-react';
import { mailto, profile, resumeUrl } from '@/data/profile';
import { homeSectionLinks } from '@/data/navigation';
import { site } from '@/data/content';

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

const contactLinks = [
  { Icon: Mail, href: mailto, label: 'Email' },
  { Icon: ExternalLink, href: profile.linkedin, label: 'LinkedIn' },
  { Icon: GithubIcon, href: profile.github, label: 'GitHub' },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Link to="/#overview" className="site-brand">Jose Garcia</Link>
          <p>{site.headline}</p>
        </div>

        <nav aria-label="Footer">
          <ul className="site-footer__links">
            {homeSectionLinks.map((l) => (
              <li key={l.id}><Link to={l.href}>{l.label}</Link></li>
            ))}
            <li>
              {/* A plain link: a router <Link> would open an empty app route instead of the PDF. */}
              <a href={resumeUrl} download={profile.resumeFile}>
                <FileDown size={14} aria-hidden="true" /> Résumé (PDF)
              </a>
            </li>
          </ul>
        </nav>

        <ul className="site-footer__social">
          {contactLinks.map(({ Icon, href, label }) => (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith('mailto') ? undefined : '_blank'}
                rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
              >
                <Icon size={15} />
                <span>{label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="site-footer__note">
        &copy; {new Date().getFullYear()} Jose Garcia &middot; South Florida.
        {' '}The Cinematic mode’s Miami flight is AI-generated imagery, not real footage.
      </p>
    </footer>
  );
}
