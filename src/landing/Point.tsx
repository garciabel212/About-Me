import { Link } from 'react-router-dom';
import { contact } from '@/data/content';
import { mailto, profile, resumeUrl } from '@/data/profile';
import type { Point, Role, WorkItem } from './points';

const base = import.meta.env.BASE_URL;

function Contact() {
  return (
    <p className="point__actions">
      <a className="point__primary" href={mailto}>Email me</a>
      <a href={resumeUrl} download={profile.resumeFile}>Résumé</a>
    </p>
  );
}

function RoleBlock({ role }: { role: Role }) {
  return (
    <article className="role-note" aria-labelledby={`role-${role.id}`}>
      <h3 id={`role-${role.id}`}>{role.organization}</h3>
      <p className="role-note__title">{role.title}</p>
      <p className="point__meta">{role.period}. {role.location}</p>
      <p>{role.summary}</p>
      <ul className="role-note__contributions">
        {role.contributions.map((c) => (
          <li key={c.label}><strong>{c.label}.</strong> {c.text}</li>
        ))}
      </ul>
      <details className="role-note__details">
        <summary>Full responsibilities from my résumé</summary>
        <ul>
          {role.details.map((d) => <li key={d}>{d}</li>)}
        </ul>
      </details>
    </article>
  );
}

function WorkBlock({ item }: { item: WorkItem }) {
  return (
    <article className="work-note" aria-labelledby={item.id}>
      <h3 id={item.id}>{item.title}</h3>
      <p className="point__meta">{item.focus}</p>
      {item.image && (
        <figure className="work-note__shot">
          <img src={`${base}${item.image.src}`} alt={item.image.alt} width={item.image.width} height={item.image.height} loading="lazy" decoding="async" />
          <figcaption>{item.image.caption}</figcaption>
        </figure>
      )}
      <p>{item.problem}</p>
      {item.steps && <p className="work-note__steps">Workflow: {item.steps.join(' → ')}</p>}
      <p><strong>My part.</strong> {item.contribution}</p>
      <p className="point__meta">{item.status}. {item.statusNote}.</p>
      <Link to={item.href} className="point__link">
        {item.linkLabel}<span className="sr-only">: {item.title}</span>
      </Link>
    </article>
  );
}

/**
 * One point of the landing: a detailed text block in normal page flow, placed
 * by `placement`. Its node is where the light path passes; anchors keep the
 * old deep links working.
 */
export default function PointSection({ point }: { point: Point }) {
  const b = point.body;
  const titleId = `point-${point.id}-title`;
  return (
    <section className={`point point--${point.placement}`} data-point={point.id} tabIndex={-1} aria-labelledby={titleId}>
      {point.anchors.map((a) => (
        <span key={a} className="point__anchor" id={a} />
      ))}
      <div className="point__body">
        <span className="point__node" data-node="true" aria-hidden="true" />
        {point.number && (
          <p className="point__label"><span>{point.number} /</span> {point.label}</p>
        )}
        {b.kind === 'intro' ? (
          <>
            <h1 id={titleId} className="point__name">{b.name}</h1>
            <p className="point__role">{b.role}</p>
            <p className="point__lead">{b.statement}</p>
            <Contact />
            <dl className="point-facts">
              {b.facts.map((f) => (
                <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>
              ))}
            </dl>
          </>
        ) : (
          <h2 id={titleId} className="point__headline">{point.headline}</h2>
        )}
        {b.kind === 'experience' && b.roles.map((r) => <RoleBlock key={r.id} role={r} />)}
        {b.kind === 'expertise' && (
          <>
            <ol className="point-steps">
              {b.steps.map((s) => (
                <li key={s.step} className="point-steps__step">
                  <h3>{s.step}</h3>
                  {s.work.map((p) => (
                    <p key={p.text}><span className="point__meta">At work</span> {p.text} <Link to={p.href}>{p.source}</Link></p>
                  ))}
                  {s.projects.map((p) => (
                    <p key={p.text}><span className="point__meta">In a project</span> {p.text} <Link to={p.href}>{p.source}</Link></p>
                  ))}
                </li>
              ))}
            </ol>
            <div className="tools">
              {b.groups.map((g) => (
                <div key={g.name} className="tools__group">
                  <h3>{g.name}</h3>
                  <ul>{g.items.map((i) => <li key={i}>{i}</li>)}</ul>
                </div>
              ))}
            </div>
          </>
        )}
        {b.kind === 'work' && b.items.map((w) => <WorkBlock key={w.id} item={w} />)}
        {b.kind === 'connect' && (
          <>
            <div className="connect__about">
              <img className="connect__portrait" src={`${base}${b.portrait.src}`} alt={b.portrait.alt} width={120} height={120} loading="lazy" decoding="async" />
              <div>{b.bio.map((p) => <p key={p}>{p}</p>)}</div>
            </div>
            <p className="point__lead">{b.body}</p>
            <ul className="connect__details">{b.details.map((d) => <li key={d}>{d}</li>)}</ul>
            <ul className="connect__education">
              {b.education.map((e) => <li key={e.name}><strong>{e.name}</strong> {e.issuer}</li>)}
              <li><strong>Languages</strong> {b.languages}</li>
            </ul>
            <p className="point__actions">
              <a className="point__primary" href={mailto}>Email me</a>
              <a href={contact.linkedin}>LinkedIn</a>
              <a href={profile.github}>GitHub</a>
              <a href={resumeUrl} download={profile.resumeFile}>Résumé</a>
            </p>
          </>
        )}
        <span className="point__node point__node--exit" data-node="exit" aria-hidden="true" />
      </div>
    </section>
  );
}
