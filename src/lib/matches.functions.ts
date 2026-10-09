import { createServerFn } from "@tanstack/react-start";

import type { MatchesPayload } from "@/data/mock-live";
import { SPORTS as SPORT_DIRECTORY, type SportId } from "@/data/sports";

const SPORTS: SportId[] = SPORT_DIRECTORY.map((sport) => sport.id);

export const getMatches = createServerFn({ method: "GET" })
  .inputValidator((input?: { sport?: SportId }) => ({
    sport: input?.sport && SPORTS.includes(input.sport) ? input.sport : ("football" as SportId),
  }))
  .handler(async ({ data }): Promise<MatchesPayload> => {
    const { fetchSportMatches } = await import("./matches.server");
    return fetchSportMatches(data.sport);
  });
