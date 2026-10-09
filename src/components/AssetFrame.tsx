import type { Asset } from '@/data/caseStudies';

export default function AssetFrame({ asset }: { asset: Asset }) {
  const label = `${asset.kind === 'demonstration' ? 'Demonstration' : asset.kind === 'employer' ? 'Employer work' : 'Personal work'}${asset.sampleData ? ' · sample data' : ''} · ${asset.date}`;
  return (
    <figure className="space-y-2">
      {asset.src ? (
        <img
          src={`${import.meta.env.BASE_URL}${asset.src}`}
          alt={asset.alt}
          loading="lazy"
          className="w-full rounded-xl border border-[var(--border)]"
        />
      ) : (
        <div
          role="img"
          aria-label={asset.alt}
          className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-warm)] p-4 text-center text-xs font-mono text-[var(--text-muted)]"
        >
          Screenshot pending
        </div>
      )}
      <figcaption className="text-xs text-[var(--text-muted)]">
        {asset.caption} <span className="font-mono">({label})</span>
      </figcaption>
    </figure>
  );
}
