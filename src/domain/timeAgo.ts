/** "3s ago" / "2m ago" - short-form, for a van popup's last-update line next
 * to its Live/Signal-lost status. Pure (takes `now` explicitly) so it's
 * testable without real timers, same reasoning as ws/staleness.ts's isStale. */
export function timeAgo(deviceTimeIso: string, now: number): string {
  const seconds = Math.max(0, Math.round((now - new Date(deviceTimeIso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}
