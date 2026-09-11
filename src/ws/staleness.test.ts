import { describe, expect, it } from 'vitest';
import { isStale } from './staleness';

describe('isStale', () => {
  const now = new Date('2026-01-01T12:00:00.000Z').getTime();

  it('is not stale just under the threshold', () => {
    const deviceTime = new Date(now - 89_000).toISOString();
    expect(isStale(deviceTime, now, 90_000)).toBe(false);
  });

  it('is stale just over the threshold', () => {
    const deviceTime = new Date(now - 91_000).toISOString();
    expect(isStale(deviceTime, now, 90_000)).toBe(true);
  });

  it('defaults to STALE_AFTER_MS when no threshold is given', () => {
    const deviceTime = new Date(now - 1_000).toISOString();
    expect(isStale(deviceTime, now)).toBe(false);
  });
});
