import { Link } from 'react-router-dom';
import { capabilities } from '@/data/content';

export default function CapabilitiesCard() {
  return (
    <>
      <h2 className="fl-h2">What I help customers do</h2>
      <ul className="fl-rows">
        {capabilities.map((c) => (
          <li key={c.id}>
            <b>{c.title}</b>
            <span>{c.body}</span>
            <Link className="fl-link" to={c.href}>{c.linkLabel}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
