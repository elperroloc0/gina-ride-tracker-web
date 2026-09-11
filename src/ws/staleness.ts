import { STALE_AFTER_MS } from './constants';

/**
 * Pure so it's testable without a real WebSocket or timers, and reused by
 * both the parent's own staleness timer and the operator console's per-van
 * marker coloring - same rule, one place.
 */
export function isStale(deviceTimeIso: string, now: number, thresholdMs: number = STALE_AFTER_MS): boolean {
  return now - new Date(deviceTimeIso).getTime() > thresholdMs;
}
