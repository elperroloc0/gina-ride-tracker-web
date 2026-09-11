/**
 * How long since the last position fix before a live ride is shown as stale.
 * Not specified anywhere in DESIGN-SYSTEM.md (that doc covers motion easing,
 * not this threshold) - picked as a reasonable default, isolated here so
 * it's easy to retune without touching logic.
 */
export const STALE_AFTER_MS = 90_000;
