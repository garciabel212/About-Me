import { flight } from '@/flight/flightData';
import { sites } from '@/survey/sites';
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
 * Cinematic mode's links: the survey sheets in route order, each by its
 * primary anchor. Downtown has no Home section of its own and About is part of
 * the River sheet, so the route reads Overview, Projects, Expertise,
 * Experience, Contact.
 */
export const cinematicSectionLinks = sites.flatMap((site) => homeSectionLinks.filter((l) => l.id === site.anchors[0]));
