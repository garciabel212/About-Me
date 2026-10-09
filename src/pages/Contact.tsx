import { motion, useReducedMotion } from 'framer-motion';
import { Mail, ExternalLink, Code2, FileText, MessageSquare, MapPin, Plane, Globe2, Briefcase } from 'lucide-react';
import { mailto, profile, resumeUrl } from '@/data/profile';

const targetRoles = [
  'Solutions Engineer',
  'Sales Engineer',
  'Technical Consultant',
  'Implementation Consultant',
  'Customer Engineer',
];

const contactMethods = [
  {
    icon: Mail,
    label: 'Direct Email',
    value: profile.email,
    href: mailto,
    desc: 'Best for interview scheduling & technical inquiries',
    color: '#3B82F6',
    primary: true,
  },
  {
    icon: ExternalLink,
    label: 'LinkedIn',
    value: 'jose-abel-garcia',
    href: profile.linkedin,
    desc: 'Connect professionally & view network recommendations',
    color: '#0A66C2',
    primary: false,
  },
  {
    icon: Code2,
    label: 'GitHub',
    value: 'garciabel212',
    href: 'https://github.com/garciabel212',
    desc: 'View public engineering repositories & prototypes',
    color: '#6B7280',
    primary: false,
  },
  {
    icon: FileText,
    label: 'Résumé',
    value: 'Download PDF',
    href: resumeUrl,
    desc: 'Current two-page résumé: experience, education, and tools',
    color: '#10B981',
    primary: false,
  },
];

export default function Contact() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="pt-24 pb-0 text-[var(--text-primary)]">
      {/* Hero */}
      <section className="section-py">
        <div className="section-container max-w-3xl text-center mx-auto">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-low)] flex items-center justify-center">
                <MessageSquare size={24} className="text-[var(--accent)]" />
              </div>
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--accent)] font-semibold mb-3">
              GET IN TOUCH
            </p>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase text-[var(--text-primary)] tracking-tight mb-6 font-display">
              Let’s talk about making technology work.
            </h1>
            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed mb-6">
              I am actively seeking Solutions Engineering, Sales Engineering, Technical Consulting, and
              Customer Engineering roles. If your team needs someone who can understand customer environments,
              demonstrate and configure technical solutions, lead deployments, and build the tools that keep
              operations running smoothly, I would love to connect.
            </p>

            {/* Work style & location chips */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">
                <MapPin size={13} className="text-[var(--accent)]" />
                <span>Boca Raton, Florida</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">
                <Plane size={13} className="text-[var(--accent)]" />
                <span>Remote / Hybrid / Up to 40% Travel</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">
                <Globe2 size={13} className="text-[var(--accent)]" />
                <span>Bilingual: English &amp; Spanish</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Target Roles Bar */}
      <section className="pb-12">
        <div className="section-container max-w-4xl mx-auto">
          <div className="card p-6 border-[var(--border)] bg-[var(--surface-elevated)]">
            <div className="flex items-center gap-2 mb-4 text-xs font-mono uppercase tracking-wider text-[var(--accent)]">
              <Briefcase size={14} /> Target Roles
            </div>
            <div className="flex flex-wrap gap-2.5">
              {targetRoles.map((role) => (
                <span
                  key={role}
                  className="px-3.5 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-xs sm:text-sm font-medium text-[var(--text-primary)]"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="pb-20">
        <div className="section-container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {contactMethods.map((method, i) => {
              const Icon = method.icon;
              const linkProps = method.href.startsWith('mailto')
                ? {}
                : { target: '_blank', rel: 'noopener noreferrer' };

              return (
                <motion.a
                  key={method.label}
                  href={method.href}
                  {...linkProps}
                  initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={reduceMotion ? undefined : { y: -4 }}
                  className={`card p-6 flex flex-col items-center text-center gap-4 group cursor-pointer ${
                    method.primary ? 'border-[var(--accent)]' : ''
                  }`}
                  aria-label={`${method.label}: ${method.value}`}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `${method.color}18`, border: `1px solid ${method.color}30` }}
                  >
                    <Icon size={22} style={{ color: method.color }} />
                  </div>
                  <div>
                    <p className="text-[var(--text-primary)] font-semibold text-sm">{method.label}</p>
                    <p className="text-xs sm:text-sm font-mono text-[var(--text-secondary)] mt-0.5 break-all font-semibold">
                      {method.value}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">{method.desc}</p>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Résumé Request Section */}
      <section className="section-py border-t border-[var(--border-subtle)] bg-[var(--surface)]">
        <div className="section-container max-w-2xl text-center mx-auto">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold uppercase text-[var(--text-primary)] font-display tracking-tight mb-3">
              Looking for a résumé?
            </h2>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base mb-8 max-w-lg mx-auto">
              Download the current two-page PDF: experience, education, tools, and languages.
            </p>
            <a
              href={resumeUrl}
              download={profile.resumeFile}
              className="btn-lime inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm mx-auto shadow-lg hover:brightness-105 transition-all"
            >
              <FileText size={17} />
              <span>DOWNLOAD RÉSUMÉ (PDF)</span>
            </a>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

