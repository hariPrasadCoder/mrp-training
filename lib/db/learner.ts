import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "./index";
import { enrollments, feedback, learnerChecklist, profiles, programs, programWeeks, submissions, weekReleases } from "./schema";
import { weeks } from "@/lib/program-data";

export async function ensureLearnerProgram(profileId: string) {
  const db = getDb();
  const program = await ensureProgramStructure();

  await db.insert(enrollments).values({ learnerId: profileId, programId: program.id, startsAt: new Date() }).onConflictDoNothing();
  const [enrollment] = await db.select().from(enrollments).where(and(eq(enrollments.learnerId, profileId), eq(enrollments.programId, program.id))).limit(1);
  const persistedWeeks = await db.select().from(programWeeks).where(eq(programWeeks.programId, program.id));

  await db.insert(weekReleases).values(persistedWeeks.map((week) => ({
    enrollmentId: enrollment.id,
    weekId: week.id,
    status: week.weekNumber === 0 ? "available" as const : "locked" as const,
    releasedAt: week.weekNumber === 0 ? new Date() : null,
  }))).onConflictDoNothing();

  return enrollment;
}

export async function ensureProgramStructure() {
  const db = getDb();
  await db.insert(programs).values({ name: "AI Engineering Accelerator", version: 1 }).onConflictDoNothing();
  const [program] = await db.select().from(programs).where(and(eq(programs.name, "AI Engineering Accelerator"), eq(programs.version, 1))).limit(1);
  await db.insert(programWeeks).values(weeks.map((week, sortOrder) => ({
    programId: program.id,
    weekNumber: week.id,
    title: week.title,
    eyebrow: week.eyebrow,
    outcome: week.outcome,
    accent: week.accent,
    sortOrder,
  }))).onConflictDoNothing();
  return program;
}

export async function getCompletedChecklist(profileId: string) {
  const rows = await getDb().select({ itemId: learnerChecklist.itemId }).from(learnerChecklist).where(eq(learnerChecklist.profileId, profileId));
  return rows.map((row) => row.itemId);
}

export async function setChecklistItem(profileId: string, itemId: string, completed: boolean) {
  const db = getDb();
  if (completed) {
    await db.insert(learnerChecklist).values({ profileId, itemId }).onConflictDoUpdate({
      target: [learnerChecklist.profileId, learnerChecklist.itemId],
      set: { completedAt: new Date() },
    });
  } else {
    await db.delete(learnerChecklist).where(and(eq(learnerChecklist.profileId, profileId), eq(learnerChecklist.itemId, itemId)));
  }
}

export async function completeLearnerProfile(profileId: string, values: { timezone: string; experience: string; weeklyAvailability: string; successDefinition: string; productInterests: string }) {
  const db = getDb();
  await db.update(profiles).set({ ...values, onboardingCompletedAt: new Date(), updatedAt: new Date() }).where(eq(profiles.id, profileId));
  await setChecklistItem(profileId, "profile", true);
}

export async function getLearnerWorkspace(profileId: string) {
  const enrollment = await ensureLearnerProgram(profileId);
  const db = getDb();
  const releases = await db.select({
    weekNumber: programWeeks.weekNumber,
    status: weekReleases.status,
    dueAt: weekReleases.dueAt,
  }).from(weekReleases).innerJoin(programWeeks, eq(weekReleases.weekId, programWeeks.id)).where(eq(weekReleases.enrollmentId, enrollment.id));
  const learnerSubmissions = await db.select({
    id: submissions.id,
    weekId: submissions.weekId,
    weekNumber: programWeeks.weekNumber,
    status: submissions.status,
    liveUrl: submissions.liveUrl,
    repositoryUrl: submissions.repositoryUrl,
    reflection: submissions.reflection,
    blocker: submissions.blocker,
    submittedAt: submissions.submittedAt,
  }).from(submissions).innerJoin(programWeeks, eq(submissions.weekId, programWeeks.id)).where(eq(submissions.enrollmentId, enrollment.id));
  const submissionFeedback = learnerSubmissions.length ? await db.select({
    submissionId: feedback.submissionId,
    result: feedback.result,
    summary: feedback.summary,
    createdAt: feedback.createdAt,
  }).from(feedback).where(inArray(feedback.submissionId, learnerSubmissions.map((submission) => submission.id))) : [];

  return {
    enrollmentId: enrollment.id,
    currentWeek: enrollment.currentWeek,
    releases: releases.map((release) => ({ ...release, dueAt: release.dueAt?.toISOString() ?? null })),
    submissions: learnerSubmissions.map((submission) => ({ ...submission, submittedAt: submission.submittedAt?.toISOString() ?? null })),
    feedback: submissionFeedback.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })),
  };
}

export async function submitWeekWork(profileId: string, weekNumber: number, values: { liveUrl: string; repositoryUrl: string; reflection: string; blocker: string }) {
  const workspace = await getLearnerWorkspace(profileId);
  const release = workspace.releases.find((item) => item.weekNumber === weekNumber);
  if (!release || release.status === "locked") throw new Error("This week is still locked.");

  const db = getDb();
  const [week] = await db.select({ id: programWeeks.id }).from(programWeeks).innerJoin(enrollments, eq(enrollments.programId, programWeeks.programId)).where(and(eq(enrollments.id, workspace.enrollmentId), eq(programWeeks.weekNumber, weekNumber))).limit(1);
  const prior = workspace.submissions.filter((item) => item.weekNumber === weekNumber);
  const [submission] = await db.insert(submissions).values({
    enrollmentId: workspace.enrollmentId,
    weekId: week.id,
    version: prior.length + 1,
    status: "submitted",
    ...values,
    submittedAt: new Date(),
  }).returning();
  return submission;
}
