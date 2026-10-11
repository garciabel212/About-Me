import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, Menu, X, FileDown } from 'lucide-react';
import ThemeToggle from './theme/ThemeToggle';
import { MotionToggle, ViewSwitch } from './view/ViewControls';
import { useViewMode } from './view/ViewMode';
import { mailto, profile, resumeUrl } from '@/data/profile';
import { homeSectionLinks } from '@/data/navigation';
import { useActiveSection } from '@/hooks/useActiveSection';

/**
 * Site header on every page: section links (with their Miami stop as a
 * secondary label), the Cinematic / Read page switch and motion control on
 * Home, and Email. Over the flight it is a dark bar so it stays readable.
 */
export default function Navbar() {
  const { pathname, hash } = useLocation();
  const { mode } = useViewMode();
  const home = pathname === '/';
  const onFilm = home && mode === 'cinematic';
  const active = useActiveSection(home);
  const [menuOpen, setMenuOpen] = useState(false);

  const [route, setRoute] = useState(pathname + hash);
  if (route !== pathname + hash) {
    setRoute(pathname + hash);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <header className={`site-header ${onFilm ? 'is-film' : ''}`}>
      <a className="skip-link" href="#main" onClick={(e) => {
        e.preventDefault();
        const main = document.getElementById('main');
        main?.focus();
        main?.scrollIntoView();
      }}>Skip to content</a>
      <div className="site-header__bar">
        <Link to="/#overview" className="site-brand">Jose Garcia</Link>

        <nav className="site-nav" aria-label="Sections">
          <ul>
            {homeSectionLinks.map((l) => (
              <li key={l.id}>
                <Link to={l.href} aria-current={active === l.id ? 'location' : undefined}>
                  <span className="site-nav__label">{l.label}</span>
                  <span className="site-nav__place">{l.place}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__tools">
          {home && <ViewSwitch />}
          {onFilm && <MotionToggle className="hide-below-md" />}
          {!onFilm && <ThemeToggle className="theme-toggle hide-below-sm" />}
          <a className="hdr-btn hide-below-sm" href={mailto}>
            <Mail size={15} aria-hidden="true" />
            <span>Email</span>
          </a>
          <button
            type="button"
            className="hdr-btn menu-btn"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label="Menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
            <span>Menu</span>
          </button>
        </div>
      </div>

      <div id="site-menu" className="site-menu" hidden={!menuOpen}>
        <div className="site-menu__actions">
          <a className="btn btn-primary" href={resumeUrl} download={profile.resumeFile}>
            <FileDown size={16} aria-hidden="true" /> Download Resume
          </a>
          <a className="btn btn-secondary" href={mailto}>
            <Mail size={16} aria-hidden="true" /> Email Jose
          </a>
        </div>
        <ul className="site-menu__links">
          {homeSectionLinks.map((l) => (
            <li key={l.id}>
              <Link to={l.href} aria-current={active === l.id ? 'location' : undefined}>
                <span>{l.label}</span>
                <span className="site-nav__place">{l.place}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="site-menu__view">
          {onFilm && <MotionToggle />}
          {!onFilm && <ThemeToggle className="theme-toggle" />}
        </div>
      </div>
    </header>
  );
}
