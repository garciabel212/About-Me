import type { Asset } from '@/data/caseStudies';
import ServiceWorkflow from '@/components/home/ServiceWorkflow';

const base = import.meta.env.BASE_URL;
const LABEL = { screenshot: 'Screenshot', concept: 'Concept', diagram: 'Diagram' } as const;

/** A case-study visual with a label that says whether it is a screenshot, a diagram, or a concept. */
export default function AssetFrame({ asset, large = false }: { asset: Asset; large?: boolean }) {
  const pending = !asset.src && asset.kind !== 'diagram';
  const label = pending ? 'Screenshot pending' : LABEL[asset.kind];
  return (
    <figure className={`asset ${large ? 'asset--large' : ''}`}>
      {asset.kind === 'diagram' ? (
        <div className="asset__diagram"><ServiceWorkflow label={asset.alt} /></div>
      ) : asset.src ? (
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
        <span className={`image-kind image-kind--${pending ? 'pending' : asset.kind}`}>{label}</span>
        {asset.caption}
      </figcaption>
    </figure>
  );
}
