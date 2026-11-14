import { test } from "node:test";
import { strict as assert } from "node:assert";
import { detectGoals, scoreMap } from "./goal-alerts";
import type { LiveFixture } from "@/data/mock-live";

const fx = (id: string, h: number | null, a: number | null) => ({ id, home: "A", away: "B", homeScore: h, awayScore: a }) as LiveFixture;

test("alerts when a team's score goes up", () => {
  assert.deepEqual(detectGoals(scoreMap([fx("1", 0, 0)]), [fx("1", 1, 0)]).map((g) => g.side), ["home"]);
});
test("does not alert for matches seen for the first time", () => {
  assert.deepEqual(detectGoals({}, [fx("1", 2, 1)]), []);
});
test("does not alert when the score is unchanged", () => {
  assert.deepEqual(detectGoals(scoreMap([fx("1", 1, 1)]), [fx("1", 1, 1)]), []);
});
