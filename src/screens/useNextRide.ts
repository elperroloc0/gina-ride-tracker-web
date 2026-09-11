import { useEffect, useState } from 'react';
import { getGeoFence, getRoute } from '../api/client';
import type { ChildDTO } from '../api/types';
import { computeNextRide, type NextRide } from '../domain/schedule';

type State = {
  nextRide: NextRide | null;
  origin?: string;
  destination?: string;
  loading: boolean;
};

/**
 * Combines the pure computeNextRide() with the two-step route -> geofence
 * name lookups (RouteSerializer only exposes bare geofence ids, not nested
 * objects).
 */
export function useNextRide(child: ChildDTO | undefined): State {
  const [state, setState] = useState<State>({ nextRide: null, loading: true });

  useEffect(() => {
    if (!child) return;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));

    (async () => {
      const nextRide = computeNextRide(child.schedule, new Date());
      const route = await getRoute(child.route);
      const [origin, destination] = await Promise.all([getGeoFence(route.origin), getGeoFence(route.destination)]);
      if (!cancelled) {
        setState({ nextRide, origin: origin.name, destination: destination.name, loading: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [child]);

  return state;
}
