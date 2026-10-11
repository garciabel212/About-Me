import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';
import AssetFrame from '@/components/AssetFrame';
import { getCaseStudy } from '@/data/caseStudies';

function CaseActions() {
  return (
    <div className="case-actions">
      {/* Returns to the visitor's place on Home, in the mode they were using. */}
      <Link to="/#projects" state={{ restore: true }} className="btn btn-secondary">
        <ArrowLeft size={16} aria-hidden="true" /> Back to Projects
      </Link>
      <Link to="/#contact" className="btn btn-primary">
        <Mail size={16} aria-hidden="true" /> Contact Jose
      </Link>
    </div>
  );
}

/**
 * Every case study follows one structure: summary → large screenshot →
 * role, users, status → problem → important decisions → visual evidence →
 * current result → next improvement.
 */
export default function CaseStudyPage({ slug }: { slug: string }) {
  const study = getCaseStudy(slug);
  if (!study) return null;
  const related = getCaseStudy(study.related);
  const isLab = study.slug === 'agent-trading-os';

  return (
    <main id="main" tabIndex={-1} className="case">
      <article className="case__inner">
        <CaseActions />

        <header className="case__head">
          <p className="eyebrow">{isLab ? 'Lab experiment' : 'Personal project'} · Updated {study.updated}</p>
          <h1>{study.title}</h1>
          <p className="case__subtitle">{study.subtitle}</p>
          <p className="case__summary">{study.summary}</p>
        </header>

        <AssetFrame asset={study.hero} large />

        <dl className="case__facts">
          <div><dt>My role</dt><dd>{study.role}</dd></div>
          <div><dt>Users</dt><dd>{study.users}</dd></div>
          <div><dt>Status</dt><dd><span className="status">{study.status}</span> {study.statusNote}.</dd></div>
        </dl>

        <section className="case__section" aria-labelledby="problem">
          <h2 id="problem">The problem</h2>
          <p>{study.problem}</p>
        </section>

        <section className="case__section" aria-labelledby="decisions">
          <h2 id="decisions">Important decisions</h2>
          <ol className="decisions">
            {study.decisions.map((d) => (
              <li key={d.title}>
                <h3>{d.title}</h3>
                <p>{d.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {study.evidence.length > 0 && (
          <section className="case__section" aria-labelledby="evidence">
            <h2 id="evidence">Visual evidence</h2>
            <div className="evidence">
              {study.evidence.map((a) => <AssetFrame key={a.caption} asset={a} />)}
            </div>
          </section>
        )}

        <section className="case__section" aria-labelledby="result">
          <h2 id="result">Current result</h2>
          <p>{study.result}</p>
          {study.note && <p className="case__note">{study.note}</p>}
        </section>

        <section className="case__section" aria-labelledby="next">
          <h2 id="next">Next improvement</h2>
          <ul className="plain-list case__next">
            {study.next.map((r) => <li key={r}>{r}</li>)}
          </ul>
          <p className="case__tech">Built with {study.technologies.join(', ')}.</p>
        </section>

        <footer className="case__foot">
          <CaseActions />
          {related && (
            <Link to={related.slug === 'agent-trading-os' ? '/lab' : `/projects/${related.slug}`} className="text-link">
              Next case study: {related.title} <ArrowRight size={14} aria-hidden="true" />
            </Link>
          )}
        </footer>
      </article>
    </main>
  );
}
