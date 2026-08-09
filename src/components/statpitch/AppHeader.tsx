import { Search, Zap } from "lucide-react";

export function AppHeader({
  liveCount,
  query,
  onQueryChange,
  onGoPro,
}: {
  liveCount: number;
  query: string;
  onQueryChange: (v: string) => void;
  onGoPro: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:gap-4">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-neon/12 text-neon glow-ring">
            <Zap className="size-4.5" strokeWidth={2.5} />
          </span>
          <div className="leading-tight">
            <h1 className="text-base font-bold sm:text-lg">StatPitch Analytics</h1>
            <p className="text-[11px] text-muted-foreground">Data-first football insight</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5">
          <span className="relative grid size-2 place-items-center">
            <span className="absolute inset-0 rounded-full bg-neon pulse-dot" />
          </span>
          <span className="text-xs font-semibold tabular-nums">{liveCount} Live</span>
        </div>

        <button
          onClick={onGoPro}
          className="rounded-full bg-neon px-4 py-2 text-xs font-bold text-primary-foreground transition hover:bg-neon/90"
        >
          Go Pro
        </button>

        <label className="order-last flex w-full items-center gap-2 rounded-xl border border-input bg-surface px-3 py-2 focus-within:border-neon/50 sm:order-none sm:w-72">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search teams or leagues…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>
    </header>
  );
}
