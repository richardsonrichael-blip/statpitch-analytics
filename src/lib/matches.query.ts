import { queryOptions } from "@tanstack/react-query";
import { getMatches } from "@/lib/matches.functions";

export const matchesQueryOptions = queryOptions({
  queryKey: ["matches"],
  queryFn: () => getMatches(),
  staleTime: 60_000,
});
