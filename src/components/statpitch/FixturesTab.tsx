import type { LiveFixture } from "@/data/mock-live";
import { TeamCrest } from "@/components/statpitch/TeamCrest";
import { isLiveFixture } from "@/components/statpitch/LiveRail";
import { hasMatchProbabilities } from "@/lib/match-probabilities";
import { MatchFreshness } from "@/components/statpitch/MatchFreshness";

function formatKickoff(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FixturesTab({ fixtures }: { fixtures: LiveFixture[] }) {
  if (fixtures.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground">
        No fixtures match your search.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {fixtures.map((f) => {
        const isLive = isLiveFixture(f);
        const hasScore = f.homeScore !== null && f.awayScore !== null;
        return (
          <article
            key={f.id}
            className="min-w-0 rounded-lg border border-border bg-surface p-5 transition hover:border-neon/40 card-shadow"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="font-semibold uppercase tracking-widest">{f.league}</span>
              <span className={isLive ? "font-bold text-neon" : ""}>
                {isLive ? "Live" : formatKickoff(f.utcDate)}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <h3 className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-base font-bold sm:text-lg">
                <span className="flex min-w-0 items-center gap-2"><TeamCrest src={f.homeCrest} name={f.home} /><span className="break-words [overflow-wrap:anywhere]">{f.home}</span></span>
                <span className="text-muted-foreground">vs</span>
                <span className="flex min-w-0 items-center gap-2"><TeamCrest src={f.awayCrest} name={f.away} /><span className="break-words [overflow-wrap:anywhere]">{f.away}</span></span>
              </h3>
              {hasScore && (
                <span className="shrink-0 rounded-lg bg-muted px-2.5 py-1 text-sm font-bold tabular-nums">
                  {f.homeScore} - {f.awayScore}
                </span>
              )}
            </div>

            {isLive && <MatchFreshness updatedAt={f.scoresUpdatedAt} />}
            {hasMatchProbabilities(f) && (
              <>
                <p className="mt-4 text-[11px] font-semibold text-muted-foreground">Win Probability %</p>
                <div className="mt-4 flex h-1.5 overflow-hidden rounded-full">
                  <div className="bg-neon" style={{ width: `${f.homeWin}%` }} />
                  {f.draw > 0 && (
                    <div className="bg-muted-foreground/40" style={{ width: `${f.draw}%` }} />
                  )}
                  <div className="bg-neon-dim" style={{ width: `${f.awayWin}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-muted-foreground tabular-nums">
                  <span>Home · {f.homeWin}%</span>
                  {f.draw > 0 && <span>Draw · {f.draw}%</span>}
                  <span>Away · {f.awayWin}%</span>
                </div>
              </>
            )}


          </article>
        );
      })}
    </div>
  );
}
