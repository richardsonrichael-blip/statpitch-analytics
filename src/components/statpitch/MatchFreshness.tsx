import { useEffect, useState } from "react";
import { Clock3, TriangleAlert } from "lucide-react";
import { matchFreshness } from "@/lib/match-freshness";

export function MatchFreshness({ updatedAt }: { updatedAt?: string | undefined }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  if (now === null) return null;
  const { state, timestamp } = matchFreshness(updatedAt, now);
  const delayed = state !== "fresh";
  return <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]" aria-live="polite">
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <Clock3 className="size-3 shrink-0" aria-hidden />
      {timestamp === null ? "Last updated: unknown" : <>Last updated <time dateTime={updatedAt} title={new Date(timestamp).toLocaleString()}>{new Date(timestamp).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}</time></>}
    </span>
    <span className={`inline-flex items-center gap-1 font-semibold ${delayed ? "text-neon" : "text-muted-foreground"}`}>
      {delayed && <TriangleAlert className="size-3 shrink-0" aria-hidden />}
      {state === "stale" ? "Stale data · scores may be behind" : state === "unknown" ? "Freshness unverified · scores may be behind" : "15-minute updates"}
    </span>
  </div>;
}