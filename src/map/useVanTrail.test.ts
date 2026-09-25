import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MAX_TRAIL_POINTS, MIN_STEP_METERS, useVanTrail } from './useVanTrail';
import type { LatLon } from './useSmoothPosition';

// ~0.0001 degrees of latitude is ~11 m: just over MIN_STEP_METERS.
const STEP = 0.0001;
const at = (i: number): LatLon => ({ lat: 25.7 + i * STEP, lon: -80.2 });

function render(initial: LatLon | null, history?: [number, number][]) {
  return renderHook(({ p, h }: { p: LatLon | null; h?: [number, number][] | undefined }) => useVanTrail(p, h), { initialProps: { p: initial, h: history } as { p: LatLon | null; h?: [number, number][] } });
}

describe('useVanTrail', () => {
  it('starts empty and ignores a null position', () => {
    expect(render(null).result.current).toEqual([]);
  });

  it('seeds with the first position and appends once the van has moved far enough', () => {
    const { result, rerender } = render(at(0));
    rerender({ p: at(1), h: undefined });
    rerender({ p: at(2), h: undefined });

    expect(result.current).toEqual([
      [-80.2, at(0).lat],
      [-80.2, at(1).lat],
      [-80.2, at(2).lat],
    ]);
  });

  it('skips movements shorter than MIN_STEP_METERS (per-frame animation ticks, a parked van)', () => {
    expect(MIN_STEP_METERS).toBeGreaterThan(1);
    const { result, rerender } = render(at(0));
    rerender({ p: { lat: at(0).lat + 0.00001, lon: at(0).lon } }); // ~1 m
    rerender({ p: at(0) });

    expect(result.current).toHaveLength(1);
  });

  it('caps the trail at MAX_TRAIL_POINTS, keeping the most recent points', () => {
    const { result, rerender } = render(at(0));
    for (let i = 1; i <= MAX_TRAIL_POINTS + 5; i++) rerender({ p: at(i) });

    expect(result.current).toHaveLength(MAX_TRAIL_POINTS);
    expect(result.current[0]).toEqual([-80.2, at(6).lat]);
  });

  it('discards the trail when the component unmounts (a ride ending swaps ParentRide out)', () => {
    const { result, rerender, unmount } = render(at(0));
    rerender({ p: at(1) });
    expect(result.current).toHaveLength(2);

    unmount();

    expect(render(null).result.current).toEqual([]);
  });

  it('puts server history in front of live points, without duplicating the overlap', () => {
    const { result, rerender } = render(at(3));
    rerender({ p: at(4), h: undefined });

    // History (which already contains the live points seen so far) arrives late.
    const history: [number, number][] = [0, 1, 2, 3, 4].map((i) => [-80.2, at(i).lat]);
    rerender({ p: at(4), h: history });
    expect(result.current.map((c) => c[1])).toEqual([0, 1, 2, 3, 4].map((i) => at(i).lat));

    // Later live points continue from its end.
    rerender({ p: at(5), h: history });
    expect(result.current.map((c) => c[1])).toEqual([0, 1, 2, 3, 4, 5].map((i) => at(i).lat));
  });

  it('is unaffected by the history being applied twice (StrictMode double-invokes effects)', () => {
    const history: [number, number][] = [0, 1, 2].map((i) => [-80.2, at(i).lat]);
    const { result } = renderHook(({ p, h }: { p: LatLon | null; h?: [number, number][] }) => useVanTrail(p, h), {
      initialProps: { p: at(2), h: history },
      reactStrictMode: true,
    });

    expect(result.current.map((c) => c[1])).toEqual([0, 1, 2].map((i) => at(i).lat));
  });
});
