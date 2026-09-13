import { and, asc, eq, inArray } from "drizzle-orm";
import { getDb } from "./index";
import {
  enrollments,
  feedback,
  learnerChecklist,
  profiles,
  programs,
  programWeeks,
  submissions,
  weekReleases,
} from "./schema";
import { weeks } from "@/lib/program-data";

export async function ensureLearnerProgram(profileId: string) {
  const db = getDb();
  const program = await ensureProgramStructure();
  let [enrollment] = await db
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.learnerId, profileId),
        eq(enrollments.programId, program.id),
      ),
    )
    .limit(1);
  if (!enrollment) {
    [enrollment] = await db
      .insert(enrollments)
      .values({
        learnerId: profileId,
        programId: program.id,
        startsAt: new Date(),
      })
      .onConflictDoNothing()
      .returning();
    if (!enrollment)
      [enrollment] = await db
        .select()
        .from(enrollments)
        .where(
          and(
            eq(enrollments.learnerId, profileId),
            eq(enrollments.programId, program.id),
          ),
        )
        .limit(1);
  }
  const persistedWeeks = await db
    .select()
    .from(programWeeks)
    .where(eq(programWeeks.programId, program.id));

  const existingReleases = await db
    .select({ weekId: weekReleases.weekId })
    .from(weekReleases)
    .where(eq(weekReleases.enrollmentId, enrollment.id));
  const existingWeekIds = new Set(existingReleases.map((item) => item.weekId));
  const missingWeeks = persistedWeeks.filter(
    (week) => !existingWeekIds.has(week.id),
  );
  if (missingWeeks.length)
    await db
      .insert(weekReleases)
      .values(
        missingWeeks.map((week) => ({
          enrollmentId: enrollment.id,
          weekId: week.id,
          status:
            week.weekNumber === 0
              ? ("available" as const)
              : ("locked" as const),
          releasedAt: week.weekNumber === 0 ? new Date() : null,
        })),
      )
      .onConflictDoNothing();

  return enrollment;
}

export async function ensureProgramStructure() {
  const db = getDb();
  let [program] = await db
    .select()
    .from(programs)
    .where(
      and(
        eq(programs.name, "AI Engineering Accelerator"),
        eq(programs.version, 1),
      ),
    )
    .limit(1);
  if (!program)
    [program] = await db
      .insert(programs)
      .values({ name: "AI Engineering Accelerator", version: 1 })
      .onConflictDoNothing()
      .returning();
  if (!program)
    [program] = await db
      .select()
      .from(programs)
      .where(
        and(
          eq(programs.name, "AI Engineering Accelerator"),
          eq(programs.version, 1),
        ),
      )
      .limit(1);
  const persistedWeeks = await db
    .select({ weekNumber: programWeeks.weekNumber })
    .from(programWeeks)
    .where(eq(programWeeks.programId, program.id));
  const existingNumbers = new Set(
    persistedWeeks.map((week) => week.weekNumber),
  );
  const missingWeeks = weeks.filter((week) => !existingNumbers.has(week.id));
  if (missingWeeks.length)
    await db
      .insert(programWeeks)
      .values(
        missingWeeks.map((week) => ({
          programId: program.id,
          weekNumber: week.id,
          title: week.title,
          eyebrow: week.eyebrow,
          outcome: week.outcome,
          accent: week.accent,
          sortOrder: week.id,
        })),
      )
      .onConflictDoNothing();
  return program;
}

export async function getCompletedChecklist(profileId: string) {
  const db = getDb();
  const rows = await db
    .select({ itemId: learnerChecklist.itemId })
    .from(learnerChecklist)
    .where(eq(learnerChecklist.profileId, profileId));
  const [profile] = await db
    .select({ whatsappReady: profiles.whatsappReady })
    .from(profiles)
    .where(eq(profiles.id, profileId))
    .limit(1);
  return rows
    .map((row) => row.itemId)
    .filter((itemId) => itemId !== "whatsapp" || profile?.whatsappReady);
}

export async function setChecklistItem(
  profileId: string,
  itemId: string,
  completed: boolean,
) {
  const db = getDb();
  if (completed) {
    await db
      .insert(learnerChecklist)
      .values({ profileId, itemId })
      .onConflictDoUpdate({
        target: [learnerChecklist.profileId, learnerChecklist.itemId],
        set: { completedAt: new Date() },
      });
  } else {
    await db
      .delete(learnerChecklist)
      .where(
        and(
          eq(learnerChecklist.profileId, profileId),
          eq(learnerChecklist.itemId, itemId),
        ),
      );
  }
}

