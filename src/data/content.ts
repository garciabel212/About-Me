// Single source of truth for public copy. Facts mirror the master résumé
// (public/Jose-Garcia-Resume.pdf); claims here must be ones Jose can back up.
// Metrics, customer counts, revenue, and certifications stay out unless verified.

export type WorkStatus =
  | 'Personal project'
  | 'Working prototype'
  | 'Demo with sample data'
  | 'Deployed tool';

export const site = {
  name: 'Jose Garcia',
  headline: 'Customer Solutions & Implementation',
  title: 'Jose Garcia | Customer Solutions and Implementation',
  description:
    'Jose Garcia helps customers understand technical solutions, get systems running, and use them confidently. Explore his experience, projects, and résumé.',
} as const;

export const overview = {
  title: 'Customer Solutions & Implementation',
  statement: 'I help customers understand technical solutions, get systems running, and use them confidently.',
  evidence: ['Customer delivery since 2022', 'English & Spanish', 'South Florida'],
  availability: ['Open to remote and South Florida roles', 'Up to 40% travel'],
  workCta: 'View My Work',
  resumeCta: 'Download Resume',
} as const;

export interface Contribution {
  label: string;
  text: string;
}

export interface ExperienceEntry {
  id: 'dlsg' | 'globenet';
  title: string;
  organization: string;
  period: string;
  location: string;
  /** Primary role, or earlier work that supports it. */
  weight: 'primary' | 'supporting';
  summary: string;
  contributions: [Contribution, Contribution, Contribution];
  /** Shown behind "More detail"; résumé wording. */
  details: string[];
}

export const experience: ExperienceEntry[] = [
  {
    id: 'dlsg',
    title: 'Service Engineer',
    organization: 'Digital Library Systems Group / Image Access',
    period: 'October 2022 – Present',
    location: 'Boca Raton, Florida',
    weight: 'primary',
    summary:
      'I help institutions implement and support enterprise workflow and document-management software and the specialized hardware it runs with. I work with customer IT, operations, and sales teams from requirements to follow-up.',
    contributions: [
      {
        label: 'Implementation',
        text: 'Lead onsite and remote installations: configuration, licensing and activation, validation, and go-live support.',
      },
      {
        label: 'Customer communication',
        text: 'Discuss requirements with customer teams, support product demonstrations, and deliver user training and handover.',
      },
      {
        label: 'Technical support',
        text: 'Troubleshoot application, Windows, network, and hardware issues; escalate, document findings, and follow up.',
      },
    ],
    details: [
      'Lead onsite and remote implementations of enterprise workflow and document-management software, coordinating installation, configuration, system validation, go-live, and post-sale support.',
      'Gather requirements with customer IT, procurement, and operational stakeholders; assess workflows and network connectivity to configure integrated software and specialized hardware.',
      'Install, configure, and upgrade Windows-based applications; manage software versions, licensing and activation, and customer-specific settings.',
      'Diagnose application, operating system, network, and software-to-hardware communication issues; coordinate escalations with engineering, support, and customer IT teams.',
      'Deliver customer onboarding and user and administrator training; coordinate deployment logistics and follow-up, documenting activity and service history in Salesforce CRM.',
      'Support Account Executives with solution demonstrations and technical presentations for customer leadership, IT teams, and other stakeholders.',
    ],
  },
  {
    id: 'globenet',
    title: 'Network Operations Center Engineer',
    organization: 'Globenet',
    period: 'November 2021 – September 2022',
    location: 'Boca Raton, Florida',
    weight: 'supporting',
    summary:
      'I monitored enterprise networks and helped restore service during connectivity incidents. The role shaped how I troubleshoot, document, and coordinate during an incident.',
    contributions: [
      { label: 'Monitoring', text: 'Monitored enterprise networks and investigated connectivity incidents as they happened.' },
      { label: 'Troubleshooting', text: 'Performed root-cause analysis to support service restoration.' },
      { label: 'Incident coordination', text: 'Coordinated technical escalations and documented findings until incidents were resolved.' },
    ],
    details: [],
  },
];

export interface Expertise {
  id: 'understand' | 'implement' | 'train' | 'troubleshoot';
  title: string;
  /** 20–35 words. */
  body: string;
  /** Home anchor (`/#…`) or case-study route. */
  href: string;
  linkLabel: string;
}

export const expertise: Expertise[] = [
  {
    id: 'understand',
    title: 'Understand and demonstrate',
    body: 'I learn how a customer’s team works today, then show how the solution fits that workflow. I support Account Executives with product demonstrations and technical presentations.',
    href: '/projects/service-map-planner',
    linkLabel: 'Mapping a service workflow',
  },
  {
    id: 'implement',
    title: 'Implement and configure',
    body: 'I coordinate installation, configuration, licensing, and validation in the customer’s Windows and network environment, then support go-live so the system works the way they need.',
    href: '/#exp-dlsg',
    linkLabel: 'Implementation at DLSG / Image Access',
  },
  {
    id: 'train',
    title: 'Train and onboard',
    body: 'I walk users and administrators through the workflows they need, explain technical ideas in plain language, and hand over notes so they can keep working confidently.',
    href: '/projects/aac-communication-app',
    linkLabel: 'Designing for confident use',
  },
  {
    id: 'troubleshoot',
    title: 'Troubleshoot and support',
    body: 'I investigate application, Windows, network, and hardware communication issues, document what I find, and coordinate practical next steps with engineering, support, and customer IT.',
    href: '/#exp-globenet',
    linkLabel: 'Incident work at Globenet',
  },
];

/** How I work, shown once. */
export const method = ['Understand', 'Explain', 'Configure', 'Train', 'Follow up'] as const;

