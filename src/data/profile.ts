/**
 * Single source of truth for contact details and the résumé.
 * Facts here mirror the master résumé; change them there first, then here.
 */
export const profile = {
  email: 'garciabel212@gmail.com',
  linkedin: 'https://www.linkedin.com/in/jose-abel-garcia/',
  github: 'https://github.com/garciabel212',
  resumeFile: 'Jose-Garcia-Resume.pdf',
} as const;

export const mailto = `mailto:${profile.email}`;

/**
 * Résumé URL that respects Vite's base path (GitHub Pages serves under /About-Me/).
 * Always render it with a plain <a href>, never a router <Link>: the HashRouter
 * would turn it into an empty app route (#/About-Me/…pdf).
 */
export const resumeUrl = `${import.meta.env.BASE_URL}${profile.resumeFile}`;
