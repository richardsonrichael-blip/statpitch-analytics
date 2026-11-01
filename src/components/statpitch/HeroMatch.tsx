import type { LiveFixture } from "@/data/mock-live";
import { AiPredictionPanel } from "@/components/statpitch/AiPredictionPanel";
import { hasMatchProbabilities } from "@/lib/match-probabilities";
import { isLiveFixture } from "@/components/statpitch/LiveRail";

function Bar({ label, value, tone }: { label: string; value: number; tone?: "muted" }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="truncate text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={
            tone === "muted"
              ? "h-full rounded-full bg-muted-foreground/60"
              : "h-full rounded-full bg-neon"
          }
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function kickoffLabel(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Top match of the current sport, priced from the live odds feed. */
export function HeroMatch({ fixture }: { fixture?: LiveFixture | undefined }) {
  if (!fixture) {
    return (
      <section className="pitch-hero rounded-3xl border border-border p-7 card-shadow">
        <span className="stat-pill">Match of the Day</span>
        <p className="mt-4 text-sm text-muted-foreground">
          No upcoming matches in this sport right now — check another sport or come back closer to
          kick-off.
        </p>
      </section>
    );
  }

  const isLive = isLiveFixture(fixture);
  const favourite = fixture.homeWin >= fixture.awayWin ? fixture.home : fixture.away;
  const favouriteProb = Math.max(fixture.homeWin, fixture.awayWin);
  const hasProb = hasMatchProbabilities(fixture);

  return (
    <section className="pitch-hero relative overflow-hidden rounded-3xl border border-border p-5 card-shadow sm:p-7">
      <div className="flex flex-wrap items-center gap-3">
        <span className="stat-pill">Match of the Day</span>
        <span className="text-xs text-muted-foreground">
          {fixture.league} · {isLive ? "In play now" : kickoffLabel(fixture.utcDate)}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="break-words text-2xl font-bold [overflow-wrap:anywhere] sm:text-4xl">
            {fixture.home} <span className="text-muted-foreground">vs</span> {fixture.away}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {fixture.homeScore !== null && fixture.awayScore !== null
              ? `Score ${fixture.homeScore} - ${fixture.awayScore} · `
              : ""}
            {hasProb ? `Highest win probability · ${favourite}` : "Live fixture data"}
          </p>
        </div>
        {hasProb && (
          <div className="hidden shrink-0 text-right sm:block">
            <p className="text-4xl font-bold text-neon tabular-nums">{favouriteProb}%</p>
            <p className="text-xs text-muted-foreground">Win probability</p>
          </div>
        )}
      </div>

      {hasProb && <div className="mt-6 border-t border-border pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Win Probability %
          </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Bar label={fixture.home} value={fixture.homeWin} />
              {fixture.draw > 0 && <Bar label="Draw" value={fixture.draw} tone="muted" />}
              <Bar label={fixture.away} value={fixture.awayWin} tone="muted" />
            </div>
      </div>}

      <div className="mt-4">
        <AiPredictionPanel fixture={fixture} />
      </div>
    </section>
  );
}
