/** Real bookmaker prices from the live odds feed. */
export type BookPrice = {
  name: string;
  homeDecimal: number;
  drawDecimal: number | null;
  awayDecimal: number;
};

export type LiveFixture = {
  id: string;
  league: string;
  /** ISO kickoff timestamp */
  utcDate: string;
  status: string;
  home: string;
  away: string;
  homeCrest: string | null;
  awayCrest: string | null;
  homeScore: number | null;
  awayScore: number | null;
  pills: string[];
  homeWin: number;
  draw: number;
  awayWin: number;
  /** Live prices from real bookmakers, when the odds feed supplies them. */
  books?: BookPrice[];
};

export type MatchesPayload = {
  source: "live" | "mock";
  liveCount: number;
  fixtures: LiveFixture[];
};

/** Deterministic 0-1 hash so probabilities stay stable between server and client. */
export function seededRatio(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

export function deriveProbabilities(seed: string) {
  const r = seededRatio(seed);
  const homeWin = 30 + Math.round(r * 35);
  const draw = 18 + Math.round(seededRatio(`${seed}-draw`) * 12);
  return { homeWin, draw, awayWin: Math.max(5, 100 - homeWin - draw) };
}
