import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "./index";
import {
  blockProgress,
  coachNotes,
  contentBlocks,
  enrollments,
  feedback,
  learnerChecklist,
  profiles,
  programWeeks,
  submissions,
  weekReleases,
} from "./schema";
import { ensureLearnerProgram, ensureProgramStructure } from "./learner";
import type {
  AdminWorkspaceData,
  ContentKind,
  EnrollmentState,
  LessonBlock,
  ProgramWeek,
} from "@/lib/lms-types";
import { onboardingItems } from "@/lib/program-data";

export async function getProgramWeeks(): Promise<ProgramWeek[]> {
  const program = await ensureProgramStructure();
  const rows = await getDb()
    .select()
    .from(programWeeks)
    .where(eq(programWeeks.programId, program.id))
    .orderBy(asc(programWeeks.sortOrder));
  return rows.map((week) => ({
    ...week,
    accent: week.accent as ProgramWeek["accent"],
  }));
}

export async function getProgramContent(
  includeDrafts = false,
): Promise<LessonBlock[]> {
  const program = await ensureProgramStructure();
  const db = getDb();
  const rows = await db
    .select({
      id: contentBlocks.id,
      weekNumber: programWeeks.weekNumber,
      type: contentBlocks.type,
      title: contentBlocks.title,
      description: contentBlocks.description,
      content: contentBlocks.content,
      required: contentBlocks.required,
      sortOrder: contentBlocks.sortOrder,
      published: contentBlocks.published,
    })
    .from(contentBlocks)
    .innerJoin(programWeeks, eq(contentBlocks.weekId, programWeeks.id))
    .where(
      includeDrafts
        ? eq(programWeeks.programId, program.id)
        : and(
            eq(programWeeks.programId, program.id),
            eq(contentBlocks.published, true),
          ),
    )
    .orderBy(asc(programWeeks.weekNumber), asc(contentBlocks.sortOrder));
  return rows.map((row) => ({ ...row, description: row.description ?? "" }));
}

export async function getCompletedBlocks(enrollmentId: string) {
  const rows = await getDb()
    .select({ blockId: blockProgress.blockId })
    .from(blockProgress)
    .where(
      and(
        eq(blockProgress.enrollmentId, enrollmentId),
        eq(blockProgress.completed, true),
      ),
    );
  return rows.map((row) => row.blockId);
}

export async function setBlockComplete(
  enrollmentId: string,
  blockId: string,
  completed: boolean,
) {
  const db = getDb();
  await db
    .insert(blockProgress)
    .values({
      enrollmentId,
      blockId,
      completed,
      completedAt: completed ? new Date() : null,
    })
    .onConflictDoUpdate({
      target: [blockProgress.enrollmentId, blockProgress.blockId],
      set: { completed, completedAt: completed ? new Date() : null },
    });
}

export async function saveContentBlock(input: {
  id?: string;
  weekNumber: number;
  type: ContentKind;
  title: string;
  description: string;
  content: LessonBlock["content"];
  required: boolean;
  published: boolean;
}) {
  const program = await ensureProgramStructure();
  const db = getDb();
  const [week] = await db
    .select()
    .from(programWeeks)
    .where(
      and(
        eq(programWeeks.programId, program.id),
        eq(programWeeks.weekNumber, input.weekNumber),
      ),
    )
    .limit(1);
  if (!week) throw new Error("Week not found.");
  if (input.id) {
    const [updated] = await db
      .update(contentBlocks)
      .set({
        type: input.type,
        title: input.title,
        description: input.description,
        content: input.content,
        required: input.required,
        published: input.published,
      })
      .where(eq(contentBlocks.id, input.id))
      .returning();
    return updated;
  }
  const existing = await db
    .select({ sortOrder: contentBlocks.sortOrder })
    .from(contentBlocks)
    .where(eq(contentBlocks.weekId, week.id))
    .orderBy(desc(contentBlocks.sortOrder))
    .limit(1);
  const [created] = await db
    .insert(contentBlocks)
    .values({
      weekId: week.id,
      type: input.type,
      title: input.title,
      description: input.description,
      content: input.content,
      required: input.required,
      published: input.published,
      sortOrder: (existing[0]?.sortOrder ?? -1) + 1,
    })
    .returning();
  return created;
}

