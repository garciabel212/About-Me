import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, Check, Copy, ExternalLink, FileDown, Mail } from 'lucide-react';
import {
  about, contact, education, experience, expertise, glance, languages, overview, projects, site, toolGroups,
  type Project,
} from '@/data/content';
import { mailto, profile, resumeUrl } from '@/data/profile';
import type { SectionId } from '@/data/routes';
import CareerTimeline from './CareerTimeline';
import EvidenceMatrix from './EvidenceMatrix';
import ServiceWorkflow from './ServiceWorkflow';

const base = import.meta.env.BASE_URL;

function Section({ id, title, lead, evidence, children }: { id: SectionId; title: string; lead?: string; evidence?: string; children: ReactNode }) {
  return (
    <section id={id} tabIndex={-1} aria-labelledby={`${id}-title`} className={`home-section home-section--${id}`} data-evidence={evidence}>
      <div className="panel">
        <header className="section-head">
          <h2 id={`${id}-title`}>{title}</h2>
          {lead && <p className="section-lead">{lead}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}

export function Overview() {
  return (
    <section id="overview" tabIndex={-1} aria-labelledby="overview-title" className="home-section home-section--overview">
      <div className="overview">
        <h1 id="overview-title">{site.name}</h1>
        <p className="overview__title">{overview.title}</p>
        <p className="overview__statement">{overview.statement}</p>
        <p className="overview__evidence">{overview.evidence.join(' · ')}</p>
        <div className="actions">
          <Link to="/#projects" className="btn btn-primary">
            {overview.workCta} <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <a href={resumeUrl} download={profile.resumeFile} className="btn btn-secondary">
            <FileDown size={16} aria-hidden="true" /> {overview.resumeCta}
          </a>
        </div>
      </div>
      <div className="glance">
        <dl>
          {glance.map((g) => (
            <div key={g.label}>
              <dt>{g.label}</dt>
              <dd>{g.value}</dd>
            </div>
          ))}
        </dl>
        <Link to="/#experience" className="next-cue">
          Next: Experience <ArrowDown size={15} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

export function Experience() {
  return (
    <Section id="experience" title="Experience" evidence="timeline" lead="Professional roles, most recent first. Personal projects are listed separately under Projects.">
      <div className="inline-evidence"><CareerTimeline /></div>
      <div className="roles">
        {experience.map((e) => (
          <article key={e.id} id={`exp-${e.id}`} tabIndex={-1} className={`role role--${e.weight}`} aria-labelledby={`exp-${e.id}-title`}>
            <div className="role__row">
              <div>
                {e.weight === 'supporting' && <p className="role__tag">Earlier role</p>}
                <h3 id={`exp-${e.id}-title`}>{e.organization}</h3>
                <p className="role__title">{e.title}</p>
              </div>
              <p className="role__meta">
                <span>{e.period}</span>
                <span>{e.location}</span>
              </p>
            </div>
            <p className="role__summary">{e.summary}</p>
            <ul className="role__contributions">
              {e.contributions.map((c) => (
                <li key={c.label}>
                  <h4>{c.label}</h4>
                  <p>{c.text}</p>
                </li>
              ))}
            </ul>
            {e.details.length > 0 && (
              <details className="role__details">
                <summary>More detail from this role</summary>
                <ul>
                  {e.details.map((d) => <li key={d}>{d}</li>)}
                </ul>
              </details>
            )}
          </article>
        ))}
      </div>
    </Section>
  );
}

export function Expertise() {
  return (
    <Section id="expertise" title="Expertise" lead="What I bring to a customer-facing technical team.">
      <ul className="capabilities">
        {expertise.map((x) => (
          <li key={x.id} className="capability">
            <h3>{x.title}</h3>
            <p>{x.body}</p>
            <Link to={x.href} className="text-link">
              {x.linkLabel} <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
      <EvidenceMatrix />
    </Section>
  );
}

function ProjectFigure({ project, featured }: { project: Project; featured?: boolean }) {
  const image = project.image;
  if (image?.kind === 'diagram') {
    return (
      <figure className={`project__figure project__figure--diagram inline-evidence ${featured ? 'is-featured' : ''}`}>
        <ServiceWorkflow label={image.alt} />
        <figcaption>
          <span className="image-kind image-kind--diagram">Diagram</span>
          {image.caption}
        </figcaption>
      </figure>
    );
  }
  if (!image) {
    // Text-led until a real screenshot exists.
    return (
      <div className="project__textled">
        <p className="project__pull">{project.focus}</p>
        <p className="project__pending">Screenshot coming soon</p>
      </div>
    );
  }
  return (
    <figure className={`project__figure inline-evidence ${featured ? 'is-featured' : ''}`}>
      <img
        src={`${base}${image.src}`}
        srcSet={image.small ? `${base}${image.small} 800w, ${base}${image.src} 1600w` : undefined}
        sizes={featured ? '(min-width: 1100px) 1000px, 100vw' : '(min-width: 900px) 520px, 100vw'}
        alt={image.alt}
        loading="lazy"
        decoding="async"
      />
      <figcaption>
        <span className={`image-kind image-kind--${image.kind}`}>{image.kind === 'concept' ? 'Concept' : 'Screenshot'}</span>
        {image.caption}
      </figcaption>
    </figure>
  );
}

function ProjectFacts({ project }: { project: Project }) {
  return (
    <dl className="facts">
      <div><dt>Problem</dt><dd>{project.problem}</dd></div>
      <div><dt>Who it’s for</dt><dd>{project.audience}</dd></div>
      <div><dt>My contribution</dt><dd>{project.contribution}</dd></div>
      <div><dt>Status</dt><dd><span className="status">{project.status}</span> {project.statusNote}.</dd></div>
    </dl>
  );
}

export function Projects() {
  const [featured, ...rest] = projects;
  return (
    <Section id="projects" title="Projects" lead="Personal projects I designed and built on my own time, separate from my employment.">
      <article className="project project--featured" aria-labelledby="project-featured-title" data-evidence={featured.slug}>
        <ProjectFigure project={featured} featured />
        <div className="project__body">
          <p className="project__focus">{featured.focus}</p>
          <h3 id="project-featured-title">{featured.title}</h3>
          <ProjectFacts project={featured} />
          <Link to={featured.href} className="btn btn-primary">
            Read the {featured.title} case study <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </article>
      <div className="project-grid">
        {rest.map((p) => (
          <article key={p.slug} className="project" aria-labelledby={`project-${p.slug}-title`} data-evidence={p.image ? p.slug : undefined}>
            <ProjectFigure project={p} />
            <div className="project__body">
              {p.image && <p className="project__focus">{p.focus}</p>}
              <h3 id={`project-${p.slug}-title`}>{p.title}</h3>
              <ProjectFacts project={p} />
              <Link to={p.href} className="btn btn-secondary">
                Read the {p.title} case study <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </div>
      <p className="lab-link">
        Smaller experiments live in the <Link to="/lab" className="text-link">Lab <ArrowRight size={14} aria-hidden="true" /></Link>
      </p>
    </Section>
  );
}

export function About() {
  return (
    <Section id="about" title="About">
      <div className="about">
        <img className="about__portrait" src={`${base}${about.portrait.src}`} alt={about.portrait.alt} width={160} height={160} loading="lazy" />
        <div className="about__bio">
          {about.bio.map((p) => <p key={p}>{p}</p>)}
        </div>
      </div>
      <div className="qualifications">
        <div>
          <h3>Education</h3>
          <ul>
            {education.map((e) => (
              <li key={e.name}><strong>{e.name}</strong><span>{e.issuer}</span></li>
            ))}
          </ul>
          <h3>Languages</h3>
          <p>{languages}</p>
        </div>
        {toolGroups.map((g) => (
          <div key={g.name}>
            <h3>{g.name}</h3>
            <ul className="plain-list">
              {g.items.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function Contact() {
  const [copied, setCopied] = useState<'idle' | 'done' | 'failed'>('idle');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied('done');
    } catch {
      setCopied('failed');
    }
  };
  return (
    <Section id="contact" title={contact.heading}>
      <p className="contact__body">{contact.body}</p>
      <p className="contact__email">{contact.email}</p>
      <div className="actions">
        <a className="btn btn-primary" href={mailto}>
          <Mail size={16} aria-hidden="true" /> Email
        </a>
        <button type="button" className="btn btn-secondary" onClick={copy}>
          {copied === 'done' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          {copied === 'done' ? 'Email copied' : 'Copy Email'}
        </button>
        <a className="btn btn-secondary" href={contact.linkedin} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={16} aria-hidden="true" /> LinkedIn
        </a>
        <a className="btn btn-secondary" href={resumeUrl} download={profile.resumeFile}>
          <FileDown size={16} aria-hidden="true" /> Download Resume
        </a>
      </div>
      <p className="contact__status" role="status">
        {copied === 'failed' ? 'Copy is not available in this browser. Select the address above instead.' : ''}
      </p>
      <p className="contact__details">{contact.details.join(' · ')}</p>
    </Section>
  );
}
