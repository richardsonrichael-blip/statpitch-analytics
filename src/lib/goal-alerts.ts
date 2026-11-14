import type { LiveFixture } from "@/data/mock-live";

export type ScoreMap = Record<string, { home: number; away: number }>;
export type GoalEvent = { fixture: LiveFixture; side: "home" | "away" };

export function scoreMap(fixtures: LiveFixture[]): ScoreMap {
  const m: ScoreMap = {};
  for (const f of fixtures) if (f.homeScore !== null && f.awayScore !== null) m[f.id] = { home: f.homeScore, away: f.awayScore };
  return m;
}

/** Goals scored since the previous snapshot; matches unseen before never alert. */
export function detectGoals(prev: ScoreMap, fixtures: LiveFixture[]): GoalEvent[] {
  const out: GoalEvent[] = [];
  for (const f of fixtures) {
    const p = prev[f.id];
    if (!p || f.homeScore === null || f.awayScore === null) continue;
    if (f.homeScore > p.home) out.push({ fixture: f, side: "home" });
    if (f.awayScore > p.away) out.push({ fixture: f, side: "away" });
  }
  return out;
}
