import type { LiveFixture } from "@/data/mock-live";
import { OddsBoard } from "@/components/statpitch/OddsPanel";

const LIVE_STATUSES = ["IN_PLAY", "PAUSED", "LIVE"];

function formatKickoff(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Crest({ src, name }: { src: string | null; name: string }) {
  if (!src) {
    return (
      <span className="grid size-6 place-items-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground">
        {name.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return <img src={src} alt={`${name} crest`} loading="lazy" className="size-6 object-contain" />;
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
        const isLive = LIVE_STATUSES.includes(f.status);
        const hasScore = f.homeScore !== null && f.awayScore !== null;
        return (
          <article
            key={f.id}
            className="rounded-2xl border border-border bg-surface p-5 transition hover:border-neon/40 card-shadow"
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold uppercase tracking-widest">{f.league}</span>
              <span className={isLive ? "font-bold text-neon" : ""}>
                {isLive ? "Live" : formatKickoff(f.utcDate)}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <h3 className="flex flex-wrap items-center gap-2 text-base font-bold sm:text-lg">
                <Crest src={f.homeCrest} name={f.home} />
                {f.home}
                <span className="text-muted-foreground">vs</span>
                <Crest src={f.awayCrest} name={f.away} />
                {f.away}
              </h3>
              {hasScore && (
                <span className="shrink-0 rounded-lg bg-muted px-2.5 py-1 text-sm font-bold tabular-nums">
                  {f.homeScore} - {f.awayScore}
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {f.pills.map((p) => (
                <span key={p} className="stat-pill">
                  {p}
                </span>
              ))}
            </div>

            <div className="mt-4 flex h-1.5 overflow-hidden rounded-full">
              <div className="bg-neon" style={{ width: `${f.homeWin}%` }} />
              {f.draw > 0 && (
                <div className="bg-muted-foreground/40" style={{ width: `${f.draw}%` }} />
              )}
              <div className="bg-neon-dim" style={{ width: `${f.awayWin}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground tabular-nums">
              <span>1 · {f.homeWin}%</span>
              {f.draw > 0 && <span>X · {f.draw}%</span>}
              <span>2 · {f.awayWin}%</span>
            </div>


            <OddsBoard
              probability={f.homeWin}
              seed={f.id}
              books={f.books}
              side="home"
              selection={`${f.home} vs ${f.away} · ${f.home} to win`}
              label={`${f.home} to win`}
            />
          </article>
        );
      })}
    </div>
  );
}
