import { Link } from 'react-router-dom';
import { method, type Proof } from '@/data/content';

function Cell({ proofs }: { proofs: Proof[] }) {
  return (
    <ul className="matrix__proofs">
      {proofs.map((p) => (
        <li key={p.text}>
          <Link to={p.href} className="matrix__source">{p.source}</Link>
          <span>{p.text}</span>
        </li>
      ))}
    </ul>
  );
}

/** How I work, shown once: each step with where it shows at work and in my projects. */
export default function EvidenceMatrix() {
  return (
    <div className="matrix">
      <h3 id="method-title">How I work, and where it shows</h3>
      <table aria-labelledby="method-title">
        <thead>
          <tr>
            <th scope="col">Step</th>
            <th scope="col">At work</th>
            <th scope="col">In my projects</th>
          </tr>
        </thead>
        <tbody>
          {method.map((m, i) => (
            <tr key={m.step}>
              <th scope="row">
                <span className="matrix__num" aria-hidden="true">{i + 1}</span>
                {m.step}
              </th>
              <td data-label="At work"><Cell proofs={m.work} /></td>
              <td data-label="In my projects"><Cell proofs={m.projects} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