export async function completeLearnerProfile(
  profileId: string,
  values: {
    timezone: string;
    experience: string;
    weeklyAvailability: string;
    successDefinition: string;
    productInterests: string;
  },
) {
  const db = getDb();
  await db
    .update(profiles)
    .set({
      ...values,
      onboardingCompletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, profileId));
  await setChecklistItem(profileId, "profile", true);
  const enrollment = await ensureLearnerProgram(profileId);
  await db
    .update(enrollments)
    .set({ status: "active" })
    .where(eq(enrollments.id, enrollment.id));
}

export async function updateLearnerCapstone(
  profileId: string,
  values: {
    capstoneTitle: string;
    capstoneProblem: string;
    capstoneOutcome: string;
  },
) {
  const enrollment = await ensureLearnerProgram(profileId);
  await getDb()
    .update(enrollments)
    .set(values)
    .where(eq(enrollments.id, enrollment.id));
  await setChecklistItem(profileId, "problem", true);
  await setChecklistItem(profileId, "report", true);
}

export async function getLearnerWorkspace(profileId: string) {
  const enrollment = await ensureLearnerProgram(profileId);
  const db = getDb();
  const releases = await db
    .select({
      weekNumber: programWeeks.weekNumber,
      status: weekReleases.status,
      dueAt: weekReleases.dueAt,
    })
    .from(weekReleases)
    .innerJoin(programWeeks, eq(weekReleases.weekId, programWeeks.id))
    .where(eq(weekReleases.enrollmentId, enrollment.id));
  const learnerSubmissions = await db
    .select({
      id: submissions.id,
      weekId: submissions.weekId,
      weekNumber: programWeeks.weekNumber,
      status: submissions.status,
      liveUrl: submissions.liveUrl,
      repositoryUrl: submissions.repositoryUrl,
      reflection: submissions.reflection,
      blocker: submissions.blocker,
      submittedAt: submissions.submittedAt,
    })
    .from(submissions)
    .innerJoin(programWeeks, eq(submissions.weekId, programWeeks.id))
    .where(eq(submissions.enrollmentId, enrollment.id))
    .orderBy(asc(programWeeks.weekNumber), asc(submissions.version));
  const submissionFeedback = learnerSubmissions.length
    ? await db
        .select({
          submissionId: feedback.submissionId,
          result: feedback.result,
          summary: feedback.summary,
          createdAt: feedback.createdAt,
        })
        .from(feedback)
        .where(
          inArray(
            feedback.submissionId,
            learnerSubmissions.map((submission) => submission.id),
          ),
        )
    : [];
  return {
    enrollmentId: enrollment.id,
    status: enrollment.status,
    currentWeek: enrollment.currentWeek,
    capstoneTitle: enrollment.capstoneTitle ?? "",
    capstoneProblem: enrollment.capstoneProblem ?? "",
    capstoneOutcome: enrollment.capstoneOutcome ?? "",
    releases: releases.map((release) => ({
      ...release,
      dueAt: release.dueAt?.toISOString() ?? null,
    })),
    submissions: learnerSubmissions.map((submission) => ({
      ...submission,
      submittedAt: submission.submittedAt?.toISOString() ?? null,
    })),
    feedback: submissionFeedback.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
  };
}

export async function submitWeekWork(
  profileId: string,
  weekNumber: number,
  values: {
    liveUrl: string;
    repositoryUrl: string;
    reflection: string;
    blocker: string;
  },
) {
  const workspace = await getLearnerWorkspace(profileId);
  if (workspace.status !== "active")
    throw new Error("Your enrollment is not currently active.");
  const release = workspace.releases.find(
    (item) => item.weekNumber === weekNumber,
  );
  if (!release || release.status === "locked")
    throw new Error("This week is still locked.");

  const db = getDb();
  const [week] = await db
    .select({ id: programWeeks.id })
    .from(programWeeks)
    .innerJoin(enrollments, eq(enrollments.programId, programWeeks.programId))
    .where(
      and(
        eq(enrollments.id, workspace.enrollmentId),
        eq(programWeeks.weekNumber, weekNumber),
      ),
    )
    .limit(1);
  const prior = workspace.submissions.filter(
    (item) => item.weekNumber === weekNumber,
  );
  const [submission] = await db
    .insert(submissions)
    .values({
      enrollmentId: workspace.enrollmentId,
      weekId: week.id,
      version: prior.length + 1,
      status: "submitted",
      ...values,
      submittedAt: new Date(),
    })
    .returning();
  return submission;
}
