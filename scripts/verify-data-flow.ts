import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config } from "dotenv";
import { and, eq } from "drizzle-orm";
import { getDb } from "../lib/db/index";
import {
  ensureLearnerProgram,
  getLearnerWorkspace,
  submitWeekWork,
} from "../lib/db/learner";
import { reviewSubmission, saveContentBlock } from "../lib/db/lms";
import {
  contentBlocks,
  enrollments,
  profiles,
  programWeeks,
  weekReleases,
} from "../lib/db/schema";

config({ path: ".env.local" });

async function main() {
  const db = getDb();
  const marker = randomUUID();
  let profileId = "";
  let blockId = "";

  try {
  const [coach] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.role, "admin"))
    .limit(1);
  assert.ok(coach, "A configured admin profile is required.");

  const [profile] = await db
    .insert(profiles)
    .values({
      authUserId: `smoke-${marker}`,
      displayName: "Production Smoke Learner",
      email: `smoke-${marker}@example.invalid`,
      role: "learner",
      onboardingCompletedAt: new Date(),
    })
    .returning({ id: profiles.id });
  profileId = profile.id;

  const enrollment = await ensureLearnerProgram(profile.id);
  await db
    .update(enrollments)
    .set({ status: "active", currentWeek: 1 })
    .where(eq(enrollments.id, enrollment.id));

  const [weekOne] = await db
    .select({ id: programWeeks.id })
    .from(programWeeks)
    .where(
      and(
        eq(programWeeks.programId, enrollment.programId),
        eq(programWeeks.weekNumber, 1),
      ),
    )
    .limit(1);
  assert.ok(weekOne, "Week 1 must exist.");
  await db
    .update(weekReleases)
    .set({ status: "available", releasedAt: new Date() })
    .where(
      and(
        eq(weekReleases.enrollmentId, enrollment.id),
        eq(weekReleases.weekId, weekOne.id),
      ),
    );

  const block = await saveContentBlock({
    weekNumber: 1,
    type: "text",
    title: `Smoke lesson ${marker}`,
    description: "Temporary production data-flow verification.",
    content: { body: "Temporary smoke-test content." },
    required: true,
    published: false,
  });
  blockId = block.id;

  const submission = await submitWeekWork(profile.id, 1, {
    liveUrl: "https://example.com/smoke-app",
    repositoryUrl: "https://github.com/example/smoke-app",
    reflection: "Temporary production data-flow verification.",
    blocker: "",
  });
  assert.equal(submission.status, "submitted");
  assert.equal(
    await reviewSubmission(submission.id, coach.id, {
      result: "approved",
      summary: "Temporary smoke-test approval.",
    }),
    true,
  );
  assert.equal(
    await reviewSubmission(submission.id, coach.id, {
      result: "approved",
      summary: "Duplicate review must not be saved.",
    }),
    false,
  );

  const workspace = await getLearnerWorkspace(profile.id);
  assert.equal(workspace.submissions.length, 1);
  assert.equal(workspace.feedback.length, 1);
  assert.equal(workspace.feedback[0]?.result, "approved");
  console.log("Production data flow verified and temporary records cleaned up.");
  } finally {
    if (blockId)
      await db.delete(contentBlocks).where(eq(contentBlocks.id, blockId));
    if (profileId)
      await db.delete(profiles).where(eq(profiles.id, profileId));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
