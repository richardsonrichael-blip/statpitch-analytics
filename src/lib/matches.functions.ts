import { createServerFn } from "@tanstack/react-start";

import type { MatchesPayload } from "@/data/mock-live";

export const getMatches = createServerFn({ method: "GET" }).handler(
  async (): Promise<MatchesPayload> => {
    const { fetchMatches } = await import("./football-api.server");
    return fetchMatches();
  },
);
