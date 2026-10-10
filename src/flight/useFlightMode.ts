import { useEffect, useState } from 'react';

export type FlightMode = 'desktop' | 'mobile' | 'static';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const MOBILE = '(max-width: 767px)';

function readMode(): FlightMode {
  if (typeof window === 'undefined') return 'static';
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (window.matchMedia(REDUCED_MOTION).matches || connection?.saveData === true) return 'static';
  return window.matchMedia(MOBILE).matches ? 'mobile' : 'desktop';
}

/** Flight presentation mode; updates when motion preference or viewport width changes. */
export function useFlightMode(): FlightMode {
  const [mode, setMode] = useState<FlightMode>(readMode);

  useEffect(() => {
    const queries = [REDUCED_MOTION, MOBILE].map((query) => window.matchMedia(query));
    const onChange = () => setMode(readMode());
    queries.forEach((query) => query.addEventListener('change', onChange));
    return () => queries.forEach((query) => query.removeEventListener('change', onChange));
  }, []);

  return mode;
}
