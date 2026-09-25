import { describe, expect, it } from 'vitest';
import { deriveRideState, timelineSteps } from './rideStatus';

const now = new Date('2026-01-06T15:10:00'); // Tuesday
const base = { rideActive: false, todaysPickup: '15:00:00', destinationArrivals: [] as Date[], now };

describe('deriveRideState', () => {
  it('is active whenever the backend says the ride is active', () => {
    expect(deriveRideState({ ...base, rideActive: true })).toBe('active');
  });

  it('is none when there is no pickup today, even with a destination arrival', () => {
    expect(deriveRideState({ ...base, todaysPickup: null, destinationArrivals: [new Date('2026-01-06T15:05:00')] })).toBe('none');
  });

  it('is scheduled when a pickup is planned but no ride ran', () => {
    expect(deriveRideState(base)).toBe('scheduled');
  });

  it('ignores a destination arrival from before the pickup window', () => {
    expect(deriveRideState({ ...base, destinationArrivals: [new Date('2026-01-06T08:00:00')] })).toBe('scheduled');
  });

  it('is completed after an arrival at the destination inside the window', () => {
    expect(deriveRideState({ ...base, destinationArrivals: [new Date('2026-01-06T15:40:00')] })).toBe('completed');
  });
});

describe('timelineSteps', () => {
  it('shows no ticks unless a ride is active or completed', () => {
    for (const state of ['none', 'scheduled'] as const) {
      expect(timelineSteps(state, 'School', 'Gym').map((s) => s.state)).toEqual(['future', 'future', 'future']);
    }
    expect(timelineSteps('active', 'School', 'Gym').map((s) => s.state)).toEqual(['done', 'current', 'future']);
    expect(timelineSteps('completed', 'School', 'Gym').map((s) => s.state)).toEqual(['done', 'done', 'done']);
  });
});
