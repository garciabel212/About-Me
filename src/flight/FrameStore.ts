export type FrameLoader<T> = (index: number) => Promise<T>;

export interface FrameStoreOptions<T> {
  frameCount: number;
  load: FrameLoader<T>;
  /** Maximum simultaneous loads. Default 6. */
  concurrency?: number;
  onLoad?: (index: number) => void;
}

const TIER_STRIDES = [8, 4, 2, 1] as const;

/**
 * Loads a frame sequence coarse-to-fine (every 8th frame, then every 4th, 2nd, all),
 * nearest-to-playhead first within each tier, so a scrub always has something close
 * to show. Holding decoded-image memory is left to the browser.
 */
export class FrameStore<T> {
  /** Increments on every successful load so renderers can detect new data cheaply. */
  version = 0;

  private readonly frames = new Map<number, T>();
  private readonly failed = new Set<number>();
  private readonly pending: Set<number>[];
  private inFlight = 0;
  private playhead = 0;
  private started = false;
  private disposed = false;
  private readonly options: FrameStoreOptions<T>;

  constructor(options: FrameStoreOptions<T>) {
    this.options = options;
    this.pending = TIER_STRIDES.map(() => new Set<number>());
    for (let index = 0; index < options.frameCount; index += 1) {
      this.pending[this.tierOf(index)].add(index);
    }
  }

  get readyCount(): number {
    return this.frames.size;
  }

  get failedCount(): number {
    return this.failed.size;
  }

  start(): void {
    if (this.started || this.disposed) return;
    this.started = true;
    this.pump();
  }

  setPlayhead(index: number): void {
    this.playhead = index;
  }

  get(index: number): T | undefined {
    return this.frames.get(index);
  }

  nearest(index: number): { index: number; frame: T } | null {
    const count = this.options.frameCount;
    if (this.frames.size === 0 || count === 0) return null;
    const base = Math.min(count - 1, Math.max(0, Math.round(index)));
    for (let distance = 0; distance < count; distance += 1) {
      const lower = base - distance;
      if (lower >= 0) {
        const frame = this.frames.get(lower);
        if (frame !== undefined) return { index: lower, frame };
      }
      const upper = base + distance;
      if (upper < count) {
        const frame = this.frames.get(upper);
        if (frame !== undefined) return { index: upper, frame };
      }
    }
    return null;
  }

  dispose(): void {
    this.disposed = true;
    this.pending.forEach((tier) => tier.clear());
  }

  private tierOf(index: number): number {
    if (index === this.options.frameCount - 1) return 0;
    const tier = TIER_STRIDES.findIndex((stride) => index % stride === 0);
    return tier === -1 ? TIER_STRIDES.length - 1 : tier;
  }

  private next(): number | undefined {
    for (const tier of this.pending) {
      if (tier.size === 0) continue;
      let best: number | undefined;
      let bestDistance = Infinity;
      for (const index of tier) {
        const distance = Math.abs(index - this.playhead);
        if (distance < bestDistance) {
          best = index;
          bestDistance = distance;
        }
      }
      if (best !== undefined) tier.delete(best);
      return best;
    }
    return undefined;
  }

  private pump(): void {
    const limit = this.options.concurrency ?? 6;
    while (!this.disposed && this.inFlight < limit) {
      const index = this.next();
      if (index === undefined) return;
      this.inFlight += 1;
      this.options
        .load(index)
        .then(
          (frame) => {
            if (this.disposed) return;
            this.frames.set(index, frame);
            this.version += 1;
            this.options.onLoad?.(index);
          },
          () => {
            if (!this.disposed) this.failed.add(index);
          },
        )
        .finally(() => {
          this.inFlight -= 1;
          this.pump();
        });
    }
  }
}
