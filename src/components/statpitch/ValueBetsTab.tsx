import { useMemo, useState } from "react";
import { Flame } from "lucide-react";
import { ProLock } from "@/components/statpitch/ProLock";
import { useProAccess } from "@/hooks/useProAccess";
import { useOddsFormat } from "@/hooks/useOddsFormat";
import { bestPrice, betLink, bookmakerPrices, formatOdds } from "@/lib/odds";
import {
  OUTCOME_FILTERS,
  edgeOf,
  isHighValue,
  liveValueSpots,
  type LeagueGroup,
  type StatMarket,
  type ValueSpot,
} from "@/data/value-bets";
import type { LiveFixture } from "@/data/mock-live";


const FREE_ROWS = 3;

function Head() {
  return (
    <thead>
      <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground">
        <th className="px-5 py-3 font-semibold">Match</th>
        <th className="px-3 py-3 font-semibold">Market</th>
        <th className="px-3 py-3 font-semibold">Model</th>
        <th className="px-3 py-3 font-semibold">Implied</th>
        <th className="px-3 py-3 font-semibold">Edge</th>
        <th className="px-3 py-3 font-semibold">Best odds</th>
        <th className="px-5 py-3 font-semibold">Bet</th>
      </tr>
    </thead>
  );
}

function Rows({ rows }: { rows: ValueSpot[] }) {
  const { format } = useOddsFormat();

  return (
    <tbody>
      {rows.map((v) => {
        const prices = bookmakerPrices(v.model, v.match + v.market);
        const best = bestPrice(prices);
        const selection = `${v.match} · ${v.market}`;
        return (
          <tr key={v.match + v.market} className="border-t border-border/70">
            <td className="px-5 py-3.5">
              <p className="flex flex-wrap items-center gap-2 font-semibold">
                {v.match}
                {isHighValue(v) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-neon/15 px-2 py-0.5 text-[10px] font-bold text-neon">
                    <Flame className="size-3" /> High Value Alert
                  </span>
                )}
              </p>
              <p className="text-[11px] text-muted-foreground">{v.leagueGroup}</p>
            </td>
            <td className="px-3 py-3.5 text-muted-foreground">{v.market}</td>
            <td className="px-3 py-3.5 font-bold tabular-nums">{v.model}%</td>
            <td className="px-3 py-3.5 tabular-nums text-muted-foreground">{v.implied}%</td>
            <td className="px-3 py-3.5 font-bold text-neon tabular-nums">+{edgeOf(v)}%</td>
            <td className="px-3 py-3.5">
              <p className="font-bold tabular-nums">{formatOdds(best.decimal, format)}</p>
              <p className="text-[11px] text-muted-foreground">{best.bookmaker.name}</p>
            </td>
            <td className="px-5 py-3.5">
              <a
                href={betLink(best.bookmaker, selection)}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-block whitespace-nowrap rounded-full bg-neon px-3.5 py-1.5 text-[11px] font-bold text-primary-foreground transition hover:bg-neon/90"
              >
                Place Bet
              </a>
            </td>
          </tr>
        );
      })}
    </tbody>
  );
}

export function ValueBetsTab({ fixtures }: { fixtures: LiveFixture[] }) {
  const { isPro } = useProAccess();
  const [league, setLeague] = useState<LeagueGroup | "All">("All");
  const [stats, setStats] = useState<StatMarket[]>([]);

  const spots = useMemo(() => liveValueSpots(fixtures), [fixtures]);

  const leagueFilters = useMemo(
    () =>
      Array.from(new Set(fixtures.map((f) => f.league))).map((l) => ({ id: l, label: l })),
    [fixtures],
  );
  const statFilters = useMemo(
    () => OUTCOME_FILTERS.filter((m) => (m === "Draw" ? fixtures.some((f) => f.draw > 0) : true)),
    [fixtures],
  );


  const filtered = useMemo(
    () =>
      spots.filter(
        (v) =>
          (league === "All" || v.leagueGroup === league) &&
          (stats.length === 0 || (v.statMarket ? stats.includes(v.statMarket) : false)),
      ),
    [league, stats, spots],
  );


  const free = filtered.slice(0, FREE_ROWS);
  const locked = filtered.slice(FREE_ROWS);

  function toggleStat(s: StatMarket) {
    setStats((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-surface card-shadow">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h3 className="text-base font-bold">Value spots by model edge</h3>
          <p className="text-xs text-muted-foreground">
            {isPro
              ? "Full model probability vs market implied probability"
              : `Free plan shows ${FREE_ROWS} value spots per day`}
          </p>
        </div>
        {isPro && (
          <span className="rounded-full border border-neon/40 bg-neon/10 px-3 py-1.5 text-xs font-bold text-neon">
            Pro unlocked
          </span>
        )}
      </div>

      <div className="space-y-3 border-b border-border px-5 py-4">
        <div className="flex gap-1.5 overflow-x-auto">
          {["All", ...leagueFilters.map((l) => l.id)].map((id) => {
            const label = id === "All" ? "All leagues" : leagueFilters.find((l) => l.id === id)!.label;
            return (
              <button
                key={id}
                onClick={() => setLeague(id)}
                aria-pressed={league === id}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11px] font-bold transition ${
                  league === id
                    ? "bg-neon text-primary-foreground"
                    : "border border-input text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {statFilters.map((s) => (

            <button
              key={s}
              onClick={() => toggleStat(s)}
              aria-pressed={stats.includes(s)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                stats.includes(s)
                  ? "border border-neon/50 bg-neon/12 text-neon"
                  : "border border-input text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="px-5 py-8 text-sm text-muted-foreground">
          No value spots match these filters right now.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-sm">
            <Head />
            <Rows rows={isPro ? filtered : free} />
          </table>
        </div>
      )}

      {!isPro && locked.length > 0 && (
        <div className="p-4">
          <ProLock feature="Full value bet table & edge alerts" cta="Unlock">
            <div className="overflow-x-auto rounded-2xl border border-border bg-background">
              <table className="w-full min-w-[780px] text-sm">
                <Rows rows={locked} />
              </table>
            </div>
          </ProLock>
        </div>
      )}
    </div>
  );
}
