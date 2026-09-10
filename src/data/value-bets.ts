import type { LiveFixture } from "./mock-live";

export type LeagueGroup = string;

export type StatMarket = string;

export type ValueSpot = {
  match: string;
  leagueGroup: LeagueGroup;
  market: string;
  statMarket?: StatMarket;
  model: number;
  implied: number;
  confidence: "High" | "Medium" | "Low";
};

/** Outcome markets available from the live h2h feed. */
export const OUTCOME_FILTERS: StatMarket[] = ["Home Win", "Draw", "Away Win"];

function toSpot(
  fixture: LiveFixture,
  market: StatMarket,
  model: number,
  prices: (number | null)[],
): ValueSpot | null {
  const valid = prices.filter((p): p is number => !!p && p > 1);
  if (valid.length === 0) return null;
  const best = Math.max(...valid);
  const implied = Math.round((100 / best) * 10) / 10;
  const edge = model - implied;
  return {
    match: `${fixture.home} vs ${fixture.away}`,
    leagueGroup: fixture.league,
    market,
    statMarket: market,
    model,
    implied,
    confidence: edge >= 15 ? "High" : edge >= 6 ? "Medium" : "Low",
  };
}

/** Value spots built from live bookmaker prices: de-vigged model line vs best available price. */
export function liveValueSpots(fixtures: LiveFixture[]): ValueSpot[] {
  return fixtures.flatMap((f) => {
    const books = f.books ?? [];
    const spots = [
      toSpot(f, "Home Win", f.homeWin, books.map((b) => b.homeDecimal)),
      f.draw > 0 ? toSpot(f, "Draw", f.draw, books.map((b) => b.drawDecimal)) : null,
      toSpot(f, "Away Win", f.awayWin, books.map((b) => b.awayDecimal)),
    ];
    return spots.filter((s): s is ValueSpot => s !== null);
  });
}

export function edgeOf(v: ValueSpot) {
  return Math.round((v.model - v.implied) * 10) / 10;
}

/** High Value Alert: model probability at least 15 points above the implied price. */
export function isHighValue(v: ValueSpot) {
  return edgeOf(v) >= 15;
}
