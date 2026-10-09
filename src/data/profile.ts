/**
 * Single source of truth for contact details, positioning, and the résumé.
 * Facts here mirror the master résumé; change them there first, then here.
 */
export const profile = {
  title: 'Solutions Engineer',
  focus: 'Enterprise Software Solutions',
  /** New public positioning line (see content.ts); the Home still shows title + focus until it is redesigned. */
  headline: 'Customer Solutions | Implementation | Technical Consulting',
  email: 'garciabel212@gmail.com',
  linkedin: 'https://www.linkedin.com/in/jose-abel-garcia/',
  resumeFile: 'Jose-Garcia-Resume.pdf',
} as const;

export const mailto = `mailto:${profile.email}`;

/** Résumé URL that respects Vite's base path (GitHub Pages serves under /About-Me/). */
export const resumeUrl = `${import.meta.env.BASE_URL}${profile.resumeFile}`;

/** Headline credentials shown in the hero, in reading order. */
export const credentials = [
  'Service Engineer at DLSG / Image Access, Oct 2022 – present',
  'Previously NOC Engineer at GlobeNet',
  'B.S. Computer Science & Engineering, FAU',
  'AWS Certified Cloud Practitioner',
  'English & Spanish, fluent',
] as const;
