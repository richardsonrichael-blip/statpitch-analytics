import { matchOfTheDay as m } from "@/data/football";
import { ProLock } from "@/components/statpitch/ProLock";

function Bar({ label, value, tone }: { label: string; value: number; tone?: "muted" }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={tone === "muted" ? "h-full rounded-full bg-muted-foreground/60" : "h-full rounded-full bg-neon"}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function HeroMatch() {
  return (
    <section className="pitch-hero relative overflow-hidden rounded-3xl border border-border p-5 card-shadow sm:p-7">
      <div className="flex flex-wrap items-center gap-3">
        <span className="stat-pill">Match of the Day</span>
        <span className="text-xs text-muted-foreground">
          {m.league} · {m.kickoff}
        </span>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold sm:text-4xl">
            {m.home} <span className="text-muted-foreground">vs</span> {m.away}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Live {m.minute}' · Score {m.score} · Avg goals {m.overUnder.avgGoals}
          </p>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-4xl font-bold text-neon tabular-nums">{m.overUnder.over}%</p>
          <p className="text-xs text-muted-foreground">Over 2.5 probability</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface/70 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Live probabilities
          </p>
          <div className="space-y-2.5">
            <Bar label={m.home} value={m.probabilities.home} />
            <Bar label="Draw" value={m.probabilities.draw} tone="muted" />
            <Bar label={m.away} value={m.probabilities.away} tone="muted" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface/70 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Head-to-Head ({m.h2h.played})
          </p>
          <div className="flex h-2 overflow-hidden rounded-full">
            <div className="bg-neon" style={{ width: `${m.h2h.home}%` }} />
            <div className="bg-muted-foreground/50" style={{ width: `${m.h2h.draw}%` }} />
            <div className="bg-neon-dim" style={{ width: `${m.h2h.away}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-3 text-center text-sm">
            <div>
              <p className="font-bold text-neon tabular-nums">{m.h2h.home}%</p>
              <p className="text-[11px] text-muted-foreground">Home wins</p>
            </div>
            <div>
              <p className="font-bold tabular-nums">{m.h2h.draw}%</p>
              <p className="text-[11px] text-muted-foreground">Draws</p>
            </div>
            <div>
              <p className="font-bold tabular-nums">{m.h2h.away}%</p>
              <p className="text-[11px] text-muted-foreground">Away wins</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface/70 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Over / Under 2.5
          </p>
          <div className="space-y-2.5">
            <Bar label="Over 2.5" value={m.overUnder.over} />
            <Bar label="Under 2.5" value={m.overUnder.under} tone="muted" />
            <Bar label="Both teams to score" value={m.overUnder.bttsPct} />
          </div>
        </div>
      </div>
      <div className="mt-4">
        <ProLock feature="AI match prediction" cta="Unlock">
          <div className="grid gap-4 rounded-2xl border border-border bg-surface/70 p-4 sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Predicted scoreline
              </p>
              <p className="mt-1 text-2xl font-bold text-neon tabular-nums">2 - 1</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Model pick
              </p>
              <p className="mt-1 text-2xl font-bold">{m.home} & Over 2.5</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Corners / cards
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">10.4 / 4.2</p>
            </div>
          </div>
        </ProLock>
      </div>
    </section>
  );
}
