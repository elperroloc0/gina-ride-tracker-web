import { useEffect, useState } from 'react';
import type { LngLat } from './directions';
import type { VanPosition } from '../ws/vanSocket';

// Generous headroom above what a real ride ever produces (a position every
// few seconds for 15-30 minutes is a couple hundred points at most) - this
// is a hard backstop for the pathological case, not the normal bound.
// tracking/services.py's own ACTIVE_RIDE_MAX_DURATION (6 hours) is the
// server-side safety net for a ride that never got its "arrived" webhook;
// this keeps the client-side array bounded even across that entire window
// rather than growing without limit for as long as the tab stays open.
export const MAX_TRAIL_POINTS = 1000;

/**
 * Accumulates live positions into a breadcrumb trail - the actual path
 * driven, not a planned route (see directions.ts, which this replaces on
 * ParentRide). Deliberately holds no cleanup of its own: the trail lives in
 * plain component state, so it exists only as long as the component
 * calling this hook is mounted, and ParentRide only stays mounted for as
 * long as its WebSocket does - which the server itself closes the moment a
 * ride isn't active (tracking/consumers.py). A ride ending unmounts
 * ParentRide (RideTab swaps it for ParentIdle), which discards this state
 * the ordinary React way - there is nothing external here (no timer, no
 * subscription, no observer) that would outlive that.
 */
export function useVanTrail(position: VanPosition | null): LngLat[] {
  const [trail, setTrail] = useState<LngLat[]>([]);

  useEffect(() => {
    if (!position) return;
    setTrail((prev) => {
      const next: LngLat[] = [...prev, [position.lon, position.lat]];
      return next.length > MAX_TRAIL_POINTS ? next.slice(next.length - MAX_TRAIL_POINTS) : next;
    });
  }, [position]);

  return trail;
}
