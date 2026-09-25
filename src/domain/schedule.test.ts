import { describe, expect, it } from 'vitest';
import type { ChildScheduleDTO } from '../api/types';
import { computeNextRide, todaysPickup } from './schedule';

function row(weekday: number, pickup_hour: string): ChildScheduleDTO {
  return { id: weekday, child: 1, weekday, pickup_hour };
}

describe('computeNextRide', () => {
  it('returns null for an empty schedule', () => {
    expect(computeNextRide([], new Date('2026-01-05T12:00:00'))).toBeNull();
  });

  it('picks the correct weekday and time, and marks the Sun..Sat active-days strip', () => {
    // Monday(0), Wednesday(2), Friday(4) - "now" is Tuesday.
    const schedule = [row(0, '15:00:00'), row(2, '15:00:00'), row(4, '15:00:00')];
    const now = new Date('2026-01-06T09:00:00'); // a Tuesday

    const result = computeNextRide(schedule, now)!;
    expect(result.weekday).toBe('Wednesday');
    expect(result.daysAway).toBe(1);
    // Sun,Mon,Tue,Wed,Thu,Fri,Sat
    expect(result.activeDays).toEqual([false, true, false, true, false, true, false]);
  });

  it('shows "later today" (0 days away) when the pickup has not happened yet', () => {
    const schedule = [row(1, '15:00:00')]; // Tuesday
    const now = new Date('2026-01-06T09:00:00'); // Tuesday morning, before pickup

    const result = computeNextRide(schedule, now)!;
    expect(result.weekday).toBe('Tuesday');
    expect(result.daysAway).toBe(0);
  });

  it('wraps to next week when today\'s pickup has already passed', () => {
    const schedule = [row(1, '15:00:00')]; // Tuesday
    const now = new Date('2026-01-06T18:00:00'); // Tuesday evening, after pickup

    const result = computeNextRide(schedule, now)!;
    expect(result.weekday).toBe('Tuesday');
    expect(result.daysAway).toBe(7);
  });
});

describe('todaysPickup', () => {
  const tuesday = new Date('2026-01-06T09:00:00');

  it("returns today's pickup time", () => {
    expect(todaysPickup([row(0, '14:00:00'), row(1, '15:30:00')], tuesday)).toBe('15:30:00');
  });

  it('returns null when today is not scheduled', () => {
    expect(todaysPickup([row(0, '14:00:00'), row(2, '15:30:00')], tuesday)).toBeNull();
    expect(todaysPickup([], tuesday)).toBeNull();
  });
});
