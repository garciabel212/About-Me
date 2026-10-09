import { navLinks } from '@/data/routes';

/**
 * Links from any page to a stop on the flight Home, in the brief's nav order.
 * src/data/__tests__/navigation.test.ts checks them against `navLinks` and `sectionIds`.
 */
export const homeSectionLinks = navLinks.map((l) => ({ label: l.label.toUpperCase(), href: `/${l.hash}` }));
