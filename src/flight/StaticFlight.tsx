import { Link } from 'react-router-dom';
import { flight } from './flightData';
import { STOP_LABEL, STOP_SECTIONS, type BeachTab } from './stops';
import StopContent from './StopContent';
import './flight.css';

const base = import.meta.env.BASE_URL;
const pad = (n: number) => String(n).padStart(3, '0');

/** Reduced motion, Save-Data or "Read as a page": every stop as a still section with its card in place. */
export default function StaticFlight({ beachTab, canFly }: { beachTab?: BeachTab; canFly: boolean }) {
  return (
    <div className="fl-root fl-static">
      {canFly && (
        <div className="fl-static-head">
          <span>Jose Garcia</span>
          <Link to="/">Back to the flight</Link>
        </div>
      )}
      {flight.stops.map((stop) => {
        const [first, ...rest] = STOP_SECTIONS[stop.id];
        return (
          <section
            key={stop.id}
            id={first}
            aria-labelledby={`fl-static-${stop.id}`}
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(6,8,13,.55), rgba(6,8,13,0) 60%), url(${base}flight/desktop/f${pad(stop.frame)}.webp)`,
            }}
          >
            {rest.map((id) => <span key={id} id={id} className="fl-anchor" style={{ top: 0 }} />)}
            <article className="fl-card">
              <p className="fl-eyebrow" id={`fl-static-${stop.id}`}><i />{STOP_LABEL[stop.id]} · {stop.place}</p>
              <div className="fl-inner"><StopContent id={stop.id} beachTab={beachTab} /></div>
            </article>
          </section>
        );
      })}
      <p className="fl-static-foot">Backgrounds: AI-rendered flight · not real footage</p>
    </div>
  );
}
