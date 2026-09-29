import { OFFLINE_THRESHOLD_SECONDS } from '../config/constants.js'

// Pure function, deliberately kept free of DB/Express so it's trivial to
// unit test. A machine exactly at the threshold counts as offline — we'd
// rather flag a borderline machine than let a genuinely stale one read
// as online.
export function isMachineOffline(lastSeenAt: Date, now: Date): boolean {
  const secondsSinceLastSeen = (now.getTime() - lastSeenAt.getTime()) / 1000
  return secondsSinceLastSeen >= OFFLINE_THRESHOLD_SECONDS
}
