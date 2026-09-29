/**
 * Turns an ISO timestamp into a short "how long ago" string, e.g.
 * "just now", "12s ago", "3m ago", "2h ago", "5d ago".
 *
 * Deliberately simple — this dashboard only needs coarse recency, not a
 * full calendar-aware library like date-fns.
 */
export function formatRelativeTime(isoTimestamp: string): string {
  const then = new Date(isoTimestamp).getTime();
  const now = Date.now();
  const diffSeconds = Math.floor((now - then) / 1000);

  if (diffSeconds < 5) return "just now";
  if (diffSeconds < 60) return `${diffSeconds}s ago`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