export async function deleteContentBlock(id: string) {
  await getDb().delete(contentBlocks).where(eq(contentBlocks.id, id));
}

export async function moveContentBlock(id: string, direction: "up" | "down") {
  const db = getDb();
  const [current] = await db
    .select()
    .from(contentBlocks)
    .where(eq(contentBlocks.id, id))
    .limit(1);
  if (!current) throw new Error("Content block not found.");
  const siblings = await db
    .select()
    .from(contentBlocks)
    .where(eq(contentBlocks.weekId, current.weekId))
    .orderBy(asc(contentBlocks.sortOrder));
  const index = siblings.findIndex((block) => block.id === id);
  const target = siblings[index + (direction === "up" ? -1 : 1)];
  if (!target) return;
  await db
    .update(contentBlocks)
    .set({ sortOrder: target.sortOrder })
    .where(eq(contentBlocks.id, current.id));
  await db
    .update(contentBlocks)
    .set({ sortOrder: current.sortOrder })
    .where(eq(contentBlocks.id, target.id));
}

export async function updateProgramWeek(
  weekNumber: number,
  input: { eyebrow: string; title: string; outcome: string },
) {
  const program = await ensureProgramStructure();
  const [updated] = await getDb()
    .update(programWeeks)
    .set(input)
    .where(
      and(
        eq(programWeeks.programId, program.id),
        eq(programWeeks.weekNumber, weekNumber),
      ),
    )
    .returning();
  if (!updated) throw new Error("Week not found.");
  return { ...updated, accent: updated.accent as ProgramWeek["accent"] };
}

export async function getAdminWorkspace(): Promise<AdminWorkspaceData> {
  const db = getDb();
  const learnerProfiles = await db
    .select()
    .from(profiles)
    .where(eq(profiles.role, "learner"))
    .orderBy(desc(profiles.createdAt));
  const learners = await Promise.all(
    learnerProfiles.map(async (profile) => {
      const enrollment = await ensureLearnerProgram(profile.id);
      const checklist = await db
        .select({ itemId: learnerChecklist.itemId })
        .from(learnerChecklist)
        .where(eq(learnerChecklist.profileId, profile.id));
      const [currentRelease] = await db
        .select({ dueAt: weekReleases.dueAt })
        .from(weekReleases)
        .innerJoin(programWeeks, eq(weekReleases.weekId, programWeeks.id))
        .where(
          and(
            eq(weekReleases.enrollmentId, enrollment.id),
            eq(programWeeks.weekNumber, enrollment.currentWeek),
          ),
        )
        .limit(1);
      const notes = await db
        .select({
          id: coachNotes.id,
          body: coachNotes.body,
          createdAt: coachNotes.createdAt,
        })
        .from(coachNotes)
        .where(eq(coachNotes.enrollmentId, enrollment.id))
        .orderBy(desc(coachNotes.createdAt));
      return {
        id: profile.id,
        name: profile.displayName,
        email: profile.email,
        timezone: profile.timezone,
        whatsappInviteUrl: profile.whatsappInviteUrl ?? "",
        whatsappReady: profile.whatsappReady,
        onboardingComplete: Boolean(profile.onboardingCompletedAt),
        currentWeek: enrollment.currentWeek,
        currentDueAt: currentRelease?.dueAt?.toISOString() ?? "",
        enrollmentId: enrollment.id,
        status: enrollment.status,
        completedItems: checklist.filter(
          (item) =>
            onboardingItems.some((valid) => valid.id === item.itemId) &&
            (item.itemId !== "whatsapp" || profile.whatsappReady) &&
            (item.itemId !== "report" || Boolean(enrollment.capstoneTitle)),
        ).length,
        capstoneTitle: enrollment.capstoneTitle ?? "",
        capstoneProblem: enrollment.capstoneProblem ?? "",
        capstoneOutcome: enrollment.capstoneOutcome ?? "",
        notes: notes.map((note) => ({
          ...note,
          createdAt: note.createdAt.toISOString(),
        })),
      };
    }),
  );
  const reviewRows = await db
    .select({
      id: submissions.id,
      learnerName: profiles.displayName,
      learnerEmail: profiles.email,
      weekNumber: programWeeks.weekNumber,
      version: submissions.version,
      status: submissions.status,
      liveUrl: submissions.liveUrl,
      repositoryUrl: submissions.repositoryUrl,
      reflection: submissions.reflection,
      blocker: submissions.blocker,
      submittedAt: submissions.submittedAt,
    })
    .from(submissions)
    .innerJoin(enrollments, eq(submissions.enrollmentId, enrollments.id))
    .innerJoin(profiles, eq(enrollments.learnerId, profiles.id))
    .innerJoin(programWeeks, eq(submissions.weekId, programWeeks.id))
    .where(eq(submissions.status, "submitted"))
    .orderBy(desc(submissions.submittedAt));
  return {
    learners,
    reviews: reviewRows.map((row) => ({
      ...row,
      liveUrl: row.liveUrl ?? "",
      repositoryUrl: row.repositoryUrl ?? "",
      reflection: row.reflection ?? "",
      blocker: row.blocker ?? "",
      submittedAt: row.submittedAt?.toISOString() ?? null,
    })),
  };
}

