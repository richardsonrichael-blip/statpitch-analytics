import { createServerFn } from "@tanstack/react-start";

import type { MatchesPayload } from "@/data/mock-live";
import type { SportId } from "@/data/sports";

const SPORTS: SportId[] = [
  "football",
  "basketball",
  "tennis",
  "american-football",
  "ice-hockey",
  "cricket",
  "combat",
];

export const getMatches = createServerFn({ method: "GET" })
  .inputValidator((input?: { sport?: SportId }) => ({
    sport: input?.sport && SPORTS.includes(input.sport) ? input.sport : ("football" as SportId),
  }))
  .handler(async ({ data }): Promise<MatchesPayload> => {
    const { fetchSportMatches } = await import("./matches.server");
    return fetchSportMatches(data.sport);
  });
