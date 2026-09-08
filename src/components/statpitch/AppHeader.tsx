import { useEffect, useMemo, useRef, useState } from "react";
import { BadgeCheck, Search, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { LiveFixture } from "@/data/mock-live";
import { searchTeams } from "@/lib/team-directory";
import { useProAccess } from "@/hooks/useProAccess";
import { ProUpsellModal } from "@/components/statpitch/ProLock";
import { OddsFormatToggle } from "@/components/statpitch/OddsPanel";

export function AppHeader({
  liveCount,
  query,
  onQueryChange,
  fixtures,
}: {
  liveCount: number;
  query: string;
  onQueryChange: (v: string) => void;
  fixtures: LiveFixture[];
}) {
  const [open, setOpen] = useState(false);
  const [upsell, setUpsell] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const { user, isPro } = useProAccess();

  const results = useMemo(() => searchTeams(fixtures, query), [fixtures, query]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-neon/12 text-neon glow-ring">
            <Zap className="size-4.5" strokeWidth={2.5} />
          </span>
          <div className="leading-tight">
            <h1 className="text-base font-bold sm:text-lg">StatPitch Analytics</h1>
            <p className="text-[11px] text-muted-foreground">Data-first football insight</p>
          </div>
        </Link>

        <div className="ml-auto order-2 sm:order-none">
          <OddsFormatToggle compact />
        </div>

        <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5">
          <span className="relative grid size-2 place-items-center">
            <span className="absolute inset-0 rounded-full bg-neon pulse-dot" />
          </span>
          <span className="text-xs font-semibold tabular-nums">{liveCount} Live</span>
        </div>

        {isPro ? (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full border border-neon/40 bg-neon/12 px-3.5 py-2 text-xs font-bold text-neon"
          >
            <BadgeCheck className="size-4" /> Pro
          </Link>
        ) : (
          <button
            onClick={() => setUpsell(true)}
            className="rounded-full bg-neon px-4 py-2 text-xs font-bold text-primary-foreground transition hover:bg-neon/90"
          >
            Go Pro
          </button>
        )}

        {user ? (
          !isPro && (
            <Link
              to="/dashboard"
              className="rounded-full border border-input px-3.5 py-2 text-xs font-semibold transition hover:bg-accent"
            >
              Account
            </Link>
          )
        ) : (
          <Link
            to="/auth"
            search={{ redirect: "/dashboard" }}
            className="rounded-full border border-input px-3.5 py-2 text-xs font-semibold transition hover:bg-accent"
          >
            Sign in
          </Link>
        )}

        <div ref={boxRef} className="relative order-last w-full sm:order-none sm:w-72">
          <label className="flex w-full items-center gap-2 rounded-xl border border-input bg-surface px-3 py-2 focus-within:border-neon/50">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => {
                onQueryChange(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Search teams or leagues…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              aria-label="Search teams or leagues"
            />
          </label>

          {open && query.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-border bg-surface card-shadow">
              {results.length === 0 ? (
                <p className="px-3 py-3 text-xs text-muted-foreground">No teams found.</p>
              ) : (
                <ul className="max-h-72 overflow-y-auto">
                  {results.map((t) => (
                    <li key={t.name}>
                      <Link
                        to="/team/$teamName"
                        params={{ teamName: t.name }}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 transition hover:bg-muted/60"
                      >
                        {t.crest ? (
                          <img src={t.crest} alt="" loading="lazy" className="size-5 object-contain" />
                        ) : (
                          <span className="grid size-5 place-items-center rounded bg-muted text-[9px] font-bold text-muted-foreground">
                            {t.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                        <span className="text-sm font-semibold">{t.name}</span>
                        {t.leagues[0] && (
                          <span className="ml-auto text-[11px] text-muted-foreground">{t.leagues[0]}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
      <ProUpsellModal open={upsell} onOpenChange={setUpsell} signedIn={Boolean(user)} />
    </header>
  );
}
