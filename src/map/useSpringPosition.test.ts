import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSpringPosition } from './useSpringPosition';

// jsdom's requestAnimationFrame runs on a real ~16ms timer - fake timers let
// the test drive frames deterministically instead of racing real time. Each
// frame's setRendered() call is a React state update, so it must be wrapped
// in act() for the hook's `result.current` snapshot to reflect it.
function advanceFrames(count: number) {
  for (let i = 0; i < count; i++) {
    act(() => {
      vi.advanceTimersToNextFrame();
    });
  }
}

describe('useSpringPosition', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('converges toward the target without overshoot', () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'performance'] });
    const { result, rerender } = renderHook(({ target }) => useSpringPosition(target), {
      initialProps: { target: { lat: 25.7, lon: -80.2 } },
    });

    rerender({ target: { lat: 25.8, lon: -80.1 } });

    let prevDistance = Infinity;
    for (let i = 0; i < 60; i++) {
      advanceFrames(1);
      const distance = Math.abs(25.8 - result.current.lat) + Math.abs(-80.1 - result.current.lon);
      // Critical damping (damping ratio 1.0) means monotonic approach - the
      // remaining distance to target never grows, and neither axis crosses
      // past its target (lat rises toward 25.8, lon rises toward -80.1).
      expect(distance).toBeLessThanOrEqual(prevDistance + 1e-9);
      expect(result.current.lat).toBeLessThanOrEqual(25.8 + 1e-6);
      expect(result.current.lon).toBeLessThanOrEqual(-80.1 + 1e-6);
      prevDistance = distance;
    }

    expect(result.current.lat).toBeCloseTo(25.8, 3);
    expect(result.current.lon).toBeCloseTo(-80.1, 3);
  });

  it('retargets live from the current on-screen value instead of restarting', () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'performance'] });
    const { result, rerender } = renderHook(({ target }) => useSpringPosition(target), {
      initialProps: { target: { lat: 25.7, lon: -80.2 } },
    });

    rerender({ target: { lat: 25.8, lon: -80.1 } });
    advanceFrames(10);
    const midFlight = { lat: result.current.lat, lon: result.current.lon };
    expect(midFlight.lat).not.toBe(25.7);
    expect(midFlight.lat).not.toBe(25.8);

    // A new target arrives mid-flight - the value should continue from where
    // it already was, not snap back to the original start point.
    rerender({ target: { lat: 25.9, lon: -80.0 } });
    advanceFrames(1);
    expect(result.current.lat).toBeCloseTo(midFlight.lat, 2);
    expect(result.current.lon).toBeCloseTo(midFlight.lon, 2);

    advanceFrames(60);
    expect(result.current.lat).toBeCloseTo(25.9, 3);
    expect(result.current.lon).toBeCloseTo(-80.0, 3);
  });

  it('bypasses animation entirely under prefers-reduced-motion, snapping straight to target', () => {
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

    const { result, rerender } = renderHook(({ target }) => useSpringPosition(target), {
      initialProps: { target: { lat: 25.7, lon: -80.2 } },
    });

    rerender({ target: { lat: 25.8, lon: -80.1 } });

    expect(result.current).toEqual({ lat: 25.8, lon: -80.1 });
    expect(rafSpy).not.toHaveBeenCalled();

    window.matchMedia = originalMatchMedia;
    rafSpy.mockRestore();
  });
});
