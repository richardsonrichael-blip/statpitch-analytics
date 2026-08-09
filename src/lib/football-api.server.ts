import {
  buildMockMatches,
  deriveProbabilities,
  type LiveFixture,
  type MatchesPayload,
} from "@/data/mock-live";

const API_BASE = "https://api.football-data.org/v4/matches";

type ApiTeam = { name?: string; shortName?: string; crest?: string };
type ApiMatch = {
  id: number;
  utcDate: string;
  status: string;
  matchday?: number | null;
  competition?: { name?: string; code?: string };
  homeTeam?: ApiTeam;
  awayTeam?: ApiTeam;
  score?: { fullTime?: { home: number | null; away: number | null } };
};

const LIVE_STATUSES = new Set(["IN_PLAY", "PAUSED", "LIVE"]);

function buildPills(m: ApiMatch, homeScore: number | null, awayScore: number | null) {
  const pills: string[] = [];
  if (m.competition?.name) pills.push(m.competition.name);
  if (m.matchday) pills.push(`Matchday ${m.matchday}`);
  if (LIVE_STATUSES.has(m.status)) pills.push("Live now");
  else if (m.status === "FINISHED") pills.push("Full time");
  else pills.push("Upcoming");
  if (homeScore !== null && awayScore !== null && homeScore + awayScore >= 3) {
    pills.push("Over 2.5 hit");
  }
  return pills;
}

function mapMatch(m: ApiMatch): LiveFixture {
  const home = m.homeTeam?.shortName ?? m.homeTeam?.name ?? "Home";
  const away = m.awayTeam?.shortName ?? m.awayTeam?.name ?? "Away";
  const homeScore = m.score?.fullTime?.home ?? null;
  const awayScore = m.score?.fullTime?.away ?? null;
  const { homeWin, draw, awayWin } = deriveProbabilities(`${m.id}-${home}-${away}`);

  return {
    id: String(m.id),
    league: m.competition?.name ?? m.competition?.code ?? "Football",
    utcDate: m.utcDate,
    status: m.status,
    home,
    away,
    homeCrest: m.homeTeam?.crest ?? null,
    awayCrest: m.awayTeam?.crest ?? null,
    homeScore,
    awayScore,
    pills: buildPills(m, homeScore, awayScore),
    homeWin,
    draw,
    awayWin,
  };
}

/**
 * Fetches today's matches from Football-Data.org.
 * Falls back to dynamic mock data when no API key is configured or the API fails.
 */
export async function fetchMatches(): Promise<MatchesPayload> {
  const apiKey = process.env["FOOTBALL_DATA_API_KEY"];
  if (!apiKey) return buildMockMatches();

  try {
    const res = await fetch(API_BASE, {
      headers: { "X-Auth-Token": apiKey },
    });
    if (!res.ok) {
      console.error("football-data.org request failed", res.status);
      return buildMockMatches();
    }

    const json = (await res.json()) as { matches?: ApiMatch[] };
    const matches = json.matches ?? [];
    if (matches.length === 0) return buildMockMatches();

    const fixtures = matches.slice(0, 24).map(mapMatch);
    return {
      source: "live",
      liveCount: fixtures.filter((f) => LIVE_STATUSES.has(f.status)).length,
      fixtures,
    };
  } catch (error) {
    console.error("football-data.org fetch error", error);
    return buildMockMatches();
  }
}
