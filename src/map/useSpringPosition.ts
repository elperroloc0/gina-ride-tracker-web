import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export type LatLon = { lat: number; lon: number };

// DESIGN-SYSTEM.md: "two independent springs X and Y, damping 1.0, response
// 0.4" - damping ratio 1.0 is critical damping (no overshoot - "the van never
// bounces"), response is the undamped oscillation period, converted to the
// standard stiffness/damping-coefficient form for a mass=1 spring ODE:
//   x'' + dampingCoef*x' + stiffness*x = stiffness*target
const RESPONSE_SECONDS = 0.4;
const DAMPING_RATIO = 1.0;
const ANGULAR_FREQUENCY = (2 * Math.PI) / RESPONSE_SECONDS;
const STIFFNESS = ANGULAR_FREQUENCY * ANGULAR_FREQUENCY;
const DAMPING_COEFFICIENT = 2 * DAMPING_RATIO * ANGULAR_FREQUENCY;
// Below this distance/speed (in degrees, degrees/sec) the spring is
// considered settled - stops the rAF loop instead of running forever on an
// imperceptible residual wobble that would otherwise never hit exactly 0.
const SETTLE_EPSILON = 0.0000005;

/**
 * Animates toward `target` with two independent critically-damped springs
 * (see constants above) - retargets live from whatever's currently on screen
 * rather than restarting from scratch, so a new position arriving mid-flight
 * doesn't jump or reset velocity ("must retarget from the current on-screen
 * value, not the logical one" - DESIGN-SYSTEM.md). Bypassed entirely under
 * prefers-reduced-motion: reduce, where it just returns `target` directly.
 */
export function useSpringPosition(target: LatLon): LatLon {
  const reducedMotion = usePrefersReducedMotion();
  const [rendered, setRendered] = useState(target);
  const stateRef = useRef({ lat: target.lat, lon: target.lon, vLat: 0, vLon: 0 });
  const targetRef = useRef(target);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  targetRef.current = target;

  useEffect(() => {
    if (reducedMotion) {
      stateRef.current = { lat: target.lat, lon: target.lon, vLat: 0, vLon: 0 };
      setRendered(target);
      return;
    }

    function step(time: number) {
      const last = lastTimeRef.current ?? time;
      // Capped so a backgrounded/throttled tab resuming doesn't integrate one
      // huge dt and fling the spring instead of just continuing smoothly.
      const dt = Math.min((time - last) / 1000, 1 / 30);
      lastTimeRef.current = time;

      const s = stateRef.current;
      const t = targetRef.current;

      const aLat = STIFFNESS * (t.lat - s.lat) - DAMPING_COEFFICIENT * s.vLat;
      const aLon = STIFFNESS * (t.lon - s.lon) - DAMPING_COEFFICIENT * s.vLon;
      s.vLat += aLat * dt;
      s.vLon += aLon * dt;
      s.lat += s.vLat * dt;
      s.lon += s.vLon * dt;

      const settled =
        Math.abs(t.lat - s.lat) < SETTLE_EPSILON &&
        Math.abs(t.lon - s.lon) < SETTLE_EPSILON &&
        Math.abs(s.vLat) < SETTLE_EPSILON &&
        Math.abs(s.vLon) < SETTLE_EPSILON;

      if (settled) {
        s.lat = t.lat;
        s.lon = t.lon;
        setRendered({ lat: s.lat, lon: s.lon });
        frameRef.current = null;
        lastTimeRef.current = null;
        return;
      }

      setRendered({ lat: s.lat, lon: s.lon });
      frameRef.current = requestAnimationFrame(step);
    }

    if (frameRef.current == null) {
      frameRef.current = requestAnimationFrame(step);
    }

    return () => {
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
        lastTimeRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reads target via targetRef, only lat/lon primitives should retrigger
  }, [target.lat, target.lon, reducedMotion]);

  return rendered;
}
