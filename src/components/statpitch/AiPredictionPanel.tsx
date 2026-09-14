import type { LiveFixture } from "@/data/mock-live";
import { ProLock } from "@/components/statpitch/ProLock";
import { useAiPrediction } from "@/hooks/useAiPredictions";

function Cell({ label, value, tone }: { label: string; value: string; tone?: "neon" }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${tone === "neon" ? "text-neon" : ""}`}>
        {value}
      </p>
    </div>
  );
}

/**
 * Pro-only AI prediction for one fixture. Free accounts see a blurred teaser;
 * the numbers themselves are only returned by the database to Pro members.
 */
export function AiPredictionPanel({ fixture }: { fixture: LiveFixture }) {
  const { prediction, loading } = useAiPrediction(fixture.id);

  const favourite = fixture.homeWin >= fixture.awayWin ? fixture.home : fixture.away;
  const favouriteProb = Math.max(fixture.homeWin, fixture.awayWin);

  const pick = prediction?.recommendedPick ?? favourite;
  const confidence = prediction ? `${prediction.confidence}%` : `${favouriteProb}%`;
  const score = prediction?.predictedScore ?? "—";
  const edge = prediction ? `${prediction.valueEdge.toFixed(1)}%` : "—";

  return (
    <ProLock feature="AI match prediction" cta="Unlock">
      <div className="rounded-2xl border border-border bg-surface/70 p-4">
        <div className="grid gap-4 sm:grid-cols-4">
          <Cell label="Model pick" value={pick} />
          <Cell label="Predicted score" value={score} />
          <Cell label="Confidence" value={confidence} tone="neon" />
          <Cell label="Value edge" value={edge} tone="neon" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {loading
            ? "Loading model output…"
            : (prediction?.modelNote ??
              "Model blends recent form, expected goals and closing-line movement.")}
        </p>
      </div>
    </ProLock>
  );
}
