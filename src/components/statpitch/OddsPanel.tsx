import { ExternalLink } from "lucide-react";
import { useOddsFormat } from "@/hooks/useOddsFormat";
import {
  ODDS_FORMATS,
  bestPrice,
  betLink,
  bookmakerPrices,
  formatOdds,
  type OddsFormat,
} from "@/lib/odds";

export function OddsFormatToggle({ compact = false }: { compact?: boolean }) {
  const { format, setFormat } = useOddsFormat();

  return (
    <div
      role="group"
      aria-label="Odds format"
      className="flex items-center gap-1 rounded-full border border-border bg-surface p-1"
    >
      {ODDS_FORMATS.map((f) => (
        <button
          key={f.id}
          onClick={() => setFormat(f.id as OddsFormat)}
          aria-pressed={format === f.id}
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
            format === f.id
              ? "bg-neon text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {compact ? f.label.slice(0, 4) : f.label}
          <span className="ml-1 font-normal opacity-70 tabular-nums">{f.example}</span>
        </button>
      ))}
    </div>
  );
}

/** Live bookmaker prices for a selection + affiliate "Place Bet at Best Odds" CTA. */
export function OddsBoard({
  probability,
  seed,
  selection,
  label,
}: {
  probability: number;
  seed: string;
  selection: string;
  label?: string;
}) {
  const { format } = useOddsFormat();
  const prices = bookmakerPrices(probability, seed);
  const best = bestPrice(prices);

  return (
    <div className="mt-4 rounded-2xl border border-border bg-background/60 p-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Live odds · {label ?? selection}
        </p>
        <p className="text-[10px] text-muted-foreground">
          Best: {best.bookmaker.name} {formatOdds(best.decimal, format)}
        </p>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {prices.map((p) => {
          const isBest = p.bookmaker.id === best.bookmaker.id;
          return (
            <a
              key={p.bookmaker.id}
              href={betLink(p.bookmaker, selection)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className={`flex flex-col rounded-xl border px-2.5 py-1.5 transition hover:border-neon/60 ${
                isBest ? "border-neon/50 bg-neon/10" : "border-border bg-surface"
              }`}
            >
              <span className="text-[10px] text-muted-foreground">{p.bookmaker.name}</span>
              <span
                className={`text-sm font-bold tabular-nums ${isBest ? "text-neon" : ""}`}
              >
                {formatOdds(p.decimal, format)}
              </span>
            </a>
          );
        })}
      </div>

      <a
        href={betLink(best.bookmaker, selection)}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="mt-2.5 flex items-center justify-center gap-1.5 rounded-xl bg-neon px-4 py-2.5 text-xs font-bold text-primary-foreground transition hover:bg-neon/90"
      >
        Place Bet at Best Odds · {formatOdds(best.decimal, format)}
        <ExternalLink className="size-3.5" />
      </a>
      <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
        18+ · Affiliate links. Odds move fast — always confirm at the sportsbook.
      </p>
    </div>
  );
}
