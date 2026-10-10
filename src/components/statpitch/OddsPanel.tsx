import type { BookPrice } from "@/data/mock-live";

/** Analytics-only display; price inputs are intentionally not presented. */
export function OddsBoard({ probability, selection, label }: {
  probability: number | null;
  seed: string;
  selection: string;
  label?: string;
  books?: BookPrice[] | undefined;
  side?: "home" | "draw" | "away";
}) {
  return (
    <div className="mt-4 border-t border-border pt-3">
      <p className="text-xs font-semibold text-muted-foreground">{label ?? selection}</p>
      <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div><dt className="text-[11px] text-muted-foreground">Win Probability %</dt>{probability === null ? <dd className="mt-1 text-sm text-muted-foreground">Not available</dd> : <dd className="mt-1 text-lg font-bold text-neon tabular-nums">{probability}%</dd>}</div>
        <div><dt className="text-[11px] text-muted-foreground">Expected Goals (xG)</dt><dd className="mt-1 text-sm text-muted-foreground">Not available</dd></div>
        <div><dt className="text-[11px] text-muted-foreground">Team Form Score</dt><dd className="mt-1 text-sm text-muted-foreground">Not available</dd></div>
      </dl>
    </div>
  );
}
