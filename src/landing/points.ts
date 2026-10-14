import { SERVICE_STEPS } from '@/components/home/ServiceWorkflow';
import { caseStudies } from '@/data/caseStudies';
import {
  about, contact, education, experience, glance, languages, method, overview, projects, site, toolGroups,
  type Contribution, type EducationItem, type Proof, type ToolGroup,
} from '@/data/content';
import type { StopId } from '@/flight/flightData';

export type Placement = 'top-right' | 'left' | 'center' | 'right' | 'bottom-left';

export interface Shot {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
}

export interface WorkItem {
  id: string;
  title: string;
  focus: string;
  problem: string;
  contribution: string;
  status: string;
  statusNote: string;
  href: string;
  linkLabel: string;
  /** Service Map Planner has no screenshot; its workflow shows as text. */
  steps?: string[];
  image?: Shot;
}

export interface Role {
  id: 'dlsg' | 'globenet';
  organization: string;
  title: string;
  period: string;
  location: string;
  summary: string;
  contributions: Contribution[];
  details: string[];
}

export type PointBody =
  | { kind: 'intro'; name: string; role: string; statement: string; facts: { label: string; value: string }[] }
  | { kind: 'experience'; roles: Role[] }
  | { kind: 'expertise'; steps: { step: string; work: Proof[]; projects: Proof[] }[]; groups: ToolGroup[] }
  | { kind: 'work'; items: WorkItem[] }
  | { kind: 'connect'; bio: string[]; portrait: { src: string; alt: string }; education: EducationItem[]; languages: string; body: string; details: string[] };

export interface Point {
  id: StopId;
  /** Hash targets that land on this point, primary first. Existing deep links keep working. */
  anchors: string[];
  /** "01" to "05"; the intro has none. */
  number: string | null;
  label: string;
  headline: string;
  placement: Placement;
  body: PointBody;
}

/** Dash separators read as words ("October 2022 to Present"). */
export function plain(text: string): string {
  return text.replace(/\s*[—–]\s*/g, ' to ');
}

function project(slug: string) {
  const p = projects.find((x) => x.slug === slug);
  if (!p) throw new Error(`Unknown project: ${slug}`);
  return p;
}

/** A project's screenshot at the 800px size the landing shows (800x500). */
function shot(p: ReturnType<typeof project>): Shot | undefined {
  if (!p.image || p.image.kind !== 'screenshot' || !p.image.small) return undefined;
  return { src: p.image.small, alt: p.image.alt, width: 800, height: 500, caption: p.image.caption };
}

function work(slug: string, extra: Partial<WorkItem> = {}): WorkItem {
  const p = project(slug);
  return {
    id: `work-${slug}`,
    title: p.title,
    focus: p.focus,
    problem: p.problem,
    contribution: p.contribution,
    status: p.status,
    statusNote: p.statusNote,
    href: p.href,
    linkLabel: 'Read the case study',
    image: shot(p),
    ...extra,
  };
}

const lab = caseStudies.find((c) => c.slug === 'agent-trading-os');
if (!lab) throw new Error('Unknown case study: agent-trading-os');

export const points: Point[] = [
  {
    id: 'river',
    anchors: ['overview'],
    number: null,
    label: 'Introduction',
    headline: site.name,
    placement: 'top-right',
    body: {
      kind: 'intro',
      name: site.name,
      role: overview.title,
      statement: overview.statement,
      facts: glance.map((g) => ({ label: g.label, value: g.value })),
    },
  },
  {
    id: 'brickell',
    anchors: ['experience', 'exp-dlsg', 'exp-globenet'],
    number: '01',
    label: 'Experience',
    headline: 'Technology. People. Results.',
    placement: 'left',
    body: {
      kind: 'experience',
      roles: experience.map((e) => ({
        id: e.id,
        organization: e.organization,
        title: e.title,
        period: plain(e.period),
        location: e.location,
        summary: e.summary,
        contributions: e.contributions,
        details: e.details,
      })),
    },
  },
  {
    id: 'downtown',
    anchors: ['expertise'],
    number: '02',
    label: 'Expertise',
    headline: 'Understand. Implement. Support.',
    placement: 'center',
    body: { kind: 'expertise', steps: method.map((m) => ({ step: m.step, work: m.work, projects: m.projects })), groups: toolGroups },
  },
  {
    id: 'bay',
    anchors: ['projects'],
    number: '03',
    label: 'Selected work',
    headline: 'Built for real needs.',
    placement: 'right',
    body: {
      kind: 'work',
      items: [work('service-map-planner', { steps: SERVICE_STEPS.map((s) => s.title), image: undefined }), work('aac-communication-app')],
    },
  },
  {
    id: 'beach',
    anchors: ['more-projects'],
    number: '04',
    label: 'More work',
    headline: 'Built to learn by doing.',
    placement: 'left',
    body: {
      kind: 'work',
      items: [
        work('scale-garage-studio'),
        {
          id: 'work-agent-trading-os',
          title: lab.title,
          focus: lab.subtitle,
          problem: lab.summary,
          contribution: lab.role,
          status: 'Experiment',
          statusNote: lab.statusNote,
          href: '/lab',
          linkLabel: 'Open the Lab notes',
        },
      ],
    },
  },
  {
    id: 'sunset',
    anchors: ['contact', 'about'],
    number: '05',
    label: 'Let’s connect',
    headline: 'Let’s make technology work for people.',
    placement: 'bottom-left',
    body: {
      kind: 'connect',
      bio: [...about.bio],
      portrait: { ...about.portrait },
      education,
      languages,
      body: contact.body,
      details: [...contact.details],
    },
  },
];
