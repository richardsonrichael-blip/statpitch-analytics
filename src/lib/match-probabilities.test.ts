import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { SPORTS } from "../data/sports";
import { hasMatchProbabilities, readMatchProbabilities } from "./match-probabilities";

describe("additional sports", () => {
  for (const [id, label] of [
    ["baseball", "Baseball"], ["handball", "Handball"], ["water-polo", "Water Polo"],
    ["snooker", "Snooker"], ["badminton", "Badminton"], ["esports", "Esports"],
  ]) {
    test(`${label} is a supported sport`, () => {
      assert.equal(SPORTS.find((sport) => sport.id === id)?.label, label);
    });
  }
});

test("analytics probabilities work without bookmaker data", () => {
  assert.deepEqual(readMatchProbabilities({ homeWin: 48, draw: 0, awayWin: 52 }), { homeWin: 48, draw: 0, awayWin: 52 });
  assert.deepEqual(readMatchProbabilities({ homeWin: 57, draw: 8, awayWin: 35 }), { homeWin: 57, draw: 8, awayWin: 35 });
});

test("missing or invalid analytics are not invented", () => {
  for (const value of [null, {}, { homeWin: 60, draw: 0, awayWin: 60 }, { homeWin: -1, draw: 0, awayWin: 101 }]) {
    assert.equal(readMatchProbabilities(value), null);
  }
});

test("unavailable fixture probabilities are excluded", () => {
  assert.equal(hasMatchProbabilities({ homeWin: 50, draw: 0, awayWin: 50, probabilitiesAvailable: false }), false);
  assert.equal(hasMatchProbabilities({ homeWin: 0, draw: 0, awayWin: 0 }), false);
  assert.equal(hasMatchProbabilities({ homeWin: Number.NaN, draw: 0, awayWin: 50 }), false);
  assert.equal(hasMatchProbabilities({ homeWin: 48, draw: 0, awayWin: 52 }), true);
});