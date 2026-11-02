export type MatchEvent = {
  minute: number;
  label: string;
  side: "home" | "away";
  type: "goal" | "card" | "sub" | "other";
  detail: string;
  player: string;
  assist: string | null;
};

export type MatchDetails = {
  homeTeamId: number;
  events: MatchEvent[];
  stats: { label: string; home: number; away: number }[];
  markets: { bookmaker: string; home: number | null; draw: number | null; away: number | null }[];
  h2h: { date: string; home: string; away: string; homeGoals: number | null; awayGoals: number | null }[];
  standings: { rank: number; team: string; logo: string; played: number; goalDiff: number; points: number; shift: string; highlight: boolean }[];
};

/** Momentum per 15-minute window from timeline events: positive favours home. */
export function momentumBuckets(events: MatchEvent[]): number[] {
  const weight = { goal: 3, card: -1, sub: 0, other: 0.5 } as const;
  const buckets = Array.from({ length: 6 }, () => 0);
  for (const e of events) {
    const i = Math.min(5, Math.max(0, Math.floor((e.minute - 1) / 15)));
    buckets[i]! += (e.side === "home" ? 1 : -1) * weight[e.type];
  }
  return buckets;
}
