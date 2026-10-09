import type { WorkStatus } from '@/data/content';

export interface Asset {
  /** Path under public/, or undefined until the real asset exists. */
  src?: string;
  alt: string;
  caption: string;
  date: string;
  kind: 'employer' | 'personal' | 'demonstration';
  sampleData: boolean;
}

export interface CaseStudy {
  slug: 'service-map-planner' | 'aac-communication-app' | 'scale-garage-studio' | 'agent-trading-os';
  title: string;
  subtitle: string;
  status: WorkStatus | 'Experiment';
  updated: string;
  problem: string;
  who: string;
  role: string;
  constraints: string;
  approach: string;
  inspect: string[];
  result: string;
  remaining: string[];
  technologies: string[];
  assets: Asset[];
  related: CaseStudy['slug'];
  /** Rendered as a short "Note" under the result when present. */
  note?: string;
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'service-map-planner',
    title: 'Service Map Planner',
    subtitle: 'Organizing customer records and service planning',
    status: 'Working prototype',
    updated: 'October 2026',
    problem:
      'Preparing a service visit takes several connected pieces of information: the customer location, contacts, installed systems, software versions, previous work, and maintenance status. Those pieces were hard to see in one place.',
    who: 'Service engineers preparing customer visits and follow-up.',
    role:
      'I defined the records and relationships, the interface, the maintenance views, and the visit-planning workflow. I used AI-assisted development; the requirements, data model decisions, and checks are mine.',
    constraints:
      'Customer records are sensitive, so every screen shown here uses fictional institutions and locations. Access is restricted to approved, signed-in users.',
    approach:
      'I modelled sites, equipment, software, and service history as connected records, then built maintenance views that surface follow-up needs and incomplete information. The map view sequences nearby stops for a visit and shows driving distance and time.',
    inspect: [
      'A customer record connecting contacts, equipment, software, and service history.',
      'Maintenance views that show follow-up needs and incomplete information.',
      'A map view and visit-planning sequence using fictional institutions.',
    ],
    result:
      'The project demonstrates a connected view of customer and asset information with map-based visit planning.',
    remaining: [
      'Automated tests for the planning workflow.',
      'A read-only demo with sample data that anyone can open.',
    ],
    technologies: ['Next.js', 'Firebase'],
    assets: [
      { alt: 'Customer record showing contacts, equipment, software, and service history for a fictional institution', caption: 'Customer record (screenshot pending — fictional data)', date: 'October 2026', kind: 'personal', sampleData: true },
      { alt: 'Maintenance view listing follow-up needs and incomplete information for fictional institutions', caption: 'Maintenance view (screenshot pending — fictional data)', date: 'October 2026', kind: 'personal', sampleData: true },
      { alt: 'Map view with a sequenced visit plan between fictional institutions', caption: 'Visit planning on the map (screenshot pending — fictional data)', date: 'October 2026', kind: 'personal', sampleData: true },
    ],
    related: 'aac-communication-app',
  },
  {
    slug: 'aac-communication-app',
    title: 'AAC communication app',
    subtitle: 'Simple bilingual communication for a touch screen',
    status: 'Working prototype',
    updated: 'October 2026',
    problem:
      'Some adults can answer simple questions but find reading, coordination, and multi-step screens tiring. Communication needs few steps and targets that do not move.',
    who: 'An adult who communicates through yes/no answers and simple choices, and the people who support them.',
    role:
      'I listened to what the user and caregivers needed and turned those limits into interface decisions: fixed Sí/No positions, large buttons, adult-appropriate pictograms, and fewer taps. I used AI-assisted development; the requirements and the decisions to simplify are mine.',
    constraints:
      'Large touch targets, low reading effort, Spanish-first presentation with English, and no private family or medical information on this site.',
    approach:
      'The app opens on a Yes/No question screen and a two-choice screen, uses predefined Spanish and English phrases (not automatic translation), and speaks through the device’s text-to-speech. Caregiver settings control card size and accidental-touch filtering.',
    inspect: [
      'The Yes/No board with fixed positions.',
      'One choice screen and the language controls.',
    ],
    result:
      'A working Android app for large-target Yes/No and choice screens in Spanish and English.',
    remaining: [
      'A scoped accessibility assessment before making any compliance claim.',
      'Tested behavior with no network connection before making any offline claim.',
      'Exporting answer logs on the device.',
    ],
    technologies: ['React', 'TypeScript', 'Capacitor (Android)'],
    assets: [
      { alt: 'Yes and No answer screen with two large buttons', caption: 'Yes/No screen (screenshot pending)', date: 'October 2026', kind: 'personal', sampleData: true },
      { alt: 'Two-choice screen with large picture cards in Spanish', caption: 'Choice screen (screenshot pending)', date: 'October 2026', kind: 'personal', sampleData: true },
    ],
    related: 'scale-garage-studio',
    note: 'Pictographic symbols are by Sergio Palao for ARASAAC (arasaac.org), property of the Government of Aragón, under CC BY-NC-SA 4.0. Attribution is shown in the app.',
  },
  {
    slug: 'scale-garage-studio',
    title: 'Miniature Garage Configurator',
    subtitle: 'Exploring custom designs before fabrication',
    status: 'Working prototype',
    updated: 'October 2026',
    problem:
      'Customers choosing a custom miniature garage have to picture how layout and component choices come together before anything is printed.',
    who: 'Collectors who want a custom 1:18 model-car garage, and the person fabricating it.',
    role:
      'I designed the configuration model and the 3D preview, and I am shaping the preview to look like the printed part. I used AI-assisted development; the product decisions and fit checks are mine.',
    constraints:
      'The preview must resemble the 3D-printed result, run smoothly in a browser, and stay within what a desktop printer can make.',
    approach:
      'A structured design (layout, parts, finishes) drives a real-time 3D preview with a display-car fit check. Pricing and printability checks run over seed data; checkout is a mock.',
    inspect: ['A real configurator screenshot and a short interaction recording.', 'A photo of a printed part, when available.'],
    result: 'A working 1:18 configurator preview with fit check, pricing estimates, and printability checks.',
    remaining: [
      'Photos of printed parts next to the preview.',
      'Export of print-ready files, once it is built and verified.',
      'Additional scales, once they are supported.',
    ],
    technologies: ['React Three Fiber', 'Drei', 'Next.js'],
    assets: [
      { alt: 'Configurator showing a 1:18 garage with a display car', caption: 'Configurator (concept render until a screenshot is added)', date: 'October 2026', kind: 'personal', sampleData: true },
    ],
    related: 'service-map-planner',
  },
  {
    slug: 'agent-trading-os',
    title: 'Agent Trading OS',
    subtitle: 'An experiment in making agent decisions inspectable',
    status: 'Experiment',
    updated: 'October 2026',
    problem:
      'Automated decision-making is easy to over-trust. I wanted every proposal, risk check, and skipped trade recorded so it can be replayed and questioned.',
    who: 'Me — a learning project, not a service for customers.',
    role: 'I designed the event history, replay, and controlled experiments. I used AI-assisted development.',
    constraints: 'Paper trading only. No real money. No performance claims without a reproducible evaluation.',
    approach:
      'Rule-based agents propose paper trades; each proposal, risk check, and skipped trade is logged. Today the agents are fixed rules, not language models; model-driven agents are planned.',
    inspect: ['The event timeline and replay (screenshot pending).'],
    result: 'A working paper-trading simulation with an inspectable event history.',
    remaining: [
      'Scoring computed from settled outcomes rather than fixed values.',
      'A reproducible evaluation against a simple baseline.',
    ],
    technologies: ['React', 'TypeScript', 'Python', 'FastAPI'],
    assets: [
      { alt: 'Event timeline listing agent proposals and skipped trades', caption: 'Event timeline (screenshot pending)', date: 'October 2026', kind: 'personal', sampleData: true },
    ],
    related: 'service-map-planner',
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
