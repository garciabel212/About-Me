/// <reference types="node" />
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Claims Jose cannot back up must not reach the site. Only src/data/content.ts
// may mention a few facts (employer location, the unscoped account count).
const root = fileURLToPath(new URL('../../../', import.meta.url));

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = dir + name;
    if (name === '__tests__' || name === 'generated') return [];
    return statSync(path).isDirectory() ? walk(path + '/') : [path];
  });
}

const files = [...walk(root + 'src/'), root + 'index.html']
  .filter((p) => /\.(ts|tsx|html)$/.test(p))
  .map((p) => ({ path: p.slice(root.length), text: readFileSync(p, 'utf8') }));

const CONTENT = 'src/data/content.ts';

// Legacy files that the case-study PR (PR 5) deletes or rewrites. Remove each
// entry when that file goes; the list must reach [] by the end of PR 5.
const PENDING = [
  'src/data/experience.ts',
  'src/data/projects.ts',
  'src/pages/Contact.tsx',
  'src/pages/Experience.tsx',
  'src/pages/Projects.tsx',
  'src/pages/projects/EnterpriseDeployment.tsx',
  'src/pages/projects/ScaleGarageStudio.tsx',
];

interface Rule {
  name: string;
  pattern: RegExp;
  allowIn?: string[];
}

const rules: Rule[] = [
  { name: '99.999% SLA', pattern: /99\.999/ },
  { name: 'offline claim', pattern: /offline[ -](pwa|ready|first)|sin conexi[oó]n/i },
  { name: 'AA compliance claim', pattern: /AA[ -]?compliant|contraste accesible AA/i },
  { name: '200+ assets', pattern: /\b200\+/ },
  { name: 'scales other than 1:18', pattern: /1:(10|24|43|64)\b/ },
  { name: 'STL / slicer export', pattern: /STL (export|geometry)|direct STL|slicing export|slicer/i },
  { name: 'route optimization', pattern: /route optimi[sz]|optimi[sz]ed (dispatch|service routes)|GIS routing/i },
  { name: 'daily operations', pattern: /daily operations|active daily|daily use|used daily|deployed to operations/i },
  { name: 'retention / ticket / RFP claims', pattern: /client retention|ticket rates|rfp technical scoring|admin certification/i },
  { name: 'Computer Engineering degree', pattern: /computer engineering/i },
  { name: 'Sales Engineer title', pattern: /sales engineer(ing)?\b/i, allowIn: [CONTENT] },
  { name: '100+ accounts', pattern: /100\+/, allowIn: [CONTENT] },
  { name: 'Boca Raton', pattern: /boca raton/i, allowIn: [CONTENT] },
];

describe('claims guard', () => {
  it.each(rules)('no "$name" outside allowed files', (rule) => {
    const hits = files
      .filter((f) => !PENDING.includes(f.path) && !rule.allowIn?.includes(f.path) && rule.pattern.test(f.text))
      .map((f) => f.path);
    expect(hits).toEqual([]);
  });

  it('lists only files that still exist', () => {
    const present = files.map((f) => f.path);
    expect(PENDING.filter((p) => !present.includes(p))).toEqual([]);
  });
});
