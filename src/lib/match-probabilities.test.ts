import { describe, expect, test } from "bun:test";
import { SPORTS } from "../data/sports";
import { readMatchProbabilities } from "./match-probabilities";

describe("additional sports", () => {
  for (const [id, label] of [
    ["baseball", "Baseball"], ["handball", "Handball"], ["water-polo", "Water Polo"],
    ["snooker", "Snooker"], ["badminton", "Badminton"], ["esports", "Esports"],
  ]) {
    test(`${label} is a supported sport`, () => {
      expect(SPORTS.find((sport) => sport.id === id)?.label).toBe(label);
    });
  }
});

test("analytics probabilities work without bookmaker data", () => {
  expect(readMatchProbabilities({ homeWin: 48, draw: 0, awayWin: 52 })).toEqual({ homeWin: 48, draw: 0, awayWin: 52 });
  expect(readMatchProbabilities({ homeWin: 57, draw: 8, awayWin: 35 })).toEqual({ homeWin: 57, draw: 8, awayWin: 35 });
});

test("missing or invalid analytics are not invented", () => {
  for (const value of [null, {}, { homeWin: 60, draw: 0, awayWin: 60 }, { homeWin: -1, draw: 0, awayWin: 101 }]) {
    expect(readMatchProbabilities(value)).toBeNull();
  }
});