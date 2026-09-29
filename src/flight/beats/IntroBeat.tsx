import type { MouseEvent } from 'react';
import { ArrowDown, ArrowUpRight, FileDown, Mail } from 'lucide-react';
import { veilStyle } from '../veil';

const RESUME_MAILTO =
  'mailto:joseabelgarcia99@gmail.com?subject=R%C3%A9sum%C3%A9%20Request%20-%20Jose%20Garcia&body=Hi%20Jose,%0D%0A%0D%0AI%20would%20like%20to%20request%20a%20copy%20of%20your%20current%20r%C3%A9sum%C3%A9.%0D%0A%0D%0AThanks!';
const LINKEDIN = 'https://www.linkedin.com/in/jose-abel-garcia-a5006616b/';

interface IntroBeatProps {
  onExploreWork: () => void;
  /** Handles in-page "#id" links when smooth scrolling is off. */
  onInPageLink: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export default function IntroBeat({ onExploreWork, onInPageLink }: IntroBeatProps) {
  const portrait = `${import.meta.env.BASE_URL}images/jose_garcia_portrait.png`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
      <div className="lg:col-span-7 rounded-3xl p-5 sm:p-8 backdrop-blur-md" style={veilStyle}>
        <p className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-4">
          <img src={portrait} alt="" className="lg:hidden h-10 w-10 rounded-full object-cover object-top" />
          <span className="font-semibold text-[var(--accent)]">Jose Garcia</span>
          <span aria-hidden="true">&middot;</span>
          <span>South Florida</span>
          <span aria-hidden="true">&middot;</span>
          <span>Sales Engineering &middot; Solutions Consulting</span>
        </p>

        <h1 className="font-serif font-bold uppercase tracking-tight leading-[1.06] text-[var(--text-primary)] text-4xl sm:text-5xl xl:text-6xl mb-5">
          I turn complex technology into solutions people can use.
        </h1>

        <p className="hidden sm:block text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mb-6">
          Customer-facing engineer bridging technical discovery, tailored solution demonstrations, hardware and
          software implementation, and long-term customer success. Translating deep technical execution into
          verifiable business impact.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onExploreWork}
            className="btn-primary inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base shadow-[var(--shadow-blue)] group"
          >
            <span>Explore Selected Work</span>
            <ArrowDown size={16} className="group-hover:translate-y-0.5 transition-transform" aria-hidden="true" />
          </button>
          <a
            href="#contact"
            onClick={onInPageLink}
            className="btn-secondary inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-medium text-sm sm:text-base"
          >
            <Mail size={16} aria-hidden="true" />
            <span>Let&apos;s Connect</span>
          </a>
          <a
            href={RESUME_MAILTO}
            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <FileDown size={15} aria-hidden="true" />
            <span>R&Eacute;SUM&Eacute; ON REQUEST</span>
          </a>
        </div>
      </div>

      <figure
        className="hidden lg:block lg:col-span-5 justify-self-center w-full max-w-sm rounded-3xl p-3 border border-[var(--border)] shadow-[var(--shadow-floating)] backdrop-blur-md"
        style={veilStyle}
      >
        <img
          src={portrait}
          alt="Jose Garcia - Solutions Engineer and Computer Engineer"
          className="aspect-[4/5] w-full rounded-2xl object-cover object-top"
        />
        <figcaption className="pt-3 px-1 flex items-center justify-between font-mono text-xs">
          <span className="font-semibold text-[var(--text-primary)]">Jose Garcia, B.S. CE</span>
          <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline">
            <span>LinkedIn Profile</span>
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </figcaption>
      </figure>
    </div>
  );
}
