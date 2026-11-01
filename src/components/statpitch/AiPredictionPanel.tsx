import type { LiveFixture } from "@/data/mock-live";
import { ProLock } from "@/components/statpitch/ProLock";
import { useAiPrediction } from "@/hooks/useAiPredictions";
import { hasMatchProbabilities } from "@/lib/match-probabilities";

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

  const hasProb = hasMatchProbabilities(fixture);
  const pick = prediction?.recommendedPick ?? (hasProb ? favourite : null);
  const confidence = prediction ? `${prediction.confidence}%` : hasProb ? `${favouriteProb}%` : null;

  return (
    <ProLock feature="AI match prediction" cta="Unlock">
      <div className="rounded-2xl border border-border bg-surface/70 p-4">
        {(pick || prediction || confidence) && <div className="flex flex-wrap gap-x-6 gap-y-4 [&>div]:min-w-0 [&>div]:flex-1 [&>div]:basis-32 [&>div]:break-words">
          {pick && <Cell label="Projected winner" value={pick} />}
          {prediction?.predictedScore && <Cell label="Predicted score" value={prediction.predictedScore} />}
          {confidence && <Cell label="Confidence" value={confidence} tone="neon" />}
          {prediction && <Cell label="Probability advantage" value={`${prediction.valueEdge.toFixed(1)}%`} tone="neon" />}
        </div>}
        {(loading || prediction?.modelNote || !pick) && <p className="mt-3 text-xs text-muted-foreground">
          {loading ? "Loading model output…" : prediction?.modelNote ?? "No model prediction available for this fixture yet."}
        </p>}
      </div>
    </ProLock>
  );
}
