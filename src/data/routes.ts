import type { StopId } from '@/flight/flightData';

/**
 * Home sections in page order. Both viewing modes render the same sections in
 * this order; in Cinematic mode each one holds at its stop on the Miami flight.
 */
export const homeSections = [
  { id: 'overview', label: 'Overview', stop: 'river' },
  { id: 'experience', label: 'Experience', stop: 'brickell' },
  { id: 'expertise', label: 'Expertise', stop: 'downtown' },
  { id: 'projects', label: 'Projects', stop: 'bay' },
  { id: 'about', label: 'About', stop: 'beach' },
  { id: 'contact', label: 'Contact', stop: 'sunset' },
] as const satisfies readonly { id: string; label: string; stop: StopId }[];

export type SectionId = (typeof homeSections)[number]['id'];

export const sectionIds: SectionId[] = homeSections.map((s) => s.id);

/** Old section ids that links elsewhere may still use: old id → current section. */
export const hashAliases: Record<string, SectionId> = {
  intro: 'overview',
  capabilities: 'expertise',
  'who-i-am': 'expertise',
  resume: 'contact',
};

/** Old URLs that must keep working: path → Home section. */
export const legacyRoutes = [
  { from: '/intro', hash: 'overview' },
  { from: '/who-i-am', hash: 'expertise' },
  { from: '/work', hash: 'projects' },
  { from: '/workflow', hash: 'expertise' },
  { from: '/capabilities', hash: 'expertise' },
  { from: '/about', hash: 'about' },
  { from: '/projects', hash: 'projects' },
  { from: '/experience', hash: 'experience' },
  { from: '/contact', hash: 'contact' },
  { from: '/projects/enterprise-deployment', hash: 'experience' },
] as const satisfies readonly { from: string; hash: SectionId }[];
