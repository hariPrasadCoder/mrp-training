import assert from "node:assert/strict";
import test from "node:test";
import {
  onboardingItems,
  problemStatements,
  weekPlans,
  weeks,
} from "../lib/program-data";

test("keeps the course outcome-first and the video plan intentionally small", () => {
  assert.deepEqual(
    weeks.map((week) => week.id),
    [0, 1, 2, 3, 4],
  );
  assert.equal(weekPlans.length, weeks.length);
  assert.equal(weekPlans[0].videos.length, 0);
  assert.equal(weekPlans[0].build.length, 0);
  assert.ok(weekPlans.slice(1).every((plan) => plan.videos.length <= 3));
  assert.ok(weekPlans.slice(1).every((plan) => plan.build.length > 0));
  assert.ok(weekPlans.every((plan) => plan.submit.length > 0));
  assert.equal(problemStatements.length, 10);
  assert.ok(
    problemStatements.every(
      (problem) => problem.buildPath.length === 4 && problem.evidence.length > 0,
    ),
  );
});

test("locks every future week by default and keeps Week 0 concise", () => {
  assert.equal(weeks[0].status, "current");
  assert.ok(weeks.slice(1).every((week) => week.status === "locked"));
  assert.ok(onboardingItems.length <= 6);
});
