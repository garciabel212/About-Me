import { useState } from 'react';
import { Link } from 'react-router-dom';
import { contact, site as siteCopy } from '@/data/content';
import { mailto, profile, resumeUrl } from '@/data/profile';
import type { Job, Site } from './sites';

/** A job's note: outcome on the front, how it was built on the back. */
export function JobNote({ job, initiallyFlipped = false }: { job: Job; initiallyFlipped?: boolean }) {
  const [flipped, setFlipped] = useState(initiallyFlipped);
  return (
    <article className="note note--job" data-anchor={job.id} aria-labelledby={`${job.id}-title`}>
      <h3 id={`${job.id}-title`} className="note__title">{job.title}</h3>
      <p className="note__outcome" hidden={flipped}>{job.outcome}</p>
      <p className="note__method" hidden={!flipped}>{job.method}</p>
      <p className="note__meta">
        <span className="note__status">{job.status}</span>
        <button type="button" className="note__flip" aria-expanded={flipped} onClick={() => setFlipped((v) => !v)}>
          {flipped ? 'What it does' : 'How it was built'}
        </button>
        <Link to={job.href} className="note__link">
          Case study<span className="sr-only">: {job.title}</span>
        </Link>
      </p>
    </article>
  );
}

/**
 * One site of the survey. The section is tall; its frame sticks to the
 * viewport while the site holds, so the notes stay put as the ink draws to
 * them. Hash anchors sit mid-hold so links land with the ink drawn.
 */
export default function SiteSection({ site }: { site: Site }) {
  const b = site.body;
  const titleId = `site-${site.id}-title`;
  return (
    <section className={`site site--${site.id}`} data-site={site.id} aria-labelledby={titleId}>
      {site.anchors.map((a) => (
        <span key={a} className="site__anchor" id={a} />
      ))}
      <div className="site__frame">
        <div className="site__notes">
          {b.kind === 'intro' ? (
            <div className="note note--intro" data-anchor={site.id}>
              <h1 id={titleId} className="intro__name">{b.name}</h1>
              <p className="intro__role">{b.role}</p>
              <p className="intro__statement">{b.statement}</p>
              <p className="intro__next">{b.next}</p>
            </div>
          ) : (
            <>
              <h2 id={titleId} className="site__heading" data-anchor={b.kind === 'jobs' ? undefined : site.id}>
                {site.heading}
              </h2>
              {b.kind === 'jobs' && b.jobs.map((j) => <JobNote key={j.id} job={j} />)}
              {b.kind === 'punch' && (
                <ol className="punch">
                  {b.items.map((it) => (
                    <li key={it.id} data-anchor={it.id} data-anchor-side="left">
                      <strong>{it.step}</strong>
                      <span>{it.line}</span>
                    </li>
                  ))}
                </ol>
              )}
              {b.kind === 'log' && (
                <ul className="log">
                  {b.entries.map((e) => (
                    <li key={e.id}>
                      <strong>{e.name}</strong>
                      <span>{e.line}</span>
                      {e.period && <span className="log__period">{e.period}</span>}
                    </li>
                  ))}
                </ul>
              )}
              {b.kind === 'handover' && (
                <div className="handover">
                  <p className="handover__heading">{b.heading}</p>
                  <p className="handover__body">{b.body}</p>
                  <p className="handover__sign">
                    Signed off <span>{siteCopy.name}</span>
                  </p>
                  <ul className="handover__links">
                    <li><a className="tb-email" href={mailto}>Email me</a></li>
                    <li><a href={contact.linkedin}>LinkedIn</a></li>
                    <li><a href={profile.github}>GitHub</a></li>
                    <li><a href={resumeUrl} download={profile.resumeFile}>Résumé</a></li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
