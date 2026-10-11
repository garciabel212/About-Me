import { flight } from '@/flight/flightData';
import { homeSections } from '@/data/routes';

/**
 * Site navigation: a descriptive label for each Home section, with its Miami
 * stop as a secondary label. src/data/__tests__/navigation.test.ts checks it.
 */
export const homeSectionLinks = homeSections.map((s) => ({
  id: s.id,
  label: s.label,
  place: flight.stops.find((stop) => stop.id === s.stop)!.place,
  href: `/#${s.id}`,
}));
