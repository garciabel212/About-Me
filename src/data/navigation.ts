/**
 * Links from any page to a section on Home. Each hash must match a section id
 * on Home; src/data/__tests__/navigation.test.ts fails the build if one doesn't.
 */
export const homeSectionLinks = [
  { label: 'WORK', href: '/#projects' },
  { label: 'EXPERIENCE', href: '/#experience' },
  { label: 'ABOUT', href: '/#who-i-am' },
  { label: 'CONTACT', href: '/#contact' },
] as const;
