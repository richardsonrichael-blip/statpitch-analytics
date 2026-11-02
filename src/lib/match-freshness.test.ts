import { test } from "node:test";
import { strict as assert } from "node:assert";
import { matchFreshness } from "./match-freshness";

const received = "2026-11-01T21:00:00Z";
const at = Date.parse(received);
test("live data is stale at the 15-minute refresh boundary", () => {
  assert.equal(matchFreshness(received, at + 899_999).state, "fresh");
  assert.equal(matchFreshness(received, at + 900_000).state, "stale");
  assert.equal(matchFreshness(received, at + 1_800_000).state, "stale");
});
test("missing, invalid and future retrieval times never claim fresh scores", () => {
  for (const value of [undefined, "invalid", "2026-11-01T21:01:00Z"]) {
    assert.equal(matchFreshness(value, at).state, "unknown");
  }
});