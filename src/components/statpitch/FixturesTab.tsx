import type { Fixture } from "@/data/football";

export function FixturesTab({ fixtures }: { fixtures: Fixture[] }) {
  if (fixtures.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground">
        No fixtures match your search.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {fixtures.map((f) => (
        <article
          key={f.id}
          className="rounded-2xl border border-border bg-surface p-5 transition hover:border-neon/40 card-shadow"
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-widest">{f.league}</span>
            <span>{f.kickoff}</span>
          </div>
          <h3 className="mt-2 text-lg font-bold">
            {f.home} <span className="text-muted-foreground">vs</span> {f.away}
          </h3>

          <div className="mt-4 flex flex-wrap gap-2">
            {f.pills.map((p) => (
              <span key={p} className="stat-pill">
                {p}
              </span>
            ))}
          </div>

          <div className="mt-4 flex h-1.5 overflow-hidden rounded-full">
            <div className="bg-neon" style={{ width: `${f.homeWin}%` }} />
            <div className="bg-muted-foreground/40" style={{ width: `${f.draw}%` }} />
            <div className="bg-neon-dim" style={{ width: `${f.awayWin}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-muted-foreground tabular-nums">
            <span>1 · {f.homeWin}%</span>
            <span>X · {f.draw}%</span>
            <span>2 · {f.awayWin}%</span>
          </div>
        </article>
      ))}
    </div>
  );
}
