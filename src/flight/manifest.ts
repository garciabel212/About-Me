export type SegmentKind = 'transit' | 'stop';
export type FrameSize = 'desktop' | 'mobile';

export interface Segment {
  id: string;
  kind: SegmentKind;
  /** Inclusive [first, last] indices into the committed frame list (0-based). */
  frames: readonly [number, number];
  /** Scroll length of this segment, in viewport heights, per frame size. */
  scrollVh: Readonly<Record<FrameSize, number>>;
}

export interface FlightManifest {
  id: string;
  frameCount: number;
  segments: readonly Segment[];
  /** Tiny blurred first frame as a data URI, painted before any frame loads. */
  poster: string;
}

export function frameUrl(baseUrl: string, flightId: string, size: FrameSize, index: number): string {
  return `${baseUrl}flight/${flightId}/${size}/${String(index + 1).padStart(4, '0')}.webp`;
}

export function stillUrl(baseUrl: string, flightId: string, size: FrameSize): string {
  return `${baseUrl}flight/${flightId}/still-${size}.webp`;
}

export function totalScrollVh(manifest: FlightManifest, size: FrameSize): number {
  return manifest.segments.reduce((sum, segment) => sum + segment.scrollVh[size], 0);
}
