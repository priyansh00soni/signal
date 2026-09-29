// How long a machine can go without a heartbeat before we consider it
// offline. 30s keeps the demo dashboard responsive to change without
// flickering on normal network jitter between heartbeats.
export const OFFLINE_THRESHOLD_SECONDS = 30
