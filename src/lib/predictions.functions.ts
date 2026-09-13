import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AiPrediction = {
  matchId: string;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  predictedScore: string;
  confidence: number;
  valueEdge: number;
  recommendedPick: string;
  modelNote: string | null;
};

/**
 * AI predictions for a set of matches. The read runs with the caller's own
 * permissions, so the database only returns rows when the account is Pro.
 */
export const getAiPredictions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { matchIds: string[] }) => {
    const matchIds = Array.isArray(data?.matchIds)
      ? data.matchIds.filter((id) => typeof id === "string").slice(0, 40)
      : [];
    return { matchIds };
  })
  .handler(async ({ data, context }): Promise<AiPrediction[]> => {
    if (data.matchIds.length === 0) return [];

    const { data: rows, error } = await context.supabase
      .from("ai_predictions")
      .select(
        "match_id, home_win_prob, draw_prob, away_win_prob, predicted_score, confidence, value_edge, recommended_pick, model_note",
      )
      .in("match_id", data.matchIds);

    if (error) {
      console.error("[predictions] read failed", error);
      return [];
    }

    return (rows ?? []).map((r) => ({
      matchId: r.match_id,
      homeWinProb: Number(r.home_win_prob),
      drawProb: Number(r.draw_prob),
      awayWinProb: Number(r.away_win_prob),
      predictedScore: r.predicted_score,
      confidence: r.confidence,
      valueEdge: Number(r.value_edge),
      recommendedPick: r.recommended_pick,
      modelNote: r.model_note,
    }));
  });
