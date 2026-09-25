import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export type LatLon = { lat: number; lon: number };

// A tracker reports every few seconds. Easing toward each fix (the old
// critically-damped spring) finished in ~0.4s and then sat still until the
// next one - stop-and-go. Instead the marker glides between fixes at constant
// speed, taking as long as fixes usually take to arrive, so it is still
// moving when the next one lands (the way navigation apps and Uber render).
const DEFAULT_INTERVAL_MS = 3000;
// Intervals outside this range (a van that sat still for a minute, a burst of
// buffered fixes) say nothing about the tracker's cadence - they don't feed
// the estimate, and the last good estimate is used for that leg instead.
const MIN_INTERVAL_MS = 500;
const MAX_INTERVAL_MS = 8000;
// Weight of the newest interval in the running estimate.
const INTERVAL_SMOOTHING = 0.3;

type Leg = { from: LatLon; to: LatLon; startedAt: number; duration: number };

/**
 * Glides toward `target` in a straight line at constant speed. Retargets from
 * whatever is currently on screen (never jumps back to the previous fix), and
 * returns `null` until the first real target exists so a marker never animates
 * in from a fake (0,0). Bypassed under prefers-reduced-motion: reduce, where
 * it just returns `target` directly.
 */
export function useSmoothPosition(target: LatLon | null): LatLon | null {
  const reducedMotion = usePrefersReducedMotion();
  const [rendered, setRendered] = useState<LatLon | null>(target);
  const renderedRef = useRef<LatLon | null>(target);
  const legRef = useRef<Leg | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastFixAtRef = useRef<number | null>(null);
  const intervalRef = useRef(DEFAULT_INTERVAL_MS);

  const lat = target?.lat;
  const lon = target?.lon;

  useEffect(() => {
    if (lat == null || lon == null) return;
    const to = { lat, lon };

    if (reducedMotion || renderedRef.current == null) {
      renderedRef.current = to;
      legRef.current = null;
      setRendered(to);
      lastFixAtRef.current = performance.now();
      return;
    }

    const now = performance.now();
    if (lastFixAtRef.current != null) {
      const gap = now - lastFixAtRef.current;
      if (gap >= MIN_INTERVAL_MS && gap <= MAX_INTERVAL_MS) {
        intervalRef.current += (gap - intervalRef.current) * INTERVAL_SMOOTHING;
      }
    }
    lastFixAtRef.current = now;
    legRef.current = { from: renderedRef.current, to, startedAt: now, duration: intervalRef.current };

    function step(time: number) {
      const leg = legRef.current;
      if (!leg) {
        frameRef.current = null;
        return;
      }
      const t = Math.min((time - leg.startedAt) / leg.duration, 1);
      const next = {
        lat: leg.from.lat + (leg.to.lat - leg.from.lat) * t,
        lon: leg.from.lon + (leg.to.lon - leg.from.lon) * t,
      };
      renderedRef.current = next;
      setRendered(next);
      if (t >= 1) {
        legRef.current = null;
        frameRef.current = null;
        return;
      }
      frameRef.current = requestAnimationFrame(step);
    }

    if (frameRef.current == null) frameRef.current = requestAnimationFrame(step);
  }, [lat, lon, reducedMotion]);

  useEffect(
    () => () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    },
    [],
  );

  return reducedMotion ? target : rendered;
}
