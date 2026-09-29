import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { veilStyle } from '../veil';

const LABEL = 'block font-mono text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-1';

export default function ServiceMapBeat() {
  const image = `${import.meta.env.BASE_URL}images/service_map_tablet.jpg`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-12 items-center">
      <div className="order-2 lg:order-1 lg:col-span-5 rounded-3xl p-5 sm:p-7 backdrop-blur-md" style={veilStyle}>
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">
          <span className="font-black text-[var(--accent)] mr-2">01</span>
          Field Service Operations &amp; Asset Intelligence
        </p>
        <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-4">
          Service Map Planner
        </h2>
        <dl className="space-y-3 text-sm sm:text-base leading-relaxed text-[var(--text-primary)]">
          <div className="hidden sm:block">
            <dt className={LABEL}>The operational problem</dt>
            <dd>
              Managing nationwide hardware installations across research universities and public libraries relied on
              fragmented spreadsheets, causing scheduling conflicts and version drift.
            </dd>
          </div>
          <div className="hidden sm:block">
            <dt className={LABEL}>My contribution</dt>
            <dd>Architecture · Product Design · Frontend Engineering</dd>
          </div>
          <div>
            <dt className={LABEL}>Value delivered</dt>
            <dd>
              Unified 100+ accounts, scanner inventories, and nationwide routing into an active daily internal tool with
              proactive compliance flags.
            </dd>
          </div>
        </dl>
        <Link
          to="/projects/service-map-planner"
          className="btn-primary mt-5 inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider shadow-[var(--shadow-blue)] group"
        >
          <span>Explore system</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </Link>
      </div>

      <div className="order-1 lg:order-2 lg:col-span-7">
        <img
          src={image}
          alt="Service Map Planner operational interface displayed on a field tablet"
          className="w-full aspect-[16/10] max-h-[26svh] lg:max-h-none object-cover rounded-2xl border border-[var(--border)] shadow-[var(--shadow-floating)]"
          loading="lazy"
        />
      </div>
    </div>
  );
}
