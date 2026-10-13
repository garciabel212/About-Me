import { useState } from 'react';
import { Link } from 'react-router-dom';
import { site as siteCopy } from '@/data/content';
import { mailto, profile, resumeUrl } from '@/data/profile';
import { AI_DISCLOSURE } from '@/flight/disclosure';
import type { Site } from './sites';

/**
 * The survey's title block, fixed low-left like the block on an engineering
 * drawing. Its fields never move; only their values change per site. The Site
 * field opens the sheet list (all six sites).
 */
export default function TitleBlock({ sites, current }: { sites: Site[]; current: number }) {
  const [open, setOpen] = useState(false);
  const here = sites[current];
  return (
    <aside className="title-block" aria-label="Site survey">
      <nav id="tb-sites" className="tb-sites" aria-label="Sites" hidden={!open}>
        <ol>
          {sites.map((s, i) => (
            <li key={s.id}>
              <Link to={{ pathname: '/', hash: `#${s.anchors[0]}` }} aria-current={i === current ? 'location' : undefined} onClick={() => setOpen(false)}>
                {s.label}
                <span>{s.job}</span>
              </Link>
            </li>
          ))}
        </ol>
      </nav>
      <dl className="tb-fields">
        <div className="tb-field tb-field--by">
          <dt>Drawn by</dt>
          <dd>{siteCopy.name}</dd>
        </div>
        <div className="tb-field tb-field--site">
          <dt>Site</dt>
          <dd>
            <button type="button" className="tb-site" aria-expanded={open} aria-controls="tb-sites" onClick={() => setOpen((v) => !v)}>
              {here.label}
              <span className="tb-sheet">Sheet {current + 1} of {sites.length}</span>
            </button>
          </dd>
        </div>
        <div className="tb-field tb-field--contact">
          <dt>Contact</dt>
          <dd>
            <a className="tb-email" href={mailto}>Email me</a>
            <a className="tb-resume" href={resumeUrl} download={profile.resumeFile}>Résumé</a>
          </dd>
        </div>
        <div className="tb-field tb-field--job">
          <dt>Job</dt>
          <dd>{here.job}</dd>
        </div>
        <div className="tb-field tb-field--status">
          <dt>Status</dt>
          <dd>{here.status}</dd>
        </div>
      </dl>
      <p className="tb-disclosure">{AI_DISCLOSURE}</p>
    </aside>
  );
}
