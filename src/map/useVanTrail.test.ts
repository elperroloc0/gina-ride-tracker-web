import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MAX_TRAIL_POINTS, useVanTrail } from './useVanTrail';
import type { VanPosition } from '../ws/vanSocket';

function position(lon: number, lat: number): VanPosition {
  return { van_id: 1, lat, lon, course: null, device_time: new Date().toISOString(), ignition: null, fuel: null, speed: null };
}

describe('useVanTrail', () => {
  it('starts empty and ignores a null position', () => {
    const { result } = renderHook(({ p }: { p: VanPosition | null }) => useVanTrail(p), { initialProps: { p: null } });
    expect(result.current).toEqual([]);
  });

  it('appends one point per position update, in order', () => {
    const { result, rerender } = renderHook(({ p }: { p: VanPosition | null }) => useVanTrail(p), {
      initialProps: { p: position(-80.2, 25.7) },
    });
    rerender({ p: position(-80.1, 25.8) });
    rerender({ p: position(-80.0, 25.9) });

    expect(result.current).toEqual([
      [-80.2, 25.7],
      [-80.1, 25.8],
      [-80.0, 25.9],
    ]);
  });

  it('caps the trail at MAX_TRAIL_POINTS, keeping the most recent points', () => {
    const { result, rerender } = renderHook(({ p }: { p: VanPosition | null }) => useVanTrail(p), {
      initialProps: { p: position(0, 0) },
    });
    for (let i = 1; i <= MAX_TRAIL_POINTS + 5; i++) {
      rerender({ p: position(i, i) });
    }

    expect(result.current).toHaveLength(MAX_TRAIL_POINTS);
    // The oldest 6 points (index 0 through 5) should have fallen off the front.
    expect(result.current[0]).toEqual([6, 6]);
    expect(result.current[result.current.length - 1]).toEqual([MAX_TRAIL_POINTS + 5, MAX_TRAIL_POINTS + 5]);
  });

  it('discards the trail when the component unmounts (a ride ending swaps ParentRide out)', () => {
    const { result, rerender, unmount } = renderHook(({ p }: { p: VanPosition | null }) => useVanTrail(p), {
      initialProps: { p: position(-80.2, 25.7) },
    });
    rerender({ p: position(-80.1, 25.8) });
    expect(result.current).toHaveLength(2);

    unmount();

    // A fresh mount (the next ride) starts from empty, not from leftover state.
    const fresh = renderHook(({ p }: { p: VanPosition | null }) => useVanTrail(p), { initialProps: { p: null } });
    expect(fresh.result.current).toEqual([]);
  });
});
