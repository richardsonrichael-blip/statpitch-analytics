import { queryOptions } from "@tanstack/react-query";
import { getMatches } from "@/lib/matches.functions";
import type { SportId } from "@/data/sports";

export function matchesQuery(sport: SportId = "football") {
  return queryOptions({
    queryKey: ["matches", sport],
    queryFn: () => getMatches({ data: { sport } }),
    staleTime: 60_000,
     // Recheck while the page is visible, without exceeding the feed cache cadence.
     refetchInterval: sport === "football" ? 15 * 60_000 : false,
     refetchIntervalInBackground: false,
  });
}

export const matchesQueryOptions = matchesQuery("football");
