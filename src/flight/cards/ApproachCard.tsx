import { useState } from 'react';
import { approach, bio, education, languages, tools } from '@/data/content';

type Tab = 'approach' | 'tools' | 'about';
const TABS: { id: Tab; label: string }[] = [
  { id: 'approach', label: 'How I work' },
  { id: 'tools', label: 'Tools & education' },
  { id: 'about', label: 'About' },
];

export default function ApproachCard({ initialTab = 'approach' }: { initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  // A later #about / #who-i-am link switches the tab without remounting the card.
  const [requested, setRequested] = useState(initialTab);
  if (requested !== initialTab) {
    setRequested(initialTab);
    setTab(initialTab);
  }
  return (
    <>
      <div className="fl-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" id={`fl-tab-${t.id}`} aria-controls={`fl-panel-${t.id}`}
            aria-selected={tab === t.id} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      <div role="tabpanel" id={`fl-panel-${tab}`} aria-labelledby={`fl-tab-${tab}`}>
        {tab === 'approach' && (
          <ol className="fl-steps">
            {approach.map((s) => <li key={s.step}><b>{s.name}</b><span>{s.subtitle}</span></li>)}
          </ol>
        )}
        {tab === 'tools' && (
          <div className="fl-cols">
            <div><p className="fl-status">Professional</p><ul className="fl-bullets">{tools.professional.map((t) => <li key={t.name}>{t.name}</li>)}</ul></div>
            <div><p className="fl-status">Projects</p><ul className="fl-bullets">{tools.project.map((t) => <li key={t.name}>{t.name}</li>)}</ul></div>
            <div><p className="fl-status">Education</p><ul className="fl-bullets">{education.map((e) => <li key={e.name}>{e.name}, {e.issuer}</li>)}<li>{languages}</li></ul></div>
          </div>
        )}
        {tab === 'about' && bio.map((p) => <p key={p} className="fl-body">{p}</p>)}
      </div>
    </>
  );
}
