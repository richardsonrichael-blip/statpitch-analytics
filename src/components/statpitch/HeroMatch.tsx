import type { LiveFixture } from "@/data/mock-live";
import { AiPredictionPanel } from "@/components/statpitch/AiPredictionPanel";
import { OddsBoard } from "@/components/statpitch/OddsPanel";

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
          No priced matches in this sport right now — check another sport or come back closer to
          kick-off.
        </p>
      </section>
    );
  }

  const isLive = fixture.status === "IN_PLAY";
  const bookCount = fixture.books?.length ?? 0;
  const favourite = fixture.homeWin >= fixture.awayWin ? fixture.home : fixture.away;
  const favouriteProb = Math.max(fixture.homeWin, fixture.awayWin);

  return (
    <section className="pitch-hero relative overflow-hidden rounded-3xl border border-border p-5 card-shadow sm:p-7">
      <div className="flex flex-wrap items-center gap-3">
        <span className="stat-pill">Match of the Day</span>
        <span className="text-xs text-muted-foreground">
          {fixture.league} · {isLive ? "In play now" : kickoffLabel(fixture.utcDate)}
        </span>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold sm:text-4xl">
            {fixture.home} <span className="text-muted-foreground">vs</span> {fixture.away}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {fixture.homeScore !== null && fixture.awayScore !== null
              ? `Score ${fixture.homeScore} - ${fixture.awayScore} · `
              : ""}
            {bookCount > 0 ? `${bookCount} bookmakers priced` : "Market forming"} · Market
            favourite {favourite}
          </p>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-4xl font-bold text-neon tabular-nums">{favouriteProb}%</p>
          <p className="text-xs text-muted-foreground">Win probability</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface/70 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Market probabilities
          </p>
          <div className="space-y-2.5">
            <Bar label={fixture.home} value={fixture.homeWin} />
            {fixture.draw > 0 && <Bar label="Draw" value={fixture.draw} tone="muted" />}
            <Bar label={fixture.away} value={fixture.awayWin} tone="muted" />
          </div>
          <OddsBoard
            probability={fixture.homeWin}
            seed={`${fixture.id}-home`}
            books={fixture.books}
            side="home"
            selection={`${fixture.home} vs ${fixture.away} · ${fixture.home} to win`}
            label={`${fixture.home} to win`}
          />
        </div>

        <div className="rounded-2xl border border-border bg-surface/70 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Other side of the market
          </p>
          <div className="flex flex-wrap gap-2">
            {fixture.pills.map((p) => (
              <span key={p} className="stat-pill">
                {p}
              </span>
            ))}
          </div>
          <OddsBoard
            probability={fixture.awayWin}
            seed={`${fixture.id}-away`}
            books={fixture.books}
            side="away"
            selection={`${fixture.home} vs ${fixture.away} · ${fixture.away} to win`}
            label={`${fixture.away} to win`}
          />
        </div>
      </div>

      <div className="mt-4">
        <AiPredictionPanel fixture={fixture} />
      </div>
    </section>
  );
}