export async function updateLearner(
  profileId: string,
  input: {
    currentWeek?: number;
    whatsappInviteUrl?: string;
    whatsappReady?: boolean;
    dueWeek?: number;
    dueAt?: Date | null;
    status?: EnrollmentState;
    note?: string;
  },
  coachId?: string,
) {
  const db = getDb();
  const enrollment = await ensureLearnerProgram(profileId);
  if (typeof input.currentWeek === "number") {
    await db
      .update(enrollments)
      .set({ currentWeek: input.currentWeek })
      .where(eq(enrollments.id, enrollment.id));
    const releases = await db
      .select({ weekId: programWeeks.id, weekNumber: programWeeks.weekNumber })
      .from(programWeeks)
      .where(eq(programWeeks.programId, enrollment.programId));
    for (const release of releases) {
      await db
        .update(weekReleases)
        .set({
          status:
            release.weekNumber <= input.currentWeek ? "available" : "locked",
          releasedAt:
            release.weekNumber <= input.currentWeek ? new Date() : null,
        })
        .where(
          and(
            eq(weekReleases.enrollmentId, enrollment.id),
            eq(weekReleases.weekId, release.weekId),
          ),
        );
    }
  }
  if (typeof input.dueWeek === "number") {
    const [week] = await db
      .select({ id: programWeeks.id })
      .from(programWeeks)
      .where(
        and(
          eq(programWeeks.programId, enrollment.programId),
          eq(programWeeks.weekNumber, input.dueWeek),
        ),
      )
      .limit(1);
    if (week)
      await db
        .update(weekReleases)
        .set({ dueAt: input.dueAt ?? null })
        .where(
          and(
            eq(weekReleases.enrollmentId, enrollment.id),
            eq(weekReleases.weekId, week.id),
          ),
        );
  }
  if (
    typeof input.whatsappInviteUrl === "string" ||
    typeof input.whatsappReady === "boolean"
  ) {
    await db
      .update(profiles)
      .set({
        ...(typeof input.whatsappInviteUrl === "string"
          ? { whatsappInviteUrl: input.whatsappInviteUrl }
          : {}),
        ...(typeof input.whatsappReady === "boolean"
          ? { whatsappReady: input.whatsappReady }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, profileId));
  }
  if (input.status)
    await db
      .update(enrollments)
      .set({ status: input.status })
      .where(eq(enrollments.id, enrollment.id));
  if (input.note && coachId) {
    const [note] = await db
      .insert(coachNotes)
      .values({ enrollmentId: enrollment.id, coachId, body: input.note })
      .returning();
    return {
      id: note.id,
      body: note.body,
      createdAt: note.createdAt.toISOString(),
    };
  }
  return null;
}

export async function reviewSubmission(
  submissionId: string,
  coachId: string,
  input: {
    result: "changes_requested" | "approved" | "standout";
    summary: string;
  },
) {
  const db = getDb();
  const inserted = await db
    .insert(feedback)
    .values({
      submissionId,
      coachId,
      result: input.result,
      summary: input.summary,
    })
    .onConflictDoNothing()
    .returning({ id: feedback.id });
  if (!inserted.length) return false;
  await db
    .update(submissions)
    .set({ status: input.result })
    .where(eq(submissions.id, submissionId));
  return true;
}
