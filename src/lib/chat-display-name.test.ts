import { test } from "node:test";
import { strict as assert } from "node:assert";
import { chatDisplayName } from "./chat-display-name";

test("chat names never fall back to email identifiers", () => {
  assert.equal(chatDisplayName(undefined), "Fan");
  assert.equal(chatDisplayName("fan@example.com"), "Fan");
});

test("chat uses the public display name", () => {
  assert.equal(chatDisplayName("  Football Fan  "), "Football Fan");
});