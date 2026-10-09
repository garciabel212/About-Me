// Single source of truth for public copy. Source: Jose_Garcia_Website_Content_Brief.docx
// (2026-10-08). Claims here must be ones Jose can back up; see docs/superpowers/specs.

export type WorkStatus =
  | 'Personal project'
  | 'Working prototype'
  | 'Demo with sample data'
  | 'Deployed tool';

export const site = {
  name: 'Jose Garcia',
  headline: 'Customer Solutions | Implementation | Technical Consulting',
  title: 'Jose Garcia | Customer Solutions and Implementation',
  description:
    'Jose Garcia helps customers implement, understand, and support technical systems. Explore his experience, project case studies, and resume.',
} as const;

export const hero = {
  heading: 'Helping customers understand, implement, and use technology.',
  intro:
    'I work with customers to understand their needs, explain technical options, and get software and integrated systems working in their environment. My experience includes product demonstrations, implementation, training, troubleshooting, and ongoing support.',
  details: [
    'South Florida',
    'English and Spanish',
    'Open to remote and South Florida opportunities',
    'Available for up to 40% travel',
  ],
  availability: 'Open to opportunities in implementation and customer solutions.',
  workCta: 'View My Work',
  resumeCta: 'Download Resume',
  emailCta: 'Email Me',
} as const;

export const evidenceStrip = [
  'Customer delivery since 2022',
  'Previous network operations experience',
  'Fluent in English and Spanish',
] as const;

export interface Capability {
  id: string;
  title: string;
  body: string;
  /** Experience section (`#experience`) or a case study route. */
  href: string;
  linkLabel: string;
}

export const capabilities: Capability[] = [
  {
    id: 'requirements',
    title: 'Understand the requirements',
    body: 'I work with customers and their IT teams to understand the workflow, environment, and requirements before recommending a configuration.',
    href: '#experience',
    linkLabel: 'See my experience',
  },
  {
    id: 'demonstrate',
    title: 'See how the solution works',
    body: 'I support product demonstrations and technical conversations that help customers understand what a solution can do and how it fits their work.',
    href: '#experience',
    linkLabel: 'See my experience',
  },
  {
    id: 'implement',
    title: 'Get the system running',
    body: 'I coordinate installation, application configuration, licensing, validation, and go-live support for software and integrated systems.',
    href: '#experience',
    linkLabel: 'See my experience',
  },
  {
    id: 'train',
    title: 'Use the product confidently',
    body: 'I guide users and administrators through the workflows they need, explain technical concepts clearly, and stay involved after deployment.',
    href: '/projects/aac-communication-app',
    linkLabel: 'See how I design for users',
  },
  {
    id: 'troubleshoot',
    title: 'Resolve technical problems',
    body: 'I investigate application, Windows, network, and hardware communication issues, document findings, and coordinate the next steps with the right teams.',
    href: '/projects/service-map-planner',
    linkLabel: 'See how I track service history',
  },
];

export interface ExperienceEntry {
  id: 'dlsg' | 'globenet';
  title: string;
  organization: string;
  period: string;
  location: string;
  summary: string;
  bullets: string[];
  context?: string;
}

export const experience: ExperienceEntry[] = [
  {
    id: 'dlsg',
    title: 'Service Engineer',
    organization: 'Digital Library Systems Group / Image Access',
    period: 'October 2022 to Present',
    location: 'Boca Raton, Florida',
    summary:
      'I help institutional customers implement and support workflow and document-management systems. My work includes understanding requirements, configuring software and connected equipment, training users, and resolving technical issues. I also support Account Executives with product demonstrations and technical presentations.',
    bullets: [
      'Lead onsite and remote implementations, including installation, configuration, validation, go-live, and continued support.',
      'Work with customer IT, procurement, and operations teams to assess workflows and technical requirements.',
      'Manage application versions, licensing, activation, customer settings, and software upgrades in Windows environments.',
      'Deliver onboarding and training, diagnose issues, and coordinate escalations with engineering, support, and customer IT.',
      'Support demonstrations and customer meetings; document activities, findings, and service history in Salesforce CRM.',
    ],
    context:
      'Product context: enterprise workflow and document-management applications, book scanning and self-service systems, and network-connected hardware. Supported 100+ institutional accounts.',
  },
  {
    id: 'globenet',
    title: 'Network Operations Center Engineer',
    organization: 'Globenet',
    period: 'November 2021 to September 2022',
    location: 'Boca Raton, Florida',
    summary:
      'I monitored enterprise networks, investigated connectivity incidents, and supported service restoration through troubleshooting, root-cause analysis, and technical escalation. The role strengthened how I document issues and coordinate work during service incidents.',
    bullets: [],
  },
];

