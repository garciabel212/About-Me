import { evidenceStrip, hero, site } from '@/data/content';
import { mailto, resumeUrl } from '@/data/profile';

export default function HeroCard() {
  return (
    <>
      <h1 className="fl-h1">{site.name}</h1>
      <p className="fl-role">{site.headline}</p>
      <p className="fl-lead">{hero.heading}</p>
      <p className="fl-body">{hero.intro}</p>
      <p className="fl-details">{hero.details.join(' · ')}</p>
      <div className="fl-actions">
        <a className="fl-btn fl-btn-primary" href="#projects">{hero.workCta}</a>
        <a className="fl-btn fl-btn-ghost" href={resumeUrl} target="_blank" rel="noopener">{hero.resumeCta}</a>
        <a className="fl-btn fl-btn-ghost" href={mailto}>{hero.emailCta}</a>
      </div>
      <ul className="fl-chips">{evidenceStrip.map((e) => <li key={e}>{e}</li>)}</ul>
    </>
  );
}
