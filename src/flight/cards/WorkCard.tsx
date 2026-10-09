import { Link } from 'react-router-dom';
import { featuredWork } from '@/data/content';

const base = import.meta.env.BASE_URL;

export default function WorkCard() {
  return (
    <>
      <h2 className="fl-h2">Selected work</h2>
      <ul className="fl-work">
        {featuredWork.map((w) => (
          <li key={w.slug}>
            {w.image ? (
              <figure className="fl-thumb">
                <img src={`${base}${w.image}`} alt={`${w.title}: ${w.subtitle}`} loading="lazy" />
                {w.imageIsConcept && <figcaption>Concept</figcaption>}
              </figure>
            ) : (
              <div className="fl-thumb fl-thumb-empty" data-placeholder="true" role="img" aria-label={`${w.title}: screenshot coming soon`}>
                <span>Screenshot coming soon</span>
              </div>
            )}
            <div>
              <p className="fl-status">{w.status}</p>
              <b>{w.title}</b>
              <span>{w.subtitle}</span>
              <Link className="fl-link" to={w.href}>Read case study</Link>
            </div>
          </li>
        ))}
      </ul>
      <Link className="fl-link fl-quiet" to="/lab">More in the Lab</Link>
    </>
  );
}
