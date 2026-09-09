import { fixtures as staticFixtures } from "./football";

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

/** Mock data with dates relative to "now" so the dashboard never looks empty or stale. */
export function buildMockMatches(now = Date.now()): MatchesPayload {
  const fixtures = staticFixtures.map((f, i) => {
    const utcDate = new Date(now + (i - 1) * 6 * 60 * 60 * 1000).toISOString();
    const isLive = i === 0;
    return {
      id: f.id,
      league: f.league,
      utcDate,
      status: isLive ? "IN_PLAY" : "TIMED",
      home: f.home,
      away: f.away,
      homeCrest: null,
      awayCrest: null,
      homeScore: isLive ? 1 : null,
      awayScore: isLive ? 1 : null,
      pills: f.pills,
      homeWin: f.homeWin,
      draw: f.draw,
      awayWin: f.awayWin,
    } satisfies LiveFixture;
  });

  return { source: "mock", liveCount: 1, fixtures };
}
