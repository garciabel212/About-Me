import type { Asset } from '@/data/caseStudies';

const base = import.meta.env.BASE_URL;

/** A case-study image with a label that says whether it is a real screenshot or a concept. */
export default function AssetFrame({ asset, large = false }: { asset: Asset; large?: boolean }) {
  const label = !asset.src ? 'Screenshot pending' : asset.kind === 'concept' ? 'Concept' : 'Screenshot';
  return (
    <figure className={`asset ${large ? 'asset--large' : ''}`}>
      {asset.src ? (
        <img
          src={`${base}${asset.src}`}
          srcSet={asset.small ? `${base}${asset.small} 800w, ${base}${asset.src} 1600w` : undefined}
          sizes={large ? '(min-width: 1100px) 1040px, 100vw' : '(min-width: 900px) 520px, 100vw'}
          alt={asset.alt}
          loading={large ? 'eager' : 'lazy'}
          decoding="async"
        />
      ) : (
        <div role="img" aria-label={asset.alt} className="asset__pending">
          <span>{asset.alt}</span>
        </div>
      )}
      <figcaption>
        <span className={`image-kind image-kind--${asset.src ? asset.kind : 'pending'}`}>{label}</span>
        {asset.caption}
      </figcaption>
    </figure>
  );
}
