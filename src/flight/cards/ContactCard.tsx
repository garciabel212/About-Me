import { useState } from 'react';
import { availableResumes, contact } from '@/data/content';

const base = import.meta.env.BASE_URL;

export default function ContactCard() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(contact.email); setCopied(true); } catch { setCopied(false); }
  };
  return (
    <>
      <h2 className="fl-h2">{contact.heading}</h2>
      <p className="fl-body">{contact.body}</p>
      <p className="fl-email">{contact.email}</p>
      <div className="fl-actions">
        <a className="fl-btn fl-btn-primary" href={`mailto:${contact.email}`}>Email Jose</a>
        <button type="button" className="fl-btn fl-btn-ghost" onClick={copy}>{copied ? 'Copied' : 'Copy email'}</button>
        <a className="fl-btn fl-btn-ghost" href={contact.linkedin} target="_blank" rel="noopener">LinkedIn</a>
      </div>
      <ul className="fl-resumes" id="resume-list">
        {availableResumes().map((r) => (
          <li key={r.id} data-resume={r.id}>
            <span>{r.label}</span>
            <a className="fl-link" href={`${base}${r.file}`} target="_blank" rel="noopener">Download PDF</a>
            <small>Updated {r.updated}</small>
          </li>
        ))}
      </ul>
      <p className="fl-details">{contact.details.join(' · ')}</p>
    </>
  );
}