export type ResponsibilityName =
  | 'Customer Communication'
  | 'Technical Problem Solving'
  | 'Software'
  | 'Networking'
  | 'Hardware'
  | 'Implementation'
  | 'Training'
  | 'Solution Demonstrations'
  | 'Post-Sale Support';

export interface ApproachStep {
  step: string;
  name: string;
  subtitle: string;
  description: string;
  responsibilities: ResponsibilityName[];
  covers: string[];
  /** Real example from the experience section. */
  example: string;
}

export const approach: ApproachStep[] = [
  {
    step: '01',
    name: 'UNDERSTAND',
    subtitle: 'Understand the workflow',
    description:
      'I start by understanding what the customer is trying to accomplish and the environment they are working in.',
    responsibilities: ['Customer Communication', 'Technical Problem Solving'],
    covers: ['What the customer needs to accomplish', 'Their IT environment and constraints', 'Requirements agreed before configuration'],
    example: 'At DLSG / Image Access: working with customer IT, procurement, and operations teams to assess workflows and technical requirements.',
  },
  {
    step: '02',
    name: 'EXPLAIN',
    subtitle: 'Explain the options',
    description: 'I explain the options, make the requirements clear, and help coordinate implementation.',
    responsibilities: ['Solution Demonstrations', 'Customer Communication'],
    covers: ['Plain-language options and trade-offs', 'Demonstrations that fit the customer’s work', 'A clear plan for who does what'],
    example: 'At DLSG / Image Access: supporting Account Executives with product demonstrations and technical presentations.',
  },
  {
    step: '03',
    name: 'CONFIGURE',
    subtitle: 'Configure and validate',
    description: 'I validate the setup so the system works in the customer’s environment before it goes live.',
    responsibilities: ['Implementation', 'Software', 'Hardware', 'Networking'],
    covers: ['Installation, configuration, and licensing', 'Validation in the customer’s environment', 'Go-live support'],
    example: 'At DLSG / Image Access: leading onsite and remote implementations in Windows environments, from installation to go-live.',
  },
  {
    step: '04',
    name: 'TRAIN',
    subtitle: 'Train and hand over',
    description: 'I train the people using it and hand over what they need to work confidently.',
    responsibilities: ['Training', 'Customer Communication'],
    covers: ['Onboarding for users and administrators', 'The workflows each person needs', 'Documentation of what was set up'],
    example: 'At DLSG / Image Access: onboarding and training for users and administrators.',
  },
  {
    step: '05',
    name: 'FOLLOW UP',
    subtitle: 'Follow up and support',
    description: 'I follow through when questions or issues come up after deployment.',
    responsibilities: ['Post-Sale Support', 'Technical Problem Solving'],
    covers: ['Troubleshooting and escalation', 'Service history kept in Salesforce CRM', 'Continued customer contact'],
    example: 'At DLSG / Image Access: diagnosing issues and coordinating escalations with engineering, support, and customer IT.',
  },
];

export interface ToolItem {
  name: string;
  example: string;
}

export const tools = {
  professional: [
    { name: 'Windows applications', example: 'Managing versions, licensing, activation, and upgrades at customer sites.' },
    { name: 'Networking and connectivity', example: 'Troubleshooting connections between applications and network-attached hardware.' },
    { name: 'Integrated hardware and software', example: 'Installing and validating scanners and the software that drives them.' },
    { name: 'Salesforce CRM', example: 'Recording customer activity, findings, and service history.' },
    { name: 'Onboarding, demonstrations, and training', example: 'Walking users and administrators through the workflows they need.' },
    { name: 'Remote diagnostics and escalation', example: 'Coordinating with customer IT, support, and engineering to resolve issues.' },
  ] satisfies ToolItem[],
  project: [
    { name: 'Next.js and Firebase', example: 'Service Map Planner: customer records, maintenance views, and visit planning.' },
    { name: 'React and TypeScript', example: 'The bilingual communication app and this portfolio.' },
    { name: 'React Three Fiber and Drei', example: 'The miniature garage configurator’s 3D preview.' },
    { name: 'AI-assisted prototyping', example: 'Experimental agent workflows in the Lab, with scope stated on the page.' },
  ] satisfies ToolItem[],
};

export interface EducationItem {
  name: string;
  issuer: string;
  detail?: string;
}

