import { describe, expect, it } from "bun:test";
import { detectGoals, scoreMap } from "./goal-alerts";
import type { LiveFixture } from "@/data/mock-live";

const fx = (id: string, h: number | null, a: number | null) => ({ id, home: "A", away: "B", homeScore: h, awayScore: a }) as LiveFixture;

describe("detectGoals", () => {
  it("alerts when a team's score goes up", () => {
    expect(detectGoals(scoreMap([fx("1", 0, 0)]), [fx("1", 1, 0)]).map((g) => g.side)).toEqual(["home"]);
  });
  it("does not alert for matches seen for the first time", () => {
    expect(detectGoals({}, [fx("1", 2, 1)])).toEqual([]);
  });
  it("does not alert when the score is unchanged", () => {
    expect(detectGoals(scoreMap([fx("1", 1, 1)]), [fx("1", 1, 1)])).toEqual([]);
  });
});
