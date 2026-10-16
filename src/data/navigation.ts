import { flight } from '@/flight/flightData';
import { points } from '@/landing/points';
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

/**
 * Cinematic mode's links: the landing points in page order, each by its
 * primary anchor. "More work" has no Home section of its own and About is part
 * of the closing point, so the route reads Overview, Experience, Expertise,
 * Projects, Contact.
 */
export const cinematicSectionLinks = points.flatMap((point) => homeSectionLinks.filter((l) => l.id === point.anchors[0]));
