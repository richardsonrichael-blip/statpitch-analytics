import { useMemo, useState } from "react";
import { Check, Copy, Dices } from "lucide-react";
import { useOddsFormat } from "@/hooks/useOddsFormat";
import { decimalFromProbability, formatOdds } from "@/lib/odds";
import type { ValueSpot } from "@/data/value-bets";

const RISK_LEVELS = [
  { id: "Safe", minModel: 65, legs: 3 },
  { id: "Balanced", minModel: 58, legs: 4 },
  { id: "High Yield", minModel: 45, legs: 5 },
] as const;

type Risk = (typeof RISK_LEVELS)[number]["id"];

type Leg = { spot: ValueSpot; decimal: number };

function buildSlip(spots: ValueSpot[], risk: Risk, minOdds: number, maxOdds: number) {
  const cfg = RISK_LEVELS.find((r) => r.id === risk)!;
  const pool = spots
    .filter((s) => s.model >= cfg.minModel)
    .sort((a, b) => b.model - a.model)
    .map<Leg>((spot) => ({ spot, decimal: decimalFromProbability(spot.model) }));

  const legs: Leg[] = [];
  let total = 1;
  for (const leg of pool) {
    if (legs.length >= cfg.legs) break;
    if (total * leg.decimal > maxOdds && legs.length >= 3) continue;
    legs.push(leg);
    total *= leg.decimal;
  }

  // Top up towards the target range when the slip is still short of it.
  for (const leg of pool) {
    if (total >= minOdds || legs.length >= 5) break;
    if (legs.includes(leg)) continue;
    legs.push(leg);
    total *= leg.decimal;
  }

  return { legs, total: Math.round(total * 100) / 100, inRange: total >= minOdds && total <= maxOdds };
}

function slipCode(legs: Leg[], risk: Risk) {
  const letters = legs
    .map((l) => l.spot.match.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase())
    .join("");
  return `SP-${risk[0]}${legs.length}-${letters}`.slice(0, 22);
}

export function BetBuilder({ spots }: { spots: ValueSpot[] }) {
  const { format } = useOddsFormat();
  const [minOdds, setMinOdds] = useState(2);
  const [maxOdds, setMaxOdds] = useState(5);
  const [risk, setRisk] = useState<Risk>("Balanced");
  const [slip, setSlip] = useState<{ legs: Leg[]; total: number; inRange: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => (slip ? slipCode(slip.legs, risk) : ""), [slip, risk]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 card-shadow">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-xl bg-neon/12 text-neon">
          <Dices className="size-4.5" />
        </span>
        <div>
          <h3 className="text-base font-bold">AI Bet Builder / Slip Generator</h3>
          <p className="text-xs text-muted-foreground">
            Set a target odds range and risk level — the model assembles a 3–5 leg slip.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <label className="rounded-2xl border border-border bg-background/60 p-3 text-xs">
          <span className="text-muted-foreground">Min total odds</span>
          <input
            type="number"
            step="0.1"
            min="1.1"
            value={minOdds}
            onChange={(e) => setMinOdds(Number(e.target.value) || 1.1)}
            className="mt-1 w-full bg-transparent text-lg font-bold tabular-nums outline-none"
          />
        </label>
        <label className="rounded-2xl border border-border bg-background/60 p-3 text-xs">
          <span className="text-muted-foreground">Max total odds</span>
          <input
            type="number"
            step="0.1"
            min="1.2"
            value={maxOdds}
            onChange={(e) => setMaxOdds(Number(e.target.value) || 1.2)}
            className="mt-1 w-full bg-transparent text-lg font-bold tabular-nums outline-none"
          />
        </label>
        <div className="rounded-2xl border border-border bg-background/60 p-3">
          <span className="text-xs text-muted-foreground">Risk level</span>
          <div className="mt-1.5 flex gap-1.5">
            {RISK_LEVELS.map((r) => (
              <button
                key={r.id}
                onClick={() => setRisk(r.id)}
                aria-pressed={risk === r.id}
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                  risk === r.id
                    ? "bg-neon text-primary-foreground"
                    : "border border-input text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => setSlip(buildSlip(spots, risk, minOdds, maxOdds))}
        className="mt-4 w-full rounded-xl bg-neon py-3 text-sm font-bold text-primary-foreground transition hover:bg-neon/90"
      >
        Generate slip
      </button>

      {slip && (
        <div className="mt-5 rounded-2xl border border-neon/30 bg-background/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {slip.legs.length}-leg {risk} slip
            </p>
            <p className="text-lg font-bold text-neon tabular-nums">
              {formatOdds(slip.total, format)}
            </p>
          </div>

          <ul className="mt-3 space-y-2">
            {slip.legs.map((l) => (
              <li
                key={l.spot.match + l.spot.market}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm"
              >
                <span>
                  <span className="font-semibold">{l.spot.match}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{l.spot.market}</span>
                </span>
                <span className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground tabular-nums">Model {l.spot.model}%</span>
                  <span className="font-bold tabular-nums">{formatOdds(l.decimal, format)}</span>
                </span>
              </li>
            ))}
          </ul>

          {!slip.inRange && (
            <p className="mt-2 text-[11px] text-warn">
              Closest slip to your range at this risk level — widen the range for an exact match.
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-bold tracking-wider">
              {code}
            </code>
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 rounded-xl border border-neon/40 px-3.5 py-2 text-xs font-bold text-neon transition hover:bg-neon/10"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy Slip Code"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
