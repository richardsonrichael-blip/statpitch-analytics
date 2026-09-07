import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { LiveFixture } from "@/data/mock-live";

const LIVE_STATUSES = ["IN_PLAY", "PAUSED", "LIVE"];

function isLiveFixture(f: LiveFixture) {
  return LIVE_STATUSES.includes(f.status);
}

function kickoffLabel(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/** Compact live / upcoming fixture rail for the command-centre grid. */
export function LiveRail({ fixtures }: { fixtures: LiveFixture[] }) {
  const [tab, setTab] = useState<"live" | "upcoming">("live");

  const live = fixtures.filter(isLiveFixture);
  const upcoming = fixtures.filter((f) => !isLiveFixture(f));
  const list = (tab === "live" ? (live.length ? live : upcoming) : upcoming).slice(0, 6);


  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface card-shadow">
      <div className="flex bg-background/60">
        {(["live", "upcoming"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition ${
              tab === t
                ? "border-b-2 border-neon text-neon"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "live" ? "Live now" : "Upcoming"}
          </button>
        ))}
      </div>

      <ul className="divide-y divide-border">
        {list.length === 0 && (
          <li className="p-4 text-xs text-muted-foreground">No matches in this view right now.</li>
        )}
        {list.map((f) => (
          <li key={f.id}>
            <Link
              to="/team/$teamName"
              params={{ teamName: f.home }}
              className="group flex items-center justify-between gap-3 p-4 transition hover:bg-foreground/5"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-10 text-[10px] font-bold uppercase ${
                    f.isLive ? "text-neon" : "text-muted-foreground"
                  }`}
                >
                  {f.isLive ? f.statusLabel : f.kickoffLabel}
                </span>
                <div className="space-y-0.5 text-xs font-semibold">
                  <p>{f.home}</p>
                  <p>{f.away}</p>
                </div>
              </div>
              <div className="space-y-0.5 text-right">
                <p className="text-xs font-bold tabular-nums">
                  {f.score ?? <span className="text-muted-foreground">VS</span>}
                </p>
                <p className="text-[10px] text-neon group-hover:underline">Analysis →</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
