import { useState } from 'react';
import { experience } from '@/data/content';

export default function ExperienceCard() {
  const [all, setAll] = useState(false);
  return (
    <>
      <h2 className="fl-h2">Experience</h2>
      {experience.map((e) => (
        <section key={e.id} className="fl-job">
          <b>{e.title}</b>
          <span className="fl-meta">{e.organization} · {e.period} · {e.location}</span>
          <p className="fl-body">{e.summary}</p>
          {e.bullets.length > 0 && (
            <ul className="fl-bullets">
              {(all ? e.bullets : e.bullets.slice(0, 3)).map((b) => <li key={b}>{b}</li>)}
            </ul>
          )}
          {e.bullets.length > 3 && (
            <button type="button" className="fl-link" aria-expanded={all} onClick={() => setAll(!all)}>
              {all ? 'Show fewer' : `Show all ${e.bullets.length}`}
            </button>
          )}
        </section>
      ))}
    </>
  );
}
