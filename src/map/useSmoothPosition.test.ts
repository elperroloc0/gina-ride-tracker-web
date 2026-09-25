import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSmoothPosition, type LatLon } from './useSmoothPosition';

// Fake timers drive both rAF and performance.now() deterministically; each
// frame's setRendered() is a React update, so advancing must be wrapped in act().
function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function setup(initial: LatLon | null) {
  vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
  return renderHook(({ target }: { target: LatLon | null }) => useSmoothPosition(target), { initialProps: { target: initial } });
}

describe('useSmoothPosition', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null until a first target exists, then seeds from it without animating', () => {
    const { result, rerender } = setup(null);
    expect(result.current).toBeNull();

    rerender({ target: { lat: 25.7, lon: -80.2 } });
    expect(result.current).toEqual({ lat: 25.7, lon: -80.2 });
  });

  it('moves in a straight line at constant speed and keeps moving until the leg ends', () => {
    const { result, rerender } = setup({ lat: 25.0, lon: -80.0 });
    rerender({ target: { lat: 26.0, lon: -80.0 } });

    // Default leg is 3s. Sample early, middle, late: equal time -> equal distance.
    advance(750);
    const a = result.current!.lat;
    advance(750);
    const b = result.current!.lat;
    advance(750);
    const c = result.current!.lat;

    expect(a).toBeGreaterThan(25.0);
    expect(b - a).toBeCloseTo(a - 25.0, 1);
    expect(c - b).toBeCloseTo(b - a, 1);
    expect(c).toBeLessThan(26.0);

    advance(1000);
    expect(result.current).toEqual({ lat: 26.0, lon: -80.0 });
  });

  it('retargets from the current on-screen value instead of jumping back', () => {
    const { result, rerender } = setup({ lat: 25.0, lon: -80.0 });
    rerender({ target: { lat: 26.0, lon: -80.0 } });
    advance(1500);
    const midFlight = result.current!.lat;
    expect(midFlight).toBeGreaterThan(25.0);
    expect(midFlight).toBeLessThan(26.0);

    rerender({ target: { lat: 27.0, lon: -80.0 } });
    advance(20);
    expect(result.current!.lat).toBeGreaterThanOrEqual(midFlight);
    expect(result.current!.lat).toBeLessThan(midFlight + 0.1);
  });

  it('bypasses animation under prefers-reduced-motion, snapping straight to target', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = ((query: string) =>
      ({
        matches: query.includes('reduce'),
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList) as typeof window.matchMedia;

    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
    const { result, rerender } = setup({ lat: 25.7, lon: -80.2 });
    rerender({ target: { lat: 25.8, lon: -80.1 } });

    expect(result.current).toEqual({ lat: 25.8, lon: -80.1 });
    expect(rafSpy).not.toHaveBeenCalled();

    window.matchMedia = originalMatchMedia;
    rafSpy.mockRestore();
  });
});
