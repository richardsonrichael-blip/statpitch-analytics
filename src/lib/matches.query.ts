import { queryOptions } from "@tanstack/react-query";
import { getMatches } from "@/lib/matches.functions";
import type { SportId } from "@/data/sports";

export function matchesQuery(sport: SportId = "football") {
  return queryOptions({
    queryKey: ["matches", sport],
    queryFn: () => getMatches({ data: { sport } }),
    staleTime: 60_000,
  });
}

export const matchesQueryOptions = matchesQuery("football");
