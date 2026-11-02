import { createServerFn } from "@tanstack/react-start";
import type { MatchDetails } from "@/lib/match-details.types";

export const getMatchDetails = createServerFn({ method: "GET" })
  .inputValidator((input: { matchId: string }) => ({ matchId: String(input?.matchId ?? "") }))
  .handler(async ({ data }): Promise<MatchDetails | null> => {
    const m = /^af-(\d+)$/.exec(data.matchId);
    if (!m) return null;
    const { fetchMatchDetails } = await import("./match-details.server");
    return fetchMatchDetails(Number(m[1]));
  });
