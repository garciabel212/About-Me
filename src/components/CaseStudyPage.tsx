import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import AssetFrame from '@/components/AssetFrame';
import { getCaseStudy } from '@/data/caseStudies';
import { mailto } from '@/data/profile';

const questions = [
  ['What was the problem?', 'problem'],
  ['Who needed it?', 'who'],
  ['What was my role?', 'role'],
  ['What constraints mattered?', 'constraints'],
  ['What did I do and why?', 'approach'],
] as const;

export default function CaseStudyPage({ slug }: { slug: string }) {
  const study = getCaseStudy(slug);
  if (!study) return null;
  const related = getCaseStudy(study.related);

  return (
    <main className="relative z-10 pt-28 pb-24 text-[var(--text-primary)]">
      <article className="mx-auto max-w-4xl px-6 sm:px-12 space-y-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--accent)] hover:underline"
        >
          <ArrowLeft size={14} aria-hidden="true" /> Back to home
        </Link>

        <header className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">
            {study.status} · Updated {study.updated}
          </p>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight">{study.title}</h1>
          <p className="text-lg text-[var(--text-secondary)]">{study.subtitle}</p>
        </header>

        {questions.map(([heading, key]) => (
          <section key={key} className="space-y-2">
            <h2 className="font-serif text-2xl font-bold">{heading}</h2>
            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">{study[key]}</p>
          </section>
        ))}

        <section className="space-y-4">
          <h2 className="font-serif text-2xl font-bold">What can you inspect?</h2>
          <ul className="list-disc pl-5 space-y-1 text-[var(--text-secondary)]">
            {study.inspect.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
          <div className="grid gap-5 sm:grid-cols-2">
            {study.assets.map((a) => (
              <AssetFrame key={a.caption} asset={a} />
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-2xl font-bold">What is the current result?</h2>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">{study.result}</p>
          {study.note && <p className="text-sm text-[var(--text-muted)]">{study.note}</p>}
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-2xl font-bold">What remains to improve?</h2>
          <ul className="list-disc pl-5 space-y-1 text-[var(--text-secondary)]">
            {study.remaining.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>

        <p className="font-mono text-xs text-[var(--text-muted)]">Built with: {study.technologies.join(' · ')}</p>

        <footer className="flex flex-col gap-4 border-t border-[var(--border)] pt-8 sm:flex-row sm:items-center sm:justify-between">
          {related && (
            <Link
              to={related.slug === 'agent-trading-os' ? '/lab' : `/projects/${related.slug}`}
              className="font-semibold text-[var(--accent)] hover:underline"
            >
              Related: {related.title}
            </Link>
          )}
          <a
            href={mailto}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
          >
            <Mail size={16} aria-hidden="true" /> Email Jose
          </a>
        </footer>
      </article>
    </main>
  );
}
