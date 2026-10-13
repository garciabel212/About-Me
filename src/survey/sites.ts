import { caseStudies } from '@/data/caseStudies';
import { contact, education, experience, glance, languages, method, overview, projects, site } from '@/data/content';
import type { StopId } from '@/flight/flightData';

/**
 * A landmark on a stop frame. x, y: its centre as fractions of the desktop
 * frame (1280x704). r: the ink ring's radius as a fraction of the drawn
 * frame's height. Measured on the stop frames in public/flight/desktop.
 */
export interface Mark {
  x: number;
  y: number;
  r: number;
}

export interface Job {
  /** DOM id of the note; its leader line ends here. */
  id: string;
  title: string;
  /** Front of the note: what it does, in one line. */
  outcome: string;
  /** Back of the note: how it was built. */
  method: string;
  status: string;
  /** App route of the case study. */
  href: string;
  mark: Mark;
}

export interface PunchItem {
  id: string;
  step: string;
  line: string;
}

export interface LogEntry {
  id: string;
  name: string;
  line: string;
  period: string;
}

export type SiteBody =
  | { kind: 'intro'; name: string; role: string; statement: string; next: string }
  | { kind: 'jobs'; jobs: Job[] }
  | { kind: 'punch'; items: PunchItem[] }
  | { kind: 'log'; entries: LogEntry[] }
  | { kind: 'handover'; heading: string; body: string };

export interface Site {
  id: StopId;
  /** Hash targets that land on this site, primary first. Existing deep links keep working. */
  anchors: string[];
  /** Title block fields. */
  label: string;
  job: string;
  status: string;
  /** The site's heading. */
  heading: string;
  /** The site's main ring. Job sites ring each job instead. */
  mark: Mark;
  body: SiteBody;
}

/** Dash separators read as words on the survey ("October 2022 to Present"). */
export function plain(text: string): string {
  return text.replace(/\s*[—–]\s*/g, ' to ');
}

function project(slug: string) {
  const p = projects.find((x) => x.slug === slug);
  if (!p) throw new Error(`Unknown project: ${slug}`);
  return p;
}

function role(id: 'dlsg' | 'globenet') {
  const e = experience.find((x) => x.id === id);
  if (!e) throw new Error(`Unknown role: ${id}`);
  return e;
}

const smp = project('service-map-planner');
const aac = project('aac-communication-app');
const garage = project('scale-garage-studio');
const lab = caseStudies.find((c) => c.slug === 'agent-trading-os');
if (!lab) throw new Error('Unknown case study: agent-trading-os');
const dlsg = role('dlsg');
const globenet = role('globenet');

const jobs = {
  smp: {
    id: 'job-service-map-planner',
    title: smp.title,
    outcome: 'One place to prepare a service visit: site, equipment, maintenance, and route.',
    method: smp.contribution,
    status: smp.status,
    href: smp.href,
    mark: { x: 0.67, y: 0.36, r: 0.07 },
  },
  aac: {
    id: 'job-aac-communication-app',
    title: aac.title,
    outcome: 'Yes and no answers with buttons that never move, in Spanish and English.',
    method: aac.contribution,
    status: aac.status,
    href: aac.href,
    mark: { x: 0.48, y: 0.56, r: 0.06 },
  },
  garage: {
    id: 'job-miniature-garage',
    title: garage.title,
    outcome: 'A 1:18 model-car garage configured in 3D, with fit and printability checks.',
    method: garage.contribution,
    status: garage.status,
    href: garage.href,
    mark: { x: 0.645, y: 0.36, r: 0.09 },
  },
  lab: {
    id: 'job-agent-trading-os',
    title: lab.title,
    outcome: 'Simple agents propose paper trades, and every step is recorded for replay.',
    method: lab.role,
    status: 'Experiment',
    href: '/lab',
    mark: { x: 0.865, y: 0.53, r: 0.07 },
  },
} satisfies Record<string, Job>;

export const sites: Site[] = [
  {
    id: 'river',
    anchors: ['overview', 'about'],
    label: 'River',
    job: overview.title,
    status: glance[0].value,
    heading: site.name,
    mark: { x: 0.59, y: 0.33, r: 0.14 },
    body: { kind: 'intro', name: site.name, role: overview.title, statement: overview.statement, next: `Next site: ${smp.title}` },
  },
  {
    id: 'brickell',
    anchors: ['projects'],
    label: 'Brickell',
    job: smp.title,
    status: smp.status,
    heading: 'Planning service visits',
    mark: jobs.smp.mark,
    body: { kind: 'jobs', jobs: [jobs.smp] },
  },
  {
    id: 'downtown',
    anchors: ['more-projects'],
    label: 'Downtown',
    job: 'Three more jobs',
    status: 'Prototypes and an experiment',
    heading: 'Accessibility, 3D, and agents',
    mark: jobs.garage.mark,
    // Top to bottom by ring height, so no leader crosses another ring.
    body: { kind: 'jobs', jobs: [jobs.garage, jobs.aac, jobs.lab] },
  },
  {
    id: 'bay',
    anchors: ['expertise'],
    label: 'Biscayne Bay',
    job: 'How I work',
    status: 'Five steps on every job',
    heading: 'How I work',
    mark: { x: 0.56, y: 0.45, r: 0.1 },
    body: { kind: 'punch', items: method.map((m, i) => ({ id: `punch-${i + 1}`, step: m.step, line: m.work[0].text })) },
  },
  {
    id: 'beach',
    anchors: ['experience', 'exp-dlsg', 'exp-globenet'],
    label: 'The Beach',
    job: 'Crew log',
    status: `${dlsg.title} since ${dlsg.start[0]}`,
    heading: 'Experience',
    mark: { x: 0.585, y: 0.47, r: 0.1 },
    body: {
      kind: 'log',
      entries: [
        { id: 'log-dlsg', name: dlsg.organization, line: dlsg.title, period: plain(dlsg.period) },
        { id: 'log-globenet', name: globenet.organization, line: globenet.title, period: plain(globenet.period) },
        ...education.map((e, i) => ({ id: `log-edu-${i + 1}`, name: e.name, line: e.issuer, period: '' })),
        { id: 'log-languages', name: 'Languages', line: languages, period: '' },
      ],
    },
  },
  {
    id: 'sunset',
    anchors: ['contact'],
    label: 'Sunset Harbour',
    job: 'Handover',
    status: 'Open to new roles',
    heading: 'Handover',
    mark: { x: 0.625, y: 0.36, r: 0.1 },
    body: { kind: 'handover', heading: contact.heading, body: contact.body },
  },
];
