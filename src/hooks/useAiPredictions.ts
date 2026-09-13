import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAiPredictions, type AiPrediction } from "@/lib/predictions.functions";
import { useProAccess } from "@/hooks/useProAccess";

/** Pro-only AI predictions for the given match ids, keyed by match id. */
export function useAiPredictions(matchIds: string[]) {
  const { isPro, user } = useProAccess();
  const fetchPredictions = useServerFn(getAiPredictions);
  const ids = [...matchIds].sort();

  const query = useQuery({
    queryKey: ["ai-predictions", user?.id ?? "anon", ids],
    queryFn: () => fetchPredictions({ data: { matchIds: ids } }),
    enabled: Boolean(user) && isPro && ids.length > 0,
    staleTime: 60_000,
  });

  const byMatch = new Map<string, AiPrediction>();
  for (const p of query.data ?? []) byMatch.set(p.matchId, p);

  return { byMatch, loading: query.isLoading };
}

export function useAiPrediction(matchId?: string) {
  const { byMatch, loading } = useAiPredictions(matchId ? [matchId] : []);
  return { prediction: matchId ? (byMatch.get(matchId) ?? null) : null, loading };
}
