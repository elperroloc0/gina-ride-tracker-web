import type { TimelineStep } from 'gina-ride-tracker-ds';

export type RideState = 'active' | 'completed' | 'scheduled' | 'none';

/** Mirrors the backend's pickup window (tracking.views.arrival_webhook, +-30 min). */
const PICKUP_WINDOW_MS = 30 * 60 * 1000;

export function pickupDate(pickupHour: string, now: Date): Date {
  const [h, m] = pickupHour.split(':').map(Number);
  const d = new Date(now);
  d.setHours(h, m, 0, 0);
  return d;
}

/**
 * The backend's `ride_active` is the only thing that says a ride is running -
 * a van merely passing a geofence proves nothing (that was the source of
 * ticks on rides that never started). Arrival events are used only to tell a
 * ride that already finished today from one that never happened.
 */
export function deriveRideState(input: {
  rideActive: boolean;
  todaysPickup: string | null;
  /** Times of today's 'in' events at the route's destination, for this van. */
  destinationArrivals: Date[];
  now: Date;
}): RideState {
  if (input.rideActive) return 'active';
  if (input.todaysPickup === null) return 'none';
  const windowStart = pickupDate(input.todaysPickup, input.now).getTime() - PICKUP_WINDOW_MS;
  const finished = input.destinationArrivals.some((t) => t.getTime() >= windowStart);
  return finished ? 'completed' : 'scheduled';
}

export function timelineSteps(state: RideState, originName: string, destinationName: string): TimelineStep[] {
  const states: Record<RideState, [TimelineStep['state'], TimelineStep['state'], TimelineStep['state']]> = {
    active: ['done', 'current', 'future'],
    completed: ['done', 'done', 'done'],
    scheduled: ['future', 'future', 'future'],
    none: ['future', 'future', 'future'],
  };
  const [a, b, c] = states[state];
  return [
    { label: `Picked up at ${originName}`, state: a },
    { label: `On the way to ${destinationName}`, state: b },
    { label: `Arrives at ${destinationName}`, state: c },
  ];
}