export const education: EducationItem[] = [
  { name: 'B.S. Computer Science & Engineering', issuer: 'Florida Atlantic University' },
  { name: 'Certificate in Data Science & Analytics', issuer: 'Florida Atlantic University', detail: '2022' },
  { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', detail: '2022' },
];

export const languages = 'English and Spanish, fluent';

export const bio = [
  'I am a customer-facing technical professional based in South Florida. My background combines a degree in Computer Science & Engineering, network operations experience, and hands-on work implementing and supporting customer systems. I enjoy understanding how people work, explaining technical options, and staying involved until the solution is working for them.',
  'Outside my day-to-day work, I build practical tools and explore 3D design and fabrication. Those projects give me another way to test ideas, learn new tools, and improve how people interact with technology. I am fluent in English and Spanish.',
] as const;

export interface ResumeVersion {
  id: 'master' | 'implementation' | 'solutions' | 'accounts';
  label: string;
  /** File under public/, or null until the PDF exists. */
  file: string | null;
  updated: string;
}

export const resumeVersions: ResumeVersion[] = [
  { id: 'master', label: 'Master resume', file: 'Jose-Garcia-Resume.pdf', updated: 'October 2026' },
  { id: 'implementation', label: 'Implementation and Professional Services', file: null, updated: 'October 2026' },
  { id: 'solutions', label: 'Solutions Engineering and Consulting', file: null, updated: 'October 2026' },
  { id: 'accounts', label: 'Technical Accounts and Customer Success', file: null, updated: 'October 2026' },
];

export function availableResumes(): (ResumeVersion & { file: string })[] {
  return resumeVersions.filter((r): r is ResumeVersion & { file: string } => r.file !== null);
}

export const contact = {
  heading: 'Let us talk about your team',
  body: 'I am interested in customer-facing roles where I can help people evaluate technology, implement it successfully, and get more value from the tools they use. My focus includes implementation, solutions consulting, solutions engineering, and technical account support.',
  email: 'garciabel212@gmail.com',
  linkedin: 'https://www.linkedin.com/in/jose-abel-garcia/',
  details: ['South Florida', 'English and Spanish', 'Available for up to 40% travel'],
} as const;

export interface FeaturedWork {
  slug: 'service-map-planner' | 'aac-communication-app' | 'scale-garage-studio';
  title: string;
  subtitle: string;
  status: WorkStatus;
  updated: string;
  summary: string;
  contribution: string;
  technologies: string[];
  href: string;
  /** Path under public/images; imageIsConcept=true means a render/concept, not a real screenshot. */
  image: string;
  imageIsConcept: boolean;
}

export const featuredWork: FeaturedWork[] = [
  {
    slug: 'service-map-planner',
    title: 'Service Map Planner',
    subtitle: 'Organizing customer records and service planning',
    status: 'Working prototype',
    updated: 'October 2026',
    summary:
      'I designed Service Map Planner to bring customer sites, equipment, software, maintenance status, and service history into one place. The project connects those records with map-based visit planning to support service preparation and customer follow-up.',
    contribution: 'Defined the records, relationships, interface, maintenance views, and visit-planning workflow.',
    technologies: ['Next.js', 'Firebase'],
    href: '/projects/service-map-planner',
    image: 'images/service-map-preview.webp',
    imageIsConcept: true, // existing preview; replace with fictional-data screenshots
  },
  {
    slug: 'aac-communication-app',
    title: 'AAC communication app',
    subtitle: 'Simple bilingual communication for a touch screen',
    status: 'Working prototype',
    updated: 'October 2026',
    summary:
      'I am developing a bilingual communication app focused on large touch targets and simple choices. It includes Yes/No and choice-based screens, with Spanish and English presentation options.',
    contribution: 'Turned a real user’s limits into interface decisions: fixed target positions, large buttons, fewer taps.',
    technologies: ['React', 'TypeScript', 'Android (Capacitor)'],
    href: '/projects/aac-communication-app',
    image: '',
    imageIsConcept: true, // no screenshot yet; consumers must render a labeled placeholder
  },
  {
    slug: 'scale-garage-studio',
    title: 'Miniature Garage Configurator',
    subtitle: 'Exploring custom designs before fabrication',
    status: 'Working prototype',
    updated: 'October 2026',
    summary:
      'I am developing a 3D configurator for miniature model-car garages. It brings layout and component choices into a visual workflow so a design can be discussed and refined before printing and assembly.',
    contribution: 'Designed the configuration model and the 3D preview, focused on the 1:18 scale.',
    technologies: ['React Three Fiber', 'Drei'],
    href: '/projects/scale-garage-studio',
    image: 'images/hero_garage_diorama.jpg',
    imageIsConcept: true, // render, not a screenshot
  },
];
