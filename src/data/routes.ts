/**
 * Section ids on the Home page, in the brief's page order. This is the target
 * contract: 'about' and 'resume' arrive with the new Home, and the nav in
 * navigation.ts is switched to `navLinks` then (its test checks ids against
 * the scene source, so it stays accurate until that switch).
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
  // Flip to 'about' when Home gains that section.
  { from: '/about', hash: 'who-i-am' },
  { from: '/projects', hash: 'projects' },
  { from: '/experience', hash: 'experience' },
  { from: '/contact', hash: 'contact' },
  { from: '/projects/enterprise-deployment', hash: 'experience' },
] as const;
