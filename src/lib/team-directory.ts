import type { LiveFixture } from "@/data/mock-live";
import { teams, type TeamStats } from "@/data/football";

export type TeamEntry = {
  name: string;
  crest: string | null;
  leagues: string[];
};

/** Unique teams across live fixtures plus the curated stats database. */
export function buildTeamIndex(fixtures: LiveFixture[]): TeamEntry[] {
  const map = new Map<string, TeamEntry>();

  const add = (name: string, crest: string | null, league: string | null) => {
    const key = name.toLowerCase();
    const existing = map.get(key);
    if (existing) {
      if (!existing.crest && crest) existing.crest = crest;
      if (league && !existing.leagues.includes(league)) existing.leagues.push(league);
      return;
    }
    map.set(key, { name, crest, leagues: league ? [league] : [] });
  };

  for (const f of fixtures) {
    add(f.home, f.homeCrest, f.league);
    add(f.away, f.awayCrest, f.league);
  }
  for (const name of Object.keys(teams)) add(name, null, null);

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function searchTeams(fixtures: LiveFixture[], query: string, limit = 8): TeamEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return buildTeamIndex(fixtures)
    .filter((t) => t.name.toLowerCase().includes(q) || t.leagues.some((l) => l.toLowerCase().includes(q)))
    .slice(0, limit);
}

export type TeamProfile = {
  name: string;
  crest: string | null;
  leagues: string[];
  matches: LiveFixture[];
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  stats: TeamStats | null;
};

export function getTeamProfile(fixtures: LiveFixture[], name: string): TeamProfile | null {
  const key = decodeURIComponent(name).toLowerCase();
  const index = buildTeamIndex(fixtures).find((t) => t.name.toLowerCase() === key);
  if (!index) return null;

  const matches = fixtures.filter(
    (f) => f.home.toLowerCase() === key || f.away.toLowerCase() === key,
  );

  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;
  let played = 0;

  for (const m of matches) {
    if (m.homeScore === null || m.awayScore === null) continue;
    played += 1;
    const isHome = m.home.toLowerCase() === key;
    const own = isHome ? m.homeScore : m.awayScore;
    const opp = isHome ? m.awayScore : m.homeScore;
    goalsFor += own;
    goalsAgainst += opp;
    if (own > opp) wins += 1;
    else if (own === opp) draws += 1;
    else losses += 1;
  }

  const statsEntry = Object.values(teams).find((t) => t.name.toLowerCase() === key) ?? null;

  return {
    name: index.name,
    crest: index.crest,
    leagues: index.leagues,
    matches,
    played,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    stats: statsEntry,
  };
}
