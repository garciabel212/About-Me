import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileDown, Menu, X } from 'lucide-react';
import { useLenis } from '@/components/motion/SmoothScroll';
import { profile, resumeUrl } from '@/data/profile';

export default function EditorialNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const lenis = useLenis();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      // Check if user has scrolled past top hero
      const scrolled = window.scrollY > window.innerHeight * 0.85;
      setIsScrolledPastHero(scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (hash: string) => {
    setMobileMenuOpen(false);
    if (lenis) {
      lenis.scrollTo(hash, { offset: -64 });
    } else {
      const el = document.querySelector(hash);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[80] transition-all duration-300 select-none ${
          isScrolledPastHero
            ? 'bg-[#06080d]/85 backdrop-blur-md border-b border-white/10 text-white shadow-lg'
            : 'bg-transparent text-white'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-4 flex items-center justify-between">
          {/* Brand */}
          <Link
            to="/#intro"
            onClick={() => handleNavClick('#intro')}
            className="text-xs font-bold tracking-[0.2em] uppercase transition-opacity hover:opacity-80 font-mono flex items-center gap-2"
            aria-label="Jose Garcia — Home"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Jose Garcia</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-[11px] font-mono font-medium tracking-[0.16em] uppercase text-white/80">
            <a
              href="#who-i-am"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('#who-i-am');
              }}
              className="transition-colors hover:text-cyan-300"
            >
              Who I Am
            </a>
            <a
              href="#experience"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('#experience');
              }}
              className="transition-colors hover:text-cyan-300"
            >
              Experience
            </a>
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('#projects');
              }}
              className="transition-colors hover:text-cyan-300"
            >
              Projects
            </a>
            <a
              href="#capabilities"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('#capabilities');
              }}
              className="transition-colors hover:text-cyan-300"
            >
              Capabilities
            </a>
            <a
              href="#philosophy"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('#philosophy');
              }}
              className="transition-colors hover:text-cyan-300"
            >
              Philosophy
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('#contact');
              }}
              className="transition-colors hover:text-cyan-300"
            >
              Contact
            </a>
          </nav>

          {/* Right Status */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono tracking-[0.14em] uppercase text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Available for SE Roles</span>
            </div>

            <a
              href={resumeUrl}
              download={profile.resumeFile}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            >
              <FileDown size={14} aria-hidden="true" />
              Résumé
            </a>

            {/* Mobile menu trigger */}
            <button
              type="button"
              className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[79] bg-[#06080d]/95 backdrop-blur-2xl flex flex-col justify-center items-center p-8 md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <nav className="flex flex-col items-center gap-7 text-lg font-mono tracking-widest uppercase text-white/90">
            <a
              href="#intro"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('#intro');
              }}
              className="hover:text-cyan-300"
            >
              Opening
            </a>
            <a
              href="#who-i-am"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('#who-i-am');
              }}
              className="hover:text-cyan-300"
            >
              Who I Am
            </a>
            <a
              href="#experience"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('#experience');
              }}
              className="hover:text-cyan-300"
            >
              Experience
            </a>
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('#projects');
              }}
              className="hover:text-cyan-300"
            >
              Projects
            </a>
            <a
              href="#capabilities"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('#capabilities');
              }}
              className="hover:text-cyan-300"
            >
              Capabilities
            </a>
            <a
              href="#philosophy"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('#philosophy');
              }}
              className="hover:text-cyan-300"
            >
              Philosophy
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('#contact');
              }}
              className="hover:text-cyan-300"
            >
              Contact
            </a>
            <a href={resumeUrl} download={profile.resumeFile} className="hover:text-cyan-300">
              Download résumé
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