export type ImageKind = 'screenshot' | 'concept';

export interface ProjectImage {
  /** Path under public/. */
  src: string;
  /** Optional 800 px wide copy for small screens. */
  small?: string;
  kind: ImageKind;
  alt: string;
  caption: string;
}

export interface Project {
  slug: 'service-map-planner' | 'aac-communication-app' | 'scale-garage-studio';
  title: string;
  /** What the project emphasizes, in a few words. */
  focus: string;
  problem: string;
  audience: string;
  contribution: string;
  status: WorkStatus;
  statusNote: string;
  href: string;
  /** Path under public/, or null for a text-led card until a real screenshot exists. */
  image: ProjectImage | null;
}

export const projects: Project[] = [
  {
    slug: 'service-map-planner',
    title: 'Service Map Planner',
    focus: 'Workflow design for service planning',
    problem:
      'Preparing a service visit means checking a customer’s location, contacts, equipment, software, maintenance status, and past work. Those details were hard to see in one place.',
    audience: 'Service engineers preparing customer visits and follow-up.',
    contribution:
      'I defined the records and how they connect, designed the maintenance views, and shaped the visit-planning workflow. Built with AI-assisted development.',
    status: 'Working prototype',
    statusNote: 'Private app; not open to the public',
    href: '/projects/service-map-planner',
    image: {
      src: 'images/service_map_tablet.jpg',
      kind: 'concept',
      alt: 'Concept image of a map-based service planner on a tablet, with fictional library locations',
      caption: 'Concept image, not a screenshot of the app',
    },
  },
  {
    slug: 'aac-communication-app',
    title: 'AAC communication app',
    focus: 'Accessible, bilingual interaction',
    problem:
      'Some adults can answer yes/no questions but tire quickly with reading and multi-step screens. Communication needs few steps and buttons that never move.',
    audience: 'An adult who communicates with yes/no answers and simple choices, and the people who support them.',
    contribution:
      'I turned the user’s limits into design rules: fixed Sí/No positions, large targets, Spanish-first phrases with English, and fewer taps. Built with AI-assisted development.',
    status: 'Working prototype',
    statusNote: 'Android tablet app',
    href: '/projects/aac-communication-app',
    image: {
      src: 'images/projects/aac-yes-no.webp',
      small: 'images/projects/aac-yes-no-800.webp',
      kind: 'screenshot',
      alt: 'AAC app answer screen: the question “¿Tienes sed?” above a large green Sí button on the left and a large red No button on the right',
      caption: 'Screenshot of the Yes/No answer screen, with the app’s default questions',
    },
  },
  {
    slug: 'scale-garage-studio',
    title: 'Miniature Garage Configurator',
    focus: 'Requirements, configuration, and fabrication limits',
    problem:
      'A custom miniature garage has to be agreed before it is printed. Customers find it hard to picture how layout and part choices come together.',
    audience: 'Collectors ordering a custom 1:18 model-car garage, and the person who prints it.',
    contribution:
      'I turned the product into a structured configuration model, built the 3D preview with a display-car fit check, and added printability checks. Built with AI-assisted development.',
    status: 'Working prototype',
    statusNote: 'Runs locally; checkout is a mock',
    href: '/projects/scale-garage-studio',
    image: {
      src: 'images/projects/garage-configurator.webp',
      small: 'images/projects/garage-configurator-800.webp',
      kind: 'screenshot',
      alt: 'Garage configurator: preset list on the left and a 3D preview of a glass-and-steel 1:18 garage with a display car, with fit, size, part count, printer, and price shown below',
      caption: 'Screenshot of the configurator with sample presets and pricing',
    },
  },
];

export const about = {
  bio: [
    'I like practical problems and the people who have them. I listen to how a team works, explain the options in plain language, and stay involved until the system is running.',
    'I studied Computer Science & Engineering at Florida Atlantic University and started my career in network operations. Outside work, I build small tools for real needs and learn new technology by using it.',
  ],
  portrait: {
    src: 'images/jose-portrait-320.webp',
    alt: 'Portrait of Jose Garcia',
  },
} as const;

export interface EducationItem {
  name: string;
  issuer: string;
}

export const education: EducationItem[] = [
  { name: 'B.S. Computer Science & Engineering', issuer: 'Florida Atlantic University' },
  { name: 'Certificate in Data Science & Analytics', issuer: 'Florida Atlantic University' },
];

export const languages = 'English and Spanish, fluent';

export interface ToolGroup {
  name: string;
  items: string[];
}

/** Grouped by what the tools are used for; résumé wording. */
export const toolGroups: ToolGroup[] = [
  {
    name: 'Applications and systems',
    items: ['Enterprise workflow and document-management software', 'Windows-based applications', 'Network-connected systems', 'Integrated software and hardware'],
  },
  {
    name: 'Deployment and support',
    items: ['Installation and configuration', 'Licensing and activation', 'Upgrades and version management', 'System testing and go-live', 'Remote diagnostics'],
  },
  {
    name: 'Customer operations',
    items: ['Salesforce CRM', 'Requirements gathering', 'Solution demonstrations', 'User and administrator training', 'Technical escalations'],
  },
  {
    name: 'Project tools',
    items: ['Next.js and Firebase', 'React and TypeScript', 'React Three Fiber', 'AI-assisted development'],
  },
];

export const contact = {
  heading: 'Let’s talk about your team.',
  body: 'I’m interested in customer-facing technical roles where I can help people evaluate technology, implement it successfully, and use it confidently.',
  email: 'garciabel212@gmail.com',
  linkedin: 'https://www.linkedin.com/in/jose-abel-garcia/',
  details: ['South Florida', 'English & Spanish', 'Remote or on-site, up to 40% travel'],
} as const;
