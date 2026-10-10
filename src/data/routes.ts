/**
 * Section ids on the Home page (the flight), in the brief's page order. Each id
 * is an anchor at its stop (src/flight/stops.ts); navigation.ts builds the site
 * nav from `navLinks`.
 */
export const sectionIds = [
  'intro',
  'capabilities',
  'projects',
  'experience',
  'who-i-am',
  'about',
  'resume',
  'contact',
] as const;

export const navLinks = [
  { label: 'Work', hash: '#projects' },
  { label: 'Experience', hash: '#experience' },
  { label: 'About', hash: '#about' },
  { label: 'Resume', hash: '#resume' },
  { label: 'Contact', hash: '#contact' },
] as const;

/** Old URLs that must keep working: path → Home section. */
export const legacyRoutes = [
  { from: '/intro', hash: 'intro' },
  { from: '/who-i-am', hash: 'who-i-am' },
  { from: '/work', hash: 'projects' },
  { from: '/workflow', hash: 'who-i-am' },
  { from: '/capabilities', hash: 'capabilities' },
  { from: '/about', hash: 'about' },
  { from: '/projects', hash: 'projects' },
  { from: '/experience', hash: 'experience' },
  { from: '/contact', hash: 'contact' },
  { from: '/projects/enterprise-deployment', hash: 'experience' },
] as const;
