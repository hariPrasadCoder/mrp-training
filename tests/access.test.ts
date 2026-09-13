import assert from "node:assert/strict";
import test from "node:test";
import { configuredRoleForEmail, parseEmailList } from "../lib/access";

test("normalizes comma-separated invitation lists", () => {
  assert.deepEqual(parseEmailList(" One@Example.com, two@example.com ,"), [
    "one@example.com",
    "two@example.com",
  ]);
});

test("assigns configured roles and rejects unknown emails", () => {
  const admins = "coach@example.com";
  const learners = "learner@example.com, second@example.com";

  assert.equal(
    configuredRoleForEmail(" COACH@example.com ", admins, learners),
    "admin",
  );
  assert.equal(
    configuredRoleForEmail("Learner@Example.com", admins, learners),
    "learner",
  );
  assert.equal(configuredRoleForEmail("other@example.com", admins, learners), null);
});

test("fails closed when invitation lists are empty", () => {
  assert.equal(configuredRoleForEmail("anyone@example.com", "", ""), null);
});
