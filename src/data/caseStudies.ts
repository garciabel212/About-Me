import type { WorkStatus } from '@/data/content';

export interface Asset {
  /** Path under public/, or undefined until the real asset exists. */
  src?: string;
  /** Optional 800 px wide copy for small screens. */
  small?: string;
  alt: string;
  caption: string;
  /** A real interface capture, or conceptual imagery that must be labelled as such. */
  kind: 'screenshot' | 'concept';
}

export interface Decision {
  title: string;
  body: string;
}

export interface CaseStudy {
  slug: 'service-map-planner' | 'aac-communication-app' | 'scale-garage-studio' | 'agent-trading-os';
  title: string;
  subtitle: string;
  status: WorkStatus | 'Experiment';
  statusNote: string;
  updated: string;
  /** Two short sentences: what it is and why it exists. */
  summary: string;
  hero: Asset;
  role: string;
  users: string;
  problem: string;
  decisions: Decision[];
  evidence: Asset[];
  result: string;
  next: string[];
  technologies: string[];
  related: CaseStudy['slug'];
  /** Rendered as a short note under the result when present. */
  note?: string;
}

const AI_ASSISTED = 'I built it with AI-assisted development: AI tools wrote much of the code, while the requirements, design decisions, and checks are mine.';

export const caseStudies: CaseStudy[] = [
  {
    slug: 'service-map-planner',
    title: 'Service Map Planner',
    subtitle: 'Workflow design for service planning',
    status: 'Working prototype',
    statusNote: 'Private app with approved sign-in; not open to the public',
    updated: 'October 2026',
    summary:
      'A web app that brings customer sites, equipment, software, maintenance status, and service history into one place, with visits planned on a map. I designed it around how a service engineer prepares for a visit.',
    hero: {
      src: 'images/service_map_tablet.jpg',
      kind: 'concept',
      alt: 'Concept image of a map-based service planner on a tablet, with fictional library locations',
      caption: 'Concept image, not a screenshot of the app. Real screenshots with fictional data are in progress.',
    },
    role: `Designer and developer. I defined the records and how they connect, the maintenance views, and the visit-planning workflow. ${AI_ASSISTED}`,
    users: 'Service engineers preparing customer visits and follow-up.',
    problem:
      'Preparing a service visit means checking a customer’s location, contacts, installed equipment, software versions, maintenance status, and past work. Those details were hard to see in one place.',
    decisions: [
      { title: 'Model the relationships, not a list', body: 'Sites, systems, components, and service history are connected records, so one view shows what is installed where and what happened last.' },
      { title: 'Show what needs follow-up', body: 'Maintenance-status views and data-quality checks flag expiring coverage and incomplete records before a visit, not during it.' },
      { title: 'Plan visits on a map', body: 'Customer locations sit on a map so nearby stops can be grouped into one trip, with driving distance and time.' },
      { title: 'Track replacements end to end', body: 'Part replacement requests keep serial numbers, service status, and shipping details together in one workflow.' },
      { title: 'Keep customer data private', body: 'Only approved, signed-in users can open the app, and no real customer data appears on this site.' },
    ],
    evidence: [
      { alt: 'Customer record showing contacts, equipment, software, and service history for a fictional institution', caption: 'Customer record (screenshot pending, will use fictional data)', kind: 'screenshot' },
      { alt: 'Maintenance view listing follow-up needs and incomplete information for fictional institutions', caption: 'Maintenance view (screenshot pending, will use fictional data)', kind: 'screenshot' },
      { alt: 'Map view with a planned visit between fictional institutions', caption: 'Visit planning on the map (screenshot pending, will use fictional data)', kind: 'screenshot' },
    ],
    result:
      'A working private prototype that connects customer and equipment records with maintenance views and map-based visit planning.',
    next: [
      'Screenshots of each view, captured from fictional data.',
      'Automated tests for the planning workflow.',
      'A read-only demo with fictional data that anyone can open.',
    ],
    technologies: ['Next.js', 'Firebase', 'MapLibre'],
    related: 'aac-communication-app',
  },
  {
    slug: 'aac-communication-app',
    title: 'AAC communication app',
    subtitle: 'Accessible, bilingual interaction on a tablet',
    status: 'Working prototype',
    statusNote: 'Android tablet app',
    updated: 'October 2026',
    summary:
      'A Spanish-first communication app for an Android tablet, with English available. It opens on large question cards and a Yes/No screen that speaks each answer aloud.',
    hero: {
      src: 'images/projects/aac-yes-no.webp',
      small: 'images/projects/aac-yes-no-800.webp',
      kind: 'screenshot',
      alt: 'AAC app answer screen: the question “¿Tienes sed?” above a large green Sí button on the left and a large red No button on the right',
      caption: 'Yes/No answer screen. Captured in a desktop browser without a speech voice, which is why it shows “Sin voz”.',
    },
    role: `Designer and developer. I listened to what the user and caregivers needed and turned those limits into interface decisions. ${AI_ASSISTED}`,
    users: 'An adult who communicates through yes/no answers and simple choices, and the people who support them.',
    problem:
      'Some adults can answer simple questions but find reading, fine movements, and multi-step screens tiring. Communication needs few steps and targets that do not move.',
    decisions: [
      { title: 'Answers never move', body: 'Sí is always on the left and No on the right, so the answer can be found without searching.' },
      { title: 'Large targets, fewer taps', body: 'One tap on a question card opens the answer screen. Large cards and caregiver settings reduce accidental touches.' },
      { title: 'Spanish first, English available', body: 'Phrases are written in both languages rather than machine-translated, and the device’s text-to-speech reads them aloud.' },
      { title: 'Pictures carry meaning', body: 'Adult-appropriate pictograms sit next to each question, so reading is not the only way to understand it.' },
    ],
    evidence: [
      {
        src: 'images/projects/aac-question-board.webp',
        small: 'images/projects/aac-question-board-800.webp',
        kind: 'screenshot',
        alt: 'Question board with large picture cards: ¿Tienes dolor? as a large featured card, then ¿Tienes sed?, ¿Estás cansada?, ¿Necesitas ir al baño?, ¿Tienes frío?, ¿Tienes calor?, and ¿Quieres cambiar de posición?',
        caption: 'The question board the app opens on, with its default questions.',
      },
    ],
    result: 'A working Android tablet app with large-target question, Yes/No, and choice screens in Spanish and English.',
    next: [
      'A scoped accessibility assessment before making any compliance claim.',
      'Tested behavior with no network connection before making any offline claim.',
      'Exporting answer logs on the device.',
    ],
    technologies: ['React', 'TypeScript', 'Capacitor (Android)'],
    related: 'scale-garage-studio',
    note: 'Pictographic symbols are by Sergio Palao for ARASAAC (arasaac.org), property of the Government of Aragón, under CC BY-NC-SA 4.0. Attribution is shown in the app.',
  },
  {
    slug: 'scale-garage-studio',
    title: 'Miniature Garage Configurator',
    subtitle: 'Requirements, configuration, and fabrication limits',
    status: 'Working prototype',
    statusNote: 'Runs locally; pricing uses sample data and checkout is a mock',
    updated: 'October 2026',
    summary:
      'A browser-based 3D configurator for custom 1:18 model-car garages. A customer chooses layout, parts, and finishes and sees the result before anything is printed.',
    hero: {
      src: 'images/projects/garage-configurator.webp',
      small: 'images/projects/garage-configurator-800.webp',
      kind: 'screenshot',
      alt: 'Garage configurator: preset list on the left and a 3D preview of a glass-and-steel 1:18 garage with a display car, with fit, size, part count, printer, and price shown below',
      caption: 'The configurator with a sample preset. The status bar shows the car fit, outer size, part count, target printer, and estimate.',
    },
    role: `Designer and developer. I designed the configuration model and the 3D preview, and shaped the preview to look like the printed part. ${AI_ASSISTED}`,
    users: 'Collectors ordering a custom 1:18 model-car garage, and the person who prints it.',
    problem:
      'A custom miniature garage has to be agreed before it is printed. Customers find it hard to picture how layout and part choices come together.',
    decisions: [
      { title: 'Capture requirements as one design', body: 'Layout, parts, and finishes are saved as a single design record that drives the preview, the estimate, and the checks.' },
      { title: 'Show the printed result, not a showroom', body: 'Materials and lighting aim to look like the printed plastic, so the preview sets honest expectations.' },
      { title: 'Check fit and fabrication early', body: 'A display-car fit check reports headroom, and the manufacturing view flags parts too large for the printer bed.' },
      { title: 'Stay smooth in a browser', body: 'The preview only redraws when something changes, so it stays responsive on an ordinary laptop.' },
    ],
    evidence: [
      {
        src: 'images/projects/garage-manufacturing.webp',
        small: 'images/projects/garage-manufacturing-800.webp',
        kind: 'screenshot',
        alt: 'Manufacturing view of the garage with outer dimensions labelled 350 by 210 by 175 millimetres and a “needs split” warning in the presets panel',
        caption: 'Manufacturing view: outer dimensions in millimetres, and a “needs split” flag where a part exceeds the printer bed.',
      },
      {
        src: 'images/hero_garage_diorama.jpg',
        kind: 'concept',
        alt: 'Rendered concept of a 1:18 miniature garage diorama with a display car',
        caption: 'Concept render used as the design target. Not a screenshot or a photo of a printed part.',
      },
    ],
    result: 'A working 1:18 configurator preview with a fit check, sample pricing estimates, and printability checks.',
    next: [
      'Photos of printed parts next to the preview.',
      'Export of print-ready files, once it is built and verified.',
      'Additional scales, once they are supported.',
    ],
    technologies: ['Next.js', 'React Three Fiber', 'Drei'],
    related: 'service-map-planner',
  },
  {
    slug: 'agent-trading-os',
    title: 'Agent Trading OS',
    subtitle: 'An experiment in making automated decisions inspectable',
    status: 'Experiment',
    statusNote: 'Paper trading only; no real money',
    updated: 'October 2026',
    summary:
      'A learning project where simple agents propose paper trades and every step is recorded. The goal is to make automated decisions easy to replay and question.',
    hero: {
      alt: 'Event timeline listing agent proposals, risk checks, and skipped trades',
      caption: 'Event timeline (screenshot pending)',
      kind: 'screenshot',
    },
    role: `Designer and developer. I designed the event history, replay, and controlled experiments. ${AI_ASSISTED}`,
    users: 'Me. It is a learning project, not a service for customers.',
    problem:
      'Automated decision-making is easy to over-trust. I wanted every proposal, risk check, and skipped trade recorded so it can be replayed and questioned.',
    decisions: [
      { title: 'Record everything', body: 'Each proposal, risk check, and skipped trade is logged as an event, so a run can be replayed step by step.' },
      { title: 'Start with fixed rules', body: 'Today the agents are fixed rules, not language models, so their behavior is predictable while the tooling matures.' },
      { title: 'No claims without evidence', body: 'Paper trading only, and no performance claims without a reproducible evaluation.' },
    ],
    evidence: [],
    result: 'A working paper-trading simulation with an inspectable event history.',
    next: [
      'Scoring computed from settled outcomes rather than fixed values.',
      'A reproducible evaluation against a simple baseline.',
    ],
    technologies: ['React', 'TypeScript', 'Python', 'FastAPI'],
    related: 'service-map-planner',
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
