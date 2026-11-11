import type { LiveFixture } from "@/data/mock-live";
import type { MatchDetails } from "@/lib/match-details.types";
import { hasMatchProbabilities } from "@/lib/match-probabilities";

/** Only public match facts reach the model; never comments, profiles or payment data. */
export function explanationContext(f: LiveFixture, details: MatchDetails | null) {
  return {
    source: f.id.startsWith("af-") ? "API-Football snapshot" : "Sample fixture — illustrative, not a verified real match",
    home: f.home, away: f.away, league: f.league, kickoff: f.utcDate,
    status: f.statusShort ?? f.status,
    score: f.homeScore !== null && f.awayScore !== null ? `${f.homeScore}-${f.awayScore}` : null,
    minute: f.minute ?? null,
    scoresUpdatedAt: f.scoresUpdatedAt ?? null,
    probabilities: hasMatchProbabilities(f) ? { home: f.homeWin, draw: f.draw, away: f.awayWin, basis: "Supplied statistical / market-implied snapshot; not an AI forecast or confirmed live probabilities" } : null,
    stats: details?.stats ?? [],
    events: details?.events.slice(-30) ?? [],
    previousMeetings: details?.h2h ?? [],
    standings: details?.standings.filter((r) => r.highlight).map(({ logo: _logo, ...r }) => r) ?? [],
    teamForm: null,
    expectedGoals: null,
  };
}