import type { ChildScheduleDTO } from '../api/types';

export type NextRide = {
  weekday: string;
  time: string;
  /** Sun..Sat, matching the pickup-day strip in the UI. */
  activeDays: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
  daysAway: number;
};

const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Pure and framework-agnostic so it's trivially testable and reusable across
 * ParentIdle, Schedule, and the operator roster. `now` is a parameter (never
 * read internally) for the same reason.
 *
 * accounts.models.ChildSchedule.Weekday is 0=Monday..6=Sunday; the UI's
 * pickup-day strip runs Sun..Sat - `(weekday + 1) % 7` is the one fiddly
 * translation between the two, covered by a test.
 */
export function computeNextRide(schedule: ChildScheduleDTO[], now: Date): NextRide | null {
  if (schedule.length === 0) return null;

  const activeDays: NextRide['activeDays'] = [false, false, false, false, false, false, false];
  for (const s of schedule) activeDays[(s.weekday + 1) % 7] = true;

  const nowWeekday = (now.getDay() + 6) % 7; // JS 0=Sunday -> backend 0=Monday
  let best: { daysAway: number; row: ChildScheduleDTO } | null = null;

  for (const s of schedule) {
    let daysAway = (s.weekday - nowWeekday + 7) % 7;
    if (daysAway === 0) {
      const [h, m] = s.pickup_hour.split(':').map(Number);
      const pickup = new Date(now);
      pickup.setHours(h, m, 0, 0);
      if (pickup < now) daysAway = 7; // today's pickup already passed - wrap to next week
    }
    if (best === null || daysAway < best.daysAway) best = { daysAway, row: s };
  }

  const [h, m] = best!.row.pickup_hour.split(':').map(Number);
  const time = new Date(0, 0, 0, h, m).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return {
    weekday: WEEKDAY_NAMES[best!.row.weekday],
    time,
    activeDays,
    daysAway: best!.daysAway,
  };
}
