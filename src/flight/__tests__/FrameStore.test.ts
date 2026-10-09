import { describe, expect, it, vi } from 'vitest';
import { FrameStore } from '../FrameStore';

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function deferredLoader() {
  const calls: number[] = [];
  const pending = new Map<number, { resolve: (value: string) => void; reject: (error: Error) => void }>();
  const load = (index: number) => {
    calls.push(index);
    return new Promise<string>((resolve, reject) => pending.set(index, { resolve, reject }));
  };
  return {
    calls,
    load,
    resolve: (index: number) => pending.get(index)!.resolve(`frame-${index}`),
    reject: (index: number) => pending.get(index)!.reject(new Error(`missing ${index}`)),
  };
}

function instantOrder(frameCount: number, playhead: number) {
  const calls: number[] = [];
  const store = new FrameStore<string>({
    frameCount,
    concurrency: 1,
    load: async (index) => {
      calls.push(index);
      return `frame-${index}`;
    },
  });
  store.setPlayhead(playhead);
  store.start();
  return { store, calls };
}

describe('FrameStore load order', () => {
  it('loads coarse tiers first (8 → 4 → 2 → 1), last frame in the first tier', async () => {
    const { calls } = instantOrder(18, 0);
    await flush();
    expect(calls).toEqual([0, 8, 16, 17, 4, 12, 2, 6, 10, 14, 1, 3, 5, 7, 9, 11, 13, 15]);
  });

  it('orders each tier by distance from the playhead', async () => {
    const { calls } = instantOrder(18, 17);
    await flush();
    expect(calls.slice(0, 4)).toEqual([17, 16, 8, 0]);
    expect(calls.slice(4, 6)).toEqual([12, 4]);
  });

  it('re-prioritizes remaining work when the playhead moves mid-load', async () => {
    const loader = deferredLoader();
    const store = new FrameStore<string>({ frameCount: 18, concurrency: 1, load: loader.load });
    store.start();
    expect(loader.calls).toEqual([0]);
    store.setPlayhead(17);
    loader.resolve(0);
    await flush();
    expect(loader.calls).toEqual([0, 17]);
  });

  it('never exceeds the concurrency limit', () => {
    const loader = deferredLoader();
    new FrameStore<string>({ frameCount: 40, concurrency: 3, load: loader.load }).start();
    expect(loader.calls).toHaveLength(3);
  });
});

describe('FrameStore lookup', () => {
  it('returns null from nearest() before anything loads', () => {
    const loader = deferredLoader();
    const store = new FrameStore<string>({ frameCount: 18, load: loader.load });
    expect(store.nearest(5)).toBeNull();
  });

  it('falls back to the closest loaded frame when only coarse frames exist', async () => {
    const loader = deferredLoader();
    const store = new FrameStore<string>({ frameCount: 18, concurrency: 1, load: loader.load });
    store.start();
    loader.resolve(0);
    await flush();
    expect(store.nearest(15)).toEqual({ index: 0, frame: 'frame-0' });
    loader.resolve(8);
    await flush();
    expect(store.nearest(15)).toEqual({ index: 8, frame: 'frame-8' });
    expect(store.nearest(99)).toEqual({ index: 8, frame: 'frame-8' });
  });

  it('get() returns only exact frames', async () => {
    const { store } = instantOrder(18, 0);
    await flush();
    expect(store.get(5)).toBe('frame-5');
    expect(store.get(18)).toBeUndefined();
    expect(store.readyCount).toBe(18);
  });

  it('bumps version and calls onLoad for each loaded frame', async () => {
    const onLoad = vi.fn();
    const store = new FrameStore<string>({ frameCount: 3, load: async (i) => `frame-${i}`, onLoad });
    store.start();
    await flush();
    expect(store.version).toBe(3);
    expect(onLoad).toHaveBeenCalledTimes(3);
  });
});

describe('FrameStore failures and disposal', () => {
  it('skips failed frames and keeps loading the rest', async () => {
    const store = new FrameStore<string>({
      frameCount: 18,
      load: (i) => (i === 8 ? Promise.reject(new Error('404')) : Promise.resolve(`frame-${i}`)),
    });
    store.start();
    await flush();
    expect(store.readyCount).toBe(17);
    expect(store.failedCount).toBe(1);
    expect(store.nearest(8)).toEqual({ index: 7, frame: 'frame-7' });
  });

  it('stops loading and ignores late results after dispose()', async () => {
    const loader = deferredLoader();
    const store = new FrameStore<string>({ frameCount: 18, concurrency: 1, load: loader.load });
    store.start();
    store.dispose();
    loader.resolve(0);
    await flush();
    expect(loader.calls).toEqual([0]);
    expect(store.get(0)).toBeUndefined();
  });
});
