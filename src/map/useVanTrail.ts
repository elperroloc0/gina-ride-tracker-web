import { useEffect, useMemo, useState } from 'react';
import type { LngLat } from './directions';
import type { LatLon } from './useSmoothPosition';

// Points are added by distance travelled, not per position update, so the
// count is bounded by route length rather than tracker cadence. 2000 points
// at MIN_STEP_METERS is ~20 km - more than any ride - so this is a hard
// backstop for the pathological case (tracking/services.py's own
// ACTIVE_RIDE_MAX_DURATION is the server-side 6h safety net), not the normal
// bound.
export const MAX_TRAIL_POINTS = 2000;
export const MIN_STEP_METERS = 10;

const METERS_PER_DEGREE = 111_320;

function metersBetween(a: LngLat, b: LatLon): number {
  const dLat = (b.lat - a[1]) * METERS_PER_DEGREE;
  const dLon = (b.lon - a[0]) * METERS_PER_DEGREE * Math.cos((b.lat * Math.PI) / 180);
  return Math.hypot(dLat, dLon);
}

/**
 * Accumulates the path the van has actually driven into a breadcrumb trail,
 * sampled from the *on-screen* (smoothed) position so the line and the marker
 * can never disagree. Returns only the settled points: the last stretch up to
 * the marker changes every animation frame, so the caller draws that as its own
 * two-point segment (last trail point -> marker) instead of re-uploading the
 * whole line 60 times a second.
 *
 * Deliberately holds no cleanup of its own: the trail lives in plain component
 * state, so it exists only as long as the component calling this hook is
 * mounted, and ParentRide only stays mounted for as long as its WebSocket does
 * - which the server closes the moment a ride isn't active
 * (tracking/consumers.py). A ride ending unmounts ParentRide, which discards
 * this state the ordinary React way.
 */
/** Keeps a point only once it is MIN_STEP_METERS from the last kept one. */
function thin(points: LngLat[]): LngLat[] {
  const out: LngLat[] = [];
  for (const p of points) {
    const last = out[out.length - 1];
    if (!last || metersBetween(last, { lat: p[1], lon: p[0] }) >= MIN_STEP_METERS) out.push(p);
  }
  return out;
}

function capped(points: LngLat[]): LngLat[] {
  return points.length > MAX_TRAIL_POINTS ? points.slice(points.length - MAX_TRAIL_POINTS) : points;
}

export function useVanTrail(position: LatLon | null, history?: LngLat[]): LngLat[] {
  const [live, setLive] = useState<LngLat[]>([]);

  const lat = position?.lat;
  const lon = position?.lon;

  useEffect(() => {
    if (lat == null || lon == null) return;
    setLive((prev) => {
      const last = prev[prev.length - 1];
      if (last && metersBetween(last, { lat, lon }) < MIN_STEP_METERS) return prev;
      return capped([...prev, [lon, lat]]);
    });
  }, [lat, lon]);

  // Where the ride started, as recorded by the server: without it a reload
  // would only draw from wherever the van happens to be. It arrives after some
  // live points, but those were saved server-side before being broadcast, so
  // they are already inside it - the live points seen so far are skipped rather
  // than merged. Derived during render (not merged in an effect), so running it
  // twice - StrictMode does - can't stitch the path onto itself.
  const [seenHistory, setSeenHistory] = useState(history);
  const [liveToSkip, setLiveToSkip] = useState(0);
  if (history !== seenHistory) {
    setSeenHistory(history);
    setLiveToSkip(live.length);
  }

  return useMemo(
    () => (history && history.length > 0 ? capped(thin([...history, ...live.slice(liveToSkip)])) : live),
    [history, live, liveToSkip],
  );
}
