import { test } from "node:test";
import { strict as assert } from "node:assert";
import { explanationContext } from "./match-explanation";
import type { LiveFixture } from "@/data/mock-live";

const fixture: LiveFixture = { id: "sample", home: "A", away: "B", league: "League", utcDate: "2026-11-05T18:00:00Z", status: "TIMED", homeCrest: null, awayCrest: null, homeScore: null, awayScore: null, pills: [], homeWin: 0, draw: 0, awayWin: 0, probabilitiesAvailable: false };
test("missing probabilities, form and xG are not invented", () => {
  const c = explanationContext(fixture, null);
  assert.equal(c.probabilities, null);
  assert.equal(c.teamForm, null);
  assert.equal(c.expectedGoals, null);
  assert.equal(c.scoresUpdatedAt, null);
});
test("actual retrieval time survives unchanged", () => {
  assert.equal(explanationContext({ ...fixture, scoresUpdatedAt: "2026-11-05T03:00:00Z" }, null).scoresUpdatedAt, "2026-11-05T03:00:00Z");
});
test("sample matches cannot be labelled verified provider data", () => {
  assert.match(explanationContext(fixture, null).source, /Sample fixture/);
  assert.equal(explanationContext({ ...fixture, id: "af-123" }, null).source, "API-Football snapshot");
});