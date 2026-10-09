export type MatchProbabilities = { homeWin: number; draw: number; awayWin: number };

/** Accept only complete percentage distributions; do not invent absent analytics. */
export function readMatchProbabilities(value: unknown): MatchProbabilities | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const homeWin = record["homeWin"];
  const draw = record["draw"];
  const awayWin = record["awayWin"];
  if (typeof homeWin !== "number" || typeof draw !== "number" || typeof awayWin !== "number") return null;
  if (![homeWin, draw, awayWin].every((n) => Number.isFinite(n) && n >= 0 && n <= 100)) return null;
  if (Math.abs(homeWin + draw + awayWin - 100) > 0.01) return null;
  return { homeWin, draw, awayWin };
}