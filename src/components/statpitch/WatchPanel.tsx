import type { LiveFixture } from "@/data/mock-live";
import type { MatchDetails } from "@/lib/match-details.types";
import { isLiveFixture } from "@/components/statpitch/LiveRail";

const ICON: Record<string, string> = { goal: "⚽", card: "🟨", sub: "🔁", other: "•" };

/** Legal "watch along": official highlight search, broadcaster lookup and event-driven commentary. */
export function WatchPanel({ f, d }: { f: LiveFixture; d: MatchDetails | null }) {
  const name = `${f.home} vs ${f.away}`;
  const highlights = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${name} official highlights`)}`;
  const broadcast = `https://www.google.com/search?q=${encodeURIComponent(`where to watch ${name} ${f.league} live TV`)}`;
  const feed = [...(d?.events ?? [])].sort((a, b) => b.minute - a.minute);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <a href={highlights} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-neon/40 bg-neon/10 p-4 transition hover:bg-neon/20">
          <p className="font-display text-xl tracking-wide text-neon">▶ Watch highlights</p>
          <p className="mt-1 text-xs text-muted-foreground">Official clips on YouTube</p>
        </a>
        <a href={broadcast} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-border bg-background/60 p-4 transition hover:border-neon/40">
          <p className="font-display text-xl tracking-wide">📺 Where to watch live</p>
          <p className="mt-1 text-xs text-muted-foreground">Find the official broadcaster in your country</p>
        </a>
      </div>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {isLiveFixture(f) && <span className="h-2 w-2 animate-pulse rounded-full bg-success" />}
          Live commentary
        </h3>
        {feed.length === 0 ? (
          <p className="rounded-xl bg-background/60 p-4 text-sm text-muted-foreground">
            Commentary appears here as goals, cards and substitutions happen in live-feed football matches.
          </p>
        ) : (
          <ul className="space-y-2">
            {feed.map((e, i) => (
              <li key={i} className={`flex gap-3 rounded-xl p-3 text-sm ${e.type === "goal" ? "border border-neon/40 bg-neon/10" : "bg-background/60"}`}>
                <span className="w-10 shrink-0 font-bold tabular-nums text-neon">{e.label}</span>
                <span className="min-w-0 break-words">
                  {ICON[e.type] ?? "•"} <strong>{e.type === "goal" ? "GOAL! " : ""}{e.player || e.detail}</strong>
                  {" "}({e.side === "home" ? f.home : f.away}) — {e.detail}
                  {e.assist ? `, assisted by ${e.assist}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
