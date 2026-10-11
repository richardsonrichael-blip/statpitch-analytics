import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { LiveFixture } from "@/data/mock-live";

const LIVE_STATUSES = ["IN_PLAY", "PAUSED", "LIVE", "1H", "2H", "HT", "ET", "BT", "P"];

export function isLiveFixture(f: LiveFixture) {
  return LIVE_STATUSES.includes(f.status) || LIVE_STATUSES.includes(f.statusShort ?? "");
}

function minuteLabel(f: LiveFixture) {
  if (f.statusShort === "HT") return "HT";
  if (typeof f.minute === "number") return `${f.minute}${f.minuteExtra ? `+${f.minuteExtra}` : ""}'`;
  return "Live";
}

function LivePulse({ f }: { f: LiveFixture }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/15 px-2 py-0.5 text-[10px] font-bold uppercase text-success">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
      </span>
      {minuteLabel(f)}
    </span>
  );
}

function kickoffLabel(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/** Compact live / upcoming fixture rail for the command-centre grid. */
export function LiveRail({ fixtures }: { fixtures: LiveFixture[] }) {
  const [tab, setTab] = useState<"live" | "upcoming">("live");

  const live = fixtures.filter(isLiveFixture);
  const upcoming = fixtures.filter((f) => !isLiveFixture(f));
  const list = tab === "live" ? live : upcoming.slice(0, 6);


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

      <ul className={`divide-y divide-border ${tab === "live" ? "max-h-[28rem] overflow-y-auto" : ""}`}>
        {list.length === 0 && (
          <li className="p-6 text-center text-xs text-muted-foreground">
            {tab === "live"
              ? "No live matches right now — check upcoming fixtures below!"
              : "No upcoming matches in this view right now."}
          </li>
        )}
        {list.map((f) => (
          <li key={f.id}>
            <Link
              to="/team/$teamName"
              params={{ teamName: f.home }}
              className="group flex items-center justify-between gap-3 p-4 transition hover:bg-foreground/5"
            >
              <div className="flex items-center gap-3">
                {isLiveFixture(f) ? (
                  <LivePulse f={f} />
                ) : (
                  <span className="w-12 text-[10px] font-bold uppercase text-muted-foreground">
                    {kickoffLabel(f.utcDate)}
                  </span>
                )}
                <div className="space-y-0.5 text-xs font-semibold">
                  <p>{f.home}</p>
                  <p>{f.away}</p>
                </div>
              </div>
              <div className="space-y-0.5 text-right">
                <p className="text-xs font-bold tabular-nums">
                  {f.homeScore !== null && f.awayScore !== null ? (
                    `${f.homeScore} - ${f.awayScore}`
                  ) : (
                    <span className="text-muted-foreground">VS</span>
                  )}
                </p>

                {isLiveFixture(f) && f.probabilitiesAvailable !== false ? (
                  <p className="text-[10px] tabular-nums text-muted-foreground">
                    {f.homeWin}% · {f.draw}% · {f.awayWin}%
                  </p>
                ) : isLiveFixture(f) ? (
                  <p className="text-[10px] text-muted-foreground">Win % N/A</p>
                ) : null}
                <p className="text-[10px] text-neon group-hover:underline">Analysis →</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
