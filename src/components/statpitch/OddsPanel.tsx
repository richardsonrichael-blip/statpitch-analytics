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
  if (probability === null || !Number.isFinite(probability) || probability < 0 || probability > 100) return null;
  return (
    <div className="mt-4 border-t border-border pt-3">
      <p className="text-xs font-semibold text-muted-foreground">{label ?? selection}</p>
      <dl className="mt-3 grid gap-3">
        <div><dt className="text-[11px] text-muted-foreground">Win Probability %</dt><dd className="mt-1 text-lg font-bold text-neon tabular-nums">{probability}%</dd></div>
      </dl>
    </div>
  );
}
