import { Fragment } from 'react';
import { AI_DISCLOSURE } from '@/flight/disclosure';
import Film from './Film';
import LightPath from './LightPath';
import PointSection from './Point';
import { points } from './points';
import './landing.css';

const POINT_IDS = points.map((p) => p.id);

/**
 * The Cinematic landing: the flight plays full-screen behind detailed points
 * laid out in a zig-zag, and one light joins them, drawing ahead of the reader.
 */
export default function FlightLanding({ motion }: { motion: boolean }) {
  return (
    <div className={`landing${motion ? '' : ' landing--still'}`}>
      <Film motion={motion} pointIds={POINT_IDS} />
      <div className="landing__veil" aria-hidden="true" />
      <LightPath motion={motion} />
      {points.map((p, i) => (
        <Fragment key={p.id}>
          {i > 0 && <div className="landing__gap" aria-hidden="true" />}
          <PointSection point={p} />
        </Fragment>
      ))}
      <div className="landing__veil--bottom" aria-hidden="true" />
      <p className="landing__disclosure">{AI_DISCLOSURE}</p>
    </div>
  );
}
