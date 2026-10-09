export interface ExperienceEntry {
  id: string;
  company: string;
  companyShort: string;
  role: string;
  roleSubtitle?: string;
  period: string;
  location: string;
  type: 'full-time' | 'contract';
  current: boolean;
  summary: string;
  responsibilities: ResponsibilityGroup[];
}

export interface ResponsibilityGroup {
  category: string;
  icon: string;
  items: string[];
}

export const experience: ExperienceEntry[] = [
  {
    id: 'dlsg',
    company: 'Digital Library Systems Group / Image Access',
    companyShort: 'DLSG / Image Access',
    role: 'Service Engineer',
    period: 'October 2022 – Present',
    location: 'South Florida · National Travel',
    type: 'full-time',
    current: true,
    summary:
      'Customer-facing engineering role spanning technical discovery, product demonstrations, solution configuration, nationwide hardware and software deployments, customer training, troubleshooting, and long-term technical support.',
    responsibilities: [
      {
        category: 'Customer Engineering',
        icon: 'Users',
        items: [
          'Technical discovery, requirements gathering, product demonstrations, solution configuration, technical presentations, and collaboration with sales and engineering teams.',
        ],
      },
      {
        category: 'Implementation',
        icon: 'Settings',
        items: [
          'Onsite and remote hardware/software deployments, system configuration, integration, validation, licensing, and customer handoff.',
        ],
      },
      {
        category: 'Systems & Troubleshooting',
        icon: 'Network',
        items: [
          'Windows diagnostics, network validation, hardware integration, remote support, root-cause analysis, and escalation management.',
        ],
      },
      {
        category: 'Training & Customer Success',
        icon: 'GraduationCap',
        items: [
          'Administrator and end-user training, documentation, deployment coordination, preventive maintenance, and long-term account support.',
        ],
      },
      {
        category: 'Product & Tooling',
        icon: 'Code2',
        items: [
          'Product testing, quality validation, operational reporting, technical documentation, and development of Service Map Planner.',
        ],
      },
    ],
  },
  {
    id: 'globenet',
    company: 'GlobeNet Telecom',
    companyShort: 'GlobeNet',
    role: 'Network Operations Center Engineer',
    period: 'November 2021 – September 2022',
    location: 'South Florida',
    type: 'full-time',
    current: false,
    summary:
      'Network operations role focused on carrier infrastructure monitoring, incident response, real-time diagnostics, escalation management, system reliability, and cross-team communication during network events.',
    responsibilities: [
      {
        category: 'Network Operations',
        icon: 'Network',
        items: [
          'Carrier infrastructure monitoring, incident response, real-time diagnostics, escalation management, system reliability, and cross-team communication during network events.',
        ],
      },
    ],
  },
];

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  period: string;
  gpa?: string;
  highlights: string[];
}

export const education: EducationEntry[] = [
  {
    id: 'fau-bsce',
    institution: 'Florida Atlantic University',
    degree: 'Bachelor of Science',
    field: 'Computer Science & Engineering',
    period: '2018 – 2022',
    highlights: [
      'Bachelor of Science in Computer Science & Engineering',
      'Certificate in Data Science & Analytics',
      'AWS Certified Cloud Practitioner — 2022',
      'English and Spanish',
    ],
  },
];

export interface CertEntry {
  name: string;
  issuer: string;
  year: string;
  relevant: boolean;
}

export const certifications: CertEntry[] = [
  {
    name: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    year: '2022',
    relevant: true,
  },
  {
    name: 'Certificate in Data Science & Analytics',
    issuer: 'Florida Atlantic University',
    year: '2022',
    relevant: true,
  },
];
