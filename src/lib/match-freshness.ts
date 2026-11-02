export const LIVE_STALE_AFTER_MS = 15 * 60_000;

/** Missing, invalid or future timestamps cannot establish freshness. */
export function matchFreshness(updatedAt: string | undefined, now: number) {
  const timestamp = updatedAt ? Date.parse(updatedAt) : Number.NaN;
  if (!Number.isFinite(timestamp) || timestamp > now) return { state: "unknown" as const, timestamp: null };
  return { state: now - timestamp >= LIVE_STALE_AFTER_MS ? "stale" as const : "fresh" as const, timestamp };
}