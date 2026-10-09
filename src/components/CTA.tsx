import { Link } from 'react-router-dom';
import { ArrowRight, Mail, ExternalLink } from 'lucide-react';
import { Reveal } from '@/components/motion';
import { mailto, profile } from '@/data/profile';

interface CTAProps {
  title?: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
}

export default function CTA({
  title = "Let's work together",
  description = "I'm open to Solutions Engineering, Sales Engineering, and Technical Consulting opportunities. Let's connect.",
  primaryHref = '/contact',
  primaryLabel = 'Get in Touch',
}: CTAProps) {
  return (
    <section className="section-py relative overflow-hidden bg-[#0c1010] border-t border-white/[0.08] section-inset-highlight">
      {/* Soft ambient overhead lighting */}
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[350px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 20%, rgba(255,255,255,0.035) 0%, transparent 70%)',
        }}
      />

      <div className="section-container relative z-10">
        <Reveal
          blur
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {title}
          </h2>
          <p className="text-lg text-slate-400 mb-10">{description}</p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to={primaryHref} className="btn-primary text-base px-8 py-3.5">
              {primaryLabel}
              <ArrowRight size={18} />
            </Link>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-base px-6 py-3.5"
            >
              <ExternalLink size={17} />
              LinkedIn
            </a>
            <a
              href={mailto}
              className="btn-ghost text-base"
            >
              <Mail size={17} />
              Email Me
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
